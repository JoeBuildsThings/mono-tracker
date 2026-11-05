import { db } from './client';
import { computeStreak } from '../domain/streak';
import { toLocalDateString } from '../domain/dates';
import type { FrequencyType, Habit } from '../domain/types';

export interface NewHabit {
  title: string;
  frequency_type: FrequencyType;
  target_count?: number;
  grace_enabled?: boolean;
  reminder_time?: string | null;
  start_date?: string;
}

export function createHabit(input: NewHabit): number {
  const today = toLocalDateString();
  const target = input.frequency_type === 'weekly' ? (input.target_count ?? 1) : 1;
  let id = 0;
  db.withTransactionSync(() => {
    const result = db.runSync(
      `INSERT INTO habits
        (title, frequency_type, target_count, grace_enabled, reminder_time, start_date, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM habits), ?)`,
      [
        input.title.trim(),
        input.frequency_type,
        target,
        input.grace_enabled ? 1 : 0,
        input.reminder_time ?? null,
        input.start_date ?? today,
        today,
      ]
    );
    id = result.lastInsertRowId;
    db.runSync('INSERT INTO habit_stats (habit_id, computed_on) VALUES (?, ?)', [id, today]);
  });
  return id;
}

export function updateHabit(
  id: number,
  input: { title: string; frequency_type: FrequencyType; target_count?: number; grace_enabled?: boolean }
): void {
  const target = input.frequency_type === 'weekly' ? (input.target_count ?? 1) : 1;
  db.withTransactionSync(() => {
    db.runSync(
      'UPDATE habits SET title = ?, frequency_type = ?, target_count = ?, grace_enabled = ? WHERE id = ?',
      [input.title.trim(), input.frequency_type, target, input.grace_enabled ? 1 : 0, id]
    );
    recomputeStats(id);
  });
}

export function setHabitReminder(id: number, time: string | null, notificationId: string | null): void {
  db.runSync('UPDATE habits SET reminder_time = ?, notification_id = ? WHERE id = ?', [time, notificationId, id]);
}

export function deleteHabit(id: number): void {
  db.runSync('DELETE FROM habits WHERE id = ?', [id]);
}

export function listHabits(): Habit[] {
  return db.getAllSync<Habit>('SELECT * FROM habits ORDER BY sort_order, id');
}

export function checkIn(habitId: number, today: string = toLocalDateString()): void {
  db.withTransactionSync(() => {
    db.runSync('INSERT OR IGNORE INTO habit_checkins (habit_id, check_date) VALUES (?, ?)', [habitId, today]);
    recomputeStats(habitId, today);
  });
}

export function uncheck(habitId: number, today: string = toLocalDateString()): void {
  db.withTransactionSync(() => {
    db.runSync('DELETE FROM habit_checkins WHERE habit_id = ? AND check_date = ?', [habitId, today]);
    recomputeStats(habitId, today);
  });
}

export function recomputeStats(habitId: number, today: string = toLocalDateString()): void {
  const habit = db.getFirstSync<Habit>('SELECT * FROM habits WHERE id = ?', [habitId]);
  if (!habit) return;
  const rows = db.getAllSync<{ check_date: string }>(
    'SELECT check_date FROM habit_checkins WHERE habit_id = ? ORDER BY check_date',
    [habitId]
  );
  const r = computeStreak({
    frequency_type: habit.frequency_type,
    target_count: habit.target_count,
    grace_enabled: habit.grace_enabled === 1,
    start_date: habit.start_date,
    check_dates: rows.map((x) => x.check_date),
    today,
  });
  db.runSync(
    `INSERT INTO habit_stats
      (habit_id, current_streak, longest_streak, last_check_date, grace_used_date, total_checkins, computed_on)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(habit_id) DO UPDATE SET
      current_streak = excluded.current_streak,
      longest_streak = excluded.longest_streak,
      last_check_date = excluded.last_check_date,
      grace_used_date = excluded.grace_used_date,
      total_checkins = excluded.total_checkins,
      computed_on = excluded.computed_on`,
    [habitId, r.current, r.longest, r.last_check_date, r.grace_used_date, r.total_checkins, today]
  );
}

export function refreshStaleStats(today: string = toLocalDateString()): void {
  const stale = db.getAllSync<{ id: number }>(
    `SELECT h.id FROM habits h
     LEFT JOIN habit_stats s ON s.habit_id = h.id
     WHERE s.computed_on IS NULL OR s.computed_on != ?`,
    [today]
  );
  if (stale.length === 0) return;
  db.withTransactionSync(() => {
    for (const row of stale) recomputeStats(row.id, today);
  });
}

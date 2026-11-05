import { db } from './client';
import { refreshStaleStats } from './habitsRepo';
import { addDays, startOfWeek, toLocalDateString } from '../domain/dates';
import type { Habit, Task } from '../domain/types';

export interface TodayHabit extends Habit {
  current_streak: number;
  longest_streak: number;
  checked_today: boolean;
  week_count: number;
}

export interface TodayTask extends Task {
  overdue: boolean;
}

export interface TodayData {
  habits: TodayHabit[];
  tasks: TodayTask[];
  anytime: TodayTask[];
}

interface HabitRow extends Habit {
  current_streak: number | null;
  longest_streak: number | null;
  checked_today: number;
  week_count: number;
}

export function getToday(today: string = toLocalDateString()): TodayData {
  refreshStaleStats(today);
  const weekStart = startOfWeek(today);
  const weekEnd = addDays(weekStart, 6);

  const rows = db.getAllSync<HabitRow>(
    `SELECT h.*,
       s.current_streak AS current_streak,
       s.longest_streak AS longest_streak,
       EXISTS (SELECT 1 FROM habit_checkins c WHERE c.habit_id = h.id AND c.check_date = ?) AS checked_today,
       (SELECT COUNT(*) FROM habit_checkins c
         WHERE c.habit_id = h.id AND c.check_date >= ? AND c.check_date <= ?) AS week_count
     FROM habits h
     LEFT JOIN habit_stats s ON s.habit_id = h.id
     WHERE h.start_date <= ?
     ORDER BY h.sort_order, h.id`,
    [today, weekStart, weekEnd, today]
  );

  const habits: TodayHabit[] = rows
    .filter((h) => h.frequency_type === 'daily' || h.checked_today === 1 || h.week_count < h.target_count)
    .map((h) => ({
      ...h,
      current_streak: h.current_streak ?? 0,
      longest_streak: h.longest_streak ?? 0,
      checked_today: h.checked_today === 1,
    }));

  const due = db.getAllSync<Task>(
    'SELECT * FROM tasks WHERE is_completed = 0 AND due_date IS NOT NULL AND due_date <= ? ORDER BY due_date, id',
    [today]
  );
  const doneToday = db.getAllSync<Task>(
    'SELECT * FROM tasks WHERE is_completed = 1 AND completed_at = ? ORDER BY id',
    [today]
  );
  const anytime = db.getAllSync<Task>('SELECT * FROM tasks WHERE is_completed = 0 AND due_date IS NULL ORDER BY id');

  return {
    habits,
    tasks: [
      ...due.map((t) => ({ ...t, overdue: t.due_date !== null && t.due_date < today })),
      ...doneToday.map((t) => ({ ...t, overdue: false })),
    ],
    anytime: anytime.map((t) => ({ ...t, overdue: false })),
  };
}

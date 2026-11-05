import { db } from './client';
import { toLocalDateString } from '../domain/dates';

export interface NewTask {
  title: string;
  due_date: string | null;
}

export function createTask(input: NewTask): number {
  const result = db.runSync(
    'INSERT INTO tasks (title, due_date, created_at) VALUES (?, ?, ?)',
    [input.title.trim(), input.due_date, toLocalDateString()]
  );
  return result.lastInsertRowId;
}

export function updateTask(id: number, input: NewTask): void {
  db.runSync('UPDATE tasks SET title = ?, due_date = ? WHERE id = ?', [input.title.trim(), input.due_date, id]);
}

export function setTaskCompleted(id: number, completed: boolean, today: string = toLocalDateString()): void {
  db.runSync('UPDATE tasks SET is_completed = ?, completed_at = ? WHERE id = ?', [
    completed ? 1 : 0,
    completed ? today : null,
    id,
  ]);
}

export function deleteTask(id: number): void {
  db.runSync('DELETE FROM tasks WHERE id = ?', [id]);
}

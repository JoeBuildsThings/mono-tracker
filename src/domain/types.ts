export type FrequencyType = 'daily' | 'weekly';

export interface Habit {
  id: number;
  title: string;
  frequency_type: FrequencyType;
  target_count: number;
  grace_enabled: 0 | 1;
  reminder_time: string | null;
  notification_id: string | null;
  start_date: string;
  sort_order: number;
  created_at: string;
}

export interface HabitStats {
  habit_id: number;
  current_streak: number;
  longest_streak: number;
  last_check_date: string | null;
  grace_used_date: string | null;
  total_checkins: number;
  computed_on: string | null;
}

export interface Task {
  id: number;
  title: string;
  due_date: string | null;
  is_completed: 0 | 1;
  completed_at: string | null;
  created_at: string;
}

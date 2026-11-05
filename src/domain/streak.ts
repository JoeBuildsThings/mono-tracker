import { addDays, startOfWeek } from './dates';
import type { FrequencyType } from './types';

export interface StreakInput {
  frequency_type: FrequencyType;
  target_count: number;
  grace_enabled: boolean;
  start_date: string;
  check_dates: string[];
  today: string;
}

export interface StreakResult {
  current: number;
  longest: number;
  last_check_date: string | null;
  grace_used_date: string | null;
  total_checkins: number;
}

interface Core {
  current: number;
  longest: number;
  grace_used_date: string | null;
}

function dailyCore(input: StreakInput, dates: string[]): Core {
  const checked = new Set(dates);
  let run = 0;
  let longest = 0;
  let graceWeek = '';
  let graceDate: string | null = null;
  let day = dates[0];

  while (day <= input.today) {
    if (checked.has(day)) {
      run += 1;
    } else if (day !== input.today) {
      const week = startOfWeek(day);
      const yesterday = addDays(day, -1);
      if (input.grace_enabled && run > 0 && week !== graceWeek && graceDate !== yesterday) {
        graceWeek = week;
        graceDate = day;
      } else {
        run = 0;
      }
    }
    if (run > longest) longest = run;
    day = addDays(day, 1);
  }
  return { current: run, longest, grace_used_date: graceDate };
}

function weeklyCore(input: StreakInput, dates: string[]): Core {
  const perWeek = new Map<string, number>();
  for (const d of dates) {
    const w = startOfWeek(d);
    perWeek.set(w, (perWeek.get(w) ?? 0) + 1);
  }
  const thisWeek = startOfWeek(input.today);
  let week = startOfWeek(dates[0]);
  let run = 0;
  let longest = 0;

  while (week <= thisWeek) {
    const done = (perWeek.get(week) ?? 0) >= input.target_count;
    if (done) {
      run += 1;
    } else if (week !== thisWeek) {
      run = 0;
    }
    if (run > longest) longest = run;
    week = addDays(week, 7);
  }
  return { current: run, longest, grace_used_date: null };
}

export function computeStreak(input: StreakInput): StreakResult {
  const dates = Array.from(
    new Set(input.check_dates.filter((d) => d >= input.start_date && d <= input.today))
  ).sort();

  if (dates.length === 0) {
    return { current: 0, longest: 0, last_check_date: null, grace_used_date: null, total_checkins: 0 };
  }

  const core = input.frequency_type === 'daily' ? dailyCore(input, dates) : weeklyCore(input, dates);
  return {
    ...core,
    last_check_date: dates[dates.length - 1],
    total_checkins: dates.length,
  };
}

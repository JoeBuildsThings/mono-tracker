import test from 'node:test';
import assert from 'node:assert/strict';
import { computeStreak } from './streak';
import { toLocalDateString } from './dates';

const daily = {
  frequency_type: 'daily' as const,
  target_count: 1,
  grace_enabled: false,
  start_date: '2026-10-01',
};

const weekly = {
  frequency_type: 'weekly' as const,
  target_count: 3,
  grace_enabled: false,
  start_date: '2026-10-01',
};

test('11:59 PM is today, 12:01 AM is tomorrow', () => {
  assert.equal(toLocalDateString(new Date(2026, 10, 5, 23, 59)), '2026-11-05');
  assert.equal(toLocalDateString(new Date(2026, 10, 6, 0, 1)), '2026-11-06');
});

test('no check ins gives zeros', () => {
  const r = computeStreak({ ...daily, check_dates: [], today: '2026-11-05' });
  assert.equal(r.current, 0);
  assert.equal(r.longest, 0);
  assert.equal(r.last_check_date, null);
});

test('daily: today not done yet does not break the streak', () => {
  const r = computeStreak({ ...daily, check_dates: ['2026-11-03', '2026-11-04'], today: '2026-11-05' });
  assert.equal(r.current, 2);
});

test('daily: checking in today extends it', () => {
  const r = computeStreak({ ...daily, check_dates: ['2026-11-03', '2026-11-04', '2026-11-05'], today: '2026-11-05' });
  assert.equal(r.current, 3);
});

test('daily: a missed yesterday resets current but keeps longest', () => {
  const r = computeStreak({ ...daily, check_dates: ['2026-11-02', '2026-11-03'], today: '2026-11-05' });
  assert.equal(r.current, 0);
  assert.equal(r.longest, 2);
});

test('grace: one missed day is forgiven and adds nothing', () => {
  const r = computeStreak({
    ...daily,
    grace_enabled: true,
    check_dates: ['2026-11-02', '2026-11-03', '2026-11-05'],
    today: '2026-11-05',
  });
  assert.equal(r.current, 3);
  assert.equal(r.grace_used_date, '2026-11-04');
});

test('grace: only one forgiven day per week', () => {
  const r = computeStreak({
    ...daily,
    grace_enabled: true,
    check_dates: ['2026-11-02', '2026-11-04'],
    today: '2026-11-06',
  });
  assert.equal(r.current, 0);
  assert.equal(r.longest, 2);
});

test('grace: never two forgiven days in a row across a week boundary', () => {
  const r = computeStreak({
    ...daily,
    grace_enabled: true,
    check_dates: ['2026-10-30', '2026-10-31'],
    today: '2026-11-03',
  });
  assert.equal(r.current, 0);
  assert.equal(r.longest, 2);
});

test('no streak credit before start_date', () => {
  const r = computeStreak({
    ...daily,
    start_date: '2026-11-04',
    check_dates: ['2026-11-02', '2026-11-04'],
    today: '2026-11-05',
  });
  assert.equal(r.current, 1);
  assert.equal(r.total_checkins, 1);
});

test('weekly: target met last week, this week still pending', () => {
  const r = computeStreak({
    ...weekly,
    check_dates: ['2026-10-27', '2026-10-29', '2026-10-31', '2026-11-02'],
    today: '2026-11-05',
  });
  assert.equal(r.current, 1);
  assert.equal(r.longest, 1);
});

test('weekly: a missed week resets the streak', () => {
  const r = computeStreak({
    ...weekly,
    check_dates: ['2026-10-20', '2026-10-22', '2026-10-24', '2026-10-27'],
    today: '2026-11-05',
  });
  assert.equal(r.current, 0);
  assert.equal(r.longest, 1);
});

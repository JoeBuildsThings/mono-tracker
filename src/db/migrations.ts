import type { SQLiteDatabase } from 'expo-sqlite';

const MIGRATIONS: string[] = [
  `
  CREATE TABLE habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    frequency_type TEXT NOT NULL CHECK (frequency_type IN ('daily','weekly')),
    target_count INTEGER NOT NULL DEFAULT 1 CHECK (target_count BETWEEN 1 AND 7),
    grace_enabled INTEGER NOT NULL DEFAULT 0 CHECK (grace_enabled IN (0,1)),
    reminder_time TEXT,
    notification_id TEXT,
    start_date TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    CHECK (frequency_type = 'weekly' OR target_count = 1)
  );

  CREATE TABLE habit_checkins (
    habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    check_date TEXT NOT NULL,
    PRIMARY KEY (habit_id, check_date)
  ) WITHOUT ROWID;
  CREATE INDEX idx_checkins_date ON habit_checkins(check_date);

  CREATE TABLE habit_stats (
    habit_id INTEGER PRIMARY KEY REFERENCES habits(id) ON DELETE CASCADE,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_check_date TEXT,
    grace_used_date TEXT,
    total_checkins INTEGER NOT NULL DEFAULT 0,
    computed_on TEXT
  );

  CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    due_date TEXT,
    is_completed INTEGER NOT NULL DEFAULT 0 CHECK (is_completed IN (0,1)),
    completed_at TEXT,
    created_at TEXT NOT NULL
  );
  CREATE INDEX idx_tasks_open_due ON tasks(due_date) WHERE is_completed = 0;
  `,
];

export function runMigrations(db: SQLiteDatabase): void {
  const row = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;
  for (let i = current; i < MIGRATIONS.length; i += 1) {
    db.withTransactionSync(() => {
      db.execSync(MIGRATIONS[i]);
      db.execSync(`PRAGMA user_version = ${i + 1}`);
    });
  }
}

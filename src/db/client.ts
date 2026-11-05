import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';

export const db = SQLite.openDatabaseSync('mono_tracker.db');

db.execSync('PRAGMA journal_mode = WAL;');
db.execSync('PRAGMA foreign_keys = ON;');
runMigrations(db);

export function wipeAllData(): void {
  db.withTransactionSync(() => {
    db.execSync('DELETE FROM habits; DELETE FROM tasks;');
  });
}

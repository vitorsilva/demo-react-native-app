import * as SQLite from 'expo-sqlite';
import { SCHEMA_SQL, DEFAULT_PREFERENCES } from './schema';

let database: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (database) {
    return database;
  }

  // Open database (creates file if it doesn't exist)
  database = await SQLite.openDatabaseAsync('meals.db');

  // Create tables
  await database.execAsync(SCHEMA_SQL);

  // Initialize default preferences (INSERT OR IGNORE = only if not exists)
  await database.runAsync(`INSERT OR IGNORE INTO preferences (key, value) VALUES (?, ?)`, [
    'cooldownDays',
    String(DEFAULT_PREFERENCES.cooldownDays),
  ]);
  await database.runAsync(`INSERT OR IGNORE INTO preferences (key, value) VALUES (?, ?)`, [
    'suggestionsCount',
    String(DEFAULT_PREFERENCES.suggestionsCount),
  ]);

  console.log('✅ Database initialized');
  return database;
}

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!database) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return database;
}

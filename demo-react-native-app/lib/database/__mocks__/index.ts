import { createTestAdapter, resetTestDatabase } from '../__tests__/testDb';
import { DatabaseAdapter } from '../adapters/types';
import { runMigrations } from '../migrations';
import { SCHEMA_SQL, DEFAULT_PREFERENCES } from '../schema';

// Silent logging during tests
const isTestEnv = process.env.NODE_ENV === 'test';
const log = (message: string) => {
  if (!isTestEnv) console.log(message);
};

let database: DatabaseAdapter | null = null;

export async function initDatabase(): Promise<DatabaseAdapter> {
  if (database) {
    return database;
  }

  log('🧪 Test environment - using better-sqlite3 in-memory database');
  database = createTestAdapter();

  // Create tables
  const statements = SCHEMA_SQL.split(';').filter((s) => s.trim());
  for (const statement of statements) {
    if (statement.trim()) {
      await database.runAsync(statement);
    }
  }

  // Run migrations (creates categories, meal_types, etc.)
  await runMigrations(database);

  // Initialize default preferences
  await database.runAsync(
    `INSERT OR IGNORE INTO preferences (key, value) VALUES (?,      
  ?)`,
    ['cooldownDays', String(DEFAULT_PREFERENCES.cooldownDays)]
  );
  await database.runAsync(
    `INSERT OR IGNORE INTO preferences (key, value) VALUES (?,      
  ?)`,
    ['suggestionsCount', String(DEFAULT_PREFERENCES.suggestionsCount)]
  );

  return database;
}

export function getDatabase(): DatabaseAdapter {
  if (!database) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return database;
}

export function resetDatabase(): void {
  resetTestDatabase();
  database = null;
}

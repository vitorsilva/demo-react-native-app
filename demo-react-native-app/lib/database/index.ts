import { Platform } from 'react-native';
import { DatabaseAdapter } from './adapters/types';
import { createNativeAdapter } from './adapters/native';
import { createInMemoryAdapter } from './adapters/inMemory';
import { SCHEMA_SQL, DEFAULT_PREFERENCES } from './schema';

let database: DatabaseAdapter | null = null;

export async function initDatabase(): Promise<DatabaseAdapter> {
  if (database) {
    return database;
  }

  // Platform detection - use native SQLite on mobile, in-memory on web
  if (Platform.OS === 'web') {
    console.log('🌐 Web platform detected - using in-memory database');
    database = await createInMemoryAdapter();
  } else {
    console.log(`📱 ${Platform.OS} platform detected - using native SQLite`);
    database = await createNativeAdapter('meals.db');
  }

  // Create tables
  // Note: execAsync doesn't exist on our adapter interface
  // We'll run each statement separately
  const statements = SCHEMA_SQL.split(';').filter((s) => s.trim());
  for (const statement of statements) {
    if (statement.trim()) {
      await database.runAsync(statement);
    }
  }

  // Initialize default preferences (INSERT OR IGNORE = only if not exists)
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
  database = null;
}

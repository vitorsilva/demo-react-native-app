import { Platform } from 'react-native';
import { DatabaseAdapter } from './adapters/types';
import { runMigrations } from './migrations';
import { SCHEMA_SQL, DEFAULT_PREFERENCES } from './schema';

let database: DatabaseAdapter | null = null;

export async function initDatabase(): Promise<DatabaseAdapter> {
  if (database) {
    return database;
  }

  // Platform detection - dynamically import the appropriate adapter
  if (Platform.OS === 'web') {
    console.log('🌐 Web platform detected - using in-memory database');
    const { createInMemoryAdapter } = await import('./adapters/inMemory');
    database = await createInMemoryAdapter();
  } else {
    console.log(`📱 ${Platform.OS} platform detected - using native SQLite`);
    const { createNativeAdapter } = await import('./adapters/native');
    database = await createNativeAdapter('meals.db');
  }

  // Create tables
  const statements = SCHEMA_SQL.split(';').filter((s) => s.trim());
  for (const statement of statements) {
    if (statement.trim()) {
      await database.runAsync(statement);
    }
  }

  // Run migrations for schema updates
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
  database = null;
}

import { DatabaseAdapter, RunResult } from './types';

// Type-only imports (no runtime bundling)
type SQLiteDatabase = {
  runAsync(sql: string, args: unknown[]): Promise<{ lastInsertRowId: number; changes: number }>;
  getAllAsync<T>(sql: string, args: unknown[]): Promise<T[]>;
  getFirstAsync<T>(sql: string, args: unknown[]): Promise<T | null>;
  closeAsync(): Promise<void>;
};

/**
 * Native SQLite adapter using expo-sqlite
 * Used on iOS and Android platforms
 */
export class NativeDatabaseAdapter implements DatabaseAdapter {
  private db: SQLiteDatabase;

  constructor(database: SQLiteDatabase) {
    this.db = database;
  }

  async runAsync(sql: string, args: unknown[] = []): Promise<RunResult> {
    const result = await this.db.runAsync(sql, args);
    return {
      lastInsertRowId: result.lastInsertRowId,
      changes: result.changes,
    };
  }

  async getAllAsync<T>(sql: string, args: unknown[] = []): Promise<T[]> {
    return await this.db.getAllAsync<T>(sql, args);
  }

  async getFirstAsync<T>(sql: string, args: unknown[] = []): Promise<T | null> {
    return await this.db.getFirstAsync<T>(sql, args);
  }

  async closeAsync(): Promise<void> {
    await this.db.closeAsync();
  }
}

/**
 * Factory function to create native adapter
 * Uses dynamic import to avoid bundling expo-sqlite for web platform
 */
export async function createNativeAdapter(dbName: string): Promise<DatabaseAdapter> {
  const SQLite = await import('expo-sqlite');
  const db = await SQLite.openDatabaseAsync(dbName);
  return new NativeDatabaseAdapter(db as unknown as SQLiteDatabase);
}

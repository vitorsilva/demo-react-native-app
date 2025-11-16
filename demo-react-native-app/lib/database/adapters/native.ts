import * as SQLite from 'expo-sqlite';
import { DatabaseAdapter, RunResult } from './types';

/**
 * Native SQLite adapter using expo-sqlite
 * Used on iOS and Android platforms
 */
export class NativeDatabaseAdapter implements DatabaseAdapter {
  private db: SQLite.SQLiteDatabase;

  constructor(database: SQLite.SQLiteDatabase) {
    this.db = database;
  }

  async runAsync(sql: string, args: unknown[] = []): Promise<RunResult> {
    const result = await this.db.runAsync(sql, args as SQLite.SQLiteBindValue[]);
    return {
      lastInsertRowId: result.lastInsertRowId,
      changes: result.changes,
    };
  }

  async getAllAsync<T>(sql: string, args: unknown[] = []): Promise<T[]> {
    return await this.db.getAllAsync<T>(sql, args as SQLite.SQLiteBindValue[]);
  }

  async getFirstAsync<T>(sql: string, args: unknown[] = []): Promise<T | null> {
    return await this.db.getFirstAsync<T>(sql, args as SQLite.SQLiteBindValue[]);
  }

  async closeAsync(): Promise<void> {
    await this.db.closeAsync();
  }
}

/**
 * Factory function to create native adapter
 */
export async function createNativeAdapter(dbName: string): Promise<DatabaseAdapter> {
  const db = await SQLite.openDatabaseAsync(dbName);
  return new NativeDatabaseAdapter(db);
}

import Database from 'better-sqlite3';
import { DatabaseAdapter, RunResult } from '../adapters/types';

let db: Database.Database | null = null;

export function getTestDatabase(): Database.Database {
  if (!db || !db.open) {
    db = new Database(':memory:');
  }
  return db;
}

export function resetTestDatabase(): void {
  if (db && db.open) {
    db.close();
  }
  db = null;
}

/**
 * Test adapter using better-sqlite3
 * Implements DatabaseAdapter interface for Jest tests
 */
export function createTestAdapter(): DatabaseAdapter {
  return {
    async runAsync(sql: string, args: unknown[] = []): Promise<RunResult> {
      const database = getTestDatabase();
      const stmt = database.prepare(sql);
      const result = stmt.run(...(args as unknown[]));
      return {
        lastInsertRowId: Number(result.lastInsertRowid), // lowercase 'i'
        changes: result.changes,
      };
    },

    async getAllAsync<T>(sql: string, args: unknown[] = []): Promise<T[]> {
      const database = getTestDatabase();
      const stmt = database.prepare(sql);
      return stmt.all(...(args as unknown[])) as T[];
    },

    async getFirstAsync<T>(sql: string, args: unknown[] = []): Promise<T | null> {
      const database = getTestDatabase();
      const stmt = database.prepare(sql);
      const result = stmt.get(...(args as unknown[]));
      return (result as T) || null;
    },

    async closeAsync(): Promise<void> {
      // No-op for tests
    },
  };
}

import Database from 'better-sqlite3';

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

// Adapter: Makes better-sqlite3 compatible with expo-sqlite API
export function createExpoSQLiteAdapter() {
  return {
    async execAsync(sql: string): Promise<void> {
      const database = getTestDatabase(); // ← Get fresh reference each time
      database.exec(sql);
    },

    async runAsync(sql: string, params: any[] = []): Promise<any> {
      const database = getTestDatabase(); // ← Get fresh reference each time
      const stmt = database.prepare(sql);
      const result = stmt.run(...params);
      return { changes: result.changes };
    },

    async getAllAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
      const database = getTestDatabase(); // ← Get fresh reference each time
      const stmt = database.prepare(sql);
      return stmt.all(...params) as T[];
    },
  };
}

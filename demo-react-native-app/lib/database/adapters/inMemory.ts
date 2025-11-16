import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { DatabaseAdapter, RunResult } from './types';

/**
 * Convert ? placeholders to $1, $2, etc. and create bind object
 * sql.js uses named parameters, expo-sqlite uses positional
 * @throws Error if placeholder count doesn't match args length
 */
export function convertPlaceholders(
  sql: string,
  args: unknown[]
): { sql: string; bindObject: Record<string, unknown> } {
  // Count placeholders in SQL
  const placeholderCount = (sql.match(/\?/g) || []).length;

  if (placeholderCount !== args.length) {
    throw new Error(
      `Placeholder count mismatch: SQL has ${placeholderCount} placeholders but ${args.length} arguments provided`
    );
  }

  let paramIndex = 0;
  const convertedSql = sql.replace(/\?/g, () => `$${++paramIndex}`);

  const bindObject: Record<string, unknown> = {};
  args.forEach((arg, index) => {
    bindObject[`$${index + 1}`] = arg;
  });

  return { sql: convertedSql, bindObject };
}

/**
 * Web SQLite adapter using sql.js (WebAssembly)
 * Used in browser/web mode
 */
export class InMemoryDatabaseAdapter implements DatabaseAdapter {
  private db: SqlJsDatabase;

  constructor(database: SqlJsDatabase) {
    this.db = database;
  }

  async runAsync(sql: string, args: unknown[] = []): Promise<RunResult> {
    const { sql: convertedSql, bindObject } = convertPlaceholders(sql, args);

    this.db.run(convertedSql, bindObject);

    // Query lastInsertRowId and changes count
    // SQLite returns 0 for both when no insert/changes occurred
    const lastIdResult = this.db.exec('SELECT last_insert_rowid() as id');
    const lastInsertRowId = lastIdResult.length > 0 ? (lastIdResult[0].values[0][0] as number) : 0;

    const changesResult = this.db.exec('SELECT changes() as count');
    const changes = changesResult.length > 0 ? (changesResult[0].values[0][0] as number) : 0;

    return { lastInsertRowId, changes };
  }

  async getAllAsync<T>(sql: string, args: unknown[] = []): Promise<T[]> {
    const { sql: convertedSql, bindObject } = convertPlaceholders(sql, args);

    const result = this.db.exec(convertedSql, bindObject);

    if (result.length === 0) {
      return [];
    }

    // Convert sql.js result format to array of objects
    const columns = result[0].columns;
    const rows = result[0].values;

    return rows.map((row: unknown[]) => {
      const obj: Record<string, unknown> = {};
      columns.forEach((col: string, index: number) => {
        obj[col] = row[index];
      });
      return obj as T;
    }) as T[];
  }

  async getFirstAsync<T>(sql: string, args: unknown[] = []): Promise<T | null> {
    const results = await this.getAllAsync<T>(sql, args);
    return results.length > 0 ? results[0] : null;
  }

  async closeAsync(): Promise<void> {
    this.db.close();
  }
}

/**
 * Factory function to create web adapter
 */
export async function createInMemoryAdapter(): Promise<DatabaseAdapter> {
  // Initialize sql.js with WebAssembly
  const SQL = await initSqlJs({
    // Load sql.js WebAssembly from CDN
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
  });

  // Create in-memory database
  const db = new SQL.Database();
  return new InMemoryDatabaseAdapter(db);
}

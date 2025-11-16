/**
 * Database adapter interface - contract for platform-specific implementations
 * Similar to C# interface: both expo-sqlite and sql.js must implement this
 */

export interface DatabaseAdapter {
  /**
   * Execute a SQL statement that modifies data (INSERT, UPDATE, DELETE)
   * Returns the result with lastInsertRowId and changes count
   */
  runAsync(sql: string, args?: unknown[]): Promise<RunResult>;

  /**
   * Execute a SQL query that returns multiple rows (SELECT)
   * Generic type T represents the row shape
   */
  getAllAsync<T>(sql: string, args?: unknown[]): Promise<T[]>;

  /**
   * Execute a SQL query that returns a single row
   * Returns null if no row found
   */
  getFirstAsync<T>(sql: string, args?: unknown[]): Promise<T | null>;

  /**
   * Close the database connection
   */
  closeAsync(): Promise<void>;
}

export interface RunResult {
  lastInsertRowId: number;
  changes: number;
}

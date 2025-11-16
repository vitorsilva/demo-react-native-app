declare module 'sql.js' {
  export interface SqlJsStatic {
    Database: new (data?: ArrayLike<number>) => Database;
  }

  export interface Database {
    run(sql: string, params?: Record<string, unknown>): void;
    exec(sql: string, params?: Record<string, unknown>): QueryExecResult[];
    close(): void;
    export(): Uint8Array;
  }

  export interface QueryExecResult {
    columns: string[];
    values: unknown[][];
  }

  export interface SqlJsConfig {
    locateFile?: (file: string) => string;
  }

  export default function initSqlJs(config?: SqlJsConfig): Promise<SqlJsStatic>;
}

  import type { DatabaseAdapter } from './adapters/types';

  // Track current schema version
  const MIGRATIONS_TABLE_SQL = `
    CREATE TABLE IF NOT EXISTS migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `;

  // Helper: Check if a column exists in a table
  async function columnExists(
    db: DatabaseAdapter,
    tableName: string,
    columnName: string
  ): Promise<boolean> {
    const columns = await db.getAllAsync<{ name: string }>(
      `PRAGMA table_info(${tableName})`
    );
    return columns.some((col) => col.name === columnName);
  }

  // Helper: Check if a record exists
  async function recordExists(
    db: DatabaseAdapter,
    tableName: string,
    whereClause: string,
    args: unknown[]
  ): Promise<boolean> {
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${tableName} WHERE ${whereClause}`,
      args
    );
    return (result?.count ?? 0) > 0;
  }

  // Get current database version
  async function getCurrentVersion(db: DatabaseAdapter): Promise<number> {
    const result = await db.getFirstAsync<{ version: number }>(
      'SELECT MAX(version) as version FROM migrations'
    );
    return result?.version ?? 0;
  }

  // Migration definitions
  const migrations: { version: number; up: (db: DatabaseAdapter) => Promise<void> }[] = [
    {
      version: 1,
      up: async (db: DatabaseAdapter) => {
        // Create categories table (idempotent with IF NOT EXISTS)
        await db.runAsync(`
          CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          )
        `);

        // Create meal_types table (idempotent with IF NOT EXISTS)
        await db.runAsync(`
          CREATE TABLE IF NOT EXISTS meal_types (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            min_ingredients INTEGER DEFAULT 2,
            max_ingredients INTEGER DEFAULT 4,
            default_cooldown_days INTEGER DEFAULT 3,
            is_active INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          )
        `);

        // Add new columns to ingredients table (idempotent)
        if (!(await columnExists(db, 'ingredients', 'category_id'))) {
          await db.runAsync(`ALTER TABLE ingredients ADD COLUMN category_id INTEGER`);
        }
        if (!(await columnExists(db, 'ingredients', 'is_active'))) {
          await db.runAsync(`ALTER TABLE ingredients ADD COLUMN is_active INTEGER DEFAULT 1`);      
        }
        if (!(await columnExists(db, 'ingredients', 'is_user_added'))) {
          await db.runAsync(`ALTER TABLE ingredients ADD COLUMN is_user_added INTEGER DEFAULT 0`);
        }
        if (!(await columnExists(db, 'ingredients', 'updated_at'))) {
          await db.runAsync(`ALTER TABLE ingredients ADD COLUMN updated_at TEXT`);
        }

        // Add updated_at to meal_logs for consistency (idempotent)
        if (!(await columnExists(db, 'meal_logs', 'updated_at'))) {
          await db.runAsync(`ALTER TABLE meal_logs ADD COLUMN updated_at TEXT`);
        }

        // Seed default meal types (idempotent)
        const now = new Date().toISOString();

        if (!(await recordExists(db, 'meal_types', 'name = ?', ['breakfast']))) {
          await db.runAsync(
            `INSERT INTO meal_types (id, name, min_ingredients, max_ingredients,
        default_cooldown_days, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            ['mt-breakfast-001', 'breakfast', 2, 4, 3, 1, now, now]
          );
        }

        if (!(await recordExists(db, 'meal_types', 'name = ?', ['snack']))) {
          await db.runAsync(
            `INSERT INTO meal_types (id, name, min_ingredients, max_ingredients,
        default_cooldown_days, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            ['mt-snack-001', 'snack', 2, 4, 3, 1, now, now]
          );
        }
        
      },
    },
  ];

  // Main function to run pending migrations
  export async function runMigrations(db: DatabaseAdapter): Promise<void> {
    // 1. Create migrations table if not exists
    await db.runAsync(MIGRATIONS_TABLE_SQL);

    // 2. Get current version
    const currentVersion = await getCurrentVersion(db);
    console.log(`📊 Current database version: ${currentVersion}`);

    // 3. Run all migrations with version > currentVersion
    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        console.log(`⬆️ Running migration ${migration.version}...`);
        await migration.up(db);

        // 4. Record migration
        await db.runAsync(
          'INSERT INTO migrations (version, applied_at) VALUES (?, ?)',
          [migration.version, new Date().toISOString()]
        );
        console.log(`✅ Migration ${migration.version} complete`);
      }
    }

    console.log('📊 All migrations complete');
  }
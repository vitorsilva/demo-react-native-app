  import type { DatabaseAdapter } from './adapters/types';
import * as Crypto from 'expo-crypto';

  // Silent logging during tests
  const isTestEnv = process.env.NODE_ENV === 'test';
  const log = (message: string) => {
    if (!isTestEnv) console.log(message);
  };

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
    {
        version: 2,
        up: async (db: DatabaseAdapter) => {
          // Fix category_id column type: INTEGER -> TEXT
          // SQLite doesn't support ALTER COLUMN, so we rebuild the table

          // 1. Create new table with correct schema
          await db.runAsync(`
            CREATE TABLE IF NOT EXISTS ingredients_new (
              id TEXT PRIMARY KEY NOT NULL,
              name TEXT NOT NULL,
              category TEXT NOT NULL,
              meal_types TEXT NOT NULL,
              created_at TEXT NOT NULL,
              category_id TEXT,
              is_active INTEGER DEFAULT 1,
              is_user_added INTEGER DEFAULT 0,
              updated_at TEXT
            )
          `);

          // 2. Copy data from old table
          await db.runAsync(`
            INSERT INTO ingredients_new (id, name, category, meal_types, created_at, category_id, is_active,
      is_user_added, updated_at)
            SELECT id, name, category, meal_types, created_at, CAST(category_id AS TEXT), is_active,        
      is_user_added, updated_at
            FROM ingredients
          `);

          // 3. Drop old table
          await db.runAsync(`DROP TABLE ingredients`);

          // 4. Rename new table
          await db.runAsync(`ALTER TABLE ingredients_new RENAME TO ingredients`);
        },
      },
  {
    version: 3,
    up: async (db: DatabaseAdapter) => {
      // Fix categories table: id was INTEGER, should be TEXT (UUID)

      // 1. Drop the old table (no data to preserve)
      await db.runAsync(`DROP TABLE IF EXISTS categories`);

      // 2. Recreate with correct schema
      await db.runAsync(`
        CREATE TABLE categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);
    },
  },
  {
    version: 4,
    up: async (db: DatabaseAdapter) => {
      // Add is_favorite column to meal_logs (idempotent)
      if (!(await columnExists(db, 'meal_logs', 'is_favorite'))) {
        await db.runAsync(`ALTER TABLE meal_logs ADD COLUMN is_favorite INTEGER DEFAULT 0`);
      }
    },
  },
  {
    version: 5,
    up: async (db: DatabaseAdapter) => {
      // Phase 2: Data Model Evolution - Add preparation_methods table
      // Create preparation_methods table (idempotent with IF NOT EXISTS)
      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS preparation_methods (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          is_predefined INTEGER DEFAULT 1,
          created_at TEXT NOT NULL
        )
      `);

      // Seed predefined preparation methods (idempotent via recordExists check)
      const now = new Date().toISOString();
      const predefinedMethods = [
        ['prep-fried', 'fried'],
        ['prep-grilled', 'grilled'],
        ['prep-roasted', 'roasted'],
        ['prep-boiled', 'boiled'],
        ['prep-baked', 'baked'],
        ['prep-raw', 'raw'],
        ['prep-steamed', 'steamed'],
        ['prep-sauteed', 'sautéed'],
        ['prep-stewed', 'stewed'],
        ['prep-smoked', 'smoked'],
        ['prep-poached', 'poached'],
        ['prep-braised', 'braised'],
      ];

      for (const [id, name] of predefinedMethods) {
        if (!(await recordExists(db, 'preparation_methods', 'id = ?', [id]))) {
          await db.runAsync(
            `INSERT INTO preparation_methods (id, name, is_predefined, created_at) VALUES (?, ?, 1, ?)`,
            [id, name, now]
          );
        }
      }
    },
  },
  {
    version: 6,
    up: async (db: DatabaseAdapter) => {
      // Phase 2: Data Model Evolution - Add meal_components table
      // This table stores ingredient + preparation method pairs for each meal
      // Create meal_components table (idempotent with IF NOT EXISTS)
      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS meal_components (
          id TEXT PRIMARY KEY,
          meal_log_id TEXT NOT NULL,
          ingredient_id TEXT NOT NULL,
          preparation_method_id TEXT,
          created_at TEXT NOT NULL,
          FOREIGN KEY (meal_log_id) REFERENCES meal_logs(id) ON DELETE CASCADE,
          FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
          FOREIGN KEY (preparation_method_id) REFERENCES preparation_methods(id)
        )
      `);
    },
  },
  {
    version: 7,
    up: async (db: DatabaseAdapter) => {
      // Phase 2: Data Model Evolution - Add optional name column to meal_logs
      // This allows users to give meals a name like "Mom's special"
      if (!(await columnExists(db, 'meal_logs', 'name'))) {
        await db.runAsync(`ALTER TABLE meal_logs ADD COLUMN name TEXT`);
      }
    },
  },
  {
    version: 8,
    up: async (db: DatabaseAdapter) => {
      // Phase 2: Data Model Evolution - Migrate existing meal_logs to meal_components
      // This migration converts the legacy ingredients JSON array to meal_components entries
      // Only migrate logs that don't have components yet (idempotent)

      const logsToMigrate = await db.getAllAsync<{
        id: string;
        ingredients: string;
        created_at: string;
      }>(
        `SELECT ml.id, ml.ingredients, ml.created_at
         FROM meal_logs ml
         LEFT JOIN meal_components mc ON mc.meal_log_id = ml.id
         WHERE mc.id IS NULL AND ml.ingredients IS NOT NULL`
      );

      for (const mealLog of logsToMigrate) {
        try {
          const ingredientIds = JSON.parse(mealLog.ingredients);
          if (Array.isArray(ingredientIds)) {
            for (const ingredientId of ingredientIds) {
              // Verify ingredient exists before creating component
              const ingredientExists = await recordExists(
                db,
                'ingredients',
                'id = ?',
                [ingredientId]
              );

              if (ingredientExists) {
                await db.runAsync(
                  `INSERT INTO meal_components (id, meal_log_id, ingredient_id, preparation_method_id, created_at)
                   VALUES (?, ?, ?, NULL, ?)`,
                  [Crypto.randomUUID(), mealLog.id, ingredientId, mealLog.created_at]
                );
              } else {
                // Log warning but don't fail migration - ingredient may have been deleted
                log(
                  `⚠️ Skipping component for meal_log ${mealLog.id}: ingredient ${ingredientId} not found`
                );
              }
            }
          }
        } catch (e) {
          // Skip malformed JSON - log but don't fail migration
          log(`⚠️ Skipping migration for meal_log ${mealLog.id}: invalid ingredients JSON`);
        }
      }

      if (logsToMigrate.length > 0) {
        log(`✅ Migrated ${logsToMigrate.length} meal logs to meal_components format`);
      }
    },
  },
  {
    version: 9,
    up: async (db: DatabaseAdapter) => {
      // Phase 3: Enhanced Variety - Add pairing_rules table
      // This table stores ingredient pairing rules (positive = pairs well, negative = avoid together)
      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS pairing_rules (
          id TEXT PRIMARY KEY,
          ingredient_a_id TEXT NOT NULL,
          ingredient_b_id TEXT NOT NULL,
          rule_type TEXT NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY (ingredient_a_id) REFERENCES ingredients(id) ON DELETE CASCADE,
          FOREIGN KEY (ingredient_b_id) REFERENCES ingredients(id) ON DELETE CASCADE,
          UNIQUE(ingredient_a_id, ingredient_b_id)
        )
      `);
    },
  },
  ];

  // Main function to run pending migrations
  export async function runMigrations(db: DatabaseAdapter): Promise<void> {
    // 1. Create migrations table if not exists
    await db.runAsync(MIGRATIONS_TABLE_SQL);

    // 2. Get current version
    const currentVersion = await getCurrentVersion(db);
    log(`📊 Current database version: ${currentVersion}`);

    // 3. Run all migrations with version > currentVersion
    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        log(`⬆️ Running migration ${migration.version}...`);
        await migration.up(db);

        // 4. Record migration
        await db.runAsync(
          'INSERT INTO migrations (version, applied_at) VALUES (?, ?)',
          [migration.version, new Date().toISOString()]
        );
        log(`✅ Migration ${migration.version} complete`);
      }
    }

    log('📊 All migrations complete');
  }
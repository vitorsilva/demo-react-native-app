/**
 * Unit tests for Phase 2 Data Model Evolution migrations (versions 5, 6, 7)
 * - Version 5: preparation_methods table with predefined methods
 * - Version 6: meal_components table for ingredient + preparation pairs
 * - Version 7: name column in meal_logs for optional meal naming
 */

import { resetDatabase, initDatabase, getDatabase } from '../index';
import { resetTestDatabase } from './testDb';

jest.mock('../index');

describe('Phase 2 Migrations - Data Model Evolution', () => {
  beforeEach(async () => {
    resetTestDatabase();
    resetDatabase();
    await initDatabase();
  });

  describe('Migration Version 5: preparation_methods table', () => {
    test('preparation_methods table exists', async () => {
      const db = getDatabase();
      const tables = await db.getAllAsync<{ name: string }>(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='preparation_methods'`
      );
      expect(tables).toHaveLength(1);
      expect(tables[0].name).toBe('preparation_methods');
    });

    test('preparation_methods table has correct schema', async () => {
      const db = getDatabase();
      const columns = await db.getAllAsync<{ name: string; type: string; notnull: number; pk: number }>(
        `PRAGMA table_info(preparation_methods)`
      );

      const columnMap = new Map(columns.map((c) => [c.name, c]));

      // Check id column
      expect(columnMap.has('id')).toBe(true);
      expect(columnMap.get('id')?.type).toBe('TEXT');
      expect(columnMap.get('id')?.pk).toBe(1); // Primary key

      // Check name column
      expect(columnMap.has('name')).toBe(true);
      expect(columnMap.get('name')?.type).toBe('TEXT');
      expect(columnMap.get('name')?.notnull).toBe(1); // NOT NULL

      // Check is_predefined column
      expect(columnMap.has('is_predefined')).toBe(true);
      expect(columnMap.get('is_predefined')?.type).toBe('INTEGER');

      // Check created_at column
      expect(columnMap.has('created_at')).toBe(true);
      expect(columnMap.get('created_at')?.type).toBe('TEXT');
      expect(columnMap.get('created_at')?.notnull).toBe(1); // NOT NULL
    });

    test('preparation_methods table is seeded with 12 predefined methods', async () => {
      const db = getDatabase();
      const methods = await db.getAllAsync<{ id: string; name: string; is_predefined: number }>(
        `SELECT id, name, is_predefined FROM preparation_methods ORDER BY name`
      );

      expect(methods).toHaveLength(12);

      // All should be predefined
      expect(methods.every((m) => m.is_predefined === 1)).toBe(true);
    });

    test('preparation_methods includes all expected predefined methods', async () => {
      const db = getDatabase();
      const methods = await db.getAllAsync<{ name: string }>(
        `SELECT name FROM preparation_methods ORDER BY name`
      );

      const methodNames = methods.map((m) => m.name).sort();
      const expectedMethods = [
        'baked',
        'boiled',
        'braised',
        'fried',
        'grilled',
        'poached',
        'raw',
        'roasted',
        'sautéed',
        'smoked',
        'steamed',
        'stewed',
      ].sort();

      expect(methodNames).toEqual(expectedMethods);
    });

    test('preparation_methods have correct id format', async () => {
      const db = getDatabase();
      const methods = await db.getAllAsync<{ id: string; name: string }>(
        `SELECT id, name FROM preparation_methods`
      );

      for (const method of methods) {
        // IDs should start with 'prep-'
        expect(method.id).toMatch(/^prep-/);
        // ID should relate to the name (e.g., 'prep-fried' for 'fried')
        // Note: sautéed has id 'prep-sauteed' (without accent)
        if (method.name === 'sautéed') {
          expect(method.id).toBe('prep-sauteed');
        } else {
          expect(method.id).toBe(`prep-${method.name}`);
        }
      }
    });

    test('preparation_methods name column has UNIQUE constraint', async () => {
      const db = getDatabase();

      // Count existing 'fried' entries
      const beforeCount = await db.getAllAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM preparation_methods WHERE name = 'fried'`
      );
      expect(beforeCount[0].count).toBe(1);

      // Try to insert duplicate name - should fail or be ignored due to UNIQUE constraint
      try {
        await db.runAsync(
          `INSERT INTO preparation_methods (id, name, is_predefined, created_at) VALUES (?, ?, ?, ?)`,
          ['prep-fried-duplicate', 'fried', 1, new Date().toISOString()]
        );
      } catch {
        // Expected - UNIQUE constraint violation
      }

      // Verify only one 'fried' entry exists (constraint enforced)
      const afterCount = await db.getAllAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM preparation_methods WHERE name = 'fried'`
      );
      expect(afterCount[0].count).toBe(1);
    });

    test('preparation_methods created_at is populated', async () => {
      const db = getDatabase();
      const methods = await db.getAllAsync<{ created_at: string }>(
        `SELECT created_at FROM preparation_methods`
      );

      for (const method of methods) {
        expect(method.created_at).toBeDefined();
        // Should be a valid ISO date string
        expect(new Date(method.created_at).toISOString()).toBe(method.created_at);
      }
    });
  });

  describe('Migration Version 6: meal_components table', () => {
    test('meal_components table exists', async () => {
      const db = getDatabase();
      const tables = await db.getAllAsync<{ name: string }>(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='meal_components'`
      );
      expect(tables).toHaveLength(1);
      expect(tables[0].name).toBe('meal_components');
    });

    test('meal_components table has correct schema', async () => {
      const db = getDatabase();
      const columns = await db.getAllAsync<{ name: string; type: string; notnull: number; pk: number }>(
        `PRAGMA table_info(meal_components)`
      );

      const columnMap = new Map(columns.map((c) => [c.name, c]));

      // Check id column
      expect(columnMap.has('id')).toBe(true);
      expect(columnMap.get('id')?.type).toBe('TEXT');
      expect(columnMap.get('id')?.pk).toBe(1); // Primary key

      // Check meal_log_id column
      expect(columnMap.has('meal_log_id')).toBe(true);
      expect(columnMap.get('meal_log_id')?.type).toBe('TEXT');
      expect(columnMap.get('meal_log_id')?.notnull).toBe(1); // NOT NULL

      // Check ingredient_id column
      expect(columnMap.has('ingredient_id')).toBe(true);
      expect(columnMap.get('ingredient_id')?.type).toBe('TEXT');
      expect(columnMap.get('ingredient_id')?.notnull).toBe(1); // NOT NULL

      // Check preparation_method_id column (nullable)
      expect(columnMap.has('preparation_method_id')).toBe(true);
      expect(columnMap.get('preparation_method_id')?.type).toBe('TEXT');
      expect(columnMap.get('preparation_method_id')?.notnull).toBe(0); // Nullable

      // Check created_at column
      expect(columnMap.has('created_at')).toBe(true);
      expect(columnMap.get('created_at')?.type).toBe('TEXT');
      expect(columnMap.get('created_at')?.notnull).toBe(1); // NOT NULL
    });

    test('meal_components table has foreign key to meal_logs', async () => {
      const db = getDatabase();
      const foreignKeys = await db.getAllAsync<{ table: string; from: string; to: string }>(
        `PRAGMA foreign_key_list(meal_components)`
      );

      const mealLogFk = foreignKeys.find((fk) => fk.table === 'meal_logs');
      expect(mealLogFk).toBeDefined();
      expect(mealLogFk?.from).toBe('meal_log_id');
      expect(mealLogFk?.to).toBe('id');
    });

    test('meal_components table has foreign key to ingredients', async () => {
      const db = getDatabase();
      const foreignKeys = await db.getAllAsync<{ table: string; from: string; to: string }>(
        `PRAGMA foreign_key_list(meal_components)`
      );

      const ingredientFk = foreignKeys.find((fk) => fk.table === 'ingredients');
      expect(ingredientFk).toBeDefined();
      expect(ingredientFk?.from).toBe('ingredient_id');
      expect(ingredientFk?.to).toBe('id');
    });

    test('meal_components table has foreign key to preparation_methods', async () => {
      const db = getDatabase();
      const foreignKeys = await db.getAllAsync<{ table: string; from: string; to: string }>(
        `PRAGMA foreign_key_list(meal_components)`
      );

      const prepMethodFk = foreignKeys.find((fk) => fk.table === 'preparation_methods');
      expect(prepMethodFk).toBeDefined();
      expect(prepMethodFk?.from).toBe('preparation_method_id');
      expect(prepMethodFk?.to).toBe('id');
    });

    test('meal_components table is initially empty', async () => {
      const db = getDatabase();
      const components = await db.getAllAsync<{ id: string }>(
        `SELECT id FROM meal_components`
      );
      expect(components).toHaveLength(0);
    });

    test('meal_components allows null preparation_method_id', async () => {
      const db = getDatabase();

      // First, we need to create prerequisite records
      // Create an ingredient
      const now = new Date().toISOString();
      await db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, created_at) VALUES (?, ?, ?, ?, ?)`,
        ['test-ingredient-1', 'Test Milk', 'dairy', '["breakfast"]', now]
      );

      // Create a meal log (using 'date' and 'created_at' columns as per schema)
      await db.runAsync(
        `INSERT INTO meal_logs (id, date, meal_type, ingredients, created_at) VALUES (?, ?, ?, ?, ?)`,
        ['test-meal-log-1', now, 'breakfast', '["test-ingredient-1"]', now]
      );

      // Insert meal_component with null preparation_method_id
      await db.runAsync(
        `INSERT INTO meal_components (id, meal_log_id, ingredient_id, preparation_method_id, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        ['test-component-1', 'test-meal-log-1', 'test-ingredient-1', null, now]
      );

      // Verify insertion
      const component = await db.getFirstAsync<{ id: string; preparation_method_id: string | null }>(
        `SELECT id, preparation_method_id FROM meal_components WHERE id = ?`,
        ['test-component-1']
      );

      expect(component).toBeDefined();
      expect(component?.preparation_method_id).toBeNull();
    });

    test('meal_components can reference valid preparation_method_id', async () => {
      const db = getDatabase();

      const now = new Date().toISOString();
      // Create an ingredient
      await db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, created_at) VALUES (?, ?, ?, ?, ?)`,
        ['test-ingredient-2', 'Test Bread', 'carbs', '["breakfast"]', now]
      );

      // Create a meal log (using 'date' and 'created_at' columns as per schema)
      await db.runAsync(
        `INSERT INTO meal_logs (id, date, meal_type, ingredients, created_at) VALUES (?, ?, ?, ?, ?)`,
        ['test-meal-log-2', now, 'breakfast', '["test-ingredient-2"]', now]
      );

      // Insert meal_component with valid preparation_method_id (using 'prep-grilled')
      await db.runAsync(
        `INSERT INTO meal_components (id, meal_log_id, ingredient_id, preparation_method_id, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        ['test-component-2', 'test-meal-log-2', 'test-ingredient-2', 'prep-grilled', now]
      );

      // Verify insertion and relationship
      const component = await db.getFirstAsync<{ id: string; preparation_method_id: string }>(
        `SELECT mc.id, mc.preparation_method_id
         FROM meal_components mc
         JOIN preparation_methods pm ON mc.preparation_method_id = pm.id
         WHERE mc.id = ?`,
        ['test-component-2']
      );

      expect(component).toBeDefined();
      expect(component?.preparation_method_id).toBe('prep-grilled');
    });
  });

  describe('Migration Version 7: name column in meal_logs', () => {
    test('meal_logs table has name column', async () => {
      const db = getDatabase();
      const columns = await db.getAllAsync<{ name: string; type: string; notnull: number }>(
        `PRAGMA table_info(meal_logs)`
      );

      const nameColumn = columns.find((c) => c.name === 'name');
      expect(nameColumn).toBeDefined();
      expect(nameColumn?.type).toBe('TEXT');
      expect(nameColumn?.notnull).toBe(0); // Nullable
    });

    test('meal_logs name column allows null values', async () => {
      const db = getDatabase();
      const now = new Date().toISOString();

      // Insert meal log without name (using 'date' and 'created_at' columns as per schema)
      await db.runAsync(
        `INSERT INTO meal_logs (id, date, meal_type, ingredients, created_at) VALUES (?, ?, ?, ?, ?)`,
        ['test-unnamed-meal', now, 'breakfast', '["ingredient-1"]', now]
      );

      const meal = await db.getFirstAsync<{ id: string; name: string | null }>(
        `SELECT id, name FROM meal_logs WHERE id = ?`,
        ['test-unnamed-meal']
      );

      expect(meal).toBeDefined();
      expect(meal?.name).toBeNull();
    });

    test('meal_logs name column can store meal names', async () => {
      const db = getDatabase();
      const now = new Date().toISOString();

      // Insert meal log with name (using 'date' and 'created_at' columns as per schema)
      await db.runAsync(
        `INSERT INTO meal_logs (id, date, meal_type, ingredients, created_at, name) VALUES (?, ?, ?, ?, ?, ?)`,
        ['test-named-meal', now, 'breakfast', '["ingredient-1"]', now, "Mom's special"]
      );

      const meal = await db.getFirstAsync<{ id: string; name: string }>(
        `SELECT id, name FROM meal_logs WHERE id = ?`,
        ['test-named-meal']
      );

      expect(meal).toBeDefined();
      expect(meal?.name).toBe("Mom's special");
    });

    test('meal_logs name column can be updated', async () => {
      const db = getDatabase();
      const now = new Date().toISOString();

      // Insert meal log without name (using 'date' and 'created_at' columns as per schema)
      await db.runAsync(
        `INSERT INTO meal_logs (id, date, meal_type, ingredients, created_at) VALUES (?, ?, ?, ?, ?)`,
        ['test-update-name-meal', now, 'breakfast', '["ingredient-1"]', now]
      );

      // Update with name
      await db.runAsync(
        `UPDATE meal_logs SET name = ? WHERE id = ?`,
        ['Granny\'s breakfast', 'test-update-name-meal']
      );

      const meal = await db.getFirstAsync<{ id: string; name: string }>(
        `SELECT id, name FROM meal_logs WHERE id = ?`,
        ['test-update-name-meal']
      );

      expect(meal?.name).toBe("Granny's breakfast");
    });

    test('meal_logs name column can store unicode characters', async () => {
      const db = getDatabase();
      const now = new Date().toISOString();

      // Insert meal log with unicode name (using 'date' and 'created_at' columns as per schema)
      await db.runAsync(
        `INSERT INTO meal_logs (id, date, meal_type, ingredients, created_at, name) VALUES (?, ?, ?, ?, ?, ?)`,
        ['test-unicode-meal', now, 'breakfast', '["ingredient-1"]', now, 'Café da manhã especial 🍳']
      );

      const meal = await db.getFirstAsync<{ id: string; name: string }>(
        `SELECT id, name FROM meal_logs WHERE id = ?`,
        ['test-unicode-meal']
      );

      expect(meal?.name).toBe('Café da manhã especial 🍳');
    });
  });

  describe('Migration idempotency', () => {
    test('migrations are recorded in migrations table', async () => {
      const db = getDatabase();
      const migrations = await db.getAllAsync<{ version: number; applied_at: string }>(
        `SELECT version, applied_at FROM migrations ORDER BY version`
      );

      // Should include versions 5, 6, and 7
      const versions = migrations.map((m) => m.version);
      expect(versions).toContain(5);
      expect(versions).toContain(6);
      expect(versions).toContain(7);
    });

    test('running migrations multiple times does not duplicate preparation_methods', async () => {
      const db = getDatabase();

      // Get count before (should be 12)
      const before = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM preparation_methods`
      );
      expect(before?.count).toBe(12);

      // Re-initialize database (simulating app restart)
      resetTestDatabase();
      resetDatabase();
      await initDatabase();

      // Get count after (should still be 12)
      const after = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM preparation_methods`
      );
      expect(after?.count).toBe(12);
    });
  });
});

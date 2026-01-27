/**
 * Unit tests for Phase 3 Enhanced Variety migrations (version 9)
 * - Version 9: pairing_rules table for ingredient pairing rules
 */

import { resetDatabase, initDatabase, getDatabase } from '../index';
import { resetTestDatabase } from './testDb';

jest.mock('../index');

describe('Phase 3 Migrations - Enhanced Variety', () => {
  beforeEach(async () => {
    resetTestDatabase();
    resetDatabase();
    await initDatabase();
  });

  describe('Migration Version 9: pairing_rules table', () => {
    test('pairing_rules table exists', async () => {
      const db = getDatabase();
      const tables = await db.getAllAsync<{ name: string }>(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='pairing_rules'`
      );
      expect(tables).toHaveLength(1);
      expect(tables[0].name).toBe('pairing_rules');
    });

    test('pairing_rules table has correct schema', async () => {
      const db = getDatabase();
      const columns = await db.getAllAsync<{
        name: string;
        type: string;
        notnull: number;
        pk: number;
      }>(`PRAGMA table_info(pairing_rules)`);

      const columnMap = new Map(columns.map((c) => [c.name, c]));

      // Check id column
      expect(columnMap.has('id')).toBe(true);
      expect(columnMap.get('id')?.type).toBe('TEXT');
      expect(columnMap.get('id')?.pk).toBe(1); // Primary key

      // Check ingredient_a_id column
      expect(columnMap.has('ingredient_a_id')).toBe(true);
      expect(columnMap.get('ingredient_a_id')?.type).toBe('TEXT');
      expect(columnMap.get('ingredient_a_id')?.notnull).toBe(1); // NOT NULL

      // Check ingredient_b_id column
      expect(columnMap.has('ingredient_b_id')).toBe(true);
      expect(columnMap.get('ingredient_b_id')?.type).toBe('TEXT');
      expect(columnMap.get('ingredient_b_id')?.notnull).toBe(1); // NOT NULL

      // Check rule_type column
      expect(columnMap.has('rule_type')).toBe(true);
      expect(columnMap.get('rule_type')?.type).toBe('TEXT');
      expect(columnMap.get('rule_type')?.notnull).toBe(1); // NOT NULL

      // Check created_at column
      expect(columnMap.has('created_at')).toBe(true);
      expect(columnMap.get('created_at')?.type).toBe('TEXT');
      expect(columnMap.get('created_at')?.notnull).toBe(1); // NOT NULL
    });

    test('pairing_rules table has foreign key to ingredients for ingredient_a_id', async () => {
      const db = getDatabase();
      const foreignKeys = await db.getAllAsync<{
        table: string;
        from: string;
        to: string;
      }>(`PRAGMA foreign_key_list(pairing_rules)`);

      const ingredientAFk = foreignKeys.find(
        (fk) => fk.table === 'ingredients' && fk.from === 'ingredient_a_id'
      );
      expect(ingredientAFk).toBeDefined();
      expect(ingredientAFk?.to).toBe('id');
    });

    test('pairing_rules table has foreign key to ingredients for ingredient_b_id', async () => {
      const db = getDatabase();
      const foreignKeys = await db.getAllAsync<{
        table: string;
        from: string;
        to: string;
      }>(`PRAGMA foreign_key_list(pairing_rules)`);

      const ingredientBFk = foreignKeys.find(
        (fk) => fk.table === 'ingredients' && fk.from === 'ingredient_b_id'
      );
      expect(ingredientBFk).toBeDefined();
      expect(ingredientBFk?.to).toBe('id');
    });

    test('pairing_rules table is initially empty', async () => {
      const db = getDatabase();
      const rules = await db.getAllAsync<{ id: string }>(
        `SELECT id FROM pairing_rules`
      );
      expect(rules).toHaveLength(0);
    });

    test('pairing_rules can store positive rule type', async () => {
      const db = getDatabase();
      const now = new Date().toISOString();

      // Create test ingredients
      await db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, created_at) VALUES (?, ?, ?, ?, ?)`,
        ['test-milk', 'Milk', 'dairy', '["breakfast"]', now]
      );
      await db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, created_at) VALUES (?, ?, ?, ?, ?)`,
        ['test-cereals', 'Cereals', 'carbs', '["breakfast"]', now]
      );

      // Insert positive pairing rule
      await db.runAsync(
        `INSERT INTO pairing_rules (id, ingredient_a_id, ingredient_b_id, rule_type, created_at) VALUES (?, ?, ?, ?, ?)`,
        ['rule-1', 'test-milk', 'test-cereals', 'positive', now]
      );

      const rule = await db.getFirstAsync<{
        id: string;
        rule_type: string;
      }>(`SELECT id, rule_type FROM pairing_rules WHERE id = ?`, ['rule-1']);

      expect(rule).toBeDefined();
      expect(rule?.rule_type).toBe('positive');
    });

    test('pairing_rules can store negative rule type', async () => {
      const db = getDatabase();
      const now = new Date().toISOString();

      // Create test ingredients
      await db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, created_at) VALUES (?, ?, ?, ?, ?)`,
        ['test-butter', 'Butter', 'dairy', '["breakfast"]', now]
      );
      await db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, created_at) VALUES (?, ?, ?, ?, ?)`,
        ['test-yogurt', 'Yogurt', 'dairy', '["breakfast"]', now]
      );

      // Insert negative pairing rule
      await db.runAsync(
        `INSERT INTO pairing_rules (id, ingredient_a_id, ingredient_b_id, rule_type, created_at) VALUES (?, ?, ?, ?, ?)`,
        ['rule-2', 'test-butter', 'test-yogurt', 'negative', now]
      );

      const rule = await db.getFirstAsync<{
        id: string;
        rule_type: string;
      }>(`SELECT id, rule_type FROM pairing_rules WHERE id = ?`, ['rule-2']);

      expect(rule).toBeDefined();
      expect(rule?.rule_type).toBe('negative');
    });

    test('pairing_rules has UNIQUE constraint on ingredient pair', async () => {
      const db = getDatabase();
      const now = new Date().toISOString();

      // Create test ingredients
      await db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, created_at) VALUES (?, ?, ?, ?, ?)`,
        ['test-bread', 'Bread', 'carbs', '["breakfast"]', now]
      );
      await db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, created_at) VALUES (?, ?, ?, ?, ?)`,
        ['test-cheese', 'Cheese', 'dairy', '["breakfast"]', now]
      );

      // Insert first rule
      await db.runAsync(
        `INSERT INTO pairing_rules (id, ingredient_a_id, ingredient_b_id, rule_type, created_at) VALUES (?, ?, ?, ?, ?)`,
        ['rule-3', 'test-bread', 'test-cheese', 'positive', now]
      );

      // Try to insert duplicate pair - should fail
      await expect(
        db.runAsync(
          `INSERT INTO pairing_rules (id, ingredient_a_id, ingredient_b_id, rule_type, created_at) VALUES (?, ?, ?, ?, ?)`,
          ['rule-4', 'test-bread', 'test-cheese', 'negative', now]
        )
      ).rejects.toThrow();
    });

    test('pairing_rules allows same ingredients in reverse order', async () => {
      const db = getDatabase();
      const now = new Date().toISOString();

      // Create test ingredients
      await db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, created_at) VALUES (?, ?, ?, ?, ?)`,
        ['test-apple', 'Apple', 'fruit', '["snack"]', now]
      );
      await db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, created_at) VALUES (?, ?, ?, ?, ?)`,
        ['test-peanut', 'Peanut Butter', 'protein', '["snack"]', now]
      );

      // Insert rule A->B
      await db.runAsync(
        `INSERT INTO pairing_rules (id, ingredient_a_id, ingredient_b_id, rule_type, created_at) VALUES (?, ?, ?, ?, ?)`,
        ['rule-5', 'test-apple', 'test-peanut', 'positive', now]
      );

      // Insert rule B->A (reverse order - should succeed as it's a different pair)
      await db.runAsync(
        `INSERT INTO pairing_rules (id, ingredient_a_id, ingredient_b_id, rule_type, created_at) VALUES (?, ?, ?, ?, ?)`,
        ['rule-6', 'test-peanut', 'test-apple', 'positive', now]
      );

      const rules = await db.getAllAsync<{ id: string }>(
        `SELECT id FROM pairing_rules WHERE id IN ('rule-5', 'rule-6')`
      );

      expect(rules).toHaveLength(2);
    });

    test('pairing_rules can be deleted', async () => {
      const db = getDatabase();
      const now = new Date().toISOString();

      // Create test ingredients
      await db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, created_at) VALUES (?, ?, ?, ?, ?)`,
        ['test-egg', 'Egg', 'protein', '["breakfast"]', now]
      );
      await db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, created_at) VALUES (?, ?, ?, ?, ?)`,
        ['test-bacon', 'Bacon', 'protein', '["breakfast"]', now]
      );

      // Insert rule
      await db.runAsync(
        `INSERT INTO pairing_rules (id, ingredient_a_id, ingredient_b_id, rule_type, created_at) VALUES (?, ?, ?, ?, ?)`,
        ['rule-7', 'test-egg', 'test-bacon', 'positive', now]
      );

      // Delete rule
      await db.runAsync(`DELETE FROM pairing_rules WHERE id = ?`, ['rule-7']);

      const rule = await db.getFirstAsync<{ id: string }>(
        `SELECT id FROM pairing_rules WHERE id = ?`,
        ['rule-7']
      );

      expect(rule).toBeNull();
    });
  });

  describe('Migration idempotency', () => {
    test('migration version 9 is recorded in migrations table', async () => {
      const db = getDatabase();
      const migrations = await db.getAllAsync<{
        version: number;
        applied_at: string;
      }>(`SELECT version, applied_at FROM migrations ORDER BY version`);

      const versions = migrations.map((m) => m.version);
      expect(versions).toContain(9);
    });

    test('running migrations multiple times does not duplicate pairing_rules table', async () => {
      const db = getDatabase();

      // Get table count before
      const before = await db.getAllAsync<{ name: string }>(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='pairing_rules'`
      );
      expect(before).toHaveLength(1);

      // Re-initialize database (simulating app restart)
      resetTestDatabase();
      resetDatabase();
      await initDatabase();

      // Get table count after (should still be 1)
      const after = await db.getAllAsync<{ name: string }>(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='pairing_rules'`
      );
      expect(after).toHaveLength(1);
    });
  });
});

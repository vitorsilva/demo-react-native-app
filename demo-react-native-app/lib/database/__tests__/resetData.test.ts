/**
 * Unit tests for resetData.ts functions
 * - resetToDefaults: Full reset with seed data
 * - clearMealHistory: Soft reset (keep ingredients)
 * - hasUserData: Check for user-created data
 */

import { resetDatabase, initDatabase, getDatabase } from '../index';
import { resetTestDatabase } from './testDb';
import { resetToDefaults, clearMealHistory, hasUserData } from '../resetData';
import { SEED_CATEGORIES, SEED_INGREDIENTS, SEED_PAIRING_RULES } from '../seedData';

jest.mock('../index');

describe('resetData', () => {
  beforeEach(async () => {
    resetTestDatabase();
    resetDatabase();
    await initDatabase();
  });

  describe('resetToDefaults', () => {
    test('clears all meal logs', async () => {
      const db = getDatabase();
      const now = new Date().toISOString();

      // Add a test meal log
      await db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, created_at, is_active, is_user_added)
         VALUES (?, ?, ?, ?, ?, 1, 0)`,
        ['test-ing-1', 'Test Ingredient', 'test', '["breakfast"]', now]
      );
      await db.runAsync(
        `INSERT INTO meal_logs (id, date, meal_type, ingredients, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        ['test-log-1', now, 'breakfast', '["test-ing-1"]', now]
      );

      // Verify meal log exists
      const beforeCount = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM meal_logs`
      );
      expect(beforeCount?.count).toBeGreaterThan(0);

      // Reset
      await resetToDefaults(db);

      // Verify meal logs are cleared
      const afterCount = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM meal_logs`
      );
      expect(afterCount?.count).toBe(0);
    });

    test('clears all meal components', async () => {
      const db = getDatabase();
      const now = new Date().toISOString();

      // Add test data
      await db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, created_at, is_active, is_user_added)
         VALUES (?, ?, ?, ?, ?, 1, 0)`,
        ['test-ing-2', 'Test Ingredient 2', 'test', '["breakfast"]', now]
      );
      await db.runAsync(
        `INSERT INTO meal_logs (id, date, meal_type, ingredients, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        ['test-log-2', now, 'breakfast', '["test-ing-2"]', now]
      );
      await db.runAsync(
        `INSERT INTO meal_components (id, meal_log_id, ingredient_id, created_at)
         VALUES (?, ?, ?, ?)`,
        ['test-comp-1', 'test-log-2', 'test-ing-2', now]
      );

      // Verify component exists
      const beforeCount = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM meal_components`
      );
      expect(beforeCount?.count).toBeGreaterThan(0);

      // Reset
      await resetToDefaults(db);

      // Verify components are cleared
      const afterCount = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM meal_components`
      );
      expect(afterCount?.count).toBe(0);
    });

    test('seeds categories after reset', async () => {
      const db = getDatabase();

      // Clear categories first
      await db.runAsync('DELETE FROM categories');

      // Verify cleared
      const beforeCount = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM categories`
      );
      expect(beforeCount?.count).toBe(0);

      // Reset
      await resetToDefaults(db);

      // Verify categories are seeded
      const afterCount = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM categories`
      );
      expect(afterCount?.count).toBe(SEED_CATEGORIES.length);
    });

    test('seeds ingredients with correct category_id', async () => {
      const db = getDatabase();

      // Reset
      await resetToDefaults(db);

      // Check a specific ingredient has correct category
      const milkIngredient = SEED_INGREDIENTS.find((i) => i.name === 'Milk');
      if (milkIngredient) {
        const ingredient = await db.getFirstAsync<{
          category_id: string;
        }>(`SELECT category_id FROM ingredients WHERE id = ?`, [milkIngredient.id]);

        expect(ingredient?.category_id).toBe(milkIngredient.categoryId);
      }
    });

    test('seeds correct number of ingredients', async () => {
      const db = getDatabase();

      // Reset
      await resetToDefaults(db);

      // Verify ingredient count
      const count = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM ingredients`
      );
      expect(count?.count).toBe(SEED_INGREDIENTS.length);
    });

    test('seeds pairing rules after reset', async () => {
      const db = getDatabase();

      // Reset
      await resetToDefaults(db);

      // Verify pairing rules are seeded
      const count = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM pairing_rules`
      );
      expect(count?.count).toBe(SEED_PAIRING_RULES.length);
    });

    test('seeds both positive and negative pairing rules', async () => {
      const db = getDatabase();

      // Reset
      await resetToDefaults(db);

      const positiveCount = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM pairing_rules WHERE rule_type = 'positive'`
      );
      const negativeCount = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM pairing_rules WHERE rule_type = 'negative'`
      );

      expect(positiveCount?.count).toBeGreaterThan(0);
      expect(negativeCount?.count).toBeGreaterThan(0);
    });

    test('preserves meal_types table', async () => {
      const db = getDatabase();

      // Get meal types count before reset
      const beforeCount = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM meal_types`
      );

      // Reset
      await resetToDefaults(db);

      // Meal types should still exist
      const afterCount = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM meal_types`
      );
      expect(afterCount?.count).toBe(beforeCount?.count);
    });

    test('preserves preparation_methods table', async () => {
      const db = getDatabase();

      // Get prep methods count before reset
      const beforeCount = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM preparation_methods`
      );

      // Reset
      await resetToDefaults(db);

      // Prep methods should still exist
      const afterCount = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM preparation_methods`
      );
      expect(afterCount?.count).toBe(beforeCount?.count);
    });

    test('can be called multiple times without error', async () => {
      const db = getDatabase();

      // Call reset multiple times
      await resetToDefaults(db);
      await resetToDefaults(db);
      await resetToDefaults(db);

      // Verify data is still correct
      const categoryCount = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM categories`
      );
      expect(categoryCount?.count).toBe(SEED_CATEGORIES.length);

      const ingredientCount = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM ingredients`
      );
      expect(ingredientCount?.count).toBe(SEED_INGREDIENTS.length);
    });
  });

  describe('clearMealHistory', () => {
    test('clears meal logs', async () => {
      const db = getDatabase();
      const now = new Date().toISOString();

      // Add test meal log
      await db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, created_at, is_active, is_user_added)
         VALUES (?, ?, ?, ?, ?, 1, 0)`,
        ['test-ing-3', 'Test Ingredient 3', 'test', '["breakfast"]', now]
      );
      await db.runAsync(
        `INSERT INTO meal_logs (id, date, meal_type, ingredients, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        ['test-log-3', now, 'breakfast', '["test-ing-3"]', now]
      );

      // Clear history
      await clearMealHistory(db);

      // Verify cleared
      const count = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM meal_logs`
      );
      expect(count?.count).toBe(0);
    });

    test('clears meal components', async () => {
      const db = getDatabase();
      const now = new Date().toISOString();

      // Add test data
      await db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, created_at, is_active, is_user_added)
         VALUES (?, ?, ?, ?, ?, 1, 0)`,
        ['test-ing-4', 'Test Ingredient 4', 'test', '["breakfast"]', now]
      );
      await db.runAsync(
        `INSERT INTO meal_logs (id, date, meal_type, ingredients, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        ['test-log-4', now, 'breakfast', '["test-ing-4"]', now]
      );
      await db.runAsync(
        `INSERT INTO meal_components (id, meal_log_id, ingredient_id, created_at)
         VALUES (?, ?, ?, ?)`,
        ['test-comp-2', 'test-log-4', 'test-ing-4', now]
      );

      // Clear history
      await clearMealHistory(db);

      // Verify cleared
      const count = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM meal_components`
      );
      expect(count?.count).toBe(0);
    });

    test('preserves ingredients', async () => {
      const db = getDatabase();
      const now = new Date().toISOString();

      // Add a custom ingredient
      await db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, created_at, is_active, is_user_added)
         VALUES (?, ?, ?, ?, ?, 1, 1)`,
        ['custom-ing-1', 'Custom Ingredient', 'test', '["breakfast"]', now]
      );

      // Get ingredient count before
      const beforeCount = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM ingredients`
      );

      // Clear history
      await clearMealHistory(db);

      // Ingredients should be preserved
      const afterCount = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM ingredients`
      );
      expect(afterCount?.count).toBe(beforeCount?.count);
    });

    test('preserves categories', async () => {
      const db = getDatabase();

      // Get category count before
      const beforeCount = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM categories`
      );

      // Clear history
      await clearMealHistory(db);

      // Categories should be preserved
      const afterCount = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM categories`
      );
      expect(afterCount?.count).toBe(beforeCount?.count);
    });

    test('preserves pairing rules', async () => {
      const db = getDatabase();

      // Get pairing rules count before
      const beforeCount = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM pairing_rules`
      );

      // Clear history
      await clearMealHistory(db);

      // Pairing rules should be preserved
      const afterCount = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM pairing_rules`
      );
      expect(afterCount?.count).toBe(beforeCount?.count);
    });
  });

  describe('hasUserData', () => {
    test('returns false when no meal logs exist', async () => {
      const db = getDatabase();

      // Clear meal logs
      await db.runAsync('DELETE FROM meal_components');
      await db.runAsync('DELETE FROM meal_logs');

      // Remove user-added ingredients
      await db.runAsync('DELETE FROM ingredients WHERE is_user_added = 1');

      const result = await hasUserData(db);
      expect(result).toBe(false);
    });

    test('returns true when meal logs exist', async () => {
      const db = getDatabase();
      const now = new Date().toISOString();

      // Ensure we have a non-user ingredient first
      await db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, created_at, is_active, is_user_added)
         VALUES (?, ?, ?, ?, ?, 1, 0)`,
        ['test-ing-5', 'Test Ingredient 5', 'test', '["breakfast"]', now]
      );

      // Add a meal log
      await db.runAsync(
        `INSERT INTO meal_logs (id, date, meal_type, ingredients, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        ['test-log-5', now, 'breakfast', '["test-ing-5"]', now]
      );

      const result = await hasUserData(db);
      expect(result).toBe(true);
    });

    test('returns true when user-added ingredients exist', async () => {
      const db = getDatabase();
      const now = new Date().toISOString();

      // Clear meal logs
      await db.runAsync('DELETE FROM meal_components');
      await db.runAsync('DELETE FROM meal_logs');

      // Add a user-added ingredient
      await db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, created_at, is_active, is_user_added)
         VALUES (?, ?, ?, ?, ?, 1, 1)`,
        ['user-ing-1', 'User Ingredient', 'test', '["breakfast"]', now]
      );

      const result = await hasUserData(db);
      expect(result).toBe(true);
    });

    test('returns false when only seed data exists', async () => {
      const db = getDatabase();

      // Reset to defaults (only seed data)
      await resetToDefaults(db);

      const result = await hasUserData(db);
      expect(result).toBe(false);
    });
  });
});

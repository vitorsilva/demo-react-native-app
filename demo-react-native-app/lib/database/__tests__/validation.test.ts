import {
  isCategoryNameUnique,
  isMealTypeNameUnique,
  isIngredientNameUnique,
  validateMealTypeConfig,
  canDeleteIngredient,
  canDisableIngredient,
  validateNonEmptyString,
  validateMaxLength,
} from '../validation';
import { initDatabase, getDatabase, resetDatabase } from '../__mocks__';
import type { DatabaseAdapter } from '../adapters/types';

describe('Validation Functions', () => {
  let db: DatabaseAdapter;

  beforeEach(async () => {
    resetDatabase();
    await initDatabase();
    db = getDatabase();
  });

  describe('validateNonEmptyString', () => {
    it('should return valid for non-empty string', () => {
      const result = validateNonEmptyString('Test', 'Name');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for empty string', () => {
      const result = validateNonEmptyString('', 'Name');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Name cannot be empty');
    });

    it('should return invalid for whitespace-only string', () => {
      const result = validateNonEmptyString('   ', 'Name');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Name cannot be empty');
    });
  });

  describe('validateMaxLength', () => {
    it('should return valid for string within limit', () => {
      const result = validateMaxLength('Test', 10, 'Name');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for string at exactly the limit', () => {
      const result = validateMaxLength('1234567890', 10, 'Name');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for string exceeding limit', () => {
      const result = validateMaxLength('This is a very long string', 10, 'Name');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Name cannot exceed 10 characters');
    });

    it('should return invalid for string one char over limit', () => {
      const result = validateMaxLength('12345678901', 10, 'Name');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateMealTypeConfig', () => {
    it('should return valid for correct config', () => {
      const result = validateMealTypeConfig({
        min_ingredients: 2,
        max_ingredients: 5,
        default_cooldown_days: 3,
      });
      expect(result.isValid).toBe(true);
    });

    it('should return invalid when min > max', () => {
      const result = validateMealTypeConfig({
        min_ingredients: 5,
        max_ingredients: 2,
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Minimum ingredients cannot exceed maximum ingredients');
    });

    it('should return invalid for min_ingredients < 1', () => {
      const result = validateMealTypeConfig({
        min_ingredients: 0,
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Minimum ingredients must be at least 1');
    });

    it('should return invalid for negative cooldown days', () => {
      const result = validateMealTypeConfig({
        default_cooldown_days: -1,
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Cooldown days must be 0 or greater');
    });

    it('should return valid for cooldown days of 0', () => {
      const result = validateMealTypeConfig({
        default_cooldown_days: 0,
      });
      expect(result.isValid).toBe(true);
    });

    it('should return valid for min_ingredients of exactly 1', () => {
      const result = validateMealTypeConfig({
        min_ingredients: 1,
      });
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for max_ingredients of 0', () => {
      const result = validateMealTypeConfig({
        max_ingredients: 0,
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Maximum ingredients must be at least 1');
    });

    it('should return valid for max_ingredients of exactly 1', () => {
      const result = validateMealTypeConfig({
        max_ingredients: 1,
      });
      expect(result.isValid).toBe(true);
    });

    it('should return valid when min equals max', () => {
      const result = validateMealTypeConfig({
        min_ingredients: 3,
        max_ingredients: 3,
      });
      expect(result.isValid).toBe(true);
    });
  });

  describe('isCategoryNameUnique', () => {
    beforeEach(() => {
      // Add a test category
      db.runAsync(
        'INSERT INTO categories (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)',
        ['cat-1', 'Protein', new Date().toISOString(), new Date().toISOString()]
      );
    });

    it('should return valid for unique name', async () => {
      const result = await isCategoryNameUnique(db, 'Vegetables');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for duplicate name', async () => {
      const result = await isCategoryNameUnique(db, 'Protein');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('should return invalid for duplicate name (case-insensitive)', async () => {
      const result = await isCategoryNameUnique(db, 'PROTEIN');
      expect(result.isValid).toBe(false);
    });

    it('should return valid when updating same record', async () => {
      const result = await isCategoryNameUnique(db, 'Protein', 'cat-1');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for empty name', async () => {
      const result = await isCategoryNameUnique(db, '');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Category name cannot be empty');
    });
  });

  describe('isMealTypeNameUnique', () => {
    // Note: The migration already seeds 'breakfast' and 'snack' meal types (lowercase)

    it('should return valid for unique name', async () => {
      const result = await isMealTypeNameUnique(db, 'Lunch');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for duplicate name', async () => {
      // 'breakfast' is seeded by migrations (case-insensitive check)
      const result = await isMealTypeNameUnique(db, 'breakfast');
      expect(result.isValid).toBe(false);
    });

    it('should return invalid for duplicate name (case-insensitive)', async () => {
      // 'BREAKFAST' should match 'breakfast' seeded by migrations
      const result = await isMealTypeNameUnique(db, 'BREAKFAST');
      expect(result.isValid).toBe(false);
    });

    it('should return valid when updating same record', async () => {
      // Get the seeded breakfast meal type ID
      const existing = await db.getFirstAsync<{ id: string }>(
        'SELECT id FROM meal_types WHERE name = ?',
        ['breakfast']
      );
      expect(existing).not.toBeNull();

      const result = await isMealTypeNameUnique(db, 'breakfast', existing!.id);
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for empty name', async () => {
      const result = await isMealTypeNameUnique(db, '');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Meal type name cannot be empty');
    });

    it('should return invalid for whitespace-only name', async () => {
      const result = await isMealTypeNameUnique(db, '   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Meal type name cannot be empty');
    });
  });

  describe('isIngredientNameUnique', () => {
    beforeEach(() => {
      // Add a test ingredient
      db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, is_active, is_user_added, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['ing-1', 'Chicken', 'Protein', '["breakfast"]', 1, 0, new Date().toISOString(), new Date().toISOString()]
      );
    });

    it('should return valid for unique name', async () => {
      const result = await isIngredientNameUnique(db, 'Beef');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for duplicate name', async () => {
      const result = await isIngredientNameUnique(db, 'Chicken');
      expect(result.isValid).toBe(false);
    });

    it('should return valid when updating same record', async () => {
      const result = await isIngredientNameUnique(db, 'Chicken', 'ing-1');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for empty name', async () => {
      const result = await isIngredientNameUnique(db, '');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Ingredient name cannot be empty');
    });

    it('should return invalid for whitespace-only name', async () => {
      const result = await isIngredientNameUnique(db, '   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Ingredient name cannot be empty');
    });
  });

  describe('canDeleteIngredient', () => {
    beforeEach(() => {
      // Add two active ingredients for breakfast
      db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, is_active, is_user_added, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['ing-1', 'Eggs', 'Protein', '["breakfast"]', 1, 0, new Date().toISOString(), new Date().toISOString()]
      );
      db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, is_active, is_user_added, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['ing-2', 'Bacon', 'Protein', '["breakfast"]', 1, 0, new Date().toISOString(), new Date().toISOString()]
      );
    });

    it('should return valid when other active ingredients exist', async () => {
      const result = await canDeleteIngredient(db, 'ing-1');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid when it is the last active ingredient', async () => {
      // Disable one ingredient first
      db.runAsync('UPDATE ingredients SET is_active = 0 WHERE id = ?', ['ing-2']);

      const result = await canDeleteIngredient(db, 'ing-1');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('last active ingredient');
    });

    it('should return valid for inactive ingredient', async () => {
      // Disable the ingredient
      db.runAsync('UPDATE ingredients SET is_active = 0 WHERE id = ?', ['ing-1']);

      const result = await canDeleteIngredient(db, 'ing-1');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for non-existent ingredient', async () => {
      const result = await canDeleteIngredient(db, 'non-existent');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Ingredient not found');
    });
  });

  describe('canDisableIngredient', () => {
    beforeEach(() => {
      // Add two active ingredients for breakfast
      db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, is_active, is_user_added, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['ing-1', 'Eggs', 'Protein', '["breakfast"]', 1, 0, new Date().toISOString(), new Date().toISOString()]
      );
      db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, is_active, is_user_added, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['ing-2', 'Bacon', 'Protein', '["breakfast"]', 1, 0, new Date().toISOString(), new Date().toISOString()]
      );
    });

    it('should return valid when other active ingredients exist', async () => {
      const result = await canDisableIngredient(db, 'ing-1');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid when it is the last active ingredient', async () => {
      // Disable one ingredient first
      db.runAsync('UPDATE ingredients SET is_active = 0 WHERE id = ?', ['ing-2']);

      const result = await canDisableIngredient(db, 'ing-1');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('last active ingredient');
    });

    it('should return valid for already inactive ingredient (enabling)', async () => {
      // Disable the ingredient first
      db.runAsync('UPDATE ingredients SET is_active = 0 WHERE id = ?', ['ing-1']);

      const result = await canDisableIngredient(db, 'ing-1');
      expect(result.isValid).toBe(true);
    });
  });
});

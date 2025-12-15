
  import { initDatabase, resetDatabase, getDatabase } from '../index';
  import {
    getAllMealTypes,
    getMealTypeById,
    addMealType,
    updateMealType,
    deleteMealType,
  } from '../mealTypes';
  import { resetTestDatabase } from './testDb';

  jest.mock('../index');

  describe('MealType Operations', () => {
    beforeEach(async () => {
      resetTestDatabase();
      resetDatabase();
      await initDatabase();
    });

    test('getAllMealTypes returns seeded meal types (breakfast, snack)', async () => {
      const db = getDatabase();
      const mealTypes = await getAllMealTypes(db);

      expect(mealTypes.length).toBeGreaterThanOrEqual(2);
      const names = mealTypes.map(mt => mt.name);
      expect(names).toContain('breakfast');
      expect(names).toContain('snack');
    });

    test('getAllMealTypes with activeOnly=true filters inactive meal types', async () => {
      const db = getDatabase();

      // Add an inactive meal type
      await addMealType(db, { name: 'inactive-test', is_active: false });

      const allMealTypes = await getAllMealTypes(db);
      const activeMealTypes = await getAllMealTypes(db, true);

      expect(allMealTypes.length).toBeGreaterThan(activeMealTypes.length);
      expect(activeMealTypes.every(mt => mt.is_active)).toBe(true);
    });

    test('addMealType creates meal type with generated ID and defaults', async () => {
      const db = getDatabase();
      const mealType = await addMealType(db, { name: 'Lunch' });

      expect(mealType).toBeDefined();
      expect(mealType.id).toBeDefined();
      expect(mealType.name).toBe('Lunch');
      expect(mealType.min_ingredients).toBe(1); // Your custom default
      expect(mealType.max_ingredients).toBe(4);
      expect(mealType.default_cooldown_days).toBe(3);
      expect(mealType.is_active).toBe(true);
    });

    test('addMealType with custom settings', async () => {
      const db = getDatabase();
      const mealType = await addMealType(db, {
        name: 'Dinner',
        min_ingredients: 3,
        max_ingredients: 6,
        default_cooldown_days: 5,
      });

      expect(mealType.min_ingredients).toBe(3);
      expect(mealType.max_ingredients).toBe(6);
      expect(mealType.default_cooldown_days).toBe(5);
    });

    test('getMealTypeById returns the correct meal type', async () => {
      const db = getDatabase();
      const created = await addMealType(db, { name: 'Dessert' });

      const found = await getMealTypeById(db, created.id);
      expect(found).not.toBeNull();
      expect(found?.name).toBe('Dessert');
      expect(found?.is_active).toBe(true);
    });

    test('getMealTypeById returns null for non-existent ID', async () => {
      const db = getDatabase();
      const found = await getMealTypeById(db, 'non-existent-id');
      expect(found).toBeNull();
    });

    test('updateMealType updates single field', async () => {
      const db = getDatabase();
      const created = await addMealType(db, { name: 'Brunch' });

      await new Promise(resolve => setTimeout(resolve, 10));

      const updated = await updateMealType(db, created.id, { name: 'Late Brunch' });

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('Late Brunch');
      expect(updated?.min_ingredients).toBe(created.min_ingredients); // unchanged
      expect(updated?.updated_at).not.toBe(created.updated_at);
    });

    test('updateMealType updates multiple fields', async () => {
      const db = getDatabase();
      const created = await addMealType(db, { name: 'TestMeal' });

      const updated = await updateMealType(db, created.id, {
        min_ingredients: 2,
        max_ingredients: 5,
        is_active: false,
      });

      expect(updated?.name).toBe('TestMeal'); // unchanged
      expect(updated?.min_ingredients).toBe(2);
      expect(updated?.max_ingredients).toBe(5);
      expect(updated?.is_active).toBe(false);
    });

    test('deleteMealType removes meal type when no references', async () => {
      const db = getDatabase();
      const created = await addMealType(db, { name: 'ToDelete' });

      const result = await deleteMealType(db, created.id);
      expect(result.success).toBe(true);

      const found = await getMealTypeById(db, created.id);
      expect(found).toBeNull();
    });
        
  });
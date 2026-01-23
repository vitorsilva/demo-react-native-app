import { resetDatabase, initDatabase, getDatabase } from '../index';
import { addIngredient, getAllIngredients, deleteIngredient } from '../ingredients';
import { logMeal, getRecentMealLogs, toggleMealLogFavorite } from '../mealLogs';
import { resetTestDatabase } from './testDb';

jest.mock('../index');

describe('Favorites Feature - Database Operations', () => {
  let ingredientIds: string[] = [];

  beforeEach(async () => {
    // Reset and initialize
    resetTestDatabase();
    resetDatabase();
    await initDatabase();

    // Clear all ingredients
    const db = getDatabase();
    const allIngredients = await getAllIngredients(db);
    for (const ingredient of allIngredients) {
      await deleteIngredient(db, ingredient.id);
    }

    // Create test ingredients
    const milkId = await addIngredient(db, {
      name: 'Milk',
      category: 'protein',
      mealTypes: ['breakfast'],
    });
    const breadId = await addIngredient(db, {
      name: 'Bread',
      category: 'carb',
      mealTypes: ['breakfast'],
    });
    const jamId = await addIngredient(db, {
      name: 'Jam',
      category: 'sweet',
      mealTypes: ['breakfast'],
    });

    ingredientIds = [milkId.id, breadId.id, jamId.id];
  });

  describe('logMeal with favorite status', () => {
    test('logMeal creates meal log with isFavorite defaulting to false', async () => {
      const db = getDatabase();
      const meal = await logMeal(db, {
        date: new Date().toISOString(),
        mealType: 'breakfast',
        ingredients: ingredientIds,
      });

      expect(meal.isFavorite).toBe(false);
    });

    test('logMeal creates meal log with isFavorite set to true when specified', async () => {
      const db = getDatabase();
      const meal = await logMeal(db, {
        date: new Date().toISOString(),
        mealType: 'breakfast',
        ingredients: ingredientIds,
        isFavorite: true,
      });

      expect(meal.isFavorite).toBe(true);
    });

    test('logMeal creates meal log with isFavorite set to false when explicitly specified', async () => {
      const db = getDatabase();
      const meal = await logMeal(db, {
        date: new Date().toISOString(),
        mealType: 'breakfast',
        ingredients: ingredientIds,
        isFavorite: false,
      });

      expect(meal.isFavorite).toBe(false);
    });
  });

  describe('toggleMealLogFavorite', () => {
    test('toggleMealLogFavorite changes false to true', async () => {
      const db = getDatabase();
      // Create meal with isFavorite = false
      const meal = await logMeal(db, {
        date: new Date().toISOString(),
        mealType: 'breakfast',
        ingredients: ingredientIds,
        isFavorite: false,
      });

      expect(meal.isFavorite).toBe(false);

      // Toggle to true
      const updatedMeal = await toggleMealLogFavorite(db, meal.id);

      expect(updatedMeal.isFavorite).toBe(true);
      expect(updatedMeal.id).toBe(meal.id);
      expect(updatedMeal.mealType).toBe(meal.mealType);
      expect(updatedMeal.ingredients).toEqual(meal.ingredients);
    });

    test('toggleMealLogFavorite changes true to false', async () => {
      const db = getDatabase();
      // Create meal with isFavorite = true
      const meal = await logMeal(db, {
        date: new Date().toISOString(),
        mealType: 'breakfast',
        ingredients: ingredientIds,
        isFavorite: true,
      });

      expect(meal.isFavorite).toBe(true);

      // Toggle to false
      const updatedMeal = await toggleMealLogFavorite(db, meal.id);

      expect(updatedMeal.isFavorite).toBe(false);
    });

    test('toggleMealLogFavorite can toggle multiple times', async () => {
      const db = getDatabase();
      const meal = await logMeal(db, {
        date: new Date().toISOString(),
        mealType: 'breakfast',
        ingredients: ingredientIds,
      });

      expect(meal.isFavorite).toBe(false);

      // Toggle to true
      let updated = await toggleMealLogFavorite(db, meal.id);
      expect(updated.isFavorite).toBe(true);

      // Toggle back to false
      updated = await toggleMealLogFavorite(db, meal.id);
      expect(updated.isFavorite).toBe(false);

      // Toggle to true again
      updated = await toggleMealLogFavorite(db, meal.id);
      expect(updated.isFavorite).toBe(true);
    });

    test('toggleMealLogFavorite persists change to database', async () => {
      const db = getDatabase();
      const meal = await logMeal(db, {
        date: new Date().toISOString(),
        mealType: 'breakfast',
        ingredients: ingredientIds,
        isFavorite: false,
      });

      // Toggle to true
      await toggleMealLogFavorite(db, meal.id);

      // Fetch from database to verify persistence
      const meals = await getRecentMealLogs(db, 7);
      const fetchedMeal = meals.find((m) => m.id === meal.id);

      expect(fetchedMeal).toBeDefined();
      expect(fetchedMeal!.isFavorite).toBe(true);
    });

    test('toggleMealLogFavorite throws error for non-existent meal', async () => {
      const db = getDatabase();
      const nonExistentId = 'non-existent-id-12345';

      await expect(toggleMealLogFavorite(db, nonExistentId)).rejects.toThrow(
        `Meal log with id ${nonExistentId} not found`
      );
    });
  });

  describe('getRecentMealLogs includes isFavorite status', () => {
    test('getRecentMealLogs returns correct isFavorite status for each meal', async () => {
      const db = getDatabase();

      // Create multiple meals with different favorite statuses
      await logMeal(db, {
        date: new Date().toISOString(),
        mealType: 'breakfast',
        ingredients: ingredientIds.slice(0, 2),
        isFavorite: true,
      });

      await logMeal(db, {
        date: new Date().toISOString(),
        mealType: 'lunch',
        ingredients: ingredientIds.slice(1, 3),
        isFavorite: false,
      });

      await logMeal(db, {
        date: new Date().toISOString(),
        mealType: 'dinner',
        ingredients: ingredientIds,
        isFavorite: true,
      });

      const meals = await getRecentMealLogs(db, 7);

      expect(meals).toHaveLength(3);

      // Find each meal by type and check favorite status
      const breakfastMeal = meals.find((m) => m.mealType === 'breakfast');
      const lunchMeal = meals.find((m) => m.mealType === 'lunch');
      const dinnerMeal = meals.find((m) => m.mealType === 'dinner');

      expect(breakfastMeal?.isFavorite).toBe(true);
      expect(lunchMeal?.isFavorite).toBe(false);
      expect(dinnerMeal?.isFavorite).toBe(true);
    });

    test('meal logs can be filtered by favorite status', async () => {
      const db = getDatabase();

      // Create mix of favorite and non-favorite meals
      await logMeal(db, {
        date: new Date().toISOString(),
        mealType: 'breakfast',
        ingredients: ingredientIds.slice(0, 2),
        isFavorite: true,
      });

      await logMeal(db, {
        date: new Date().toISOString(),
        mealType: 'lunch',
        ingredients: ingredientIds.slice(1, 3),
        isFavorite: false,
      });

      await logMeal(db, {
        date: new Date().toISOString(),
        mealType: 'dinner',
        ingredients: ingredientIds,
        isFavorite: true,
      });

      await logMeal(db, {
        date: new Date().toISOString(),
        mealType: 'snack',
        ingredients: ingredientIds.slice(0, 1),
        isFavorite: false,
      });

      const meals = await getRecentMealLogs(db, 7);

      // Test filtering favorites only (as done in the UI)
      const favoritesOnly = meals.filter((m) => m.isFavorite);
      expect(favoritesOnly).toHaveLength(2);
      expect(favoritesOnly.every((m) => m.isFavorite)).toBe(true);

      // Test filtering non-favorites
      const nonFavorites = meals.filter((m) => !m.isFavorite);
      expect(nonFavorites).toHaveLength(2);
      expect(nonFavorites.every((m) => !m.isFavorite)).toBe(true);
    });
  });
});

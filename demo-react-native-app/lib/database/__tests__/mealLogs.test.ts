import { resetDatabase, initDatabase } from '../index';
import { logMeal, getRecentMealLogs, getMealLogsByDateRange, deleteMealLog } from '../mealLogs';
import { addIngredient, getAllIngredients, deleteIngredient } from '../ingredients';
import { resetTestDatabase } from './testDb';

describe('Meal Log Operations', () => {
  let ingredientIds: string[] = [];

  beforeEach(async () => {
    // Reset and initialize
    resetTestDatabase();
    resetDatabase();
    await initDatabase();

    // Clear all ingredients and meal logs
    const allIngredients = await getAllIngredients();
    for (const ingredient of allIngredients) {
      await deleteIngredient(ingredient.id);
    }

    // Create test ingredients
    const milkId = await addIngredient({
      name: 'Milk',
      category: 'protein',
      mealTypes: ['breakfast'],
    });
    const breadId = await addIngredient({
      name: 'Bread',
      category: 'carb',
      mealTypes: ['breakfast'],
    });
    const jamId = await addIngredient({
      name: 'Jam',
      category: 'sweet',
      mealTypes: ['breakfast'],
    });

    ingredientIds = [milkId, breadId, jamId];
  });

  test('logMeal creates meal log with generatedID', async () => {
    const mealId = await logMeal({
      date: new Date().toISOString(),
      mealType: 'breakfast',
      ingredients: ingredientIds,
    });

    expect(mealId).toBeDefined();
    expect(typeof mealId).toBe('string');
    expect(mealId.length).toBeGreaterThan(0);
  });

  test('getRecentMealLogs returns empty array when no meals', async () => {
    const meals = await getRecentMealLogs(7);
    expect(meals).toEqual([]);
  });

  test('getRecentMealLogs returns meals from last N days', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 8);

    // Log meal today
    await logMeal({
      date: today.toISOString(),
      mealType: 'breakfast',
      ingredients: ingredientIds.slice(0, 2),
    });

    // Log meal yesterday
    await logMeal({
      date: yesterday.toISOString(),
      mealType: 'snack',
      ingredients: ingredientIds.slice(1, 3),
    });

    // Log meal last week (8 days ago)
    await logMeal({
      date: lastWeek.toISOString(),
      mealType: 'breakfast',
      ingredients: ingredientIds,
    });

    // Get recent 7 days - should exclude last week's meal
    const recent = await getRecentMealLogs(7);
    expect(recent).toHaveLength(2);

    // Get recent 10 days - should include all
    const all = await getRecentMealLogs(10);
    expect(all).toHaveLength(3);
  });

  test('getRecentMealLogs returns meals in descending order by date', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await logMeal({
      date: yesterday.toISOString(),
      mealType: 'breakfast',
      ingredients: ingredientIds,
    });

    await logMeal({
      date: today.toISOString(),
      mealType: 'snack',
      ingredients: ingredientIds,
    });

    const meals = await getRecentMealLogs(7);
    expect(meals).toHaveLength(2);
    // Most recent first
    expect(new Date(meals[0].date).getTime()).toBeGreaterThan(new Date(meals[1].date).getTime());
  });

  test('getMealLogsByDateRange filters by date range', async () => {
    const date1 = '2025-01-01T10:00:00.000Z';
    const date2 = '2025-01-05T10:00:00.000Z';
    const date3 = '2025-01-10T10:00:00.000Z';

    await logMeal({ date: date1, mealType: 'breakfast', ingredients: ingredientIds });
    await logMeal({ date: date2, mealType: 'snack', ingredients: ingredientIds });
    await logMeal({ date: date3, mealType: 'breakfast', ingredients: ingredientIds });

    // Query range 2025-01-04 to 2025-01-09 (should only get date2)
    const meals = await getMealLogsByDateRange(
      '2025-01-04T00:00:00.000Z',
      '2025-01-09T23:59:59.999Z'
    );

    expect(meals).toHaveLength(1);
    expect(meals[0].date).toBe(date2);
  });

  test('meal log has correct structure after retrieval', async () => {
    await logMeal({
      date: new Date().toISOString(),
      mealType: 'breakfast',
      ingredients: ingredientIds,
    });

    const meals = await getRecentMealLogs(7);
    const meal = meals[0];

    expect(meal).toHaveProperty('id');
    expect(meal).toHaveProperty('date');
    expect(meal).toHaveProperty('mealType');
    expect(meal).toHaveProperty('ingredients');
    expect(meal).toHaveProperty('createdAt');

    expect(meal.mealType).toBe('breakfast');

    expect(meal.ingredients).toEqual(ingredientIds);

    expect(Array.isArray(meal.ingredients)).toBe(true);
  });

  test('deleteMealLog removes meal from database', async () => {
    const mealId = await logMeal({
      date: new Date().toISOString(),
      mealType: 'breakfast',
      ingredients: ingredientIds,
    });

    let meals = await getRecentMealLogs(7);
    expect(meals).toHaveLength(1);

    await deleteMealLog(mealId);

    meals = await getRecentMealLogs(7);
    expect(meals).toHaveLength(0);
  });
});

import { initDatabase, resetDatabase } from '../index';
import {
  addIngredient,
  getAllIngredients,
  getIngredientsByMealType,
  deleteIngredient,
} from '../ingredients';
import { resetTestDatabase } from './testDb';

describe('Ingredient Operations', () => {
  beforeEach(async () => {
    // Reset the mock database completely
    resetTestDatabase();
    resetDatabase();

    // Initialize a fresh database
    await initDatabase();
  });

  test('addIngredient creates ingredient with generated ID', async () => {
    const ingredient = await addIngredient({
      name: 'Greek Yogurt',
      category: 'protein',
      mealTypes: ['breakfast'],
    });
    expect(ingredient).toBeDefined();
    // maybe add that id is set?
    expect(typeof ingredient).toBe('string'); // dont understand why
    expect(ingredient.length).toBeGreaterThan(0);
  });

  test('getAllIngredients returns empty array when no ingredients', async () => {
    const ingredients = await getAllIngredients();
    expect(ingredients).toEqual([]);
  });

  test('getAllIngredients returns all added ingredients', async () => {
    await addIngredient({
      name: 'Milk',
      category: 'protein',
      mealTypes: ['breakfast'],
    });
    await addIngredient({
      name: 'Bread',
      category: 'carb',
      mealTypes: ['breakfast', 'snack'],
    });

    const ingredients = await getAllIngredients();
    expect(ingredients).toHaveLength(2);
    // why alphabetical order?
    expect(ingredients[0].name).toBe('Bread'); // Alphabetical order
    expect(ingredients[1].name).toBe('Milk');
  });

  test('getIngredientsByMealType filters breakfast ingredients', async () => {
    await addIngredient({
      name: 'Milk',
      category: 'protein',
      mealTypes: ['breakfast'],
    });
    await addIngredient({
      name: 'Apple',
      category: 'fruit',
      mealTypes: ['snack'],
    });
    await addIngredient({
      name: 'Bread',
      category: 'carb',
      mealTypes: ['breakfast', 'snack'],
    });

    const breakfastIngredients = await getIngredientsByMealType('breakfast');
    expect(breakfastIngredients).toHaveLength(2);
    expect(breakfastIngredients.map((i) => i.name).sort()).toEqual(['Bread', 'Milk']);
  });

  test('getIngredientsByMealType filters snack ingredients', async () => {
    await addIngredient({
      name: 'Milk',
      category: 'protein',
      mealTypes: ['breakfast'],
    });
    await addIngredient({
      name: 'Apple',
      category: 'fruit',
      mealTypes: ['snack'],
    });
    await addIngredient({
      name: 'Bread',
      category: 'carb',
      mealTypes: ['breakfast', 'snack'],
    });

    const snackIngredients = await getIngredientsByMealType('snack');
    expect(snackIngredients).toHaveLength(2);
    expect(snackIngredients.map((i) => i.name).sort()).toEqual(['Apple', 'Bread']);
  });

  test('deleteIngredient removes ingredient from database', async () => {
    const id = await addIngredient({
      name: 'Milk',
      category: 'protein',
      mealTypes: ['breakfast'],
    });

    let ingredients = await getAllIngredients();
    expect(ingredients).toHaveLength(1);

    await deleteIngredient(id);

    ingredients = await getAllIngredients();
    expect(ingredients).toHaveLength(0);
  });

  test('ingredient has correct structure after retrieval', async () => {
    await addIngredient({
      name: 'Greek Yogurt',
      category: 'protein',
      mealTypes: ['breakfast'],
    });

    const ingredients = await getAllIngredients();
    const ingredient = ingredients[0];

    expect(ingredient).toHaveProperty('id');
    expect(ingredient).toHaveProperty('name');
    expect(ingredient).toHaveProperty('category');
    expect(ingredient).toHaveProperty('mealTypes');
    expect(ingredient).toHaveProperty('createdAt');

    expect(ingredient.category).toBe('protein');
    expect(ingredient.mealTypes).toEqual(['breakfast']);
    expect(new Date(ingredient.createdAt).getTime()).toBeGreaterThan(0);
  });
});

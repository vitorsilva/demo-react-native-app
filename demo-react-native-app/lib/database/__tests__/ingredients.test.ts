import { initDatabase, resetDatabase, getDatabase } from '../index';
import {
  addIngredient,
  getAllIngredients,
  getIngredientsByMealType,
  deleteIngredient,
} from '../ingredients';
import { resetTestDatabase } from './testDb';

jest.mock('../index');

describe('Ingredient Operations', () => {
  beforeEach(async () => {
    // Reset the mock database completely
    resetTestDatabase();
    resetDatabase();

    // Initialize a fresh database
    await initDatabase();
  });

  test('addIngredient creates ingredient with generated ID', async () => {
    const db = getDatabase();
    const ingredient = await addIngredient(db, {
      name: 'Greek Yogurt',
      category: 'protein',
      mealTypes: ['breakfast'],
    });
    expect(ingredient).toBeDefined();
    // maybe add that id is set?
    expect(typeof ingredient).toBe('object');
    expect(ingredient.id).toBeDefined();
    expect(typeof ingredient.id).toBe('string');
    expect(ingredient.id.length).toBeGreaterThan(0);
    expect(ingredient.name).toBe('Greek Yogurt');
    expect(ingredient.category).toBe('protein');
    expect(ingredient.createdAt).toBeDefined();
  });

  test('getAllIngredients returns empty array when no ingredients', async () => {
    const db = getDatabase();
    const ingredients = await getAllIngredients(db);
    expect(ingredients).toEqual([]);
  });

  test('getAllIngredients returns all added ingredients', async () => {
    const db = getDatabase();
    await addIngredient(db, {
      name: 'Milk',
      category: 'protein',
      mealTypes: ['breakfast'],
    });
    await addIngredient(db, {
      name: 'Bread',
      category: 'carb',
      mealTypes: ['breakfast', 'snack'],
    });

    const ingredients = await getAllIngredients(db);
    expect(ingredients).toHaveLength(2);
    // why alphabetical order?
    expect(ingredients[0].name).toBe('Bread'); // Alphabetical order
    expect(ingredients[1].name).toBe('Milk');
  });

  test('getIngredientsByMealType filters breakfast ingredients', async () => {
    const db = getDatabase();
    await addIngredient(db, {
      name: 'Milk',
      category: 'protein',
      mealTypes: ['breakfast'],
    });
    await addIngredient(db, {
      name: 'Apple',
      category: 'fruit',
      mealTypes: ['snack'],
    });
    await addIngredient(db, {
      name: 'Bread',
      category: 'carb',
      mealTypes: ['breakfast', 'snack'],
    });

    const breakfastIngredients = await getIngredientsByMealType(db, 'breakfast');
    expect(breakfastIngredients).toHaveLength(2);
    expect(breakfastIngredients.map((i) => i.name).sort()).toEqual(['Bread', 'Milk']);
  });

  test('getIngredientsByMealType filters snack ingredients', async () => {
    const db = getDatabase();
    await addIngredient(db, {
      name: 'Milk',
      category: 'protein',
      mealTypes: ['breakfast'],
    });
    await addIngredient(db, {
      name: 'Apple',
      category: 'fruit',
      mealTypes: ['snack'],
    });
    await addIngredient(db, {
      name: 'Bread',
      category: 'carb',
      mealTypes: ['breakfast', 'snack'],
    });

    const snackIngredients = await getIngredientsByMealType(db, 'snack');
    expect(snackIngredients).toHaveLength(2);
    expect(snackIngredients.map((i) => i.name).sort()).toEqual(['Apple', 'Bread']);
  });

  test('deleteIngredient removes ingredient from database', async () => {
    const db = getDatabase();
    const id = await addIngredient(db, {
      name: 'Milk',
      category: 'protein',
      mealTypes: ['breakfast'],
    });

    let ingredients = await getAllIngredients(db);
    expect(ingredients).toHaveLength(1);

    await deleteIngredient(db, ingredients[0].id);

    ingredients = await getAllIngredients(db);
    expect(ingredients).toHaveLength(0);
  });

  test('ingredient has correct structure after retrieval', async () => {
    const db = getDatabase();
    await addIngredient(db, {
      name: 'Greek Yogurt',
      category: 'protein',
      mealTypes: ['breakfast'],
    });

    const ingredients = await getAllIngredients(db);
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

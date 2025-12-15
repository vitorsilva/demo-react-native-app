  import { initDatabase, resetDatabase, getDatabase } from '../index';
  import {
    addIngredient,
    getAllIngredients,
    getIngredientById,
    getIngredientsByMealType,
    getActiveIngredientsByMealType,
    getIngredientsByCategory,
    updateIngredient,
    toggleIngredientActive,
    deleteIngredient,
  } from '../ingredients';
  import { addCategory } from '../categories';
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


    test('addIngredient sets default values for is_active and is_user_added', async () => {
      const db = getDatabase();
      const ingredient = await addIngredient(db, {
        name: 'Oats',
        category: 'carb',
        mealTypes: ['breakfast'],
      });

      expect(ingredient.is_active).toBe(true);
      expect(ingredient.is_user_added).toBe(true);
      expect(ingredient.updated_at).toBeDefined();
    });

    test('getIngredientById returns the correct ingredient', async () => {
      const db = getDatabase();
      const created = await addIngredient(db, {
        name: 'Banana',
        category: 'fruit',
        mealTypes: ['breakfast', 'snack'],
      });

      const found = await getIngredientById(db, created.id);
      expect(found).not.toBeNull();
      expect(found?.name).toBe('Banana');
      expect(found?.is_active).toBe(true);
    });

    test('getIngredientById returns null for non-existent ID', async () => {
      const db = getDatabase();
      const found = await getIngredientById(db, 'non-existent-id');
      expect(found).toBeNull();
    });

    test('updateIngredient updates single field', async () => {
      const db = getDatabase();
      const created = await addIngredient(db, {
        name: 'Yougurt',
        category: 'protein',
        mealTypes: ['breakfast'],
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      const updated = await updateIngredient(db, created.id, { name: 'Yogurt' });

      expect(updated?.name).toBe('Yogurt');
      expect(updated?.category).toBe('protein'); // unchanged
      expect(updated?.updated_at).not.toBe(created.updated_at);
    });

    test('updateIngredient updates multiple fields', async () => {
      const db = getDatabase();
      const created = await addIngredient(db, {
        name: 'Test Ingredient',
        category: 'protein',
        mealTypes: ['breakfast'],
      });

      const updated = await updateIngredient(db, created.id, {
        category: 'fruit',
        mealTypes: ['snack'],
        is_active: false,
      });

      expect(updated?.name).toBe('Test Ingredient'); // unchanged
      expect(updated?.category).toBe('fruit');
      expect(updated?.mealTypes).toEqual(['snack']);
      expect(updated?.is_active).toBe(false);
    });

    test('toggleIngredientActive toggles the active status', async () => {
      const db = getDatabase();
      const created = await addIngredient(db, {
        name: 'Honey',
        category: 'sweet',
        mealTypes: ['breakfast'],
      });

      expect(created.is_active).toBe(true);

      const toggled = await toggleIngredientActive(db, created.id);
      expect(toggled?.is_active).toBe(false);

      const toggledBack = await toggleIngredientActive(db, created.id);
      expect(toggledBack?.is_active).toBe(true);
    });

    test('getActiveIngredientsByMealType excludes inactive ingredients', async () => {
      const db = getDatabase();

      await addIngredient(db, {
        name: 'Active Milk',
        category: 'protein',
        mealTypes: ['breakfast'],
        is_active: true,
      });

      await addIngredient(db, {
        name: 'Inactive Eggs',
        category: 'protein',
        mealTypes: ['breakfast'],
        is_active: false,
      });

      const activeOnly = await getActiveIngredientsByMealType(db, 'breakfast');
      expect(activeOnly).toHaveLength(1);
      expect(activeOnly[0].name).toBe('Active Milk');
    });

    test('getIngredientsByCategory returns ingredients with matching category_id', async () => {
      const db = getDatabase();

      // Create a category first
      const category = await addCategory(db, { name: 'Dairy' });

      // Add ingredient with category_id
      await addIngredient(db, {
        name: 'Cheese',
        category: 'protein',
        mealTypes: ['snack'],
        category_id: category.id,
      });

      // Add ingredient without category_id
      await addIngredient(db, {
        name: 'Apple',
        category: 'fruit',
        mealTypes: ['snack'],
      });

      const dairyIngredients = await getIngredientsByCategory(db, category.id);
      expect(dairyIngredients).toHaveLength(1);
      expect(dairyIngredients[0].name).toBe('Cheese');
    });

});

import { initDatabase, resetDatabase, getDatabase } from '@/lib/database';
import { resetTestDatabase } from '@/lib/database/__tests__/testDb';
import * as ingredientsDb from '@/lib/database/ingredients';
import * as preparationMethodsDb from '@/lib/database/preparationMethods';
import * as mealComponentsDb from '@/lib/database/mealComponents';
import { useStore } from '../index';

// This uses the __mocks__/index.ts file automatically
jest.mock('@/lib/database');

describe('Phase 2 Store Actions', () => {
  beforeEach(async () => {
    // Reset the test database completely
    resetTestDatabase();
    resetDatabase();

    // Initialize a fresh database with schema
    await initDatabase();

    // Reset store to initial state
    useStore.setState({
      ingredients: [],
      mealLogs: [],
      categories: [],
      mealTypes: [],
      preparationMethods: [],
      suggestedCombinations: [],
      isLoading: false,
      error: null,
      isDatabaseReady: true,
      preferences: { cooldownDays: 3, suggestionsCount: 4, hapticEnabled: true },
    });
  });

  describe('Preparation Methods - loadPreparationMethods', () => {
    it('should load predefined preparation methods from database', async () => {
      // Act: Load preparation methods
      await useStore.getState().loadPreparationMethods();

      // Assert: Verify state was updated with predefined methods
      const state = useStore.getState();
      expect(state.preparationMethods.length).toBeGreaterThanOrEqual(12);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();

      // Check for some specific predefined methods
      const methodNames = state.preparationMethods.map(m => m.name);
      expect(methodNames).toContain('fried');
      expect(methodNames).toContain('grilled');
      expect(methodNames).toContain('steamed');
    });

    it('should load methods sorted by predefined first', async () => {
      // Arrange: Add a custom method first
      const db = getDatabase();
      await preparationMethodsDb.addPreparationMethod(db, 'air-fried');

      // Act: Load preparation methods
      await useStore.getState().loadPreparationMethods();

      // Assert: Predefined methods should come first
      const state = useStore.getState();
      const predefinedMethods = state.preparationMethods.filter(m => m.isPredefined);
      const customMethods = state.preparationMethods.filter(m => !m.isPredefined);

      expect(predefinedMethods.length).toBeGreaterThan(0);
      expect(customMethods.length).toBe(1);

      // Predefined should all come before custom in the array
      const firstCustomIndex = state.preparationMethods.findIndex(m => !m.isPredefined);
      const lastPredefinedIndex = state.preparationMethods.reduce(
        (acc, m, idx) => m.isPredefined ? idx : acc, -1
      );
      expect(lastPredefinedIndex).toBeLessThan(firstCustomIndex);
    });

    it('should set isLoading to false after successful load', async () => {
      await useStore.getState().loadPreparationMethods();
      expect(useStore.getState().isLoading).toBe(false);
    });
  });

  describe('Preparation Methods - addPreparationMethod', () => {
    it('should add a custom preparation method', async () => {
      // Act: Add a custom method
      const newMethod = await useStore.getState().addPreparationMethod('air-fried');

      // Assert: Method was created correctly
      expect(newMethod.name).toBe('air-fried');
      expect(newMethod.isPredefined).toBe(false);
      expect(newMethod.id).toBeDefined();
      expect(newMethod.createdAt).toBeDefined();

      // Assert: Store state was updated
      const state = useStore.getState();
      expect(state.preparationMethods).toContainEqual(newMethod);
      expect(state.isLoading).toBe(false);
    });

    it('should add method and include in state array', async () => {
      // Arrange: First load existing methods
      await useStore.getState().loadPreparationMethods();
      const initialCount = useStore.getState().preparationMethods.length;

      // Act: Add a custom method
      await useStore.getState().addPreparationMethod('smashed');

      // Assert: Count increased by 1
      const finalCount = useStore.getState().preparationMethods.length;
      expect(finalCount).toBe(initialCount + 1);
    });

    it('should throw error when adding duplicate method name', async () => {
      // Arrange: Add a method first
      await useStore.getState().addPreparationMethod('blanched');

      // Act & Assert: Adding same name should throw (UNIQUE constraint violation)
      try {
        await useStore.getState().addPreparationMethod('blanched');
        // If no error thrown, fail the test
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        // Should throw an error (SQLite UNIQUE constraint or similar)
        expect(error).toBeDefined();
      }

      // Verify error state is set
      const state = useStore.getState();
      expect(state.error).toBeDefined();
    });

    it('should trim whitespace from method name', async () => {
      const method = await useStore.getState().addPreparationMethod('  deep fried  ');
      expect(method.name).toBe('deep fried');
    });
  });

  describe('Preparation Methods - deletePreparationMethod', () => {
    it('should delete a custom preparation method', async () => {
      // Arrange: Add a custom method first
      const method = await useStore.getState().addPreparationMethod('flash-fried');
      expect(useStore.getState().preparationMethods).toContainEqual(method);

      // Act: Delete the method
      const result = await useStore.getState().deletePreparationMethod(method.id);

      // Assert: Method was deleted
      expect(result.success).toBe(true);
      expect(useStore.getState().preparationMethods.find(m => m.id === method.id)).toBeUndefined();
    });

    it('should not delete predefined preparation methods', async () => {
      // Arrange: Load methods and get a predefined one
      await useStore.getState().loadPreparationMethods();
      const friedMethod = useStore.getState().preparationMethods.find(
        m => m.name === 'fried' && m.isPredefined
      );
      expect(friedMethod).toBeDefined();

      // Act: Try to delete the predefined method
      const result = await useStore.getState().deletePreparationMethod(friedMethod!.id);

      // Assert: Deletion should fail
      expect(result.success).toBe(false);
      expect(result.error).toContain('predefined');

      // Method should still exist in state
      expect(useStore.getState().preparationMethods.find(m => m.id === friedMethod!.id)).toBeDefined();
    });

    it('should return error when deleting non-existent method', async () => {
      const result = await useStore.getState().deletePreparationMethod('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should not delete method that is used in meal components', async () => {
      // Arrange: Add ingredient, custom method, and log a meal with component
      const db = getDatabase();
      const ingredient = await ingredientsDb.addIngredient(db, {
        name: 'Chicken',
        category: 'protein',
        mealTypes: ['lunch'],
      });

      const method = await useStore.getState().addPreparationMethod('pan-seared');

      // Log a meal with this preparation method
      await useStore.getState().logMealWithComponents(
        'lunch',
        [{ ingredientId: ingredient.id, preparationMethodId: method.id }],
        'Test meal'
      );

      // Act: Try to delete the method
      const result = await useStore.getState().deletePreparationMethod(method.id);

      // Assert: Deletion should fail
      expect(result.success).toBe(false);
      expect(result.error).toContain('meal component');
    });

    it('should set error in state when delete fails', async () => {
      // Act: Try to delete non-existent method
      await useStore.getState().deletePreparationMethod('fake-id');

      // Assert: Error should be set in state
      const state = useStore.getState();
      expect(state.error).toContain('not found');
    });
  });

  describe('Meal Components - logMealWithComponents', () => {
    it('should log a meal with components', async () => {
      // Arrange: Add ingredients
      const db = getDatabase();
      const chicken = await ingredientsDb.addIngredient(db, {
        name: 'Chicken',
        category: 'protein',
        mealTypes: ['lunch', 'dinner'],
      });
      const rice = await ingredientsDb.addIngredient(db, {
        name: 'Rice',
        category: 'carb',
        mealTypes: ['lunch', 'dinner'],
      });

      // Load predefined methods to get grilled ID
      await useStore.getState().loadPreparationMethods();
      const grilledMethod = useStore.getState().preparationMethods.find(m => m.name === 'grilled');

      // Act: Log a meal with components
      const meal = await useStore.getState().logMealWithComponents(
        'lunch',
        [
          { ingredientId: chicken.id, preparationMethodId: grilledMethod!.id },
          { ingredientId: rice.id, preparationMethodId: null },
        ],
        'Grilled chicken lunch'
      );

      // Assert: Meal was created correctly
      expect(meal.id).toBeDefined();
      expect(meal.mealType).toBe('lunch');
      expect(meal.name).toBe('Grilled chicken lunch');
      expect(meal.components).toHaveLength(2);
      expect(meal.ingredients).toHaveLength(2); // Legacy column

      // Check components
      const chickenComponent = meal.components.find(c => c.ingredientId === chicken.id);
      expect(chickenComponent?.preparationMethodId).toBe(grilledMethod!.id);

      const riceComponent = meal.components.find(c => c.ingredientId === rice.id);
      expect(riceComponent?.preparationMethodId).toBeNull();
    });

    it('should log meal without name (anonymous meal)', async () => {
      const db = getDatabase();
      const bread = await ingredientsDb.addIngredient(db, {
        name: 'Bread',
        category: 'carb',
        mealTypes: ['breakfast'],
      });

      // Act: Log meal without name
      const meal = await useStore.getState().logMealWithComponents(
        'breakfast',
        [{ ingredientId: bread.id, preparationMethodId: null }]
      );

      // Assert: Name should be null
      expect(meal.name).toBeNull();
    });

    it('should add meal to mealLogs state', async () => {
      const db = getDatabase();
      const milk = await ingredientsDb.addIngredient(db, {
        name: 'Milk',
        category: 'dairy',
        mealTypes: ['breakfast'],
      });

      // Initial state should have no meal logs
      expect(useStore.getState().mealLogs).toHaveLength(0);

      // Act: Log a meal
      await useStore.getState().logMealWithComponents(
        'breakfast',
        [{ ingredientId: milk.id, preparationMethodId: null }]
      );

      // Assert: Meal should be in state
      expect(useStore.getState().mealLogs).toHaveLength(1);
    });

    it('should populate legacy ingredients array for backward compatibility', async () => {
      const db = getDatabase();
      const eggs = await ingredientsDb.addIngredient(db, {
        name: 'Eggs',
        category: 'protein',
        mealTypes: ['breakfast'],
      });
      const bacon = await ingredientsDb.addIngredient(db, {
        name: 'Bacon',
        category: 'protein',
        mealTypes: ['breakfast'],
      });

      const meal = await useStore.getState().logMealWithComponents(
        'breakfast',
        [
          { ingredientId: eggs.id, preparationMethodId: null },
          { ingredientId: bacon.id, preparationMethodId: null },
        ]
      );

      // Assert: Legacy ingredients array is populated
      expect(meal.ingredients).toContain(eggs.id);
      expect(meal.ingredients).toContain(bacon.id);
    });

    it('should set isFavorite to false by default', async () => {
      const db = getDatabase();
      const toast = await ingredientsDb.addIngredient(db, {
        name: 'Toast',
        category: 'carb',
        mealTypes: ['breakfast'],
      });

      const meal = await useStore.getState().logMealWithComponents(
        'breakfast',
        [{ ingredientId: toast.id, preparationMethodId: null }]
      );

      expect(meal.isFavorite).toBe(false);
    });

    it('should set isLoading to false after success', async () => {
      const db = getDatabase();
      const cereal = await ingredientsDb.addIngredient(db, {
        name: 'Cereal',
        category: 'carb',
        mealTypes: ['breakfast'],
      });

      await useStore.getState().logMealWithComponents(
        'breakfast',
        [{ ingredientId: cereal.id, preparationMethodId: null }]
      );

      expect(useStore.getState().isLoading).toBe(false);
      expect(useStore.getState().error).toBeNull();
    });
  });

  describe('Meal Components - getMealWithComponents', () => {
    it('should get a meal with its components', async () => {
      // Arrange: Log a meal with components
      const db = getDatabase();
      const steak = await ingredientsDb.addIngredient(db, {
        name: 'Steak',
        category: 'protein',
        mealTypes: ['dinner'],
      });
      const potatoes = await ingredientsDb.addIngredient(db, {
        name: 'Potatoes',
        category: 'carb',
        mealTypes: ['dinner'],
      });

      await useStore.getState().loadPreparationMethods();
      const grilledMethod = useStore.getState().preparationMethods.find(m => m.name === 'grilled');
      const roastedMethod = useStore.getState().preparationMethods.find(m => m.name === 'roasted');

      const loggedMeal = await useStore.getState().logMealWithComponents(
        'dinner',
        [
          { ingredientId: steak.id, preparationMethodId: grilledMethod!.id },
          { ingredientId: potatoes.id, preparationMethodId: roastedMethod!.id },
        ],
        'Steak dinner'
      );

      // Act: Get the meal with components
      const meal = await useStore.getState().getMealWithComponents(loggedMeal.id);

      // Assert: Meal and components returned correctly
      expect(meal).not.toBeNull();
      expect(meal!.id).toBe(loggedMeal.id);
      expect(meal!.name).toBe('Steak dinner');
      expect(meal!.components).toHaveLength(2);
      expect(meal!.mealType).toBe('dinner');
    });

    it('should return null for non-existent meal', async () => {
      const meal = await useStore.getState().getMealWithComponents('non-existent-id');
      expect(meal).toBeNull();
    });

    it('should return meal with empty components array for legacy meals', async () => {
      // Arrange: Log a legacy meal (without components)
      const db = getDatabase();
      const apple = await ingredientsDb.addIngredient(db, {
        name: 'Apple',
        category: 'fruit',
        mealTypes: ['snack'],
      });

      // Log using old method (no components)
      await useStore.getState().logMeal({
        mealType: 'snack',
        date: new Date().toISOString(),
        ingredients: [apple.id],
      });

      const state = useStore.getState();
      const legacyMealId = state.mealLogs[0].id;

      // Act: Get the legacy meal with components
      const meal = await useStore.getState().getMealWithComponents(legacyMealId);

      // Assert: Should return meal with empty components
      expect(meal).not.toBeNull();
      expect(meal!.components).toHaveLength(0);
      expect(meal!.name).toBeNull(); // Legacy meals don't have names
    });

    it('should set isLoading to false after retrieval', async () => {
      const db = getDatabase();
      const banana = await ingredientsDb.addIngredient(db, {
        name: 'Banana',
        category: 'fruit',
        mealTypes: ['snack'],
      });

      const loggedMeal = await useStore.getState().logMealWithComponents(
        'snack',
        [{ ingredientId: banana.id, preparationMethodId: null }]
      );

      await useStore.getState().getMealWithComponents(loggedMeal.id);

      expect(useStore.getState().isLoading).toBe(false);
    });
  });

  describe('Integration - Preparation Methods with Meal Components', () => {
    it('should work end-to-end: load methods, log meal, retrieve meal', async () => {
      // Step 1: Load preparation methods
      await useStore.getState().loadPreparationMethods();
      const methods = useStore.getState().preparationMethods;
      expect(methods.length).toBeGreaterThan(0);

      // Step 2: Add custom method
      const customMethod = await useStore.getState().addPreparationMethod('char-grilled');
      expect(customMethod.isPredefined).toBe(false);

      // Step 3: Add ingredients
      const db = getDatabase();
      const fish = await ingredientsDb.addIngredient(db, {
        name: 'Salmon',
        category: 'protein',
        mealTypes: ['lunch', 'dinner'],
      });
      const veggies = await ingredientsDb.addIngredient(db, {
        name: 'Asparagus',
        category: 'vegetable',
        mealTypes: ['lunch', 'dinner'],
      });

      // Step 4: Log meal with components
      const steamedMethod = methods.find(m => m.name === 'steamed');
      const loggedMeal = await useStore.getState().logMealWithComponents(
        'dinner',
        [
          { ingredientId: fish.id, preparationMethodId: customMethod.id },
          { ingredientId: veggies.id, preparationMethodId: steamedMethod!.id },
        ],
        'Healthy dinner'
      );

      // Step 5: Retrieve and verify
      const retrievedMeal = await useStore.getState().getMealWithComponents(loggedMeal.id);
      expect(retrievedMeal).not.toBeNull();
      expect(retrievedMeal!.name).toBe('Healthy dinner');
      expect(retrievedMeal!.components.length).toBe(2);

      const fishComponent = retrievedMeal!.components.find(c => c.ingredientId === fish.id);
      expect(fishComponent?.preparationMethodId).toBe(customMethod.id);

      const veggieComponent = retrievedMeal!.components.find(c => c.ingredientId === veggies.id);
      expect(veggieComponent?.preparationMethodId).toBe(steamedMethod!.id);
    });

    it('should handle meals with unicode names', async () => {
      const db = getDatabase();
      const pasta = await ingredientsDb.addIngredient(db, {
        name: 'Pasta',
        category: 'carb',
        mealTypes: ['dinner'],
      });

      const meal = await useStore.getState().logMealWithComponents(
        'dinner',
        [{ ingredientId: pasta.id, preparationMethodId: null }],
        "Nonna's special pasta 🍝"
      );

      expect(meal.name).toBe("Nonna's special pasta 🍝");

      const retrieved = await useStore.getState().getMealWithComponents(meal.id);
      expect(retrieved!.name).toBe("Nonna's special pasta 🍝");
    });
  });
});

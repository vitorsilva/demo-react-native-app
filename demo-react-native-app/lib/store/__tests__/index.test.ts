import { initDatabase, resetDatabase, getDatabase } from '@/lib/database';
import { resetTestDatabase } from '@/lib/database/__tests__/testDb';
import * as ingredientsDb from '@/lib/database/ingredients';
import { useStore } from '../index';

// This uses the __mocks__/index.ts file automatically
jest.mock('@/lib/database');

describe('Zustand Store', () => {
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
      suggestedCombinations: [],
      isLoading: false,
      error: null,
      isDatabaseReady: true,
      preferences: { cooldownDays: 3, suggestionsCount: 4, hapticEnabled: true },
    });
  });

  describe('loadIngredients', () => {
    it('should load ingredients from database', async () => {
      // Arrange: Add test ingredients to the real (in-memory) database
      const db = getDatabase();

      await ingredientsDb.addIngredient(db, {
        name: 'Milk',
        category: 'protein',
        mealTypes: ['breakfast'],
      });
      await ingredientsDb.addIngredient(db, {
        name: 'Eggs',
        category: 'protein',
        mealTypes: ['breakfast'],
      });

      // Act: Call the store action
      await useStore.getState().loadIngredients();

      // Assert: Verify state was updated
      const state = useStore.getState();
      expect(state.ingredients).toHaveLength(2);
      expect(state.ingredients[0].name).toBe('Eggs'); // Alphabetical order
      expect(state.ingredients[1].name).toBe('Milk');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('logMeal', () => {
    it('should log a meal to database and update state', async () => {
      // Arrange: Add ingredients first
      const db = getDatabase();
      const milk = await ingredientsDb.addIngredient(db, {
        name: 'Milk',
        category: 'protein',
        mealTypes: ['breakfast'],
      });
      const eggs = await ingredientsDb.addIngredient(db, {
        name: 'Eggs',
        category: 'protein',
        mealTypes: ['breakfast'],
      });

      // Act: Log a meal
      await useStore.getState().logMeal({
        mealType: 'breakfast',
        date: new Date().toISOString(),
        ingredients: [milk.id, eggs.id],
      });

      // Assert: Verify state was updated
      const state = useStore.getState();
      expect(state.mealLogs).toHaveLength(1);
      expect(state.mealLogs[0].mealType).toBe('breakfast');
      expect(state.mealLogs[0].ingredients).toEqual([milk.id, eggs.id]);
    });
  });

  describe('generateMealSuggestions', () => {
    it('should generate meal suggestions based on preferences', async () => {
      // Arrange: Add multiple ingredients
      const db = getDatabase();
      await ingredientsDb.addIngredient(db, {
        name: 'Milk',
        category: 'protein',
        mealTypes: ['breakfast'],
      });
      await ingredientsDb.addIngredient(db, {
        name: 'Eggs',
        category: 'protein',
        mealTypes: ['breakfast'],
      });
      await ingredientsDb.addIngredient(db, {
        name: 'Bread',
        category: 'carb',
        mealTypes: ['breakfast'],
      });
      await ingredientsDb.addIngredient(db, {
        name: 'Banana',
        category: 'fruit',
        mealTypes: ['breakfast'],
      });

      // Load ingredients into store
      await useStore.getState().loadIngredients();

      // Act: Generate suggestions
      await useStore.getState().generateMealSuggestions();

      // Assert: Verify suggestions were generated
      const state = useStore.getState();
      expect(state.suggestedCombinations.length).toBeGreaterThan(0);
      expect(state.suggestedCombinations.length).toBeLessThanOrEqual(4); // Default suggestionsCount

      // Each combination should have ingredients
      state.suggestedCombinations.forEach((combination) => {
        expect(combination.length).toBeGreaterThan(0);
      });
    });
  });
});

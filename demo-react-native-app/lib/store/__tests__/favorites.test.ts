import { initDatabase, resetDatabase, getDatabase } from '@/lib/database';
import { resetTestDatabase } from '@/lib/database/__tests__/testDb';
import * as ingredientsDb from '@/lib/database/ingredients';
import * as mealLogsDb from '@/lib/database/mealLogs';
import { useStore } from '../index';

// This uses the __mocks__/index.ts file automatically
jest.mock('@/lib/database');

describe('Favorites Feature - Store', () => {
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
      preferences: { cooldownDays: 3, suggestionsCount: 4 },
    });
  });

  describe('toggleMealLogFavorite', () => {
    it('should toggle meal log favorite status from false to true', async () => {
      // Arrange: Add ingredients and log a meal
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

      // Log a meal (isFavorite defaults to false)
      await useStore.getState().logMeal({
        mealType: 'breakfast',
        date: new Date().toISOString(),
        ingredients: [milk.id, eggs.id],
      });

      // Verify initial state
      let state = useStore.getState();
      expect(state.mealLogs).toHaveLength(1);
      expect(state.mealLogs[0].isFavorite).toBe(false);

      const mealLogId = state.mealLogs[0].id;

      // Act: Toggle favorite
      await useStore.getState().toggleMealLogFavorite(mealLogId);

      // Assert: Verify state was updated
      state = useStore.getState();
      expect(state.mealLogs).toHaveLength(1);
      expect(state.mealLogs[0].isFavorite).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should toggle meal log favorite status from true to false', async () => {
      // Arrange: Add ingredients and log a meal with isFavorite = true
      const db = getDatabase();
      const bread = await ingredientsDb.addIngredient(db, {
        name: 'Bread',
        category: 'carb',
        mealTypes: ['breakfast'],
      });

      // Log a meal with isFavorite = true
      await useStore.getState().logMeal({
        mealType: 'breakfast',
        date: new Date().toISOString(),
        ingredients: [bread.id],
        isFavorite: true,
      });

      // Verify initial state
      let state = useStore.getState();
      expect(state.mealLogs[0].isFavorite).toBe(true);

      const mealLogId = state.mealLogs[0].id;

      // Act: Toggle favorite (should become false)
      await useStore.getState().toggleMealLogFavorite(mealLogId);

      // Assert: Verify state was updated
      state = useStore.getState();
      expect(state.mealLogs[0].isFavorite).toBe(false);
    });

    it('should only update the targeted meal log in state', async () => {
      // Arrange: Add ingredient and multiple meal logs
      const db = getDatabase();
      const banana = await ingredientsDb.addIngredient(db, {
        name: 'Banana',
        category: 'fruit',
        mealTypes: ['breakfast', 'snack'],
      });

      // Log multiple meals
      await useStore.getState().logMeal({
        mealType: 'breakfast',
        date: new Date().toISOString(),
        ingredients: [banana.id],
        isFavorite: false,
      });

      await useStore.getState().logMeal({
        mealType: 'snack',
        date: new Date().toISOString(),
        ingredients: [banana.id],
        isFavorite: false,
      });

      await useStore.getState().logMeal({
        mealType: 'lunch',
        date: new Date().toISOString(),
        ingredients: [banana.id],
        isFavorite: true,
      });

      let state = useStore.getState();
      expect(state.mealLogs).toHaveLength(3);

      // Get the first meal log's ID (breakfast)
      const breakfastLog = state.mealLogs.find((m) => m.mealType === 'breakfast');
      expect(breakfastLog).toBeDefined();

      // Act: Toggle only the breakfast meal
      await useStore.getState().toggleMealLogFavorite(breakfastLog!.id);

      // Assert: Only breakfast should be toggled
      state = useStore.getState();
      const updatedBreakfast = state.mealLogs.find((m) => m.mealType === 'breakfast');
      const snack = state.mealLogs.find((m) => m.mealType === 'snack');
      const lunch = state.mealLogs.find((m) => m.mealType === 'lunch');

      expect(updatedBreakfast?.isFavorite).toBe(true); // Was false, now true
      expect(snack?.isFavorite).toBe(false); // Unchanged
      expect(lunch?.isFavorite).toBe(true); // Unchanged
    });

    it('should handle error when toggling non-existent meal log', async () => {
      // Act: Try to toggle a non-existent meal
      await useStore.getState().toggleMealLogFavorite('non-existent-id');

      // Assert: Error should be set
      const state = useStore.getState();
      expect(state.error).toBe('Meal log with id non-existent-id not found');
      expect(state.isLoading).toBe(false);
    });

    it('should set isLoading during toggle operation', async () => {
      // Arrange: Add ingredient and meal
      const db = getDatabase();
      const cheese = await ingredientsDb.addIngredient(db, {
        name: 'Cheese',
        category: 'protein',
        mealTypes: ['lunch'],
      });

      await useStore.getState().logMeal({
        mealType: 'lunch',
        date: new Date().toISOString(),
        ingredients: [cheese.id],
      });

      const state = useStore.getState();
      const mealLogId = state.mealLogs[0].id;

      // We can't easily test the intermediate loading state in this synchronous test
      // but we can verify final state has isLoading = false
      await useStore.getState().toggleMealLogFavorite(mealLogId);

      expect(useStore.getState().isLoading).toBe(false);
    });
  });

  describe('logMeal with favorite', () => {
    it('should log meal with isFavorite defaulting to false', async () => {
      const db = getDatabase();
      const apple = await ingredientsDb.addIngredient(db, {
        name: 'Apple',
        category: 'fruit',
        mealTypes: ['snack'],
      });

      await useStore.getState().logMeal({
        mealType: 'snack',
        date: new Date().toISOString(),
        ingredients: [apple.id],
      });

      const state = useStore.getState();
      expect(state.mealLogs).toHaveLength(1);
      expect(state.mealLogs[0].isFavorite).toBe(false);
    });

    it('should log meal with isFavorite set to true when specified', async () => {
      const db = getDatabase();
      const orange = await ingredientsDb.addIngredient(db, {
        name: 'Orange',
        category: 'fruit',
        mealTypes: ['snack'],
      });

      await useStore.getState().logMeal({
        mealType: 'snack',
        date: new Date().toISOString(),
        ingredients: [orange.id],
        isFavorite: true,
      });

      const state = useStore.getState();
      expect(state.mealLogs).toHaveLength(1);
      expect(state.mealLogs[0].isFavorite).toBe(true);
    });
  });

  describe('filtering favorites in state', () => {
    it('should be able to filter mealLogs by favorite status', async () => {
      // Arrange: Add ingredient and multiple meals
      const db = getDatabase();
      const yogurt = await ingredientsDb.addIngredient(db, {
        name: 'Yogurt',
        category: 'protein',
        mealTypes: ['breakfast', 'snack'],
      });

      // Create mix of favorite and non-favorite meals
      await useStore.getState().logMeal({
        mealType: 'breakfast',
        date: new Date().toISOString(),
        ingredients: [yogurt.id],
        isFavorite: true,
      });

      await useStore.getState().logMeal({
        mealType: 'lunch',
        date: new Date().toISOString(),
        ingredients: [yogurt.id],
        isFavorite: false,
      });

      await useStore.getState().logMeal({
        mealType: 'dinner',
        date: new Date().toISOString(),
        ingredients: [yogurt.id],
        isFavorite: true,
      });

      await useStore.getState().logMeal({
        mealType: 'snack',
        date: new Date().toISOString(),
        ingredients: [yogurt.id],
        isFavorite: false,
      });

      const state = useStore.getState();

      // Filter favorites (as done in UI)
      const favorites = state.mealLogs.filter((log) => log.isFavorite);
      const nonFavorites = state.mealLogs.filter((log) => !log.isFavorite);

      expect(favorites).toHaveLength(2);
      expect(nonFavorites).toHaveLength(2);
      expect(favorites.every((m) => m.isFavorite)).toBe(true);
      expect(nonFavorites.every((m) => !m.isFavorite)).toBe(true);
    });
  });
});

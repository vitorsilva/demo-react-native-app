import { create } from 'zustand';
import type { Ingredient, MealLog } from '@/types/database';
import * as ingredientsDb from '@/lib/database/ingredients';
import * as mealLogsDb from '@/lib/database/mealLogs';
import * as preferencesDb from '@/lib/database/preferences';
import { getDatabase } from '@/lib/database';
import { getRecentlyUsedIngredients } from '../business-logic/varietyEngine';
import { generateCombinations } from '@/lib/business-logic/combinationGenerator';
import {
  mealGenerationCounter,
  mealGenerationDuration,
  suggestionsGeneratedCounter,
} from '@/lib/telemetry/mealGenerationMetrics';
import { setPreferences, UserPreferences } from '@/lib/database/preferences';
interface StoreState {
  // State: Data
  ingredients: Ingredient[];
  mealLogs: MealLog[];
  suggestedCombinations: Ingredient[][];
  isLoading: boolean;
  error: string | null;
  isDatabaseReady: boolean;
  preferences: preferencesDb.UserPreferences;

  // Actions: Functions that modify state
  loadIngredients: () => Promise<void>;
  loadMealLogs: (days?: number) => Promise<void>;
  loadPreferences: () => Promise<void>;
  updatePreferences: (preferences: preferencesDb.UserPreferences) => Promise<void>;
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => Promise<void>;
  logMeal: (mealLog: Omit<MealLog, 'id' | 'createdAt'>) => Promise<void>;
  setDatabaseReady: () => void;
  generateMealSuggestions: () => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial state values
  ingredients: [],
  mealLogs: [],
  suggestedCombinations: [],
  isLoading: false,
  error: null,
  isDatabaseReady: false,
  preferences: {
    cooldownDays: 3,
    suggestionsCount: 4,
  },

  // Load preferences from database
  loadPreferences: async () => {
    try {
      const db = getDatabase();
      const prefs = await preferencesDb.getPreferences(db);
      set({ preferences: prefs });
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  },

  // Update preferences in database and state
  updatePreferences: async (newPreferences: UserPreferences) => {
    try {
      const db = getDatabase();
      await setPreferences(db, newPreferences);
      set({ preferences: newPreferences });
    } catch (error) {
      console.error('Failed to update preferences:', error);
      set({ error: 'Failed to update preferences' });
    }
  },

  // Action: Load all ingredients from database
  loadIngredients: async () => {
    set({ isLoading: true, error: null });
    try {
      const db = getDatabase();
      const ingredients = await ingredientsDb.getAllIngredients(db);
      set({ ingredients, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load ingredients',
        isLoading: false,
      });
    }
  },

  // Action: Load meal logs from database
  loadMealLogs: async (days = 30) => {
    set({ isLoading: true, error: null });
    try {
      const db = getDatabase();
      const mealLogs = await mealLogsDb.getRecentMealLogs(db, days);
      set({ mealLogs, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load meal logs',
        isLoading: false,
      });
    }
  },

  // Action: Add a new ingredient
  addIngredient: async (ingredient) => {
    set({ isLoading: true, error: null });
    try {
      const db = getDatabase();
      const newIngredient = await ingredientsDb.addIngredient(db, ingredient);
      set((state) => ({
        ingredients: [...state.ingredients, newIngredient],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add ingredient',
        isLoading: false,
      });
    }
  },

  // Action: Log a meal (we'll enhance this with variety logic later)
  logMeal: async (mealLog) => {
    set({ isLoading: true, error: null });
    try {
      const db = getDatabase();
      const newLog = await mealLogsDb.logMeal(db, mealLog);
      set((state) => ({
        mealLogs: [...state.mealLogs, newLog],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to log meal',
        isLoading: false,
      });
    }
  },

  // Action: Generate variety-enforced meal suggestions
  generateMealSuggestions: async () => {
    const startTime = Date.now();

    set({ isLoading: true, error: null });
    try {
      const db = getDatabase();

      // Increment counter - generation started
      mealGenerationCounter.add(1);

      // Step 1: Load fresh preferences from database
      const preferences = await preferencesDb.getPreferences(db);
      const count = preferences.suggestionsCount;
      const cooldownDays = preferences.cooldownDays;

      // Step 2: Get current ingredients from store
      const { ingredients } = get();

      // Step 3: Get recent meal logs from database
      const recentMealLogs = await mealLogsDb.getRecentMealLogs(db, cooldownDays);

      // Step 4: Extract blocked ingredient IDs
      const blockedIds = getRecentlyUsedIngredients(recentMealLogs);

      // Step 5: Generate combinations with variety enforcement
      const combinations = generateCombinations(ingredients, count, blockedIds);

      // Record how many suggestions were generated
      suggestionsGeneratedCounter.add(combinations.length);

      // Record how long it took
      const duration = Date.now() - startTime;
      mealGenerationDuration.record(duration);

      set({ suggestedCombinations: combinations, isLoading: false });
      console.log('Metrics recorded:', { duration, suggestionsCount: combinations.length });
    } catch (error) {
      // Still record duration even on failure
      const duration = Date.now() - startTime;
      mealGenerationDuration.record(duration);

      set({
        error: error instanceof Error ? error.message : 'Failed to generate suggestions',
        isLoading: false,
      });
    }
  },

  // Action: Mark database as ready
  setDatabaseReady: () => set({ isDatabaseReady: true }),
}));

import { create } from 'zustand';
import type { Ingredient, MealLog } from '@/types/database';
import * as ingredientsDb from '@/lib/database/ingredients';
import * as mealLogsDb from '@/lib/database/mealLogs';
import { getRecentlyUsedIngredients } from '../business-logic/varietyEngine';
import { generateCombinations } from '@/lib/business-logic/combinationGenerator';
import {
  mealGenerationCounter,
  mealGenerationDuration,
  suggestionsGeneratedCounter,
} from '@/lib/telemetry/mealGenerationMetrics';
interface StoreState {
  // State: Data
  ingredients: Ingredient[];
  mealLogs: MealLog[];
  suggestedCombinations: Ingredient[][];
  isLoading: boolean;
  error: string | null;
  isDatabaseReady: boolean;

  // Actions: Functions that modify state
  loadIngredients: () => Promise<void>;
  loadMealLogs: () => Promise<void>;
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => Promise<void>;
  logMeal: (mealLog: Omit<MealLog, 'id' | 'createdAt'>) => Promise<void>;
  setDatabaseReady: () => void;
  generateMealSuggestions: (count: number, cooldownDays: number) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial state values
  ingredients: [],
  mealLogs: [],
  suggestedCombinations: [],
  isLoading: false,
  error: null,
  isDatabaseReady: false,

  // Action: Load all ingredients from database
  loadIngredients: async () => {
    set({ isLoading: true, error: null });
    try {
      const ingredients = await ingredientsDb.getAllIngredients();
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
      const mealLogs = await mealLogsDb.getRecentMealLogs(days);
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
      const newIngredient = await ingredientsDb.addIngredient(ingredient);
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
      const newLog = await mealLogsDb.logMeal(mealLog);
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
  generateMealSuggestions: async (count, cooldownDays) => {
    const startTime = Date.now(); // Track when we started

    set({ isLoading: true, error: null });
    try {
      // Increment counter - generation started
      mealGenerationCounter.add(1);

      // Step 1: Get current ingredients from store
      const { ingredients } = get();

      // Step 2: Get recent meal logs from database
      const recentMealLogs = await mealLogsDb.getRecentMealLogs(cooldownDays);

      // Step 3: Extract blocked ingredient IDs
      const blockedIds = getRecentlyUsedIngredients(recentMealLogs);

      // Step 4: Generate combinations with variety enforcement
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

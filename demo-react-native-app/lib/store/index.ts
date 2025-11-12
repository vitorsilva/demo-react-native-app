import { create } from 'zustand';
import type { Ingredient, MealLog } from '@/types/database';
import * as ingredientsDb from '@/lib/database/ingredients';
import * as mealLogsDb from '@/lib/database/mealLogs';

interface StoreState {
  // State: Data
  ingredients: Ingredient[];
  mealLogs: MealLog[];
  isLoading: boolean;
  error: string | null;

  // Actions: Functions that modify state
  loadIngredients: () => Promise<void>;
  loadMealLogs: () => Promise<void>;
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => Promise<void>;
  logMeal: (mealLog: Omit<MealLog, 'id' | 'createdAt'>) => Promise<void>;
}

export const useStore = create<StoreState>((set) => ({
  // Initial state values
  ingredients: [],
  mealLogs: [],
  isLoading: false,
  error: null,

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
}));

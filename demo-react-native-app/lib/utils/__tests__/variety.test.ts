import {
  isNewCombination,
  NEW_COMBINATION_THRESHOLD_DAYS,
  getVarietyColor,
  FRESH_THRESHOLD_DAYS,
  calculateVarietyStats,
  getIngredientFrequency,
  calculateVarietyScore,
  FREQUENCY_PENALTY,
} from '../variety';
import type { MealLog, Ingredient } from '../../../types/database';

/**
 * Helper to create a date string N days ago from today
 */
function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

/**
 * Helper to create a MealLog for testing
 */
function createMealLog(
  ingredientIds: string[],
  daysAgoValue: number,
  id: string = '1'
): MealLog {
  return {
    id,
    date: daysAgo(daysAgoValue),
    mealType: 'breakfast',
    ingredients: ingredientIds,
    createdAt: daysAgo(daysAgoValue),
    isFavorite: false,
  };
}

describe('isNewCombination', () => {
  describe('when combination was never logged', () => {
    it('returns true for never-logged combinations with empty history', () => {
      const ingredientIds = ['milk-id', 'bread-id'];
      const history: MealLog[] = [];

      expect(isNewCombination(ingredientIds, history)).toBe(true);
    });

    it('returns true for never-logged combinations with different combinations in history', () => {
      const ingredientIds = ['milk-id', 'bread-id'];
      const history: MealLog[] = [
        createMealLog(['cheese-id', 'apple-id'], 1),
        createMealLog(['banana-id', 'yogurt-id'], 2),
      ];

      expect(isNewCombination(ingredientIds, history)).toBe(true);
    });
  });

  describe('when combination was logged recently (< 7 days)', () => {
    it('returns false for combination logged today (0 days ago)', () => {
      const ingredientIds = ['milk-id', 'bread-id'];
      const history: MealLog[] = [createMealLog(['milk-id', 'bread-id'], 0)];

      expect(isNewCombination(ingredientIds, history)).toBe(false);
    });

    it('returns false for combination logged yesterday (1 day ago)', () => {
      const ingredientIds = ['milk-id', 'bread-id'];
      const history: MealLog[] = [createMealLog(['milk-id', 'bread-id'], 1)];

      expect(isNewCombination(ingredientIds, history)).toBe(false);
    });

    it('returns false for combination logged 6 days ago (edge case)', () => {
      const ingredientIds = ['milk-id', 'bread-id'];
      const history: MealLog[] = [createMealLog(['milk-id', 'bread-id'], 6)];

      expect(isNewCombination(ingredientIds, history)).toBe(false);
    });
  });

  describe('when combination was logged 7+ days ago', () => {
    it('returns true for combination logged exactly 7 days ago (edge case)', () => {
      const ingredientIds = ['milk-id', 'bread-id'];
      const history: MealLog[] = [
        createMealLog(['milk-id', 'bread-id'], NEW_COMBINATION_THRESHOLD_DAYS),
      ];

      expect(isNewCombination(ingredientIds, history)).toBe(true);
    });

    it('returns true for combination logged 8 days ago', () => {
      const ingredientIds = ['milk-id', 'bread-id'];
      const history: MealLog[] = [createMealLog(['milk-id', 'bread-id'], 8)];

      expect(isNewCombination(ingredientIds, history)).toBe(true);
    });

    it('returns true for combination logged 30 days ago', () => {
      const ingredientIds = ['milk-id', 'bread-id'];
      const history: MealLog[] = [createMealLog(['milk-id', 'bread-id'], 30)];

      expect(isNewCombination(ingredientIds, history)).toBe(true);
    });
  });

  describe('order-independent matching', () => {
    it('matches combinations regardless of ingredient order', () => {
      const ingredientIds = ['milk-id', 'bread-id', 'cheese-id'];
      const history: MealLog[] = [
        createMealLog(['cheese-id', 'milk-id', 'bread-id'], 1), // Different order
      ];

      expect(isNewCombination(ingredientIds, history)).toBe(false);
    });

    it('matches with reversed order', () => {
      const ingredientIds = ['a-id', 'b-id'];
      const history: MealLog[] = [createMealLog(['b-id', 'a-id'], 2)];

      expect(isNewCombination(ingredientIds, history)).toBe(false);
    });
  });

  describe('multiple logs for same combination', () => {
    it('uses the most recent log date', () => {
      const ingredientIds = ['milk-id', 'bread-id'];
      const history: MealLog[] = [
        createMealLog(['milk-id', 'bread-id'], 10, '1'), // 10 days ago
        createMealLog(['milk-id', 'bread-id'], 2, '2'), // 2 days ago (most recent)
        createMealLog(['milk-id', 'bread-id'], 5, '3'), // 5 days ago
      ];

      // Most recent is 2 days ago, so should be NOT new
      expect(isNewCombination(ingredientIds, history)).toBe(false);
    });

    it('returns true if all logs are 7+ days old', () => {
      const ingredientIds = ['milk-id', 'bread-id'];
      const history: MealLog[] = [
        createMealLog(['milk-id', 'bread-id'], 10, '1'),
        createMealLog(['milk-id', 'bread-id'], 15, '2'),
        createMealLog(['milk-id', 'bread-id'], 20, '3'),
      ];

      // All are 7+ days ago, so should be new
      expect(isNewCombination(ingredientIds, history)).toBe(true);
    });
  });

  describe('threshold constant', () => {
    it('exports NEW_COMBINATION_THRESHOLD_DAYS as 7', () => {
      expect(NEW_COMBINATION_THRESHOLD_DAYS).toBe(7);
    });
  });
});

describe('getVarietyColor', () => {
  describe('when combination was never logged', () => {
    it('returns "green" for never-logged combinations with empty history', () => {
      const ingredientIds = ['milk-id', 'bread-id'];
      const history: MealLog[] = [];

      expect(getVarietyColor(ingredientIds, history)).toBe('green');
    });

    it('returns "green" for never-logged combinations with different combinations in history', () => {
      const ingredientIds = ['milk-id', 'bread-id'];
      const history: MealLog[] = [
        createMealLog(['cheese-id', 'apple-id'], 1),
        createMealLog(['banana-id', 'yogurt-id'], 2),
      ];

      expect(getVarietyColor(ingredientIds, history)).toBe('green');
    });
  });

  describe('when combination was logged 3+ days ago (fresh)', () => {
    it('returns "green" for combination logged exactly 3 days ago (edge case)', () => {
      const ingredientIds = ['milk-id', 'bread-id'];
      const history: MealLog[] = [
        createMealLog(['milk-id', 'bread-id'], FRESH_THRESHOLD_DAYS),
      ];

      expect(getVarietyColor(ingredientIds, history)).toBe('green');
    });

    it('returns "green" for combination logged 4 days ago', () => {
      const ingredientIds = ['milk-id', 'bread-id'];
      const history: MealLog[] = [createMealLog(['milk-id', 'bread-id'], 4)];

      expect(getVarietyColor(ingredientIds, history)).toBe('green');
    });

    it('returns "green" for combination logged 10 days ago', () => {
      const ingredientIds = ['milk-id', 'bread-id'];
      const history: MealLog[] = [createMealLog(['milk-id', 'bread-id'], 10)];

      expect(getVarietyColor(ingredientIds, history)).toBe('green');
    });
  });

  describe('when combination was logged 1-2 days ago (recent)', () => {
    it('returns "yellow" for combination logged exactly 1 day ago (edge case)', () => {
      const ingredientIds = ['milk-id', 'bread-id'];
      const history: MealLog[] = [createMealLog(['milk-id', 'bread-id'], 1)];

      expect(getVarietyColor(ingredientIds, history)).toBe('yellow');
    });

    it('returns "yellow" for combination logged 2 days ago', () => {
      const ingredientIds = ['milk-id', 'bread-id'];
      const history: MealLog[] = [createMealLog(['milk-id', 'bread-id'], 2)];

      expect(getVarietyColor(ingredientIds, history)).toBe('yellow');
    });
  });

  describe('when combination was logged today (very recent)', () => {
    it('returns "red" for combination logged today (0 days ago)', () => {
      const ingredientIds = ['milk-id', 'bread-id'];
      const history: MealLog[] = [createMealLog(['milk-id', 'bread-id'], 0)];

      expect(getVarietyColor(ingredientIds, history)).toBe('red');
    });
  });

  describe('order-independent matching', () => {
    it('matches combinations regardless of ingredient order', () => {
      const ingredientIds = ['milk-id', 'bread-id', 'cheese-id'];
      const history: MealLog[] = [
        createMealLog(['cheese-id', 'milk-id', 'bread-id'], 1), // Different order
      ];

      expect(getVarietyColor(ingredientIds, history)).toBe('yellow');
    });
  });

  describe('multiple logs for same combination', () => {
    it('uses the most recent log date', () => {
      const ingredientIds = ['milk-id', 'bread-id'];
      const history: MealLog[] = [
        createMealLog(['milk-id', 'bread-id'], 10, '1'), // 10 days ago
        createMealLog(['milk-id', 'bread-id'], 1, '2'), // 1 day ago (most recent)
        createMealLog(['milk-id', 'bread-id'], 5, '3'), // 5 days ago
      ];

      // Most recent is 1 day ago, so should be yellow
      expect(getVarietyColor(ingredientIds, history)).toBe('yellow');
    });

    it('returns "green" if all logs are 3+ days old', () => {
      const ingredientIds = ['milk-id', 'bread-id'];
      const history: MealLog[] = [
        createMealLog(['milk-id', 'bread-id'], 5, '1'),
        createMealLog(['milk-id', 'bread-id'], 10, '2'),
        createMealLog(['milk-id', 'bread-id'], 15, '3'),
      ];

      // All are 3+ days ago, so should be green
      expect(getVarietyColor(ingredientIds, history)).toBe('green');
    });
  });

  describe('threshold constant', () => {
    it('exports FRESH_THRESHOLD_DAYS as 3', () => {
      expect(FRESH_THRESHOLD_DAYS).toBe(3);
    });
  });
});

/**
 * Helper to create a date string N days ago in the current month
 * (or current week for week-based tests)
 */
function daysAgoThisMonth(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

/**
 * Helper to create a date string that is guaranteed to be within the current week.
 * Uses offset from the start of the week (Sunday) to ensure consistent results
 * regardless of what day the tests run.
 *
 * @param dayOffset - Days from start of week (0 = Sunday, 1 = Monday, ... 6 = Saturday)
 *                    Must be >= 0 and <= current day of week to ensure date is in the past
 */
function thisWeekDay(dayOffset: number): string {
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

  // Calculate the start of the current week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDayOfWeek);
  startOfWeek.setHours(12, 0, 0, 0);

  // Create date at the specified offset from start of week
  // Ensure we don't go beyond today
  const safeOffset = Math.min(dayOffset, currentDayOfWeek);
  const result = new Date(startOfWeek);
  result.setDate(startOfWeek.getDate() + safeOffset);

  return result.toISOString();
}

/**
 * Helper to create a date string in the previous month
 */
function previousMonth(dayOffset: number = 0): string {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  date.setDate(15 + dayOffset); // Middle of month to avoid edge cases
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

/**
 * Helper to create an Ingredient for testing
 */
function createIngredient(
  id: string,
  name: string,
  isActive: boolean = true
): Ingredient {
  return {
    id,
    name,
    category: 'test-category',
    mealTypes: ['breakfast'],
    is_active: isActive,
    is_user_added: false,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Helper to create a MealLog for stats testing
 */
function createStatsMealLog(
  ingredientIds: string[],
  dateString: string,
  id: string = `log-${Math.random().toString(36).substr(2, 9)}`
): MealLog {
  return {
    id,
    date: dateString,
    mealType: 'breakfast',
    ingredients: ingredientIds,
    createdAt: dateString,
    isFavorite: false,
  };
}

describe('calculateVarietyStats', () => {
  describe('uniqueCombosThisMonth', () => {
    it('returns correct unique combo count for this month', () => {
      const ingredients = [
        createIngredient('milk', 'Milk'),
        createIngredient('bread', 'Bread'),
        createIngredient('cheese', 'Cheese'),
      ];
      const history = [
        createStatsMealLog(['milk', 'bread'], daysAgoThisMonth(1)),
        createStatsMealLog(['milk', 'cheese'], daysAgoThisMonth(2)),
        createStatsMealLog(['bread', 'cheese'], daysAgoThisMonth(3)),
      ];

      const stats = calculateVarietyStats(history, ingredients);
      expect(stats.uniqueCombosThisMonth).toBe(3);
    });

    it('counts duplicate combinations only once', () => {
      const ingredients = [
        createIngredient('milk', 'Milk'),
        createIngredient('bread', 'Bread'),
      ];
      const history = [
        createStatsMealLog(['milk', 'bread'], daysAgoThisMonth(1)),
        createStatsMealLog(['milk', 'bread'], daysAgoThisMonth(2)),
        createStatsMealLog(['milk', 'bread'], daysAgoThisMonth(3)),
      ];

      const stats = calculateVarietyStats(history, ingredients);
      expect(stats.uniqueCombosThisMonth).toBe(1);
    });

    it('ignores logs from previous month', () => {
      const ingredients = [
        createIngredient('milk', 'Milk'),
        createIngredient('bread', 'Bread'),
        createIngredient('cheese', 'Cheese'),
      ];
      const history = [
        createStatsMealLog(['milk', 'bread'], daysAgoThisMonth(1)),
        createStatsMealLog(['milk', 'cheese'], previousMonth()),
        createStatsMealLog(['bread', 'cheese'], previousMonth()),
      ];

      const stats = calculateVarietyStats(history, ingredients);
      expect(stats.uniqueCombosThisMonth).toBe(1);
    });

    it('treats same ingredients in different order as same combination', () => {
      const ingredients = [
        createIngredient('milk', 'Milk'),
        createIngredient('bread', 'Bread'),
      ];
      const history = [
        createStatsMealLog(['milk', 'bread'], daysAgoThisMonth(1)),
        createStatsMealLog(['bread', 'milk'], daysAgoThisMonth(2)),
      ];

      const stats = calculateVarietyStats(history, ingredients);
      expect(stats.uniqueCombosThisMonth).toBe(1);
    });
  });

  describe('mostCommonCombo', () => {
    it('returns correct most common combo across all history', () => {
      const ingredients = [
        createIngredient('milk', 'Milk'),
        createIngredient('bread', 'Bread'),
        createIngredient('cheese', 'Cheese'),
      ];
      const history = [
        createStatsMealLog(['milk', 'bread'], daysAgoThisMonth(1)),
        createStatsMealLog(['milk', 'bread'], daysAgoThisMonth(2)),
        createStatsMealLog(['milk', 'bread'], daysAgoThisMonth(3)),
        createStatsMealLog(['milk', 'cheese'], daysAgoThisMonth(4)),
      ];

      const stats = calculateVarietyStats(history, ingredients);
      expect(stats.mostCommonCombo).not.toBeNull();
      expect(stats.mostCommonCombo!.count).toBe(3);
      // Note: The ingredients are sorted during storage, so we check for sorted order
      expect(stats.mostCommonCombo!.ingredients.sort()).toEqual(['bread', 'milk']);
    });

    it('includes logs from all time, not just this month', () => {
      const ingredients = [
        createIngredient('milk', 'Milk'),
        createIngredient('bread', 'Bread'),
      ];
      const history = [
        createStatsMealLog(['milk', 'bread'], previousMonth()),
        createStatsMealLog(['milk', 'bread'], previousMonth(1)),
        createStatsMealLog(['milk', 'bread'], previousMonth(2)),
        createStatsMealLog(['milk', 'bread'], daysAgoThisMonth(1)),
      ];

      const stats = calculateVarietyStats(history, ingredients);
      expect(stats.mostCommonCombo).not.toBeNull();
      expect(stats.mostCommonCombo!.count).toBe(4);
    });

    it('returns null when history is empty', () => {
      const ingredients = [createIngredient('milk', 'Milk')];
      const history: MealLog[] = [];

      const stats = calculateVarietyStats(history, ingredients);
      expect(stats.mostCommonCombo).toBeNull();
    });
  });

  describe('ingredientsUsedThisWeek', () => {
    it('returns correct ingredient usage ratio for this week', () => {
      const ingredients = [
        createIngredient('milk', 'Milk'),
        createIngredient('bread', 'Bread'),
        createIngredient('cheese', 'Cheese'),
        createIngredient('apple', 'Apple'),
      ];
      // Use thisWeekDay() to guarantee dates are in the current week
      // (daysAgoThisMonth fails on Sunday when yesterday is previous week)
      const history = [
        createStatsMealLog(['milk', 'bread'], thisWeekDay(0)), // Sunday of current week
        createStatsMealLog(['cheese'], thisWeekDay(0)), // Same day, different ingredients
      ];

      const stats = calculateVarietyStats(history, ingredients);
      expect(stats.ingredientsUsedThisWeek).toBe(3); // milk, bread, cheese
      expect(stats.totalIngredients).toBe(4);
    });

    it('counts each ingredient only once even if used multiple times', () => {
      const ingredients = [
        createIngredient('milk', 'Milk'),
        createIngredient('bread', 'Bread'),
      ];
      // Use thisWeekDay() to guarantee dates are in the current week
      const history = [
        createStatsMealLog(['milk', 'bread'], thisWeekDay(0)),
        createStatsMealLog(['milk', 'bread'], thisWeekDay(0)),
      ];

      const stats = calculateVarietyStats(history, ingredients);
      expect(stats.ingredientsUsedThisWeek).toBe(2);
    });

    it('only counts active ingredients in totalIngredients', () => {
      const ingredients = [
        createIngredient('milk', 'Milk', true),
        createIngredient('bread', 'Bread', true),
        createIngredient('cheese', 'Cheese', false), // Inactive
      ];
      const history: MealLog[] = [];

      const stats = calculateVarietyStats(history, ingredients);
      expect(stats.totalIngredients).toBe(2);
    });
  });

  describe('varietyScore', () => {
    it('returns correct variety score percentage', () => {
      // Use thisWeekDay() to guarantee dates are in the current week
      const ingredients = [
        createIngredient('milk', 'Milk'),
        createIngredient('bread', 'Bread'),
        createIngredient('cheese', 'Cheese'),
        createIngredient('apple', 'Apple'),
      ];
      const history = [
        createStatsMealLog(['milk', 'bread'], thisWeekDay(0)),
        createStatsMealLog(['cheese', 'milk'], thisWeekDay(0)),
      ];

      const stats = calculateVarietyStats(history, ingredients);
      // 2 unique combos / 2 logs = 1.0
      // 3 ingredients used (milk, bread, cheese) / 4 total = 0.75
      // Score = 1.0 * 0.75 * 100 = 75
      expect(stats.varietyScore).toBe(75);
    });

    it('returns 0 when no logs this month', () => {
      const ingredients = [
        createIngredient('milk', 'Milk'),
        createIngredient('bread', 'Bread'),
      ];
      const history = [
        createStatsMealLog(['milk', 'bread'], previousMonth()),
      ];

      const stats = calculateVarietyStats(history, ingredients);
      expect(stats.varietyScore).toBe(0);
    });

    it('returns 0 when no ingredients', () => {
      const ingredients: Ingredient[] = [];
      const history = [
        createStatsMealLog(['milk', 'bread'], daysAgoThisMonth(0)),
      ];

      const stats = calculateVarietyStats(history, ingredients);
      expect(stats.varietyScore).toBe(0);
    });

    it('is rounded to nearest integer', () => {
      // Set up a case that would produce a decimal score
      // Use thisWeekDay() to guarantee dates are in the current week
      const ingredients = [
        createIngredient('a', 'A'),
        createIngredient('b', 'B'),
        createIngredient('c', 'C'),
      ];
      const history = [
        createStatsMealLog(['a'], thisWeekDay(0)),
        createStatsMealLog(['a'], thisWeekDay(0)),
        createStatsMealLog(['b'], thisWeekDay(0)),
      ];

      const stats = calculateVarietyStats(history, ingredients);
      // 2 unique combos / 3 logs = 0.6666...
      // 2 ingredients used / 3 total = 0.6666...
      // Score = 0.6666 * 0.6666 * 100 = 44.44... → rounds to 44
      expect(stats.varietyScore).toBe(44);
    });
  });

  describe('edge cases', () => {
    it('returns zeros/defaults when no history exists', () => {
      const ingredients = [
        createIngredient('milk', 'Milk'),
        createIngredient('bread', 'Bread'),
      ];
      const history: MealLog[] = [];

      const stats = calculateVarietyStats(history, ingredients);

      expect(stats.uniqueCombosThisMonth).toBe(0);
      expect(stats.mostCommonCombo).toBeNull();
      expect(stats.ingredientsUsedThisWeek).toBe(0);
      expect(stats.totalIngredients).toBe(2);
      expect(stats.varietyScore).toBe(0);
    });

    it('returns 1 unique combo when all logs have same combination', () => {
      const ingredients = [
        createIngredient('milk', 'Milk'),
        createIngredient('bread', 'Bread'),
      ];
      // Use thisWeekDay() to guarantee dates are in the current week
      const history = [
        createStatsMealLog(['milk', 'bread'], thisWeekDay(0)),
        createStatsMealLog(['milk', 'bread'], thisWeekDay(0)),
        createStatsMealLog(['milk', 'bread'], thisWeekDay(0)),
        createStatsMealLog(['milk', 'bread'], thisWeekDay(0)),
        createStatsMealLog(['milk', 'bread'], thisWeekDay(0)),
      ];

      const stats = calculateVarietyStats(history, ingredients);

      expect(stats.uniqueCombosThisMonth).toBe(1);
      expect(stats.mostCommonCombo).not.toBeNull();
      expect(stats.mostCommonCombo!.count).toBe(5);
    });

    it('handles empty ingredients list', () => {
      const ingredients: Ingredient[] = [];
      const history: MealLog[] = [];

      const stats = calculateVarietyStats(history, ingredients);

      expect(stats.uniqueCombosThisMonth).toBe(0);
      expect(stats.mostCommonCombo).toBeNull();
      expect(stats.ingredientsUsedThisWeek).toBe(0);
      expect(stats.totalIngredients).toBe(0);
      expect(stats.varietyScore).toBe(0);
    });

    it('handles single ingredient combinations', () => {
      const ingredients = [
        createIngredient('milk', 'Milk'),
        createIngredient('bread', 'Bread'),
      ];
      // Use thisWeekDay() to guarantee dates are in the current week
      const history = [
        createStatsMealLog(['milk'], thisWeekDay(0)),
        createStatsMealLog(['bread'], thisWeekDay(0)),
      ];

      const stats = calculateVarietyStats(history, ingredients);

      expect(stats.uniqueCombosThisMonth).toBe(2);
      expect(stats.ingredientsUsedThisWeek).toBe(2);
    });
  });
});

describe('getIngredientFrequency', () => {
  describe('basic counting', () => {
    it('returns 0 for empty history', () => {
      const history: MealLog[] = [];

      expect(getIngredientFrequency('milk-id', history, 7)).toBe(0);
    });

    it('returns 0 when ingredient is not in any meals', () => {
      const history: MealLog[] = [
        createMealLog(['bread-id', 'cheese-id'], 1),
        createMealLog(['apple-id', 'banana-id'], 2),
      ];

      expect(getIngredientFrequency('milk-id', history, 7)).toBe(0);
    });

    it('counts ingredient used once', () => {
      const history: MealLog[] = [
        createMealLog(['milk-id', 'bread-id'], 1),
        createMealLog(['cheese-id', 'apple-id'], 2),
      ];

      expect(getIngredientFrequency('milk-id', history, 7)).toBe(1);
    });

    it('counts ingredient used multiple times', () => {
      const history: MealLog[] = [
        createMealLog(['milk-id', 'bread-id'], 1, '1'),
        createMealLog(['milk-id', 'cheese-id'], 2, '2'),
        createMealLog(['milk-id', 'apple-id'], 3, '3'),
      ];

      expect(getIngredientFrequency('milk-id', history, 7)).toBe(3);
    });

    it('counts each meal separately even on same day', () => {
      const history: MealLog[] = [
        createMealLog(['milk-id', 'bread-id'], 0, '1'),
        createMealLog(['milk-id', 'cheese-id'], 0, '2'),
      ];

      expect(getIngredientFrequency('milk-id', history, 7)).toBe(2);
    });
  });

  describe('day range filtering', () => {
    it('only counts meals within the specified day range', () => {
      const history: MealLog[] = [
        createMealLog(['milk-id', 'bread-id'], 1, '1'), // Within 7 days
        createMealLog(['milk-id', 'cheese-id'], 5, '2'), // Within 7 days
        createMealLog(['milk-id', 'apple-id'], 10, '3'), // Outside 7 days
      ];

      expect(getIngredientFrequency('milk-id', history, 7)).toBe(2);
    });

    it('includes meals from today (day 0)', () => {
      const history: MealLog[] = [
        createMealLog(['milk-id', 'bread-id'], 0), // Today
      ];

      expect(getIngredientFrequency('milk-id', history, 7)).toBe(1);
    });

    it('excludes meals at exactly the day boundary', () => {
      const history: MealLog[] = [
        createMealLog(['milk-id', 'bread-id'], 7, '1'), // Exactly 7 days ago (excluded)
        createMealLog(['milk-id', 'cheese-id'], 6, '2'), // 6 days ago (included)
      ];

      // 7 days means < 7, so day 7 is excluded
      expect(getIngredientFrequency('milk-id', history, 7)).toBe(1);
    });

    it('respects custom day ranges', () => {
      const history: MealLog[] = [
        createMealLog(['milk-id', 'bread-id'], 1, '1'),
        createMealLog(['milk-id', 'cheese-id'], 2, '2'),
        createMealLog(['milk-id', 'apple-id'], 4, '3'),
      ];

      // With 3 days range, only 2 meals should count (days 1 and 2)
      expect(getIngredientFrequency('milk-id', history, 3)).toBe(2);
    });

    it('returns 0 for 0-day range', () => {
      const history: MealLog[] = [
        createMealLog(['milk-id', 'bread-id'], 0), // Today
      ];

      // 0 days means < 0, which is impossible
      expect(getIngredientFrequency('milk-id', history, 0)).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('handles meals with single ingredient', () => {
      const history: MealLog[] = [createMealLog(['milk-id'], 1)];

      expect(getIngredientFrequency('milk-id', history, 7)).toBe(1);
    });

    it('handles meals with many ingredients', () => {
      const history: MealLog[] = [
        createMealLog(
          ['milk-id', 'bread-id', 'cheese-id', 'apple-id', 'banana-id'],
          1
        ),
      ];

      expect(getIngredientFrequency('milk-id', history, 7)).toBe(1);
      expect(getIngredientFrequency('banana-id', history, 7)).toBe(1);
    });

    it('does not count same meal multiple times', () => {
      // Even if ingredient appears "multiple times" conceptually in one meal,
      // it should only count the meal once
      const history: MealLog[] = [
        createMealLog(['milk-id', 'bread-id'], 1),
      ];

      expect(getIngredientFrequency('milk-id', history, 7)).toBe(1);
    });

    it('handles large history efficiently', () => {
      // Create history with 100 meals
      const history: MealLog[] = [];
      for (let i = 0; i < 100; i++) {
        history.push(
          createMealLog(['milk-id', 'bread-id'], i % 14, `log-${i}`)
        );
      }

      // Within 7 days, count meals on days 0-6
      const count = getIngredientFrequency('milk-id', history, 7);
      // 100 meals with days = i % 14
      // Day 0: i=0,14,28,42,56,70,84,98 = 8 meals
      // Day 1: i=1,15,29,43,57,71,85,99 = 8 meals
      // Days 2-6: 7 meals each = 35 meals
      // Total = 8 + 8 + 35 = 51 meals
      expect(count).toBe(51);
    });
  });
});

describe('calculateVarietyScore', () => {
  describe('penalty constants', () => {
    it('exports FREQUENCY_PENALTY with correct values', () => {
      expect(FREQUENCY_PENALTY.HIGH).toBe(30);
      expect(FREQUENCY_PENALTY.MEDIUM).toBe(15);
      expect(FREQUENCY_PENALTY.LOW).toBe(5);
    });
  });

  describe('basic scoring', () => {
    it('returns 100 for empty candidate ingredients', () => {
      const history: MealLog[] = [createMealLog(['milk-id'], 1)];

      expect(calculateVarietyScore([], history, 7)).toBe(100);
    });

    it('returns 100 for ingredients never used (no penalty)', () => {
      const history: MealLog[] = [createMealLog(['bread-id', 'cheese-id'], 1)];

      // milk-id has never been used, so no penalty
      expect(calculateVarietyScore(['milk-id'], history, 7)).toBe(100);
    });

    it('returns 100 with empty history (all ingredients are new)', () => {
      const history: MealLog[] = [];

      expect(calculateVarietyScore(['milk-id', 'bread-id'], history, 7)).toBe(
        100
      );
    });
  });

  describe('single ingredient penalties', () => {
    it('applies LOW penalty (-5) for ingredient used once', () => {
      const history: MealLog[] = [createMealLog(['milk-id', 'cheese-id'], 1)];

      // milk-id used 1 time = -5 penalty
      expect(calculateVarietyScore(['milk-id'], history, 7)).toBe(95);
    });

    it('applies MEDIUM penalty (-15) for ingredient used twice', () => {
      const history: MealLog[] = [
        createMealLog(['milk-id', 'bread-id'], 1, '1'),
        createMealLog(['milk-id', 'cheese-id'], 2, '2'),
      ];

      // milk-id used 2 times = -15 penalty
      expect(calculateVarietyScore(['milk-id'], history, 7)).toBe(85);
    });

    it('applies HIGH penalty (-30) for ingredient used 3 times', () => {
      const history: MealLog[] = [
        createMealLog(['milk-id', 'bread-id'], 1, '1'),
        createMealLog(['milk-id', 'cheese-id'], 2, '2'),
        createMealLog(['milk-id', 'apple-id'], 3, '3'),
      ];

      // milk-id used 3 times = -30 penalty
      expect(calculateVarietyScore(['milk-id'], history, 7)).toBe(70);
    });

    it('applies HIGH penalty (-30) for ingredient used more than 3 times', () => {
      const history: MealLog[] = [
        createMealLog(['milk-id', 'bread-id'], 1, '1'),
        createMealLog(['milk-id', 'cheese-id'], 2, '2'),
        createMealLog(['milk-id', 'apple-id'], 3, '3'),
        createMealLog(['milk-id', 'banana-id'], 4, '4'),
        createMealLog(['milk-id', 'orange-id'], 5, '5'),
      ];

      // milk-id used 5 times = -30 penalty (same as 3+)
      expect(calculateVarietyScore(['milk-id'], history, 7)).toBe(70);
    });
  });

  describe('multiple ingredients penalties', () => {
    it('accumulates penalties from multiple ingredients', () => {
      const history: MealLog[] = [
        createMealLog(['milk-id'], 1, '1'), // milk used once
        createMealLog(['bread-id'], 2, '2'), // bread used once
      ];

      // milk-id: -5 (used once)
      // bread-id: -5 (used once)
      // Total: 100 - 5 - 5 = 90
      expect(calculateVarietyScore(['milk-id', 'bread-id'], history, 7)).toBe(
        90
      );
    });

    it('handles mix of different penalty levels', () => {
      const history: MealLog[] = [
        createMealLog(['milk-id', 'bread-id'], 1, '1'),
        createMealLog(['milk-id', 'cheese-id'], 2, '2'),
        createMealLog(['milk-id', 'apple-id'], 3, '3'), // milk: 3 times (HIGH)
        createMealLog(['bread-id', 'banana-id'], 4, '4'), // bread: 2 times (MEDIUM)
        createMealLog(['cheese-id'], 5, '5'), // cheese: 2 times (MEDIUM)
      ];

      // milk-id: -30 (used 3 times, HIGH)
      // bread-id: -15 (used 2 times, MEDIUM)
      // cheese-id: -15 (used 2 times, MEDIUM)
      // Total: 100 - 30 - 15 - 15 = 40
      expect(
        calculateVarietyScore(['milk-id', 'bread-id', 'cheese-id'], history, 7)
      ).toBe(40);
    });

    it('handles mix of used and unused ingredients', () => {
      const history: MealLog[] = [
        createMealLog(['milk-id'], 1, '1'),
        createMealLog(['milk-id'], 2, '2'),
      ];

      // milk-id: -15 (used 2 times, MEDIUM)
      // bread-id: 0 (never used, no penalty)
      // Total: 100 - 15 = 85
      expect(calculateVarietyScore(['milk-id', 'bread-id'], history, 7)).toBe(
        85
      );
    });
  });

  describe('score clamping', () => {
    it('clamps score to minimum 0 (does not go negative)', () => {
      // Create history where each ingredient is used 3+ times
      const history: MealLog[] = [
        createMealLog(['a-id', 'b-id', 'c-id', 'd-id'], 1, '1'),
        createMealLog(['a-id', 'b-id', 'c-id', 'd-id'], 2, '2'),
        createMealLog(['a-id', 'b-id', 'c-id', 'd-id'], 3, '3'),
      ];

      // 4 ingredients × 30 (HIGH penalty each) = 120 penalty
      // 100 - 120 = -20, but should clamp to 0
      expect(
        calculateVarietyScore(['a-id', 'b-id', 'c-id', 'd-id'], history, 7)
      ).toBe(0);
    });

    it('returns exactly 0 at the boundary', () => {
      // 100 / 30 = 3.33, so 4 ingredients with HIGH penalty = 120
      // Let's use exactly enough to hit 0
      const history: MealLog[] = [
        createMealLog(['a-id', 'b-id', 'c-id'], 1, '1'),
        createMealLog(['a-id', 'b-id', 'c-id'], 2, '2'),
        createMealLog(['a-id', 'b-id', 'c-id'], 3, '3'),
        createMealLog(['d-id'], 4, '4'), // d-id: 1 time (LOW)
      ];

      // a, b, c: -30 each (used 3 times) = -90
      // d: -5 (used once) = -5
      // Total: 100 - 90 - 5 = 5
      expect(
        calculateVarietyScore(['a-id', 'b-id', 'c-id', 'd-id'], history, 7)
      ).toBe(5);
    });
  });

  describe('cooldown period', () => {
    it('respects cooldown days parameter', () => {
      const history: MealLog[] = [
        createMealLog(['milk-id'], 1, '1'), // Within 3 days
        createMealLog(['milk-id'], 2, '2'), // Within 3 days
        createMealLog(['milk-id'], 5, '3'), // Outside 3 days
      ];

      // With 3-day cooldown: milk used 2 times = MEDIUM penalty (-15)
      expect(calculateVarietyScore(['milk-id'], history, 3)).toBe(85);

      // With 7-day cooldown: milk used 3 times = HIGH penalty (-30)
      expect(calculateVarietyScore(['milk-id'], history, 7)).toBe(70);
    });

    it('excludes meals at exactly the cooldown boundary', () => {
      const history: MealLog[] = [
        createMealLog(['milk-id'], 6, '1'), // Day 6 (included in 7-day)
        createMealLog(['milk-id'], 7, '2'), // Day 7 (excluded from 7-day)
      ];

      // 7 days means < 7, so only day 6 is included (1 use = LOW penalty)
      expect(calculateVarietyScore(['milk-id'], history, 7)).toBe(95);
    });
  });

  describe('edge cases', () => {
    it('handles single ingredient meal in candidate', () => {
      const history: MealLog[] = [createMealLog(['milk-id'], 1)];

      expect(calculateVarietyScore(['milk-id'], history, 7)).toBe(95);
    });

    it('handles many ingredients in candidate', () => {
      const history: MealLog[] = [
        createMealLog(['a-id'], 1, '1'),
        createMealLog(['b-id'], 2, '2'),
      ];

      // a: -5 (used once)
      // b: -5 (used once)
      // c, d, e: 0 (never used)
      // Total: 100 - 5 - 5 = 90
      expect(
        calculateVarietyScore(
          ['a-id', 'b-id', 'c-id', 'd-id', 'e-id'],
          history,
          7
        )
      ).toBe(90);
    });

    it('handles 0-day cooldown (no penalties possible)', () => {
      const history: MealLog[] = [
        createMealLog(['milk-id'], 0), // Today
      ];

      // 0 days means < 0, which excludes all meals
      expect(calculateVarietyScore(['milk-id'], history, 0)).toBe(100);
    });
  });
});

import {
  isNewCombination,
  NEW_COMBINATION_THRESHOLD_DAYS,
  getVarietyColor,
  FRESH_THRESHOLD_DAYS,
  calculateVarietyStats,
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
      // Use logs from today to ensure they're in this week
      const history = [
        createStatsMealLog(['milk', 'bread'], daysAgoThisMonth(0)), // Today
        createStatsMealLog(['cheese'], daysAgoThisMonth(1)), // Yesterday (still this week)
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
      const history = [
        createStatsMealLog(['milk', 'bread'], daysAgoThisMonth(0)),
        createStatsMealLog(['milk', 'bread'], daysAgoThisMonth(1)),
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
      // 2 unique combos, 2 total logs this month = 100% combo ratio
      // 2 ingredients used this week, 4 total = 50% ingredient ratio
      // Score = 1.0 * 0.5 * 100 = 50
      const ingredients = [
        createIngredient('milk', 'Milk'),
        createIngredient('bread', 'Bread'),
        createIngredient('cheese', 'Cheese'),
        createIngredient('apple', 'Apple'),
      ];
      const history = [
        createStatsMealLog(['milk', 'bread'], daysAgoThisMonth(0)),
        createStatsMealLog(['cheese', 'milk'], daysAgoThisMonth(1)),
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
      const ingredients = [
        createIngredient('a', 'A'),
        createIngredient('b', 'B'),
        createIngredient('c', 'C'),
      ];
      const history = [
        createStatsMealLog(['a'], daysAgoThisMonth(0)),
        createStatsMealLog(['a'], daysAgoThisMonth(1)),
        createStatsMealLog(['b'], daysAgoThisMonth(2)),
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
      const history = [
        createStatsMealLog(['milk', 'bread'], daysAgoThisMonth(0)),
        createStatsMealLog(['milk', 'bread'], daysAgoThisMonth(1)),
        createStatsMealLog(['milk', 'bread'], daysAgoThisMonth(2)),
        createStatsMealLog(['milk', 'bread'], daysAgoThisMonth(3)),
        createStatsMealLog(['milk', 'bread'], daysAgoThisMonth(4)),
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
      const history = [
        createStatsMealLog(['milk'], daysAgoThisMonth(0)),
        createStatsMealLog(['bread'], daysAgoThisMonth(1)),
      ];

      const stats = calculateVarietyStats(history, ingredients);

      expect(stats.uniqueCombosThisMonth).toBe(2);
      expect(stats.ingredientsUsedThisWeek).toBe(2);
    });
  });
});

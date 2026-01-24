import {
  isNewCombination,
  NEW_COMBINATION_THRESHOLD_DAYS,
  getVarietyColor,
  FRESH_THRESHOLD_DAYS,
} from '../variety';
import type { MealLog } from '../../../types/database';

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

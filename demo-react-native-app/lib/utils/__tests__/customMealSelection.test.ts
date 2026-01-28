import {
  toggleIngredientSelection,
  isSelectionValid,
  isAtMaxIngredients,
  clearSelection,
  filterIngredientsByCategory,
  getSelectionCount,
  getRemainingSlots,
  DEFAULT_MIN_INGREDIENTS,
  DEFAULT_MAX_INGREDIENTS,
} from '../customMealSelection';

describe('Custom Meal Selection Logic', () => {
  describe('toggleIngredientSelection', () => {
    it('should add ingredient when not selected and under max', () => {
      const selection = ['ing-1', 'ing-2'];
      const result = toggleIngredientSelection(selection, 'ing-3');

      expect(result).toEqual(['ing-1', 'ing-2', 'ing-3']);
      expect(result).not.toBe(selection); // Should be new array
    });

    it('should remove ingredient when already selected', () => {
      const selection = ['ing-1', 'ing-2', 'ing-3'];
      const result = toggleIngredientSelection(selection, 'ing-2');

      expect(result).toEqual(['ing-1', 'ing-3']);
    });

    it('should not add ingredient when at max', () => {
      const selection = ['ing-1', 'ing-2', 'ing-3', 'ing-4', 'ing-5', 'ing-6'];
      const result = toggleIngredientSelection(selection, 'ing-7');

      expect(result).toEqual(selection);
      expect(result).toBe(selection); // Should be same array reference
    });

    it('should respect custom max limit', () => {
      const selection = ['ing-1', 'ing-2', 'ing-3'];
      const result = toggleIngredientSelection(selection, 'ing-4', { maxIngredients: 3 });

      expect(result).toEqual(selection);
    });

    it('should allow adding when under custom max limit', () => {
      const selection = ['ing-1', 'ing-2'];
      const result = toggleIngredientSelection(selection, 'ing-3', { maxIngredients: 4 });

      expect(result).toEqual(['ing-1', 'ing-2', 'ing-3']);
    });

    it('should handle empty selection', () => {
      const selection: string[] = [];
      const result = toggleIngredientSelection(selection, 'ing-1');

      expect(result).toEqual(['ing-1']);
    });

    it('should handle removing last ingredient', () => {
      const selection = ['ing-1'];
      const result = toggleIngredientSelection(selection, 'ing-1');

      expect(result).toEqual([]);
    });
  });

  describe('isSelectionValid', () => {
    it('should return true when selection meets minimum', () => {
      expect(isSelectionValid(['ing-1'])).toBe(true);
      expect(isSelectionValid(['ing-1', 'ing-2'])).toBe(true);
    });

    it('should return false when selection is empty', () => {
      expect(isSelectionValid([])).toBe(false);
    });

    it('should respect custom minimum', () => {
      expect(isSelectionValid(['ing-1'], { minIngredients: 2 })).toBe(false);
      expect(isSelectionValid(['ing-1', 'ing-2'], { minIngredients: 2 })).toBe(true);
    });

    it('should handle zero minimum', () => {
      expect(isSelectionValid([], { minIngredients: 0 })).toBe(true);
    });
  });

  describe('isAtMaxIngredients', () => {
    it('should return true when at max', () => {
      const selection = ['1', '2', '3', '4', '5', '6'];
      expect(isAtMaxIngredients(selection)).toBe(true);
    });

    it('should return false when under max', () => {
      const selection = ['1', '2', '3'];
      expect(isAtMaxIngredients(selection)).toBe(false);
    });

    it('should return true when over max', () => {
      const selection = ['1', '2', '3', '4', '5', '6', '7'];
      expect(isAtMaxIngredients(selection)).toBe(true);
    });

    it('should respect custom max', () => {
      expect(isAtMaxIngredients(['1', '2', '3'], { maxIngredients: 3 })).toBe(true);
      expect(isAtMaxIngredients(['1', '2'], { maxIngredients: 3 })).toBe(false);
    });
  });

  describe('clearSelection', () => {
    it('should return empty array', () => {
      expect(clearSelection()).toEqual([]);
    });
  });

  describe('filterIngredientsByCategory', () => {
    const mockIngredients = [
      { id: '1', name: 'Milk', category_id: 'dairy', is_active: true },
      { id: '2', name: 'Cheese', category_id: 'dairy', is_active: true },
      { id: '3', name: 'Apple', category_id: 'fruit', is_active: true },
      { id: '4', name: 'Bread', category_id: 'grains', is_active: false },
      { id: '5', name: 'Rice', category_id: 'grains', is_active: true },
      { id: '6', name: 'Yogurt', category_id: undefined, is_active: true },
    ];

    it('should return all active ingredients when category is null', () => {
      const result = filterIngredientsByCategory(mockIngredients, null);

      expect(result).toHaveLength(5);
      expect(result.map((i) => i.name)).not.toContain('Bread'); // Inactive
    });

    it('should filter by category', () => {
      const result = filterIngredientsByCategory(mockIngredients, 'dairy');

      expect(result).toHaveLength(2);
      expect(result.map((i) => i.name)).toEqual(['Milk', 'Cheese']);
    });

    it('should include inactive when activeOnly is false', () => {
      const result = filterIngredientsByCategory(mockIngredients, 'grains', false);

      expect(result).toHaveLength(2);
      expect(result.map((i) => i.name)).toContain('Bread');
    });

    it('should handle empty array', () => {
      const result = filterIngredientsByCategory([], 'dairy');
      expect(result).toEqual([]);
    });

    it('should handle non-existent category', () => {
      const result = filterIngredientsByCategory(mockIngredients, 'nonexistent');
      expect(result).toEqual([]);
    });

    it('should handle ingredients without category_id', () => {
      const result = filterIngredientsByCategory(mockIngredients, null);
      expect(result.find((i) => i.name === 'Yogurt')).toBeDefined();
    });
  });

  describe('getSelectionCount', () => {
    it('should return correct count', () => {
      expect(getSelectionCount([])).toBe(0);
      expect(getSelectionCount(['1'])).toBe(1);
      expect(getSelectionCount(['1', '2', '3'])).toBe(3);
    });
  });

  describe('getRemainingSlots', () => {
    it('should return correct remaining slots', () => {
      expect(getRemainingSlots([])).toBe(DEFAULT_MAX_INGREDIENTS);
      expect(getRemainingSlots(['1', '2'])).toBe(4);
      expect(getRemainingSlots(['1', '2', '3', '4', '5', '6'])).toBe(0);
    });

    it('should respect custom max', () => {
      expect(getRemainingSlots(['1'], { maxIngredients: 3 })).toBe(2);
    });

    it('should not return negative', () => {
      expect(getRemainingSlots(['1', '2', '3', '4', '5', '6', '7'])).toBe(0);
    });
  });

  describe('default constants', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_MIN_INGREDIENTS).toBe(1);
      expect(DEFAULT_MAX_INGREDIENTS).toBe(6);
    });
  });
});

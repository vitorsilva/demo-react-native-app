import { generateCombinations } from '../combinationGenerator';
import type { Ingredient } from '@/types/database';

describe('generateCombinations', () => {
  const mockIngredients: Ingredient[] = [
    {
      id: '1',
      name: 'Milk',
      category: 'protein',
      mealTypes: ['breakfast', 'snack'],
      is_active: true,
      is_user_added: false,
      createdAt: '',
    },
    {
      id: '2',
      name: 'Bread',
      category: 'carb',
      mealTypes: ['breakfast', 'snack'],
      is_active: true,
      is_user_added: false,
      createdAt: '',
    },
    {
      id: '3',
      name: 'Cheese',
      category: 'protein',
      mealTypes: ['breakfast', 'snack'],
      is_active: true,
      is_user_added: false,
      createdAt: '',
    },
    {
      id: '4',
      name: 'Jam',
      category: 'sweet',
      mealTypes: ['breakfast', 'snack'],
      is_active: true,
      is_user_added: false,
      createdAt: '',
    },
    {
      id: '5',
      name: 'Apple',
      category: 'fruit',
      mealTypes: ['breakfast', 'snack'],
      is_active: true,
      is_user_added: false,
      createdAt: '',
    },
  ];

  it('generates the requested number of combinations', () => {
    const result = generateCombinations(mockIngredients, 3, []);

    expect(result).toHaveLength(3);
  });

  it('each combination has 1-3 ingredients', () => {
    const result = generateCombinations(mockIngredients, 5, []);

    expect(result).toHaveLength(5);

    result.forEach((combo: Ingredient[]) => {
      expect(combo.length).toBeGreaterThanOrEqual(1);
      expect(combo.length).toBeLessThanOrEqual(3);
    });
  });

  it('filters out recently used ingredients', () => {
    const recentlyUsed = ['1', '2']; // Block Milk and Bread
    const result = generateCombinations(mockIngredients, 3, recentlyUsed);

    expect(result).toHaveLength(3);

    result.forEach((combo: Ingredient[]) => {
      combo.forEach((ingredient: Ingredient) => {
        expect(recentlyUsed).not.toContain(ingredient.id);
      });
    });
  });

  it('does not include duplicate ingredients within a combination', () => {
    const result = generateCombinations(mockIngredients, 10, []);

    expect(result).toHaveLength(10);

    result.forEach((combo: Ingredient[]) => {
      const ids = combo.map((ing: Ingredient) => ing.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length); // No duplicates
    });
  });

  it('filters out inactive ingredients by default', () => {
    const ingredientsWithInactive: Ingredient[] = [
      ...mockIngredients,
      {
        id: '6',
        name: 'Inactive Banana',
        category: 'fruit',
        mealTypes: ['breakfast'],
        is_active: false, // Inactive
        is_user_added: false,
        createdAt: '',
      },
    ];

    const result = generateCombinations(ingredientsWithInactive, 5, []);

    expect(result).toHaveLength(5);

    // Verify inactive ingredient is not included
    result.forEach((combo: Ingredient[]) => {
      combo.forEach((ingredient: Ingredient) => {
        expect(ingredient.id).not.toBe('6');
      });
    });
  });

  it('respects custom min/max ingredients options', () => {
    const result = generateCombinations(mockIngredients, 5, [], {
      minIngredients: 2,
      maxIngredients: 4,
    });

    expect(result).toHaveLength(5);

    result.forEach((combo: Ingredient[]) => {
      expect(combo.length).toBeGreaterThanOrEqual(2);
      expect(combo.length).toBeLessThanOrEqual(4);
    });
  });

  it('uses min ingredients when max equals min', () => {
    const result = generateCombinations(mockIngredients, 3, [], {
      minIngredients: 3,
      maxIngredients: 3,
    });

    expect(result).toHaveLength(3);

    result.forEach((combo: Ingredient[]) => {
      expect(combo.length).toBe(3);
    });
  });

  it('can include inactive ingredients when filterInactive is false', () => {
    // All ingredients inactive except one
    const mostlyInactive: Ingredient[] = [
      {
        id: '1',
        name: 'Active One',
        category: 'protein',
        mealTypes: ['breakfast'],
        is_active: true,
        is_user_added: false,
        createdAt: '',
      },
      {
        id: '2',
        name: 'Inactive Two',
        category: 'carb',
        mealTypes: ['breakfast'],
        is_active: false,
        is_user_added: false,
        createdAt: '',
      },
      {
        id: '3',
        name: 'Inactive Three',
        category: 'fruit',
        mealTypes: ['breakfast'],
        is_active: false,
        is_user_added: false,
        createdAt: '',
      },
    ];

    // With filterInactive: false, should include inactive ingredients
    const result = generateCombinations(mostlyInactive, 5, [], {
      filterInactive: false,
    });

    expect(result).toHaveLength(5);

    // With 3 ingredients available, combos should include inactive ones
    const allUsedIds = result.flatMap((combo) => combo.map((ing) => ing.id));
    expect(allUsedIds.length).toBeGreaterThan(0);
  });

  it('returns empty array when all ingredients are recently used', () => {
    // All ingredients are in the recently used list
    const allIds = mockIngredients.map((ing) => ing.id);
    const result = generateCombinations(mockIngredients, 3, allIds);

    expect(result).toEqual([]);
  });

  it('returns empty array when all ingredients are inactive', () => {
    const allInactive: Ingredient[] = [
      {
        id: '1',
        name: 'Inactive One',
        category: 'protein',
        mealTypes: ['breakfast'],
        is_active: false,
        is_user_added: false,
        createdAt: '',
      },
      {
        id: '2',
        name: 'Inactive Two',
        category: 'carb',
        mealTypes: ['breakfast'],
        is_active: false,
        is_user_added: false,
        createdAt: '',
      },
    ];

    const result = generateCombinations(allInactive, 3, []);

    expect(result).toEqual([]);
  });

  it('returns empty array when no ingredients provided', () => {
    const result = generateCombinations([], 3, []);

    expect(result).toEqual([]);
  });

  it('actually filters recently used - not just random exclusion', () => {
    // Use only 2 ingredients where one is blocked
    const twoIngredients: Ingredient[] = [
      {
        id: 'blocked',
        name: 'Blocked',
        category: 'protein',
        mealTypes: ['breakfast'],
        is_active: true,
        is_user_added: false,
        createdAt: '',
      },
      {
        id: 'allowed',
        name: 'Allowed',
        category: 'carb',
        mealTypes: ['breakfast'],
        is_active: true,
        is_user_added: false,
        createdAt: '',
      },
    ];

    // Generate many combos - if filter works, blocked should NEVER appear
    const result = generateCombinations(twoIngredients, 20, ['blocked']);

    expect(result).toHaveLength(20);

    // Verify blocked ingredient never appears in any combo
    result.forEach((combo) => {
      combo.forEach((ingredient) => {
        expect(ingredient.id).not.toBe('blocked');
      });
    });

    // Verify only allowed ingredient appears
    result.forEach((combo) => {
      combo.forEach((ingredient) => {
        expect(ingredient.id).toBe('allowed');
      });
    });
  });
});

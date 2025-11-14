import { generateCombinations } from '../combinationGenerator';
import type { Ingredient } from '@/types/database';

describe('generateCombinations', () => {
  const mockIngredients: Ingredient[] = [
    {
      id: '1',
      name: 'Milk',
      category: 'protein',
      mealTypes: ['breakfast', 'snack'],
      createdAt: '',
    },
    { id: '2', name: 'Bread', category: 'carb', mealTypes: ['breakfast', 'snack'], createdAt: '' },
    {
      id: '3',
      name: 'Cheese',
      category: 'protein',
      mealTypes: ['breakfast', 'snack'],
      createdAt: '',
    },
    { id: '4', name: 'Jam', category: 'sweet', mealTypes: ['breakfast', 'snack'], createdAt: '' },
    { id: '5', name: 'Apple', category: 'fruit', mealTypes: ['breakfast', 'snack'], createdAt: '' },
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
});

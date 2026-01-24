import { getRecentlyUsedIngredients } from '../varietyEngine';
import type { MealLog } from '../../../types/database';

describe('getRecentlyUsedIngredients', () => {
  it('extracts ingredient IDs from meal logs', () => {
    const mealLogs: MealLog[] = [
      {
        id: '1',
        date: '2025-01-13',
        mealType: 'breakfast',
        ingredients: ['milk-id', 'bread-id'],
        createdAt: '2025-01-13T08:00:00Z',
        isFavorite: false,
      },
      {
        id: '2',
        date: '2025-01-12',
        mealType: 'snack',
        ingredients: ['cheese-id', 'apple-id'],
        createdAt: '2025-01-12T15:00:00Z',
        isFavorite: false,
      },
    ];

    const result = getRecentlyUsedIngredients(mealLogs);

    expect(result).toHaveLength(4);
    expect(result).toContain('milk-id');
    expect(result).toContain('bread-id');
    expect(result).toContain('cheese-id');
    expect(result).toContain('apple-id');
  });

  it('removes duplicate ingredient IDs', () => {
    const mealLogs: MealLog[] = [
      {
        id: '1',
        date: '2025-01-13',
        mealType: 'breakfast',
        ingredients: ['milk-id', 'bread-id'],
        createdAt: '2025-01-13T08:00:00Z',
        isFavorite: false,
      },
      {
        id: '2',
        date: '2025-01-12',
        mealType: 'breakfast',
        ingredients: ['milk-id', 'cheese-id'], // milk-id appears again
        createdAt: '2025-01-12T08:00:00Z',
        isFavorite: false,
      },
    ];

    const result = getRecentlyUsedIngredients(mealLogs);

    expect(result).toHaveLength(3); // milk, bread, cheese (no duplicate milk)
    expect(result).toContain('milk-id');
    expect(result).toContain('bread-id');
    expect(result).toContain('cheese-id');
  });

  it('returns empty array when no meal logs', () => {
    const result = getRecentlyUsedIngredients([]);

    expect(result).toEqual([]);
  });

  it('handles meals with empty ingredient lists', () => {
    const mealLogs: MealLog[] = [
      {
        id: '1',
        date: '2025-01-13',
        mealType: 'breakfast',
        ingredients: [],
        createdAt: '2025-01-13T08:00:00Z',
        isFavorite: false,
      },
    ];

    const result = getRecentlyUsedIngredients(mealLogs);

    expect(result).toEqual([]);
  });
});

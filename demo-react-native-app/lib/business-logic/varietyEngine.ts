import type { MealLog } from '../../types/database';

/**
 * Extracts unique ingredient IDs from meal logs
 * Used to prevent recently used ingredients from appearing in new suggestions
 *
 * @param mealLogs - Array of meal logs to analyze
 * @returns Array of unique ingredient IDs
 */
export function getRecentlyUsedIngredients(mealLogs: MealLog[]): string[] {
  // Step 1: Extract all ingredient arrays
  // [['milk-id', 'bread-id'], ['cheese-id', 'apple-id']]
  const ingredientArrays = mealLogs.map((log) => log.ingredients);

  // Step 2: Flatten into one array
  // ['milk-id', 'bread-id', 'cheese-id', 'apple-id']
  const allIngredients = ingredientArrays.flat();

  // Step 3: Remove duplicates using Set
  // Set automatically removes duplicates
  const uniqueIngredients = new Set(allIngredients);

  // Step 4: Convert Set back to array
  return Array.from(uniqueIngredients);
}

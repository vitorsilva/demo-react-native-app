import type { Ingredient } from '../../types/database';

/**
 * Generates random meal combinations from available ingredients
 *
 * @param ingredients - All available ingredients
 * @param count - Number of combinations to generate
 * @param recentlyUsedIds - IDs of ingredients to exclude (for variety)
 * @returns Array of combinations, each containing 1-3 ingredients
 */
export function generateCombinations(
  ingredients: Ingredient[],
  count: number,
  recentlyUsedIds: string[]
): Ingredient[][] {
  // Step 1: Filter out recently used ingredients
  const availableIngredients = ingredients.filter((ing) => !recentlyUsedIds.includes(ing.id));

  // Edge case: If no ingredients available, return empty array
  if (availableIngredients.length === 0) {
    return [];
  }

  const combinations: Ingredient[][] = [];

  // Step 2: Generate 'count' number of combinations
  for (let i = 0; i < count; i++) {
    // Step 3: Randomly decide combo size (1, 2, or 3)
    const comboSize = Math.floor(Math.random() * 3) + 1; // Random: 1, 2, or 3

    // Step 4: Shuffle available ingredients (for randomness)
    const shuffled = shuffleArray([...availableIngredients]);

    // Step 5: Take first 'comboSize' ingredients
    // This guarantees no duplicates within the combo
    const combo = shuffled.slice(0, Math.min(comboSize, shuffled.length));

    combinations.push(combo);
  }

  return combinations;
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 * Creates a new array (doesn't mutate original)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]; // Copy array

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap
  }

  return shuffled;
}

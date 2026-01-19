import type { Ingredient } from '../../types/database';

/**
 * Options for generating meal combinations
 */
export interface GenerateCombinationsOptions {
  /** Minimum number of ingredients per combination (default: 1) */
  minIngredients?: number;
  /** Maximum number of ingredients per combination (default: 3) */
  maxIngredients?: number;
  /** Whether to filter out inactive ingredients (default: true) */
  filterInactive?: boolean;
}

/**
 * Generates random meal combinations from available ingredients
 *
 * @param ingredients - All available ingredients
 * @param count - Number of combinations to generate
 * @param recentlyUsedIds - IDs of ingredients to exclude (for variety)
 * @param options - Optional configuration for min/max ingredients and filtering
 * @returns Array of combinations, each containing minIngredients to maxIngredients ingredients
 */
export function generateCombinations(
  ingredients: Ingredient[],
  count: number,
  recentlyUsedIds: string[],
  options: GenerateCombinationsOptions = {}
): Ingredient[][] {
  // Apply defaults
  const minIngredients = options.minIngredients ?? 1;
  const maxIngredients = options.maxIngredients ?? 3;
  const filterInactive = options.filterInactive ?? true;

  // Step 1: Filter out inactive ingredients if requested
  let availableIngredients = filterInactive
    ? ingredients.filter((ing) => ing.is_active)
    : [...ingredients];

  // Step 2: Filter out recently used ingredients
  availableIngredients = availableIngredients.filter(
    (ing) => !recentlyUsedIds.includes(ing.id)
  );

  // Edge case: If no ingredients available, return empty array
  if (availableIngredients.length === 0) {
    return [];
  }

  const combinations: Ingredient[][] = [];

  // Step 3: Generate 'count' number of combinations
  for (let i = 0; i < count; i++) {
    // Step 4: Randomly decide combo size within min-max range
    const range = maxIngredients - minIngredients + 1;
    const comboSize = Math.floor(Math.random() * range) + minIngredients;

    // Step 5: Shuffle available ingredients (for randomness)
    const shuffled = shuffleArray([...availableIngredients]);

    // Step 6: Take first 'comboSize' ingredients
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

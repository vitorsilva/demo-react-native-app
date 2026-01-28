/**
 * Custom Meal Selection Logic
 *
 * Utility functions for managing ingredient selection state in the
 * Custom Meal Creation feature.
 */

// Default validation constants
export const DEFAULT_MIN_INGREDIENTS = 1;
export const DEFAULT_MAX_INGREDIENTS = 6;

export interface SelectionConfig {
  minIngredients?: number;
  maxIngredients?: number;
}

/**
 * Toggle an ingredient in the selection.
 * Returns the new selection array.
 *
 * Rules:
 * - If ingredient is selected, remove it
 * - If ingredient is not selected and under max, add it
 * - If ingredient is not selected and at max, don't add (return same array)
 */
export function toggleIngredientSelection(
  currentSelection: string[],
  ingredientId: string,
  config: SelectionConfig = {}
): string[] {
  const { maxIngredients = DEFAULT_MAX_INGREDIENTS } = config;

  // If already selected, remove it
  if (currentSelection.includes(ingredientId)) {
    return currentSelection.filter((id) => id !== ingredientId);
  }

  // If at max, don't add
  if (currentSelection.length >= maxIngredients) {
    return currentSelection;
  }

  // Add the ingredient
  return [...currentSelection, ingredientId];
}

/**
 * Validate if the current selection meets the minimum requirement.
 */
export function isSelectionValid(
  selection: string[],
  config: SelectionConfig = {}
): boolean {
  const { minIngredients = DEFAULT_MIN_INGREDIENTS } = config;
  return selection.length >= minIngredients;
}

/**
 * Check if selection is at the maximum allowed.
 */
export function isAtMaxIngredients(
  selection: string[],
  config: SelectionConfig = {}
): boolean {
  const { maxIngredients = DEFAULT_MAX_INGREDIENTS } = config;
  return selection.length >= maxIngredients;
}

/**
 * Clear all selected ingredients.
 */
export function clearSelection(): string[] {
  return [];
}

/**
 * Filter ingredients by category.
 * If categoryId is null/undefined, returns all ingredients.
 */
export function filterIngredientsByCategory<
  T extends { category_id?: string; is_active?: boolean }
>(ingredients: T[], categoryId: string | null, activeOnly = true): T[] {
  let filtered = ingredients;

  // Filter active only if requested
  if (activeOnly) {
    filtered = filtered.filter((ing) => ing.is_active !== false);
  }

  // Filter by category if specified
  if (categoryId !== null) {
    filtered = filtered.filter((ing) => ing.category_id === categoryId);
  }

  return filtered;
}

/**
 * Get count of selected ingredients.
 */
export function getSelectionCount(selection: string[]): number {
  return selection.length;
}

/**
 * Check how many more ingredients can be selected.
 */
export function getRemainingSlots(
  selection: string[],
  config: SelectionConfig = {}
): number {
  const { maxIngredients = DEFAULT_MAX_INGREDIENTS } = config;
  return Math.max(0, maxIngredients - selection.length);
}

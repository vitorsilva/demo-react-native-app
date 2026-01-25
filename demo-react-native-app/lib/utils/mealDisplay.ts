/**
 * Meal display utility functions for formatting meal logs.
 * Used for displaying meals in history, suggestions, and other UI components.
 */

import type {
  Ingredient,
  MealComponent,
  MealLog,
  PreparationMethod,
} from '../../types/database';

/**
 * Formats a meal for display in the UI.
 *
 * Display logic:
 * - If the meal has a name, return the name (e.g., "Mom's chicken")
 * - Otherwise, build from components: "{prep} {ingredient}" joined by " + "
 *   - If component has no preparation method, just use ingredient name
 *   - Example: "fried chicken + milk + toasted bread"
 *
 * @param meal - The meal log to format
 * @param components - Array of meal components for this meal
 * @param ingredients - Array of available ingredients (for name lookup)
 * @param prepMethods - Array of available preparation methods (for name lookup)
 * @returns Formatted display string for the meal
 */
export function formatMealDisplay(
  meal: MealLog,
  components: MealComponent[],
  ingredients: Ingredient[],
  prepMethods: PreparationMethod[]
): string {
  // If meal has a name, use it
  if (meal.name) {
    return meal.name;
  }

  // Build from components
  if (components.length === 0) {
    // Fallback to legacy ingredients array if no components
    if (meal.ingredients && meal.ingredients.length > 0) {
      return meal.ingredients
        .map((ingredientId) => {
          const ingredient = ingredients.find((i) => i.id === ingredientId);
          return ingredient?.name ?? ingredientId;
        })
        .join(' + ');
    }
    return '';
  }

  // Format each component as "{prep} {ingredient}" or just "{ingredient}"
  return components
    .map((comp) => {
      const ingredient = ingredients.find((i) => i.id === comp.ingredientId);
      const ingredientName = ingredient?.name ?? comp.ingredientId;

      if (comp.preparationMethodId) {
        const prep = prepMethods.find(
          (p) => p.id === comp.preparationMethodId
        );
        if (prep) {
          return `${prep.name} ${ingredientName}`;
        }
      }

      return ingredientName;
    })
    .join(' + ');
}

/**
 * Formats a single meal component for display.
 *
 * @param component - The meal component to format
 * @param ingredients - Array of available ingredients
 * @param prepMethods - Array of available preparation methods
 * @returns Formatted string like "fried chicken" or just "milk"
 */
export function formatMealComponent(
  component: MealComponent,
  ingredients: Ingredient[],
  prepMethods: PreparationMethod[]
): string {
  const ingredient = ingredients.find((i) => i.id === component.ingredientId);
  const ingredientName = ingredient?.name ?? component.ingredientId;

  if (component.preparationMethodId) {
    const prep = prepMethods.find(
      (p) => p.id === component.preparationMethodId
    );
    if (prep) {
      return `${prep.name} ${ingredientName}`;
    }
  }

  return ingredientName;
}

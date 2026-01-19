import type { DatabaseAdapter } from './adapters/types';

/**
 * Validation utilities for database operations.
 * Centralizes all validation logic for ingredients, categories, and meal types.
 */

// ============================================
// Validation Result Types
// ============================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// ============================================
// Name Uniqueness Validation
// ============================================

/**
 * Check if a category name is unique (case-insensitive).
 * @param db Database adapter
 * @param name Category name to check
 * @param excludeId Optional ID to exclude (for updates)
 */
export async function isCategoryNameUnique(
  db: DatabaseAdapter,
  name: string,
  excludeId?: string
): Promise<ValidationResult> {
  const normalizedName = name.trim().toLowerCase();

  if (!normalizedName) {
    return { isValid: false, error: 'Category name cannot be empty' };
  }

  const query = excludeId
    ? 'SELECT COUNT(*) as count FROM categories WHERE LOWER(name) = ? AND id != ?'
    : 'SELECT COUNT(*) as count FROM categories WHERE LOWER(name) = ?';

  const params = excludeId ? [normalizedName, excludeId] : [normalizedName];

  const result = await db.getFirstAsync<{ count: number }>(query, params);

  if (result && result.count > 0) {
    return {
      isValid: false,
      error: `A category named "${name}" already exists`,
    };
  }

  return { isValid: true };
}

/**
 * Check if a meal type name is unique (case-insensitive).
 * @param db Database adapter
 * @param name Meal type name to check
 * @param excludeId Optional ID to exclude (for updates)
 */
export async function isMealTypeNameUnique(
  db: DatabaseAdapter,
  name: string,
  excludeId?: string
): Promise<ValidationResult> {
  const normalizedName = name.trim().toLowerCase();

  if (!normalizedName) {
    return { isValid: false, error: 'Meal type name cannot be empty' };
  }

  const query = excludeId
    ? 'SELECT COUNT(*) as count FROM meal_types WHERE LOWER(name) = ? AND id != ?'
    : 'SELECT COUNT(*) as count FROM meal_types WHERE LOWER(name) = ?';

  const params = excludeId ? [normalizedName, excludeId] : [normalizedName];

  const result = await db.getFirstAsync<{ count: number }>(query, params);

  if (result && result.count > 0) {
    return {
      isValid: false,
      error: `A meal type named "${name}" already exists`,
    };
  }

  return { isValid: true };
}

/**
 * Check if an ingredient name is unique (case-insensitive).
 * @param db Database adapter
 * @param name Ingredient name to check
 * @param excludeId Optional ID to exclude (for updates)
 */
export async function isIngredientNameUnique(
  db: DatabaseAdapter,
  name: string,
  excludeId?: string
): Promise<ValidationResult> {
  const normalizedName = name.trim().toLowerCase();

  if (!normalizedName) {
    return { isValid: false, error: 'Ingredient name cannot be empty' };
  }

  const query = excludeId
    ? 'SELECT COUNT(*) as count FROM ingredients WHERE LOWER(name) = ? AND id != ?'
    : 'SELECT COUNT(*) as count FROM ingredients WHERE LOWER(name) = ?';

  const params = excludeId ? [normalizedName, excludeId] : [normalizedName];

  const result = await db.getFirstAsync<{ count: number }>(query, params);

  if (result && result.count > 0) {
    return {
      isValid: false,
      error: `An ingredient named "${name}" already exists`,
    };
  }

  return { isValid: true };
}

// ============================================
// Meal Type Configuration Validation
// ============================================

/**
 * Validate meal type configuration values.
 * @param config Meal type configuration to validate
 */
export function validateMealTypeConfig(config: {
  min_ingredients?: number;
  max_ingredients?: number;
  default_cooldown_days?: number;
}): ValidationResult {
  const { min_ingredients, max_ingredients, default_cooldown_days } = config;

  // Validate min_ingredients
  if (min_ingredients !== undefined) {
    if (!Number.isInteger(min_ingredients) || min_ingredients < 1) {
      return {
        isValid: false,
        error: 'Minimum ingredients must be at least 1',
      };
    }
  }

  // Validate max_ingredients
  if (max_ingredients !== undefined) {
    if (!Number.isInteger(max_ingredients) || max_ingredients < 1) {
      return {
        isValid: false,
        error: 'Maximum ingredients must be at least 1',
      };
    }
  }

  // Validate min <= max
  if (min_ingredients !== undefined && max_ingredients !== undefined) {
    if (min_ingredients > max_ingredients) {
      return {
        isValid: false,
        error: 'Minimum ingredients cannot exceed maximum ingredients',
      };
    }
  }

  // Validate cooldown_days
  if (default_cooldown_days !== undefined) {
    if (!Number.isInteger(default_cooldown_days) || default_cooldown_days < 0) {
      return {
        isValid: false,
        error: 'Cooldown days must be 0 or greater',
      };
    }
  }

  return { isValid: true };
}

// ============================================
// Deletion Safety Checks
// ============================================

/**
 * Check if an ingredient can be safely deleted.
 * Prevents deletion of the last active ingredient for any meal type.
 * @param db Database adapter
 * @param ingredientId Ingredient ID to check
 */
export async function canDeleteIngredient(
  db: DatabaseAdapter,
  ingredientId: string
): Promise<ValidationResult> {
  // Get the ingredient to find its meal types
  const ingredient = await db.getFirstAsync<{
    id: string;
    name: string;
    meal_types: string;
    is_active: number;
  }>(
    'SELECT id, name, meal_types, is_active FROM ingredients WHERE id = ?',
    [ingredientId]
  );

  if (!ingredient) {
    return { isValid: false, error: 'Ingredient not found' };
  }

  // Only check if the ingredient is active
  if (ingredient.is_active !== 1) {
    return { isValid: true };
  }

  // Parse the meal types this ingredient belongs to
  const mealTypes: string[] = JSON.parse(ingredient.meal_types);

  // For each meal type, check if this is the last active ingredient
  for (const mealType of mealTypes) {
    // Count active ingredients for this meal type (excluding the one being deleted)
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM ingredients
       WHERE is_active = 1
       AND id != ?
       AND meal_types LIKE ?`,
      [ingredientId, `%"${mealType}"%`]
    );

    if (!result || result.count === 0) {
      return {
        isValid: false,
        error: `Cannot delete "${ingredient.name}": it's the last active ingredient for ${mealType}`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Check if disabling an ingredient is safe.
 * Prevents disabling the last active ingredient for any meal type.
 * @param db Database adapter
 * @param ingredientId Ingredient ID to check
 */
export async function canDisableIngredient(
  db: DatabaseAdapter,
  ingredientId: string
): Promise<ValidationResult> {
  // Get the ingredient to find its meal types
  const ingredient = await db.getFirstAsync<{
    id: string;
    name: string;
    meal_types: string;
    is_active: number;
  }>(
    'SELECT id, name, meal_types, is_active FROM ingredients WHERE id = ?',
    [ingredientId]
  );

  if (!ingredient) {
    return { isValid: false, error: 'Ingredient not found' };
  }

  // If already inactive, can toggle on (always allowed)
  if (ingredient.is_active !== 1) {
    return { isValid: true };
  }

  // Parse the meal types this ingredient belongs to
  const mealTypes: string[] = JSON.parse(ingredient.meal_types);

  // For each meal type, check if this is the last active ingredient
  for (const mealType of mealTypes) {
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM ingredients
       WHERE is_active = 1
       AND id != ?
       AND meal_types LIKE ?`,
      [ingredientId, `%"${mealType}"%`]
    );

    if (!result || result.count === 0) {
      return {
        isValid: false,
        error: `Cannot disable "${ingredient.name}": it's the last active ingredient for ${mealType}`,
      };
    }
  }

  return { isValid: true };
}

// ============================================
// General Validation Helpers
// ============================================

/**
 * Validate that a string is not empty after trimming.
 */
export function validateNonEmptyString(
  value: string,
  fieldName: string
): ValidationResult {
  if (!value || value.trim().length === 0) {
    return {
      isValid: false,
      error: `${fieldName} cannot be empty`,
    };
  }
  return { isValid: true };
}

/**
 * Validate that a string doesn't exceed a maximum length.
 */
export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string
): ValidationResult {
  if (value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} cannot exceed ${maxLength} characters`,
    };
  }
  return { isValid: true };
}

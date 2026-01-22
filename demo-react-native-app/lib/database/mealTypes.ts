import * as Crypto from 'expo-crypto';
import type { DatabaseAdapter } from './adapters/types';
import type { MealType } from '../../types/database';

/** Raw row type from SQLite (is_active stored as 0/1) */
type MealTypeRow = Omit<MealType, 'is_active'> & { is_active: number };

/**
 * Retrieves all meal types from the database.
 * @param db - Database adapter instance
 * @param activeOnly - If true, only returns active meal types
 * @returns Array of meal types, sorted by name
 */
export async function getAllMealTypes(
  db: DatabaseAdapter,
  activeOnly: boolean = false
): Promise<MealType[]> {
  const query = activeOnly
    ? `SELECT id, name, min_ingredients, max_ingredients, default_cooldown_days,
       is_active, created_at, updated_at FROM meal_types WHERE is_active = 1 ORDER BY name`
    : `SELECT id, name, min_ingredients, max_ingredients, default_cooldown_days,
       is_active, created_at, updated_at FROM meal_types ORDER BY name`;

  const rows = await db.getAllAsync<MealTypeRow>(query);

  // Convert SQLite integer (0/1) to boolean
  return rows.map(row => ({
    ...row,
    is_active: row.is_active === 1,
  }));
}

/**
 * Creates a new meal type in the database.
 * @param db - Database adapter instance
 * @param mealType - Meal type configuration
 * @param mealType.name - Display name (e.g., "Breakfast")
 * @param mealType.min_ingredients - Minimum ingredients per suggestion (default: 1)
 * @param mealType.max_ingredients - Maximum ingredients per suggestion (default: 4)
 * @param mealType.default_cooldown_days - Days before ingredient reuse (default: 3)
 * @param mealType.is_active - Whether the meal type is active (default: true)
 * @returns The created meal type with generated ID and timestamps
 */
export async function addMealType(
  db: DatabaseAdapter,
  mealType: {
    name: string;
    min_ingredients?: number;
    max_ingredients?: number;
    default_cooldown_days?: number;
    is_active?: boolean;
  }
): Promise<MealType> {
  const id = Crypto.randomUUID();
  const now = new Date().toISOString();

  // Apply defaults
  const min_ingredients = mealType.min_ingredients ?? 1;
  const max_ingredients = mealType.max_ingredients ?? 4;
  const default_cooldown_days = mealType.default_cooldown_days ?? 3;
  const is_active = mealType.is_active ?? true;

  await db.runAsync(
    `INSERT INTO meal_types (id, name, min_ingredients, max_ingredients,
     default_cooldown_days, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, mealType.name, min_ingredients, max_ingredients,
     default_cooldown_days, is_active ? 1 : 0, now, now]
  );

  return {
    id,
    name: mealType.name,
    min_ingredients,
    max_ingredients,
    default_cooldown_days,
    is_active,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Retrieves a single meal type by its ID.
 * @param db - Database adapter instance
 * @param id - Meal type UUID
 * @returns The meal type or null if not found
 */
export async function getMealTypeById(
  db: DatabaseAdapter,
  id: string
): Promise<MealType | null> {
  const row = await db.getFirstAsync<MealTypeRow>(
    `SELECT id, name, min_ingredients, max_ingredients, default_cooldown_days,
     is_active, created_at, updated_at FROM meal_types WHERE id = ?`,
    [id]
  );

  if (!row) return null;

  return {
    ...row,
    is_active: row.is_active === 1,
  };
}

/**
 * Updates a meal type's properties. Only provided fields are updated.
 * @param db - Database adapter instance
 * @param id - Meal type UUID
 * @param updates - Partial meal type data to update
 * @returns The updated meal type or null if not found
 */
export async function updateMealType(
  db: DatabaseAdapter,
  id: string,
  updates: Partial<Pick<MealType, 'name' | 'min_ingredients' | 'max_ingredients' | 'default_cooldown_days' | 'is_active'>>
): Promise<MealType | null> {
  const now = new Date().toISOString();

  // Build dynamic SET clause based on provided fields
  const setClauses: string[] = ['updated_at = ?'];
  const values: unknown[] = [now];

  if (updates.name !== undefined) {
    setClauses.push('name = ?');
    values.push(updates.name);
  }
  if (updates.min_ingredients !== undefined) {
    setClauses.push('min_ingredients = ?');
    values.push(updates.min_ingredients);
  }
  if (updates.max_ingredients !== undefined) {
    setClauses.push('max_ingredients = ?');
    values.push(updates.max_ingredients);
  }
  if (updates.default_cooldown_days !== undefined) {
    setClauses.push('default_cooldown_days = ?');
    values.push(updates.default_cooldown_days);
  }
  if (updates.is_active !== undefined) {
    setClauses.push('is_active = ?');
    values.push(updates.is_active ? 1 : 0);
  }

  values.push(id); // For WHERE clause

  await db.runAsync(
    `UPDATE meal_types SET ${setClauses.join(', ')} WHERE id = ?`,
    values
  );

  return getMealTypeById(db, id);
}

/**
 * Deletes a meal type from the database.
 * Fails if any meal logs or ingredients reference it.
 * @param db - Database adapter instance
 * @param id - Meal type UUID
 * @returns Object indicating success or failure with error message
 */
export async function deleteMealType(
    db: DatabaseAdapter,
    id: string
  ): Promise<{ success: boolean; error?: string }> {
    // First, get the meal type name
    const mealType = await getMealTypeById(db, id);
    if (!mealType) {
      return { success: false, error: 'Meal type not found' };
    }

    // Check if any meal logs use this meal type (by name)
    const logCount = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM meal_logs WHERE meal_type = ?',
      [mealType.name]
    );

    if (logCount && logCount.count > 0) {
      return {
        success: false,
        error: `Cannot delete meal type: ${logCount.count} meal log(s) reference it`,
      };
    }

    // Check if any ingredients include this meal type (JSON array stored as text)
    const ingredientCount = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM ingredients WHERE meal_types LIKE ?`,
      [`%"${mealType.name}"%`]
    );

    if (ingredientCount && ingredientCount.count > 0) {
      return {
        success: false,
        error: `Cannot delete meal type: ${ingredientCount.count} ingredient(s) are assigned to it`,
      };
    }

    await db.runAsync('DELETE FROM meal_types WHERE id = ?', [id]);

    return { success: true };
  }
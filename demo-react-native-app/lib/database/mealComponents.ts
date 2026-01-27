import * as Crypto from 'expo-crypto';
import type { DatabaseAdapter } from './adapters/types';
import type { MealComponent, MealLog } from '../../types/database';

/**
 * Database row type for meal_components table.
 * Maps SQLite column names to TypeScript types.
 */
interface MealComponentRow {
  id: string;
  meal_log_id: string;
  ingredient_id: string;
  preparation_method_id: string | null;
  created_at: string;
}

/**
 * Converts a database row to a MealComponent object.
 * @param row - Raw database row
 * @returns MealComponent with proper TypeScript types
 */
function rowToMealComponent(row: MealComponentRow): MealComponent {
  return {
    id: row.id,
    mealLogId: row.meal_log_id,
    ingredientId: row.ingredient_id,
    preparationMethodId: row.preparation_method_id,
    createdAt: row.created_at,
  };
}

/**
 * Input type for creating a meal component.
 * Only requires ingredient and preparation info - ID and timestamps are generated.
 */
export interface MealComponentInput {
  ingredientId: string;
  preparationMethodId: string | null;
}

/**
 * Retrieves all meal components for a specific meal log.
 * @param db - Database adapter instance
 * @param mealLogId - Meal log UUID
 * @returns Array of meal components for the meal log
 */
export async function getMealComponents(
  db: DatabaseAdapter,
  mealLogId: string
): Promise<MealComponent[]> {
  const rows = await db.getAllAsync<MealComponentRow>(
    `SELECT id, meal_log_id, ingredient_id, preparation_method_id, created_at
     FROM meal_components
     WHERE meal_log_id = ?
     ORDER BY created_at ASC`,
    [mealLogId]
  );
  return rows.map(rowToMealComponent);
}

/**
 * Creates meal components for a meal log.
 * @param db - Database adapter instance
 * @param mealLogId - Meal log UUID to attach components to
 * @param components - Array of component inputs (ingredient + preparation pairs)
 * @returns Array of created meal components
 */
export async function createMealComponents(
  db: DatabaseAdapter,
  mealLogId: string,
  components: MealComponentInput[]
): Promise<MealComponent[]> {
  const now = new Date().toISOString();
  const createdComponents: MealComponent[] = [];

  for (const comp of components) {
    const id = Crypto.randomUUID();

    await db.runAsync(
      `INSERT INTO meal_components (id, meal_log_id, ingredient_id, preparation_method_id, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [id, mealLogId, comp.ingredientId, comp.preparationMethodId, now]
    );

    createdComponents.push({
      id,
      mealLogId,
      ingredientId: comp.ingredientId,
      preparationMethodId: comp.preparationMethodId,
      createdAt: now,
    });
  }

  return createdComponents;
}

/**
 * Deletes all meal components for a specific meal log.
 * @param db - Database adapter instance
 * @param mealLogId - Meal log UUID
 */
export async function deleteMealComponents(
  db: DatabaseAdapter,
  mealLogId: string
): Promise<void> {
  await db.runAsync('DELETE FROM meal_components WHERE meal_log_id = ?', [mealLogId]);
}

/**
 * Logs a meal with components (ingredient + preparation method pairs).
 * This is the new way to log meals with preparation methods and optional names.
 * @param db - Database adapter instance
 * @param mealLog - Basic meal log info (date, mealType)
 * @param components - Array of component inputs
 * @param name - Optional meal name (e.g., "Mom's special")
 * @returns The created meal log with components attached
 */
export async function logMealWithComponents(
  db: DatabaseAdapter,
  mealLog: { date: string; mealType: string; isFavorite?: boolean },
  components: MealComponentInput[],
  name?: string
): Promise<MealLog & { components: MealComponent[] }> {
  const id = Crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const isFavorite = mealLog.isFavorite ?? false;

  // Extract ingredient IDs for backward compatibility with legacy ingredients column
  const ingredientIds = components.map(c => c.ingredientId);

  // Insert the meal log with optional name
  await db.runAsync(
    `INSERT INTO meal_logs (id, date, meal_type, ingredients, created_at, is_favorite, name)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, mealLog.date, mealLog.mealType, JSON.stringify(ingredientIds), createdAt, isFavorite ? 1 : 0, name ?? null]
  );

  // Create the meal components
  const createdComponents = await createMealComponents(db, id, components);

  return {
    id,
    date: mealLog.date,
    mealType: mealLog.mealType,
    name: name ?? null,
    ingredients: ingredientIds,
    createdAt,
    isFavorite,
    components: createdComponents,
  };
}

/**
 * Retrieves a meal log with its components attached.
 * @param db - Database adapter instance
 * @param mealLogId - Meal log UUID
 * @returns The meal log with components, or null if not found
 */
export async function getMealLogWithComponents(
  db: DatabaseAdapter,
  mealLogId: string
): Promise<(MealLog & { components: MealComponent[] }) | null> {
  const row = await db.getFirstAsync<{
    id: string;
    date: string;
    meal_type: string;
    ingredients: string;
    created_at: string;
    is_favorite: number;
    name: string | null;
  }>(
    `SELECT id, date, meal_type, ingredients, created_at, is_favorite, name
     FROM meal_logs
     WHERE id = ?`,
    [mealLogId]
  );

  if (!row) {
    return null;
  }

  const components = await getMealComponents(db, mealLogId);

  return {
    id: row.id,
    date: row.date,
    mealType: row.meal_type,
    name: row.name,
    ingredients: JSON.parse(row.ingredients),
    createdAt: row.created_at,
    isFavorite: row.is_favorite === 1,
    components,
  };
}

/**
 * Retrieves recent meal logs with their components.
 * This is the enhanced version of getRecentMealLogs that includes components.
 * @param db - Database adapter instance
 * @param days - Number of days to look back (default: 7)
 * @returns Array of meal logs with components, sorted by date descending
 */
export async function getRecentMealLogsWithComponents(
  db: DatabaseAdapter,
  days: number = 7
): Promise<(MealLog & { components: MealComponent[] })[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const rows = await db.getAllAsync<{
    id: string;
    date: string;
    meal_type: string;
    ingredients: string;
    created_at: string;
    is_favorite: number;
    name: string | null;
  }>(
    `SELECT id, date, meal_type, ingredients, created_at, is_favorite, name
     FROM meal_logs
     WHERE date >= ?
     ORDER BY date DESC`,
    [startDate.toISOString()]
  );

  // Fetch components for each meal log
  const mealLogsWithComponents = await Promise.all(
    rows.map(async (row) => {
      const components = await getMealComponents(db, row.id);
      return {
        id: row.id,
        date: row.date,
        mealType: row.meal_type,
        name: row.name,
        ingredients: JSON.parse(row.ingredients),
        createdAt: row.created_at,
        isFavorite: row.is_favorite === 1,
        components,
      };
    })
  );

  return mealLogsWithComponents;
}

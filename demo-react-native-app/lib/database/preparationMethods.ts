import * as Crypto from 'expo-crypto';
import type { DatabaseAdapter } from './adapters/types';
import type { PreparationMethod } from '../../types/database';

/**
 * Database row type for preparation_methods table.
 * Maps SQLite column names to TypeScript types.
 */
interface PreparationMethodRow {
  id: string;
  name: string;
  is_predefined: number; // SQLite stores boolean as 0/1
  created_at: string;
}

/**
 * Converts a database row to a PreparationMethod object.
 * @param row - Raw database row
 * @returns PreparationMethod with proper TypeScript types
 */
function rowToPreparationMethod(row: PreparationMethodRow): PreparationMethod {
  return {
    id: row.id,
    name: row.name,
    isPredefined: row.is_predefined === 1,
    createdAt: row.created_at,
  };
}

/**
 * Retrieves all preparation methods from the database.
 * @param db - Database adapter instance
 * @returns Array of all preparation methods, sorted by predefined first then by name
 */
export async function getAllPreparationMethods(db: DatabaseAdapter): Promise<PreparationMethod[]> {
  const rows = await db.getAllAsync<PreparationMethodRow>(
    `SELECT id, name, is_predefined, created_at
     FROM preparation_methods
     ORDER BY is_predefined DESC, name ASC`
  );
  return rows.map(rowToPreparationMethod);
}

/**
 * Retrieves a single preparation method by its ID.
 * @param db - Database adapter instance
 * @param id - Preparation method UUID
 * @returns The preparation method or null if not found
 */
export async function getPreparationMethodById(
  db: DatabaseAdapter,
  id: string
): Promise<PreparationMethod | null> {
  const row = await db.getFirstAsync<PreparationMethodRow>(
    'SELECT id, name, is_predefined, created_at FROM preparation_methods WHERE id = ?',
    [id]
  );
  return row ? rowToPreparationMethod(row) : null;
}

/**
 * Adds a custom (user-defined) preparation method to the database.
 * Predefined methods are only added via migrations.
 * @param db - Database adapter instance
 * @param name - Name of the preparation method
 * @returns The created preparation method
 * @throws Error if a method with the same name already exists
 */
export async function addPreparationMethod(
  db: DatabaseAdapter,
  name: string
): Promise<PreparationMethod> {
  const id = Crypto.randomUUID();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO preparation_methods (id, name, is_predefined, created_at) VALUES (?, ?, 0, ?)`,
    [id, name.trim(), now]
  );

  return {
    id,
    name: name.trim(),
    isPredefined: false,
    createdAt: now,
  };
}

/**
 * Deletes a custom (user-defined) preparation method from the database.
 * Predefined methods cannot be deleted.
 * @param db - Database adapter instance
 * @param id - Preparation method UUID
 * @returns Object indicating success or failure with error message
 */
export async function deletePreparationMethod(
  db: DatabaseAdapter,
  id: string
): Promise<{ success: boolean; error?: string }> {
  // First check if the method exists and is not predefined
  const method = await getPreparationMethodById(db, id);

  if (!method) {
    return {
      success: false,
      error: 'Preparation method not found',
    };
  }

  if (method.isPredefined) {
    return {
      success: false,
      error: 'Cannot delete predefined preparation methods',
    };
  }

  // Check if any meal components reference this preparation method
  const componentCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM meal_components WHERE preparation_method_id = ?',
    [id]
  );

  if (componentCount && componentCount.count > 0) {
    return {
      success: false,
      error: `Cannot delete preparation method: ${componentCount.count} meal component(s) use it`,
    };
  }

  await db.runAsync('DELETE FROM preparation_methods WHERE id = ?', [id]);

  return { success: true };
}

/**
 * Checks if a preparation method with the given name exists.
 * @param db - Database adapter instance
 * @param name - Name to check (case-insensitive)
 * @returns True if a method with this name exists
 */
export async function preparationMethodExists(
  db: DatabaseAdapter,
  name: string
): Promise<boolean> {
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM preparation_methods WHERE LOWER(name) = LOWER(?)',
    [name.trim()]
  );
  return result ? result.count > 0 : false;
}

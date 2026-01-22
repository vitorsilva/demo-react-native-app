import * as Crypto from 'expo-crypto';
import type { DatabaseAdapter } from './adapters/types';
import type { Category } from '../../types/database';

/**
 * Retrieves all categories from the database.
 * @param db - Database adapter instance
 * @returns Array of all categories, sorted by name
 */
export async function getAllCategories(db: DatabaseAdapter): Promise<Category[]> {
  return await db.getAllAsync<Category>(
    'SELECT id, name, created_at, updated_at FROM categories ORDER BY name'
  );
}

/**
 * Creates a new category in the database.
 * @param db - Database adapter instance
 * @param category - Category data (name)
 * @returns The created category with generated ID and timestamps
 */
export async function addCategory(
  db: DatabaseAdapter,
  category: Omit<Category, 'id' | 'created_at' | 'updated_at'>
 ): Promise<Category> {

    const id = Crypto.randomUUID();
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO categories (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)`,
      [id, category.name, now, now]
    );

  return {
    id,
     name: category.name,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Updates a category's name.
 * @param db - Database adapter instance
 * @param id - Category UUID
 * @param category - Partial category data with new name
 * @returns The updated category or null if not found
 */
export async function updateCategory(
  db: DatabaseAdapter,
  id: string,
  category: Partial<Pick<Category, 'name'>>
): Promise<Category | null> {
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE categories SET name = ?, updated_at = ? WHERE id = ?`,
    [category.name, now, id]
  );

  // Return updated category
  const updated = await db.getFirstAsync<Category>(
    'SELECT id, name, created_at, updated_at FROM categories WHERE id = ?',
    [id]
  );

  return updated || null;
  }

/**
 * Deletes a category from the database.
 * Fails if any ingredients are assigned to the category.
 * @param db - Database adapter instance
 * @param id - Category UUID
 * @returns Object indicating success or failure with error message
 */
export async function deleteCategory(
  db: DatabaseAdapter,
  id: string
): Promise<{ success: boolean; error?: string }> {
  // Check if any ingredients use this category
  const ingredientCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM ingredients WHERE category_id = ?',
    [id]
  );

  if (ingredientCount && ingredientCount.count > 0) {
    return {
      success: false,
      error: `Cannot delete category: ${ingredientCount.count} ingredient(s) are assigned to it`,
    };
  }

  await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);

  return { success: true };
}

/**
 * Retrieves a single category by its ID.
 * @param db - Database adapter instance
 * @param id - Category UUID
 * @returns The category or null if not found
 */
export async function getCategoryById(
  db: DatabaseAdapter,
  id: string
): Promise<Category | null> {
  const category = await db.getFirstAsync<Category>(
    'SELECT id, name, created_at, updated_at FROM categories WHERE id = ?',
    [id]
  );
  return category || null;
}
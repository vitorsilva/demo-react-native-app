import type { DatabaseAdapter } from './adapters/types';
import type { Category } from '../../types/database';
import { v4 as uuidv4 } from 'uuid';

// Get all categories
export async function getAllCategories(db: DatabaseAdapter): Promise<Category[]> {
  const rows = await db.getAllAsync<Category>(
    'SELECT id, name, created_at, updated_at FROM categories ORDER BY name'
  );
  return rows;
}

// Add a new category
export async function addCategory(
  db: DatabaseAdapter,
  category: Omit<Category, 'id' | 'created_at' | 'updated_at'>
 ): Promise<Category> {
  const id = uuidv4();
  const now = new Date().toISOString();

   // Debug logging
    console.log('Adding category with:', { id, name: category.name, now, idType: typeof id });

    await db.runAsync(
      `INSERT INTO categories (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)`,
      [String(id), String(category.name), String(now), String(now)]
    );

  return {
    id,
     name: category.name,
    created_at: now,
    updated_at: now,
  };
}

// Update a category
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

  // Delete a category (only if no ingredients are assigned)
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

// Get a single category by ID
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
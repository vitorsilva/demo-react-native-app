import type { DatabaseAdapter } from './adapters/types';
import { Ingredient } from '../../types/database';
import * as Crypto from 'expo-crypto';
import { canDeleteIngredient, canDisableIngredient } from './validation';

/**
 * Creates a new ingredient in the database.
 * @param db - Database adapter instance
 * @param ingredient - Ingredient data to create
 * @returns The created ingredient with generated ID and timestamps
 */
export async function addIngredient(
    db: DatabaseAdapter,
    ingredient: {
      name: string;
      category: string;
      mealTypes: string[];
      category_id?: string;
      is_active?: boolean;
      is_user_added?: boolean;
    }
  ): Promise<Ingredient> {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();

    // Apply defaults
    const is_active = ingredient.is_active ?? true;
    const is_user_added = ingredient.is_user_added ?? true;

    await db.runAsync(
      `INSERT INTO ingredients (id, name, category, meal_types, category_id,
       is_active, is_user_added, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        ingredient.name,
        ingredient.category,
        JSON.stringify(ingredient.mealTypes),
        ingredient.category_id ?? null,
        is_active ? 1 : 0,
        is_user_added ? 1 : 0,
        now,
        now,
      ]
    );

    return {
      id,
      name: ingredient.name,
      category: ingredient.category,
      mealTypes: ingredient.mealTypes,
      category_id: ingredient.category_id,
      is_active,
      is_user_added,
      createdAt: now,
      updated_at: now,
    };
  }

/**
 * Retrieves a single ingredient by its ID.
 * @param db - Database adapter instance
 * @param id - Ingredient UUID
 * @returns The ingredient or null if not found
 */
export async function getIngredientById(
    db: DatabaseAdapter,
    id: string
  ): Promise<Ingredient | null> {
    const row = await db.getFirstAsync<IngredientRow>(
      `SELECT id, name, category, meal_types, category_id, is_active,
       is_user_added, created_at, updated_at
       FROM ingredients WHERE id = ?`,
      [id]
    );

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      category: row.category,
      mealTypes: JSON.parse(row.meal_types),
      category_id: row.category_id ?? undefined,
      is_active: row.is_active === 1,
      is_user_added: row.is_user_added === 1,
      createdAt: row.created_at,
      updated_at: row.updated_at ?? undefined,
    };
  }

/**
 * Updates an ingredient's properties. Only provided fields are updated.
 * @param db - Database adapter instance
 * @param id - Ingredient UUID
 * @param updates - Partial ingredient data to update
 * @returns The updated ingredient or null if not found
 */
export async function updateIngredient(
    db: DatabaseAdapter,
    id: string,
    updates: Partial<Pick<Ingredient, 'name' | 'category' | 'mealTypes' | 'category_id' | 'is_active'>>
  ): Promise<Ingredient | null> {
    const now = new Date().toISOString();

    const setClauses: string[] = ['updated_at = ?'];
    const values: unknown[] = [now];

    if (updates.name !== undefined) {
      setClauses.push('name = ?');
      values.push(updates.name);
    }
    if (updates.category !== undefined) {
      setClauses.push('category = ?');
      values.push(updates.category);
    }
    if (updates.mealTypes !== undefined) {
      setClauses.push('meal_types = ?');
      values.push(JSON.stringify(updates.mealTypes));
    }
    if (updates.category_id !== undefined) {
      setClauses.push('category_id = ?');
      values.push(updates.category_id);
    }
    if (updates.is_active !== undefined) {
      setClauses.push('is_active = ?');
      values.push(updates.is_active ? 1 : 0);
    }

    values.push(id);

    await db.runAsync(
      `UPDATE ingredients SET ${setClauses.join(', ')} WHERE id = ?`,
      values
    );

    return getIngredientById(db, id);
  }

/**
 * Toggles an ingredient's active status.
 * Prevents disabling if it's the last active ingredient for any meal type.
 * @param db - Database adapter instance
 * @param id - Ingredient UUID
 * @returns Object with the updated ingredient or an error message
 */
export async function toggleIngredientActive(
    db: DatabaseAdapter,
    id: string
  ): Promise<{ ingredient: Ingredient | null; error?: string }> {
    const ingredient = await getIngredientById(db, id);
    if (!ingredient) return { ingredient: null, error: 'Ingredient not found' };

    // If trying to disable, check if it's the last active ingredient
    if (ingredient.is_active) {
      const canDisable = await canDisableIngredient(db, id);
      if (!canDisable.isValid) {
        return { ingredient: null, error: canDisable.error };
      }
    }

    const updated = await updateIngredient(db, id, { is_active: !ingredient.is_active });
    return { ingredient: updated };
  }

/**
 * Retrieves all ingredients belonging to a specific category.
 * @param db - Database adapter instance
 * @param categoryId - Category UUID
 * @returns Array of ingredients in the category, sorted by name
 */
export async function getIngredientsByCategory(
    db: DatabaseAdapter,
    categoryId: string
  ): Promise<Ingredient[]> {
    const rows = await db.getAllAsync<IngredientRow>(
      `SELECT id, name, category, meal_types, category_id, is_active,
       is_user_added, created_at, updated_at
       FROM ingredients WHERE category_id = ? ORDER BY name ASC`,
      [categoryId]
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      mealTypes: JSON.parse(row.meal_types),
      category_id: row.category_id ?? undefined,
      is_active: row.is_active === 1,
      is_user_added: row.is_user_added === 1,
      createdAt: row.created_at,
      updated_at: row.updated_at ?? undefined,
    }));
  }

/** Raw row type from SQLite (booleans stored as 0/1) */
type IngredientRow = {
    id: string;
    name: string;
    category: string;
    meal_types: string;
    category_id: string | null;
    is_active: number;
    is_user_added: number;
    created_at: string;
    updated_at: string | null;
  };

/**
 * Retrieves all ingredients from the database.
 * @param db - Database adapter instance
 * @returns Array of all ingredients, sorted by name
 */
export async function getAllIngredients(db: DatabaseAdapter): Promise<Ingredient[]> {
    const rows = await db.getAllAsync<IngredientRow>(
      `SELECT id, name, category, meal_types, category_id, is_active,
       is_user_added, created_at, updated_at
       FROM ingredients ORDER BY name ASC`
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      mealTypes: JSON.parse(row.meal_types),
      category_id: row.category_id ?? undefined,
      is_active: row.is_active === 1,
      is_user_added: row.is_user_added === 1,
      createdAt: row.created_at,
      updated_at: row.updated_at ?? undefined,
    }));
  }

/**
 * Retrieves ingredients that are assigned to a specific meal type.
 * @param db - Database adapter instance
 * @param mealType - Meal type name (e.g., "Breakfast")
 * @returns Array of ingredients for that meal type
 */
export async function getIngredientsByMealType(
    db: DatabaseAdapter,
    mealType: string
  ): Promise<Ingredient[]> {
    const allIngredients = await getAllIngredients(db);
    return allIngredients.filter((ing) => ing.mealTypes.includes(mealType));
  }

/**
 * Retrieves only active ingredients for a specific meal type.
 * Used by the combination generator for meal suggestions.
 * @param db - Database adapter instance
 * @param mealType - Meal type name (e.g., "Breakfast")
 * @returns Array of active ingredients for that meal type
 */
export async function getActiveIngredientsByMealType(
    db: DatabaseAdapter,
    mealType: string
  ): Promise<Ingredient[]> {
    const allIngredients = await getAllIngredients(db);
    return allIngredients.filter(
      (ing) => ing.is_active && ing.mealTypes.includes(mealType)
    );
  }

/**
 * Deletes an ingredient from the database.
 * Prevents deletion if it's the last active ingredient for any meal type.
 * @param db - Database adapter instance
 * @param id - Ingredient UUID
 * @returns Object indicating success or failure with error message
 */
export async function deleteIngredient(
  db: DatabaseAdapter,
  id: string
): Promise<{ success: boolean; error?: string }> {
  // Check if ingredient can be safely deleted
  const canDelete = await canDeleteIngredient(db, id);
  if (!canDelete.isValid) {
    return { success: false, error: canDelete.error };
  }

  await db.runAsync('DELETE FROM ingredients WHERE id = ?', [id]);
  return { success: true };
}

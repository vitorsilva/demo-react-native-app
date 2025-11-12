import { getDatabase } from './index';
import { Ingredient } from '../../types/database';
import * as Crypto from 'expo-crypto';

export async function addIngredient(
  ingredient: Omit<Ingredient, 'id' | 'createdAt'>
): Promise<Ingredient> {
  const db = getDatabase();
  const id = await Crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO ingredients (id, name, category, meal_types, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    [id, ingredient.name, ingredient.category, JSON.stringify(ingredient.mealTypes), createdAt]
  );

  return {
    id,
    name: ingredient.name,
    category: ingredient.category,
    mealTypes: ingredient.mealTypes,
    createdAt,
  };
}

export async function getAllIngredients(): Promise<Ingredient[]> {
  const db = getDatabase();

  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    category: string;
    meal_types: string;
    created_at: string;
  }>('SELECT id, name, category, meal_types, created_at FROM ingredients ORDER BY name ASC');

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category as Ingredient['category'],
    mealTypes: JSON.parse(row.meal_types),
    createdAt: row.created_at,
  }));
}

export async function getIngredientsByMealType(
  mealType: 'breakfast' | 'snack'
): Promise<Ingredient[]> {
  const allIngredients = await getAllIngredients();
  return allIngredients.filter((ing) => ing.mealTypes.includes(mealType));
}

export async function deleteIngredient(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM ingredients WHERE id = ?', [id]);
}

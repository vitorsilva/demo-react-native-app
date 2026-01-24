import * as Crypto from 'expo-crypto';
import { MealLog } from '../../types/database';
import type { DatabaseAdapter } from './adapters/types';

/**
 * Records a new meal log entry in the database.
 * @param db - Database adapter instance
 * @param mealLog - Meal log data (date, mealType, ingredients)
 * @returns The created meal log with generated ID and timestamp
 */
export async function logMeal(
  db: DatabaseAdapter,
  mealLog: Omit<MealLog, 'id' | 'createdAt' | 'isFavorite'> & { isFavorite?: boolean }
): Promise<MealLog> {
  const id = Crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const isFavorite = mealLog.isFavorite ?? false;

  await db.runAsync(
    `INSERT INTO meal_logs (id, date, meal_type, ingredients, created_at, is_favorite)
       VALUES (?, ?, ?, ?, ?, ?)`,
    [id, mealLog.date, mealLog.mealType, JSON.stringify(mealLog.ingredients), createdAt, isFavorite ? 1 : 0]
  );

  return {
    id,
    date: mealLog.date,
    mealType: mealLog.mealType,
    ingredients: mealLog.ingredients,
    createdAt,
    isFavorite,
  };
}

/**
 * Retrieves meal logs from the last N days.
 * Used by the variety engine to determine recently used ingredients.
 * @param db - Database adapter instance
 * @param days - Number of days to look back (default: 7)
 * @returns Array of meal logs, sorted by date descending
 */
export async function getRecentMealLogs(db: DatabaseAdapter, days: number = 7): Promise<MealLog[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const rows = await db.getAllAsync<{
    id: string;
    date: string;
    meal_type: string;
    ingredients: string;
    created_at: string;
    is_favorite: number;
  }>(
    `SELECT id, date, meal_type, ingredients, created_at, is_favorite
       FROM meal_logs
       WHERE date >= ?
       ORDER BY date DESC`,
    [startDate.toISOString()]
  );

  return rows.map((row) => ({
    id: row.id,
    date: row.date,
    mealType: row.meal_type as MealLog['mealType'],
    ingredients: JSON.parse(row.ingredients),
    createdAt: row.created_at,
    isFavorite: row.is_favorite === 1,
  }));
}

/**
 * Retrieves meal logs within a specific date range.
 * @param db - Database adapter instance
 * @param startDate - Start date (ISO string)
 * @param endDate - End date (ISO string)
 * @returns Array of meal logs, sorted by date descending
 * @throws Error if startDate is after endDate
 */
export async function getMealLogsByDateRange(
  db: DatabaseAdapter,
  startDate: string,
  endDate: string
): Promise<MealLog[]> {
  if (startDate > endDate) {
    throw new Error('Start date must be before or equal to end date');
  }

  const rows = await db.getAllAsync<{
    id: string;
    date: string;
    meal_type: string;
    ingredients: string;
    created_at: string;
    is_favorite: number;
  }>(
    `SELECT id, date, meal_type, ingredients, created_at, is_favorite
       FROM meal_logs
       WHERE date >= ? AND date <= ?
       ORDER BY date DESC`,
    [startDate, endDate]
  );

  return rows.map((row) => ({
    id: row.id,
    date: row.date,
    mealType: row.meal_type as MealLog['mealType'],
    ingredients: JSON.parse(row.ingredients),
    createdAt: row.created_at,
    isFavorite: row.is_favorite === 1,
  }));
}

/**
 * Deletes a meal log entry from the database.
 * @param db - Database adapter instance
 * @param id - Meal log UUID
 */
export async function deleteMealLog(db: DatabaseAdapter, id: string): Promise<void> {
  await db.runAsync('DELETE FROM meal_logs WHERE id = ?', [id]);
}

/**
 * Toggles the favorite status of a meal log.
 * @param db - Database adapter instance
 * @param id - Meal log UUID
 * @returns The updated meal log
 * @throws Error if meal log is not found
 */
export async function toggleMealLogFavorite(db: DatabaseAdapter, id: string): Promise<MealLog> {
  // First, get the current meal log
  const row = await db.getFirstAsync<{
    id: string;
    date: string;
    meal_type: string;
    ingredients: string;
    created_at: string;
    is_favorite: number;
  }>(
    `SELECT id, date, meal_type, ingredients, created_at, is_favorite
       FROM meal_logs
       WHERE id = ?`,
    [id]
  );

  if (!row) {
    throw new Error(`Meal log with id ${id} not found`);
  }

  // Toggle the favorite status
  const newFavoriteStatus = row.is_favorite === 1 ? 0 : 1;

  await db.runAsync(
    `UPDATE meal_logs SET is_favorite = ? WHERE id = ?`,
    [newFavoriteStatus, id]
  );

  return {
    id: row.id,
    date: row.date,
    mealType: row.meal_type as MealLog['mealType'],
    ingredients: JSON.parse(row.ingredients),
    createdAt: row.created_at,
    isFavorite: newFavoriteStatus === 1,
  };
}

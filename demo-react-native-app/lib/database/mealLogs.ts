import { getDatabase } from './index';
import { MealLog } from '../../types/database';
import * as Crypto from 'expo-crypto';

export async function logMeal(mealLog: Omit<MealLog, 'id' | 'createdAt'>): Promise<string> {
  const db = getDatabase();
  const id = Crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO meal_logs (id, date, meal_type, ingredients, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    [id, mealLog.date, mealLog.mealType, JSON.stringify(mealLog.ingredients), createdAt]
  );

  return id;
}

export async function getRecentMealLogs(days: number = 7): Promise<MealLog[]> {
  const db = getDatabase();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const rows = await db.getAllAsync<{
    id: string;
    date: string;
    meal_type: string;
    ingredients: string;
    created_at: string;
  }>(
    `SELECT id, date, meal_type, ingredients, created_at
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
  }));
}

export async function getMealLogsByDateRange(
  startDate: string,
  endDate: string
): Promise<MealLog[]> {
  const db = getDatabase();

  if (startDate > endDate) {
    throw new Error('Start date must be before or equal to end date');
  }

  const rows = await db.getAllAsync<{
    id: string;
    date: string;
    meal_type: string;
    ingredients: string;
    created_at: string;
  }>(
    `SELECT id, date, meal_type, ingredients, created_at
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
  }));
}

export async function deleteMealLog(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM meal_logs WHERE id = ?', [id]);
}

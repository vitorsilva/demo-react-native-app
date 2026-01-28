/**
 * Reset Data Function
 *
 * Clears all user data and repopulates with seed data.
 * Used for "Reset to Defaults" functionality in Settings.
 *
 * Phase 3.2: Seed Data & App Reset
 */

import * as Crypto from 'expo-crypto';
import type { DatabaseAdapter } from './adapters/types';
import { SEED_CATEGORIES, SEED_INGREDIENTS, SEED_PAIRING_RULES } from './seedData';

// Silent logging during tests
const isTestEnv = process.env.NODE_ENV === 'test';
const log = (message: string) => {
  if (!isTestEnv) console.log(message);
};

/**
 * Reset all app data to defaults
 *
 * This function:
 * 1. Clears all user data (meal logs, components, ingredients, categories, pairing rules)
 * 2. Preserves meal_types and preparation_methods tables (these are configuration)
 * 3. Re-seeds categories from seed data
 * 4. Re-seeds ingredients with category associations
 * 5. Re-seeds pairing rules
 *
 * @param db - Database adapter instance
 * @throws Error if database operations fail
 */
export async function resetToDefaults(db: DatabaseAdapter): Promise<void> {
  log('🔄 Starting app data reset...');

  // 1. Clear all user data (order matters for foreign keys)
  log('  🗑️ Clearing meal components...');
  await db.runAsync('DELETE FROM meal_components');

  log('  🗑️ Clearing meal logs...');
  await db.runAsync('DELETE FROM meal_logs');

  log('  🗑️ Clearing pairing rules...');
  await db.runAsync('DELETE FROM pairing_rules');

  log('  🗑️ Clearing ingredients...');
  await db.runAsync('DELETE FROM ingredients');

  log('  🗑️ Clearing categories...');
  await db.runAsync('DELETE FROM categories');

  // 2. Re-seed categories
  log('  📁 Seeding categories...');
  const now = new Date().toISOString();

  for (const category of SEED_CATEGORIES) {
    await db.runAsync(
      `INSERT INTO categories (id, name, created_at, updated_at)
       VALUES (?, ?, ?, ?)`,
      [category.id, category.name, now, now]
    );
  }
  log(`    ✅ Added ${SEED_CATEGORIES.length} categories`);

  // 3. Re-seed ingredients with category associations
  log('  🥗 Seeding ingredients...');
  for (const ingredient of SEED_INGREDIENTS) {
    await db.runAsync(
      `INSERT INTO ingredients (id, name, category, meal_types, category_id, is_active, is_user_added, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, 0, ?, ?)`,
      [
        ingredient.id,
        ingredient.name,
        'default', // Legacy category field (kept for compatibility)
        JSON.stringify(ingredient.mealTypes),
        ingredient.categoryId,
        now,
        now,
      ]
    );
  }
  log(`    ✅ Added ${SEED_INGREDIENTS.length} ingredients`);

  // 4. Re-seed pairing rules
  log('  🔗 Seeding pairing rules...');
  for (const rule of SEED_PAIRING_RULES) {
    await db.runAsync(
      `INSERT INTO pairing_rules (id, ingredient_a_id, ingredient_b_id, rule_type, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [Crypto.randomUUID(), rule.ingredientAId, rule.ingredientBId, rule.ruleType, now]
    );
  }
  log(`    ✅ Added ${SEED_PAIRING_RULES.length} pairing rules`);

  log('✅ App data reset complete!');
}

/**
 * Clear only meal history (logs and components)
 * Useful for a "soft reset" that keeps ingredients and categories
 *
 * @param db - Database adapter instance
 */
export async function clearMealHistory(db: DatabaseAdapter): Promise<void> {
  log('🔄 Clearing meal history...');

  await db.runAsync('DELETE FROM meal_components');
  await db.runAsync('DELETE FROM meal_logs');

  log('✅ Meal history cleared!');
}

/**
 * Check if the database has any user data
 * Useful for determining if seed data migration needs to run
 *
 * @param db - Database adapter instance
 * @returns True if user has created any data
 */
export async function hasUserData(db: DatabaseAdapter): Promise<boolean> {
  const mealLogs = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM meal_logs'
  );

  const userIngredients = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM ingredients WHERE is_user_added = 1'
  );

  return (mealLogs?.count ?? 0) > 0 || (userIngredients?.count ?? 0) > 0;
}

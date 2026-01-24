/**
 * Variety utility functions for meal suggestion variety features.
 * Shared by Feature 1.2 (New! Badge) and Feature 1.3 (Variety Color Coding).
 */

import { getDaysAgo } from './dateUtils';
import type { MealLog } from '../../types/database';

/** Number of days after which a combination is considered "new" again */
export const NEW_COMBINATION_THRESHOLD_DAYS = 7;

/**
 * Checks if a combination of ingredients is considered "new" to the user.
 * A combination is "new" if:
 * - It has never been logged, OR
 * - It hasn't been logged in 7+ days
 *
 * @param ingredientIds - Array of ingredient IDs in the combination
 * @param history - Array of meal logs to check against
 * @returns true if the combination is new (never tried or 7+ days since last logged)
 */
export function isNewCombination(ingredientIds: string[], history: MealLog[]): boolean {
  // Sort ingredient IDs for consistent comparison
  const comboKey = [...ingredientIds].sort().join(',');

  // Find the most recent log with this exact combination
  let lastLoggedDaysAgo: number | null = null;

  for (const log of history) {
    const logComboKey = [...log.ingredients].sort().join(',');

    if (logComboKey === comboKey) {
      const daysAgo = getDaysAgo(log.date);

      // Track the most recent (smallest days ago value)
      if (lastLoggedDaysAgo === null || daysAgo < lastLoggedDaysAgo) {
        lastLoggedDaysAgo = daysAgo;
      }
    }
  }

  // Never logged = new
  if (lastLoggedDaysAgo === null) {
    return true;
  }

  // 7+ days ago = new
  return lastLoggedDaysAgo >= NEW_COMBINATION_THRESHOLD_DAYS;
}

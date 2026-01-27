/**
 * Variety utility functions for meal suggestion variety features.
 * Shared by Feature 1.2 (New! Badge), Feature 1.3 (Variety Color Coding),
 * and Feature 1.4 (Variety Stats).
 */

import { getDaysAgo, isThisMonth, isThisWeek } from './dateUtils';
import type { Ingredient, MealLog, PairingRule } from '../../types/database';

/** Number of days after which a combination is considered "new" again */
export const NEW_COMBINATION_THRESHOLD_DAYS = 7;

/**
 * Counts how many times a specific ingredient has been used in recent meals.
 * Used for ingredient-level variety tracking to penalize frequently-used ingredients.
 *
 * @param ingredientId - The ingredient ID to count
 * @param history - Array of meal logs to search
 * @param days - Number of days to look back (e.g., 7 for weekly frequency)
 * @returns Number of times the ingredient was used in the specified period
 */
export function getIngredientFrequency(
  ingredientId: string,
  history: MealLog[],
  days: number
): number {
  // Filter meals from the last N days
  const recentMeals = history.filter((log) => getDaysAgo(log.date) < days);

  // Count how many meals contain this ingredient
  let count = 0;
  for (const meal of recentMeals) {
    if (meal.ingredients.includes(ingredientId)) {
      count++;
    }
  }

  return count;
}

/** Penalty thresholds for ingredient frequency scoring */
export const FREQUENCY_PENALTY = {
  /** Penalty when ingredient used 3+ times in the cooldown period */
  HIGH: 30,
  /** Penalty when ingredient used exactly 2 times */
  MEDIUM: 15,
  /** Penalty when ingredient used exactly 1 time */
  LOW: 5,
} as const;

/** Score adjustments for pairing rules */
export const PAIRING_RULE_SCORE = {
  /** Bonus score for a positive pairing (pairs well together) */
  POSITIVE_BONUS: 10,
  /** Score returned for invalid combinations (negative pairing) */
  NEGATIVE_PENALTY: -100,
} as const;

/** Result of applying pairing rules to a candidate combination */
export interface PairingRuleResult {
  /** Whether the combination is valid (no negative rules triggered) */
  isValid: boolean;
  /** Score adjustment from pairing rules (+10 per positive pair, -100 if invalid) */
  score: number;
}

/**
 * Applies pairing rules to a candidate ingredient combination.
 * Checks all ingredient pairs against the pairing rules:
 * - Negative rules: Combination is invalid (isValid=false, score=-100)
 * - Positive rules: Adds bonus to score (+10 per positive pair)
 *
 * @param candidateIngredients - Array of ingredient IDs in the candidate combination
 * @param pairingRules - Array of pairing rules to check against
 * @returns Object with isValid (boolean) and score (number)
 */
export function applyPairingRules(
  candidateIngredients: string[],
  pairingRules: PairingRule[]
): PairingRuleResult {
  let score = 0;

  // Check all pairs in the candidate
  for (let i = 0; i < candidateIngredients.length; i++) {
    for (let j = i + 1; j < candidateIngredients.length; j++) {
      const a = candidateIngredients[i];
      const b = candidateIngredients[j];

      // Find if there's a rule for this pair (check both directions)
      const rule = pairingRules.find(
        (r) =>
          (r.ingredientAId === a && r.ingredientBId === b) ||
          (r.ingredientAId === b && r.ingredientBId === a)
      );

      if (rule) {
        if (rule.ruleType === 'negative') {
          // Negative pairing found - combination is invalid
          return { isValid: false, score: PAIRING_RULE_SCORE.NEGATIVE_PENALTY };
        }
        if (rule.ruleType === 'positive') {
          // Positive pairing found - add bonus
          score += PAIRING_RULE_SCORE.POSITIVE_BONUS;
        }
      }
    }
  }

  return { isValid: true, score };
}

/**
 * Calculates a variety score for a candidate combination based on ingredient frequency.
 * Higher scores indicate better variety (less frequently used ingredients).
 *
 * Score starts at 100 and is reduced based on how often each ingredient
 * has been used in recent meals:
 * - Used 3+ times: -30 points per ingredient
 * - Used 2 times: -15 points per ingredient
 * - Used 1 time: -5 points per ingredient
 * - Never used: no penalty (encourages rotation)
 *
 * @param candidateIngredients - Array of ingredient IDs in the candidate combination
 * @param recentMeals - Array of recent meal logs to check frequency against
 * @param cooldownDays - Number of days to look back for frequency calculation
 * @returns Score from 0 to 100 (higher = better variety)
 */
export function calculateVarietyScore(
  candidateIngredients: string[],
  recentMeals: MealLog[],
  cooldownDays: number
): number {
  let score = 100;

  for (const ingredientId of candidateIngredients) {
    // Get how many times this ingredient was used in the cooldown period
    const frequency = getIngredientFrequency(ingredientId, recentMeals, cooldownDays);

    // Apply penalties based on frequency
    if (frequency >= 3) {
      score -= FREQUENCY_PENALTY.HIGH; // Used 3+ times
    } else if (frequency === 2) {
      score -= FREQUENCY_PENALTY.MEDIUM; // Used twice
    } else if (frequency === 1) {
      score -= FREQUENCY_PENALTY.LOW; // Used once
    }
    // frequency === 0 → no penalty (ingredient rotation!)
  }

  // Ensure score doesn't go below 0
  return Math.max(0, score);
}

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

/** Variety color type for color-coded indicators */
export type VarietyColor = 'green' | 'yellow' | 'red';

/** Number of days threshold for "fresh" (green) indicator */
export const FRESH_THRESHOLD_DAYS = 3;

/**
 * Gets the variety color indicator for a combination of ingredients.
 * Color indicates how recently this combination was logged:
 * - 'green': Fresh choice (3+ days ago or never logged)
 * - 'yellow': Recent (1-2 days ago)
 * - 'red': Very recent (today)
 *
 * @param ingredientIds - Array of ingredient IDs in the combination
 * @param history - Array of meal logs to check against
 * @returns 'green' | 'yellow' | 'red' based on recency
 */
export function getVarietyColor(ingredientIds: string[], history: MealLog[]): VarietyColor {
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

  // Never logged = fresh (green)
  if (lastLoggedDaysAgo === null) {
    return 'green';
  }

  // 3+ days ago = fresh (green)
  if (lastLoggedDaysAgo >= FRESH_THRESHOLD_DAYS) {
    return 'green';
  }

  // 1-2 days ago = recent (yellow)
  if (lastLoggedDaysAgo >= 1) {
    return 'yellow';
  }

  // Today (0 days) = very recent (red)
  return 'red';
}

/** Variety statistics for a user's meal history */
export interface VarietyStats {
  /** Number of unique ingredient combinations logged this month */
  uniqueCombosThisMonth: number;
  /** The most frequently logged combination with its count */
  mostCommonCombo: { ingredients: string[]; count: number } | null;
  /** Number of distinct ingredients used this week */
  ingredientsUsedThisWeek: number;
  /** Total number of available (active) ingredients */
  totalIngredients: number;
  /** Variety score percentage (0-100) */
  varietyScore: number;
}

/**
 * Calculates variety statistics from the user's meal history.
 *
 * Stats include:
 * - Unique combinations this month
 * - Most common combination (with count)
 * - Ingredients used this week vs total available
 * - Variety score percentage
 *
 * Variety score formula:
 * (unique combos / total logs this month) * (ingredients used this week / total ingredients) * 100
 *
 * @param history - Array of meal logs
 * @param ingredients - Array of available ingredients
 * @returns VarietyStats object with calculated metrics
 */
export function calculateVarietyStats(
  history: MealLog[],
  ingredients: Ingredient[]
): VarietyStats {
  // Count active ingredients
  const activeIngredients = ingredients.filter((ing) => ing.is_active);
  const totalIngredients = activeIngredients.length;

  // Filter logs to this month
  const thisMonthLogs = history.filter((log) => isThisMonth(log.date));

  // Count unique combinations this month
  const uniqueCombos = new Set(
    thisMonthLogs.map((log) => [...log.ingredients].sort().join(','))
  );
  const uniqueCombosThisMonth = uniqueCombos.size;

  // Find most common combination (across all history, not just this month)
  const comboCounts = new Map<string, { ingredients: string[]; count: number }>();

  for (const log of history) {
    const key = [...log.ingredients].sort().join(',');
    const existing = comboCounts.get(key);

    if (existing) {
      existing.count++;
    } else {
      comboCounts.set(key, { ingredients: log.ingredients, count: 1 });
    }
  }

  let mostCommonCombo: { ingredients: string[]; count: number } | null = null;
  let maxCount = 0;

  for (const combo of comboCounts.values()) {
    if (combo.count > maxCount) {
      maxCount = combo.count;
      mostCommonCombo = combo;
    }
  }

  // Count ingredients used this week
  const thisWeekLogs = history.filter((log) => isThisWeek(log.date));
  const ingredientsUsedThisWeekSet = new Set<string>();

  for (const log of thisWeekLogs) {
    for (const ingredientId of log.ingredients) {
      ingredientsUsedThisWeekSet.add(ingredientId);
    }
  }
  const ingredientsUsedThisWeek = ingredientsUsedThisWeekSet.size;

  // Calculate variety score
  // Formula: (unique combos / total logs this month) * (ingredients used this week / total ingredients) * 100
  let varietyScore = 0;

  if (thisMonthLogs.length > 0 && totalIngredients > 0) {
    const comboRatio = uniqueCombosThisMonth / thisMonthLogs.length;
    const ingredientRatio = ingredientsUsedThisWeek / totalIngredients;
    varietyScore = Math.round(comboRatio * ingredientRatio * 100);
  }

  return {
    uniqueCombosThisMonth,
    mostCommonCombo,
    ingredientsUsedThisWeek,
    totalIngredients,
    varietyScore,
  };
}

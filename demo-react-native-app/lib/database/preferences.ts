import type { DatabaseAdapter } from './adapters/types';

export interface UserPreferences {
  cooldownDays: number;
  suggestionsCount: number;
  hapticEnabled: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  cooldownDays: 3,
  suggestionsCount: 4,
  hapticEnabled: true,
};

/**
 * Get a single preference value from key-value table
 */
async function getPreferenceValue(db: DatabaseAdapter, key: string): Promise<string | null> {
  const result = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM preferences WHERE key = ?',
    [key]
  );
  return result?.value ?? null;
}

/**
 * Set a single preference value in key-value table
 */
async function setPreferenceValue(db: DatabaseAdapter, key: string, value: string): Promise<void> {
  await db.runAsync('INSERT OR REPLACE INTO preferences (key, value) VALUES (?, ?)', [key, value]);
}

/**
 * Get all user preferences from database
 * Returns default values if not found
 */
export async function getPreferences(db: DatabaseAdapter): Promise<UserPreferences> {
  const cooldownDaysStr = await getPreferenceValue(db, 'cooldownDays');
  const suggestionsCountStr = await getPreferenceValue(db, 'suggestionsCount');
  const hapticEnabledStr = await getPreferenceValue(db, 'hapticEnabled');

  return {
    cooldownDays: cooldownDaysStr
      ? parseInt(cooldownDaysStr, 10)
      : DEFAULT_PREFERENCES.cooldownDays,
    suggestionsCount: suggestionsCountStr
      ? parseInt(suggestionsCountStr, 10)
      : DEFAULT_PREFERENCES.suggestionsCount,
    hapticEnabled: hapticEnabledStr !== null
      ? hapticEnabledStr === 'true'
      : DEFAULT_PREFERENCES.hapticEnabled,
  };
}

/**
 * Update user preferences in database
 */
export async function setPreferences(
  db: DatabaseAdapter,
  preferences: UserPreferences
): Promise<void> {
  await setPreferenceValue(db, 'cooldownDays', preferences.cooldownDays.toString());
  await setPreferenceValue(db, 'suggestionsCount', preferences.suggestionsCount.toString());
  await setPreferenceValue(db, 'hapticEnabled', preferences.hapticEnabled.toString());
}

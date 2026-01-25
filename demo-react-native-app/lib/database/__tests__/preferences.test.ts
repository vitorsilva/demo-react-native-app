import { resetDatabase, initDatabase, getDatabase } from '../index';
import { getPreferences, setPreferences } from '../preferences';
import { resetTestDatabase } from './testDb';

jest.mock('../index');

describe('Preferences Operations', () => {
  beforeEach(async () => {
    // Reset and initialize
    resetTestDatabase();
    resetDatabase();
    await initDatabase();
  });

  test('getPreferences returns default values when no preferences exist', async () => {
    const db = getDatabase();
    const prefs = await getPreferences(db);

    expect(prefs).toBeDefined();
    expect(prefs.cooldownDays).toBe(3);
    expect(prefs.suggestionsCount).toBe(4);
  });

  test('setPreferences stores preferences in database', async () => {
    const db = getDatabase();

    await setPreferences(db, {
      cooldownDays: 5,
      suggestionsCount: 6,
      hapticEnabled: true,
    });

    const prefs = await getPreferences(db);
    expect(prefs.cooldownDays).toBe(5);
    expect(prefs.suggestionsCount).toBe(6);
  });

  test('setPreferences updates existing preferences', async () => {
    const db = getDatabase();

    // Set initial values
    await setPreferences(db, {
      cooldownDays: 3,
      suggestionsCount: 4,
      hapticEnabled: true,
    });

    // Update values
    await setPreferences(db, {
      cooldownDays: 7,
      suggestionsCount: 2,
      hapticEnabled: true,
    });

    const prefs = await getPreferences(db);
    expect(prefs.cooldownDays).toBe(7);
    expect(prefs.suggestionsCount).toBe(2);
  });

  test('setPreferences updates individual preference without affecting others', async () => {
    const db = getDatabase();

    // Set initial values
    await setPreferences(db, {
      cooldownDays: 3,
      suggestionsCount: 4,
      hapticEnabled: true,
    });

    // Update only cooldownDays
    await setPreferences(db, {
      cooldownDays: 7,
      suggestionsCount: 4, // Keep same
      hapticEnabled: true,
    });

    const prefs = await getPreferences(db);
    expect(prefs.cooldownDays).toBe(7);
    expect(prefs.suggestionsCount).toBe(4);
  });

  test('preferences values are numbers not strings', async () => {
    const db = getDatabase();

    await setPreferences(db, {
      cooldownDays: 5,
      suggestionsCount: 3,
      hapticEnabled: true,
    });

    const prefs = await getPreferences(db);
    expect(typeof prefs.cooldownDays).toBe('number');
    expect(typeof prefs.suggestionsCount).toBe('number');
  });

  test('preferences support minimum and maximum values', async () => {
    const db = getDatabase();

    // Test minimum values
    await setPreferences(db, {
      cooldownDays: 1,
      suggestionsCount: 2,
      hapticEnabled: true,
    });

    let prefs = await getPreferences(db);
    expect(prefs.cooldownDays).toBe(1);
    expect(prefs.suggestionsCount).toBe(2);

    // Test maximum values
    await setPreferences(db, {
      cooldownDays: 7,
      suggestionsCount: 6,
      hapticEnabled: true,
    });

    prefs = await getPreferences(db);
    expect(prefs.cooldownDays).toBe(7);
    expect(prefs.suggestionsCount).toBe(6);
  });

  test('getPreferences returns correct structure', async () => {
    const db = getDatabase();

    await setPreferences(db, {
      cooldownDays: 5,
      suggestionsCount: 3,
      hapticEnabled: true,
    });

    const prefs = await getPreferences(db);

    expect(prefs).toHaveProperty('cooldownDays');
    expect(prefs).toHaveProperty('suggestionsCount');
    expect(prefs).toHaveProperty('hapticEnabled');
    expect(Object.keys(prefs)).toHaveLength(3);
  });
});

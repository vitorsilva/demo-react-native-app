/**
 * Unit tests for i18n module
 */

import i18n from 'i18next';

// Import all translation resources for completeness testing
import {
  initI18n,
  changeLanguage,
  getCurrentLanguage,
  isI18nReady,
  onLanguageChange,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
} from '../index';
import { normalizeLanguageCode } from '../languageDetector';
import enCategories from '../locales/en/categories.json';
import enCommon from '../locales/en/common.json';
import enErrors from '../locales/en/errors.json';
import enHistory from '../locales/en/history.json';
import enHome from '../locales/en/home.json';
import enIngredients from '../locales/en/ingredients.json';
import enSettings from '../locales/en/settings.json';
import enSuggestions from '../locales/en/suggestions.json';
import enTabs from '../locales/en/tabs.json';
import ptCategories from '../locales/pt-PT/categories.json';
import ptCommon from '../locales/pt-PT/common.json';
import ptErrors from '../locales/pt-PT/errors.json';
import ptHistory from '../locales/pt-PT/history.json';
import ptHome from '../locales/pt-PT/home.json';
import ptIngredients from '../locales/pt-PT/ingredients.json';
import ptSettings from '../locales/pt-PT/settings.json';
import ptSuggestions from '../locales/pt-PT/suggestions.json';
import ptTabs from '../locales/pt-PT/tabs.json';

// Store for AsyncStorage mock
const mockAsyncStorage = new Map<string, string>();

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key: string) => mockAsyncStorage.get(key) ?? null),
  setItem: jest.fn(async (key: string, value: string) => {
    mockAsyncStorage.set(key, value);
  }),
  removeItem: jest.fn(async (key: string) => {
    mockAsyncStorage.delete(key);
  }),
  clear: jest.fn(async () => {
    mockAsyncStorage.clear();
  }),
}));

// Mock device locale
let mockDeviceLocale = 'en-US';

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageTag: mockDeviceLocale }]),
}));

describe('i18n Module', () => {
  beforeEach(async () => {
    // Reset mocks
    mockAsyncStorage.clear();
    mockDeviceLocale = 'en-US';

    // Reset i18next state - change back to English
    if (i18n.isInitialized) {
      await i18n.changeLanguage('en');
    }
  });

  describe('SUPPORTED_LANGUAGES', () => {
    it('should export supported languages array', () => {
      expect(SUPPORTED_LANGUAGES).toBeDefined();
      expect(Array.isArray(SUPPORTED_LANGUAGES)).toBe(true);
      expect(SUPPORTED_LANGUAGES.length).toBeGreaterThan(0);
    });

    it('should include English as default', () => {
      const english = SUPPORTED_LANGUAGES.find((l) => l.code === 'en');
      expect(english).toBeDefined();
      expect(english?.name).toBe('English');
      expect(english?.flag).toBe('🇬🇧');
    });

    it('should include Portuguese (pt-PT)', () => {
      const portuguese = SUPPORTED_LANGUAGES.find((l) => l.code === 'pt-PT');
      expect(portuguese).toBeDefined();
      expect(portuguese?.name).toBe('Português');
      expect(portuguese?.flag).toBe('🇵🇹');
    });

    it('should have exactly 2 supported languages', () => {
      expect(SUPPORTED_LANGUAGES).toHaveLength(2);
    });

    it('should have all required language properties', () => {
      SUPPORTED_LANGUAGES.forEach((lang) => {
        expect(lang.code).toBeTruthy();
        expect(lang.name).toBeTruthy();
        expect(lang.flag).toBeTruthy();
      });
    });
  });

  describe('DEFAULT_LANGUAGE', () => {
    it('should export English as default language', () => {
      expect(DEFAULT_LANGUAGE).toBe('en');
    });
  });

  describe('normalizeLanguageCode', () => {
    it('should return exact match for supported language', () => {
      expect(normalizeLanguageCode('en')).toBe('en');
      expect(normalizeLanguageCode('pt-PT')).toBe('pt-PT');
    });

    it('should normalize pt-BR to pt-PT', () => {
      expect(normalizeLanguageCode('pt-BR')).toBe('pt-PT');
    });

    it('should normalize en-US to en', () => {
      expect(normalizeLanguageCode('en-US')).toBe('en');
    });

    it('should normalize en-GB to en', () => {
      expect(normalizeLanguageCode('en-GB')).toBe('en');
    });

    it('should return default for unsupported languages', () => {
      expect(normalizeLanguageCode('xx-XX')).toBe('en');
      expect(normalizeLanguageCode('fr')).toBe('en');
      expect(normalizeLanguageCode('de-DE')).toBe('en');
    });

    it('should return default for null/undefined', () => {
      expect(normalizeLanguageCode(null)).toBe('en');
      expect(normalizeLanguageCode(undefined)).toBe('en');
    });

    it('should return default for empty string', () => {
      expect(normalizeLanguageCode('')).toBe('en');
    });
  });

  describe('initI18n', () => {
    it('should initialize i18next successfully', async () => {
      const instance = await initI18n();
      expect(instance).toBeDefined();
      expect(instance.isInitialized).toBe(true);
    });

    it('should only initialize once', async () => {
      const first = await initI18n();
      const second = await initI18n();
      expect(first).toBe(second);
    });

    it('should handle concurrent initialization calls', async () => {
      // This tests the promise caching logic
      const [first, second, third] = await Promise.all([initI18n(), initI18n(), initI18n()]);
      expect(first).toBe(second);
      expect(second).toBe(third);
    });
  });

  describe('changeLanguage', () => {
    beforeEach(async () => {
      await initI18n();
    });

    it('should change language to Portuguese', async () => {
      await changeLanguage('pt-PT');
      expect(getCurrentLanguage()).toBe('pt-PT');
    });

    it('should normalize language codes', async () => {
      // pt-BR should normalize to pt-PT
      await changeLanguage('pt-BR');
      expect(getCurrentLanguage()).toBe('pt-PT');
    });

    it('should fallback to English for unsupported languages', async () => {
      await changeLanguage('xx-XX');
      expect(getCurrentLanguage()).toBe('en');
    });

    it('should persist language choice to AsyncStorage', async () => {
      await changeLanguage('pt-PT');
      const stored = mockAsyncStorage.get('i18nextLng');
      expect(stored).toBe('pt-PT');
    });

    it('should return the normalized language code', async () => {
      const result = await changeLanguage('pt-BR');
      expect(result).toBe('pt-PT');
    });
  });

  describe('getCurrentLanguage', () => {
    it('should return current language code after init', async () => {
      await initI18n();
      expect(getCurrentLanguage()).toBe('en');
    });

    it('should return updated language after change', async () => {
      await initI18n();
      await changeLanguage('pt-PT');
      expect(getCurrentLanguage()).toBe('pt-PT');
    });
  });

  describe('isI18nReady', () => {
    it('should return true after initialization', async () => {
      await initI18n();
      expect(isI18nReady()).toBe(true);
    });
  });

  describe('onLanguageChange', () => {
    beforeEach(async () => {
      await initI18n();
    });

    it('should call callback when language changes', async () => {
      const callback = jest.fn();
      onLanguageChange(callback);

      await changeLanguage('pt-PT');

      expect(callback).toHaveBeenCalledWith('pt-PT');
    });

    it('should return unsubscribe function', async () => {
      const callback = jest.fn();
      const unsubscribe = onLanguageChange(callback);

      // Unsubscribe before changing
      unsubscribe();

      await changeLanguage('pt-PT');

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Translation loading', () => {
    beforeEach(async () => {
      await initI18n();
    });

    it('should load English translations', () => {
      const result = i18n.t('common:buttons.save');
      expect(result).toBe('Save');
    });

    it('should load tab translations', () => {
      const result = i18n.t('tabs:home');
      expect(result).toBe('Home');
    });

    it('should load home translations', () => {
      const result = i18n.t('home:title');
      expect(result).toBe('SaborSpin');
    });

    it('should handle interpolation', () => {
      // Using home namespace which has daysAgo with pluralization
      const result = i18n.t('home:date.daysAgo', { count: 5 });
      expect(result).toBe('5 days ago');
    });

    it('should return key for missing translations', () => {
      // i18next returns just the key without namespace when translation is missing
      const result = i18n.t('nonexistent:key');
      expect(result).toBe('key');
    });
  });

  describe('Pluralization', () => {
    beforeEach(async () => {
      await initI18n();
    });

    it('should handle singular form', () => {
      const result = i18n.t('categories:ingredientCount', { count: 1 });
      expect(result).toBe('1 ingredient');
    });

    it('should handle plural form', () => {
      const result = i18n.t('categories:ingredientCount', { count: 5 });
      expect(result).toBe('5 ingredients');
    });

    it('should handle zero as plural', () => {
      const result = i18n.t('categories:ingredientCount', { count: 0 });
      expect(result).toBe('0 ingredients');
    });
  });
});

/**
 * Translation Completeness Tests
 *
 * Verifies that all translation keys in English exist in Portuguese
 * and vice versa, ensuring translation completeness.
 */
describe('Translation Completeness', () => {
  // Helper function to get all keys from a nested object
  const getAllKeys = (obj: Record<string, unknown>, prefix = ''): string[] => {
    const keys: string[] = [];
    for (const key of Object.keys(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys.push(...getAllKeys(value as Record<string, unknown>, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    return keys;
  };

  // Helper function to compare keys between two translation files
  const compareTranslationKeys = (
    enTranslations: Record<string, unknown>,
    ptTranslations: Record<string, unknown>,
    namespace: string
  ) => {
    const enKeys = getAllKeys(enTranslations).sort();
    const ptKeys = getAllKeys(ptTranslations).sort();

    const missingInPt = enKeys.filter((key) => !ptKeys.includes(key));
    const extraInPt = ptKeys.filter((key) => !enKeys.includes(key));

    return { enKeys, ptKeys, missingInPt, extraInPt, namespace };
  };

  // Define all translation pairs
  const translationPairs = [
    { en: enCommon, pt: ptCommon, namespace: 'common' },
    { en: enTabs, pt: ptTabs, namespace: 'tabs' },
    { en: enHome, pt: ptHome, namespace: 'home' },
    { en: enHistory, pt: ptHistory, namespace: 'history' },
    { en: enSettings, pt: ptSettings, namespace: 'settings' },
    { en: enIngredients, pt: ptIngredients, namespace: 'ingredients' },
    { en: enCategories, pt: ptCategories, namespace: 'categories' },
    { en: enSuggestions, pt: ptSuggestions, namespace: 'suggestions' },
    { en: enErrors, pt: ptErrors, namespace: 'errors' },
  ];

  describe('Portuguese translations have all English keys', () => {
    translationPairs.forEach(({ en, pt, namespace }) => {
      it(`${namespace}: no missing keys in pt-PT`, () => {
        const { missingInPt } = compareTranslationKeys(en, pt, namespace);

        if (missingInPt.length > 0) {
          fail(`Missing keys in pt-PT/${namespace}.json:\n  - ${missingInPt.join('\n  - ')}`);
        }
        expect(missingInPt).toHaveLength(0);
      });
    });
  });

  describe('Portuguese translations have no extra keys', () => {
    translationPairs.forEach(({ en, pt, namespace }) => {
      it(`${namespace}: no extra keys in pt-PT`, () => {
        const { extraInPt } = compareTranslationKeys(en, pt, namespace);

        if (extraInPt.length > 0) {
          fail(`Extra keys in pt-PT/${namespace}.json (not in en):\n  - ${extraInPt.join('\n  - ')}`);
        }
        expect(extraInPt).toHaveLength(0);
      });
    });
  });

  describe('Key count verification', () => {
    translationPairs.forEach(({ en, pt, namespace }) => {
      it(`${namespace}: English and Portuguese have same number of keys`, () => {
        const { enKeys, ptKeys } = compareTranslationKeys(en, pt, namespace);
        expect(ptKeys.length).toBe(enKeys.length);
      });
    });
  });

  describe('All namespaces are present', () => {
    it('should have all 9 namespaces', () => {
      expect(translationPairs).toHaveLength(9);
    });

    it('should include all expected namespaces', () => {
      const namespaces = translationPairs.map((p) => p.namespace);
      expect(namespaces).toContain('common');
      expect(namespaces).toContain('tabs');
      expect(namespaces).toContain('home');
      expect(namespaces).toContain('history');
      expect(namespaces).toContain('settings');
      expect(namespaces).toContain('ingredients');
      expect(namespaces).toContain('categories');
      expect(namespaces).toContain('suggestions');
      expect(namespaces).toContain('errors');
    });
  });
});

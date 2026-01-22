/**
 * Unit tests for i18n module
 */

import i18n from 'i18next';

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

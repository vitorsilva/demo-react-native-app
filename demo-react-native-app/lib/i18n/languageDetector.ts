/**
 * Language Detector
 *
 * Custom i18next language detector for React Native.
 * Uses expo-localization for device locale and AsyncStorage for persistence.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import type { LanguageDetectorAsyncModule } from 'i18next';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type LanguageCode } from './types';

const LANGUAGE_STORAGE_KEY = 'i18nextLng';

/**
 * Normalize language codes to supported format
 * e.g., 'pt-BR' -> 'pt-PT', 'en-US' -> 'en'
 */
export function normalizeLanguageCode(code: string | null | undefined): LanguageCode {
  if (!code) return DEFAULT_LANGUAGE;

  // Check exact match first
  const exactMatch = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  if (exactMatch) return exactMatch.code as LanguageCode;

  // Check base language match (pt-BR -> pt-PT, en-US -> en)
  const baseLang = code.split('-')[0];
  const baseMatch = SUPPORTED_LANGUAGES.find((l) => l.code.split('-')[0] === baseLang);
  if (baseMatch) return baseMatch.code as LanguageCode;

  return DEFAULT_LANGUAGE;
}

/**
 * Get device locale from expo-localization
 */
function getDeviceLocale(): string {
  try {
    // expo-localization v3+ uses getLocales()
    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
      return locales[0].languageTag || DEFAULT_LANGUAGE;
    }
  } catch {
    // Fallback for web or errors
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Custom i18next language detector for React Native
 */
export const languageDetector: LanguageDetectorAsyncModule = {
  type: 'languageDetector',
  async: true,

  detect: async (
    callback: (lng: string | readonly string[] | undefined) => void | undefined
  ): Promise<string | readonly string[] | undefined> => {
    try {
      // Try to get stored preference first
      const storedLang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (storedLang) {
        const normalized = normalizeLanguageCode(storedLang);
        callback(normalized);
        return normalized;
      }

      // Fall back to device locale
      const deviceLocale = getDeviceLocale();
      const normalized = normalizeLanguageCode(deviceLocale);
      callback(normalized);
      return normalized;
    } catch {
      // Fallback to default
      callback(DEFAULT_LANGUAGE);
      return DEFAULT_LANGUAGE;
    }
  },

  init: () => {
    // No initialization needed
  },

  cacheUserLanguage: async (lng: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    } catch {
      // Silently fail if storage is unavailable
    }
  },
};

/**
 * Get stored language preference (for use outside i18next)
 */
export async function getStoredLanguage(): Promise<LanguageCode | null> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored ? normalizeLanguageCode(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Set language preference (for use outside i18next)
 */
export async function setStoredLanguage(lang: LanguageCode): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // Silently fail
  }
}

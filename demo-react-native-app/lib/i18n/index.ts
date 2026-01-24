/**
 * Internationalization (i18n) Module
 *
 * Provides translation functionality using i18next + react-i18next.
 * Supports multiple languages with automatic device locale detection.
 *
 * Usage:
 *   import { useTranslation } from 'react-i18next';
 *
 *   // In component
 *   const { t } = useTranslation('home');
 *   <Text>{t('title')}</Text>
 *
 *   // With interpolation
 *   <Text>{t('daysAgo', { count: 5 })}</Text>
 *
 *   // Change language
 *   import { changeLanguage } from '@/lib/i18n';
 *   await changeLanguage('pt-PT');
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { languageDetector, normalizeLanguageCode } from './languageDetector';
import resources from './locales';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type LanguageCode } from './types';

// Re-export types and constants
export { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type LanguageCode, type SupportedLanguage } from './types';
export { getStoredLanguage, setStoredLanguage } from './languageDetector';

// Track initialization state
let isInitialized = false;
let initPromise: Promise<typeof i18n> | null = null;

/**
 * Initialize i18next with configuration
 * Called once at app startup
 */
export async function initI18n(): Promise<typeof i18n> {
  if (isInitialized) return i18n;
  if (initPromise) return initPromise;

  initPromise = i18n
    .use(languageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: DEFAULT_LANGUAGE,
      defaultNS: 'common',
      ns: ['common', 'tabs', 'home', 'history', 'settings', 'ingredients', 'categories', 'suggestions', 'stats', 'errors'],
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      react: {
        useSuspense: false, // Disable suspense for better loading UX
      },
      // Language detection options
      detection: {
        order: ['asyncStorage', 'deviceLocale'],
        caches: ['asyncStorage'],
      },
    })
    .then(() => {
      isInitialized = true;
      return i18n;
    });

  return initPromise;
}

/**
 * Change the current language
 * Normalizes code and persists to storage
 */
export async function changeLanguage(lang: string): Promise<LanguageCode> {
  const normalizedLang = normalizeLanguageCode(lang);
  await i18n.changeLanguage(normalizedLang);
  return normalizedLang;
}

/**
 * Get the current language code
 */
export function getCurrentLanguage(): LanguageCode {
  return (i18n.language as LanguageCode) || DEFAULT_LANGUAGE;
}

/**
 * Check if i18n is initialized
 */
export function isI18nReady(): boolean {
  return isInitialized;
}

/**
 * Subscribe to language changes
 * Returns unsubscribe function
 */
export function onLanguageChange(callback: (lang: string) => void): () => void {
  i18n.on('languageChanged', callback);
  return () => i18n.off('languageChanged', callback);
}

// Export i18n instance for advanced usage
export default i18n;

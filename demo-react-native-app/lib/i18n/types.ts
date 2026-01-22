/**
 * i18n Types
 *
 * TypeScript types for internationalization.
 */

/**
 * Supported language metadata
 */
export interface SupportedLanguage {
  code: string;
  name: string;
  flag: string;
}

/**
 * Supported language codes
 */
export type LanguageCode = 'en' | 'pt-PT';

/**
 * Default and fallback language
 */
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

/**
 * List of supported languages with metadata
 */
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pt-PT', name: 'Português', flag: '🇵🇹' },
];

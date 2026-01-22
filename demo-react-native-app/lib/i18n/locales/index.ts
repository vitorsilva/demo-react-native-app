/**
 * Translation Resources
 *
 * Exports all translation files bundled as resources for i18next.
 */

// English translations
import enCommon from './en/common.json';
import enTabs from './en/tabs.json';
import enHome from './en/home.json';
import enHistory from './en/history.json';
import enSettings from './en/settings.json';
import enIngredients from './en/ingredients.json';
import enCategories from './en/categories.json';
import enSuggestions from './en/suggestions.json';
import enErrors from './en/errors.json';

/**
 * Bundled translation resources
 */
const resources = {
  en: {
    common: enCommon,
    tabs: enTabs,
    home: enHome,
    history: enHistory,
    settings: enSettings,
    ingredients: enIngredients,
    categories: enCategories,
    suggestions: enSuggestions,
    errors: enErrors,
  },
  // pt-PT translations will be added in Phase 4
};

export default resources;

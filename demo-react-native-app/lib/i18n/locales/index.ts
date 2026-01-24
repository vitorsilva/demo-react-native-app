/**
 * Translation Resources
 *
 * Exports all translation files bundled as resources for i18next.
 */

// English translations
import enCategories from './en/categories.json';
import enCommon from './en/common.json';
import enErrors from './en/errors.json';
import enHistory from './en/history.json';
import enHome from './en/home.json';
import enIngredients from './en/ingredients.json';
import enSettings from './en/settings.json';
import enStats from './en/stats.json';
import enSuggestions from './en/suggestions.json';
import enTabs from './en/tabs.json';

// Portuguese (Portugal) translations
import ptCategories from './pt-PT/categories.json';
import ptCommon from './pt-PT/common.json';
import ptErrors from './pt-PT/errors.json';
import ptHistory from './pt-PT/history.json';
import ptHome from './pt-PT/home.json';
import ptIngredients from './pt-PT/ingredients.json';
import ptSettings from './pt-PT/settings.json';
import ptStats from './pt-PT/stats.json';
import ptSuggestions from './pt-PT/suggestions.json';
import ptTabs from './pt-PT/tabs.json';

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
    stats: enStats,
    errors: enErrors,
  },
  'pt-PT': {
    common: ptCommon,
    tabs: ptTabs,
    home: ptHome,
    history: ptHistory,
    settings: ptSettings,
    ingredients: ptIngredients,
    categories: ptCategories,
    suggestions: ptSuggestions,
    stats: ptStats,
    errors: ptErrors,
  },
};

export default resources;

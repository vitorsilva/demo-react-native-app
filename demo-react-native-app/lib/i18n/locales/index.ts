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

// Portuguese (Portugal) translations
import ptCommon from './pt-PT/common.json';
import ptTabs from './pt-PT/tabs.json';
import ptHome from './pt-PT/home.json';
import ptHistory from './pt-PT/history.json';
import ptSettings from './pt-PT/settings.json';
import ptIngredients from './pt-PT/ingredients.json';
import ptCategories from './pt-PT/categories.json';
import ptSuggestions from './pt-PT/suggestions.json';
import ptErrors from './pt-PT/errors.json';

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
  'pt-PT': {
    common: ptCommon,
    tabs: ptTabs,
    home: ptHome,
    history: ptHistory,
    settings: ptSettings,
    ingredients: ptIngredients,
    categories: ptCategories,
    suggestions: ptSuggestions,
    errors: ptErrors,
  },
};

export default resources;

/**
 * Seed Data Definitions
 *
 * Centralized definitions for categories, ingredients, and pairing rules
 * used for new installs and app reset functionality.
 *
 * Phase 3.2: Seed Data & App Reset
 */

export interface SeedCategory {
  id: string;
  name: string;
  name_pt: string;
}

export interface SeedIngredient {
  id: string;
  name: string;
  name_pt: string;
  categoryId: string;
  mealTypes: ('breakfast' | 'snack')[];
}

export interface SeedPairingRule {
  ingredientAId: string;
  ingredientBId: string;
  ruleType: 'positive' | 'negative';
}

/**
 * Seed Categories
 * These provide organizational structure for ingredients
 */
export const SEED_CATEGORIES: SeedCategory[] = [
  { id: 'cat-fruits', name: 'Fruits', name_pt: 'Frutas' },
  { id: 'cat-dairy', name: 'Dairy', name_pt: 'Lacticínios' },
  { id: 'cat-grains', name: 'Grains & Cereals', name_pt: 'Cereais e Grãos' },
  { id: 'cat-proteins', name: 'Proteins', name_pt: 'Proteínas' },
  { id: 'cat-spreads', name: 'Spreads & Jams', name_pt: 'Compotas e Cremes' },
  { id: 'cat-bakery', name: 'Bakery', name_pt: 'Padaria' },
  { id: 'cat-nuts', name: 'Nuts & Seeds', name_pt: 'Frutos Secos' },
];

/**
 * Seed Ingredients
 * Portuguese breakfast/snack ingredients with category associations
 */
export const SEED_INGREDIENTS: SeedIngredient[] = [
  // Dairy
  {
    id: 'ing-milk',
    name: 'Milk',
    name_pt: 'Leite',
    categoryId: 'cat-dairy',
    mealTypes: ['breakfast'],
  },
  {
    id: 'ing-greek-yogurt',
    name: 'Greek Yogurt',
    name_pt: 'Iogurte Grego',
    categoryId: 'cat-dairy',
    mealTypes: ['breakfast'],
  },
  {
    id: 'ing-normal-yogurt',
    name: 'Normal Yogurt',
    name_pt: 'Iogurte Normal',
    categoryId: 'cat-dairy',
    mealTypes: ['breakfast'],
  },
  {
    id: 'ing-butter',
    name: 'Butter',
    name_pt: 'Manteiga',
    categoryId: 'cat-dairy',
    mealTypes: ['breakfast', 'snack'],
  },
  {
    id: 'ing-cheese',
    name: 'Cheese',
    name_pt: 'Queijo',
    categoryId: 'cat-dairy',
    mealTypes: ['breakfast', 'snack'],
  },

  // Proteins
  {
    id: 'ing-eggs',
    name: 'Eggs',
    name_pt: 'Ovos',
    categoryId: 'cat-proteins',
    mealTypes: ['breakfast'],
  },
  {
    id: 'ing-ham',
    name: 'Ham',
    name_pt: 'Fiambre',
    categoryId: 'cat-proteins',
    mealTypes: ['breakfast', 'snack'],
  },

  // Grains & Cereals
  {
    id: 'ing-cereals',
    name: 'Cereals',
    name_pt: 'Cereais',
    categoryId: 'cat-grains',
    mealTypes: ['breakfast'],
  },
  {
    id: 'ing-oats',
    name: 'Oats',
    name_pt: 'Aveia',
    categoryId: 'cat-grains',
    mealTypes: ['breakfast'],
  },

  // Bakery
  {
    id: 'ing-pao-branco',
    name: 'Pão Branco',
    name_pt: 'Pão Branco',
    categoryId: 'cat-bakery',
    mealTypes: ['breakfast', 'snack'],
  },
  {
    id: 'ing-pao-mistura',
    name: 'Pão Mistura',
    name_pt: 'Pão Mistura',
    categoryId: 'cat-bakery',
    mealTypes: ['breakfast', 'snack'],
  },
  {
    id: 'ing-pao-agua',
    name: 'Pão de Água',
    name_pt: 'Pão de Água',
    categoryId: 'cat-bakery',
    mealTypes: ['breakfast', 'snack'],
  },
  {
    id: 'ing-pao-forma',
    name: 'Pão de Forma',
    name_pt: 'Pão de Forma',
    categoryId: 'cat-bakery',
    mealTypes: ['breakfast', 'snack'],
  },
  {
    id: 'ing-italiana',
    name: 'Italiana',
    name_pt: 'Italiana',
    categoryId: 'cat-bakery',
    mealTypes: ['breakfast', 'snack'],
  },
  {
    id: 'ing-regueifa',
    name: 'Regueifa',
    name_pt: 'Regueifa',
    categoryId: 'cat-bakery',
    mealTypes: ['breakfast', 'snack'],
  },
  {
    id: 'ing-croissant',
    name: 'Croissant',
    name_pt: 'Croissant',
    categoryId: 'cat-bakery',
    mealTypes: ['breakfast', 'snack'],
  },
  {
    id: 'ing-toast',
    name: 'Toast',
    name_pt: 'Torrada',
    categoryId: 'cat-bakery',
    mealTypes: ['breakfast', 'snack'],
  },

  // Spreads & Jams
  {
    id: 'ing-jam',
    name: 'Jam',
    name_pt: 'Compota',
    categoryId: 'cat-spreads',
    mealTypes: ['breakfast', 'snack'],
  },
  {
    id: 'ing-marmelada',
    name: 'Marmelada',
    name_pt: 'Marmelada',
    categoryId: 'cat-spreads',
    mealTypes: ['breakfast', 'snack'],
  },
  {
    id: 'ing-honey',
    name: 'Honey',
    name_pt: 'Mel',
    categoryId: 'cat-spreads',
    mealTypes: ['breakfast', 'snack'],
  },
  {
    id: 'ing-peanut-butter',
    name: 'Peanut Butter',
    name_pt: 'Manteiga de Amendoim',
    categoryId: 'cat-spreads',
    mealTypes: ['breakfast', 'snack'],
  },

  // Fruits
  {
    id: 'ing-apple',
    name: 'Apple',
    name_pt: 'Maçã',
    categoryId: 'cat-fruits',
    mealTypes: ['snack'],
  },
  {
    id: 'ing-banana',
    name: 'Banana',
    name_pt: 'Banana',
    categoryId: 'cat-fruits',
    mealTypes: ['snack'],
  },
  {
    id: 'ing-pear',
    name: 'Pear',
    name_pt: 'Pêra',
    categoryId: 'cat-fruits',
    mealTypes: ['snack'],
  },
  {
    id: 'ing-orange',
    name: 'Orange',
    name_pt: 'Laranja',
    categoryId: 'cat-fruits',
    mealTypes: ['snack'],
  },

  // Nuts & Seeds
  {
    id: 'ing-nuts',
    name: 'Nuts',
    name_pt: 'Frutos Secos',
    categoryId: 'cat-nuts',
    mealTypes: ['snack'],
  },

  // Sweets (categorized under spreads for simplicity)
  {
    id: 'ing-cookies',
    name: 'Cookies',
    name_pt: 'Bolachas',
    categoryId: 'cat-bakery',
    mealTypes: ['breakfast', 'snack'],
  },
];

/**
 * Seed Pairing Rules
 * Positive rules suggest good combinations
 * Negative rules indicate combinations to avoid
 */
export const SEED_PAIRING_RULES: SeedPairingRule[] = [
  // Positive (Good Pairs)
  { ingredientAId: 'ing-milk', ingredientBId: 'ing-cereals', ruleType: 'positive' },
  { ingredientAId: 'ing-pao-branco', ingredientBId: 'ing-butter', ruleType: 'positive' },
  { ingredientAId: 'ing-pao-branco', ingredientBId: 'ing-jam', ruleType: 'positive' },
  { ingredientAId: 'ing-toast', ingredientBId: 'ing-butter', ruleType: 'positive' },
  { ingredientAId: 'ing-greek-yogurt', ingredientBId: 'ing-honey', ruleType: 'positive' },
  { ingredientAId: 'ing-greek-yogurt', ingredientBId: 'ing-banana', ruleType: 'positive' },
  { ingredientAId: 'ing-oats', ingredientBId: 'ing-banana', ruleType: 'positive' },
  { ingredientAId: 'ing-oats', ingredientBId: 'ing-honey', ruleType: 'positive' },
  { ingredientAId: 'ing-pao-branco', ingredientBId: 'ing-cheese', ruleType: 'positive' },
  { ingredientAId: 'ing-pao-branco', ingredientBId: 'ing-ham', ruleType: 'positive' },
  { ingredientAId: 'ing-croissant', ingredientBId: 'ing-butter', ruleType: 'positive' },
  { ingredientAId: 'ing-croissant', ingredientBId: 'ing-jam', ruleType: 'positive' },
  { ingredientAId: 'ing-apple', ingredientBId: 'ing-peanut-butter', ruleType: 'positive' },

  // Negative (Avoid Together)
  { ingredientAId: 'ing-milk', ingredientBId: 'ing-orange', ruleType: 'negative' },
  { ingredientAId: 'ing-greek-yogurt', ingredientBId: 'ing-orange', ruleType: 'negative' },
  { ingredientAId: 'ing-cheese', ingredientBId: 'ing-jam', ruleType: 'negative' },
  { ingredientAId: 'ing-ham', ingredientBId: 'ing-honey', ruleType: 'negative' },
  { ingredientAId: 'ing-eggs', ingredientBId: 'ing-jam', ruleType: 'negative' },
];

/**
 * Helper function to get all ingredient IDs from seed data
 */
export function getAllSeedIngredientIds(): string[] {
  return SEED_INGREDIENTS.map((ing) => ing.id);
}

/**
 * Helper function to get all category IDs from seed data
 */
export function getAllSeedCategoryIds(): string[] {
  return SEED_CATEGORIES.map((cat) => cat.id);
}

/**
 * Helper function to validate seed data integrity
 * Returns array of validation errors (empty if valid)
 */
export function validateSeedData(): string[] {
  const errors: string[] = [];
  const categoryIds = new Set(SEED_CATEGORIES.map((c) => c.id));
  const ingredientIds = new Set(SEED_INGREDIENTS.map((i) => i.id));

  // Check ingredients reference valid categories
  for (const ingredient of SEED_INGREDIENTS) {
    if (!categoryIds.has(ingredient.categoryId)) {
      errors.push(
        `Ingredient "${ingredient.name}" references non-existent category "${ingredient.categoryId}"`
      );
    }
  }

  // Check pairing rules reference valid ingredients
  for (const rule of SEED_PAIRING_RULES) {
    if (!ingredientIds.has(rule.ingredientAId)) {
      errors.push(
        `Pairing rule references non-existent ingredient A: "${rule.ingredientAId}"`
      );
    }
    if (!ingredientIds.has(rule.ingredientBId)) {
      errors.push(
        `Pairing rule references non-existent ingredient B: "${rule.ingredientBId}"`
      );
    }
  }

  // Check for duplicate ingredient IDs
  const seenIngredientIds = new Set<string>();
  for (const ingredient of SEED_INGREDIENTS) {
    if (seenIngredientIds.has(ingredient.id)) {
      errors.push(`Duplicate ingredient ID: "${ingredient.id}"`);
    }
    seenIngredientIds.add(ingredient.id);
  }

  // Check for duplicate category IDs
  const seenCategoryIds = new Set<string>();
  for (const category of SEED_CATEGORIES) {
    if (seenCategoryIds.has(category.id)) {
      errors.push(`Duplicate category ID: "${category.id}"`);
    }
    seenCategoryIds.add(category.id);
  }

  return errors;
}

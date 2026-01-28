import {
  SEED_CATEGORIES,
  SEED_INGREDIENTS,
  SEED_PAIRING_RULES,
  getAllSeedIngredientIds,
  getAllSeedCategoryIds,
  validateSeedData,
  SeedCategory,
  SeedIngredient,
  SeedPairingRule,
} from '../seedData';

describe('seedData', () => {
  describe('SEED_CATEGORIES', () => {
    it('should have at least 5 categories', () => {
      expect(SEED_CATEGORIES.length).toBeGreaterThanOrEqual(5);
    });

    it('should have unique category IDs', () => {
      const ids = SEED_CATEGORIES.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have IDs prefixed with "cat-"', () => {
      for (const category of SEED_CATEGORIES) {
        expect(category.id).toMatch(/^cat-/);
      }
    });

    it('should have non-empty names', () => {
      for (const category of SEED_CATEGORIES) {
        expect(category.name.trim().length).toBeGreaterThan(0);
        expect(category.name_pt.trim().length).toBeGreaterThan(0);
      }
    });

    it('should contain expected categories', () => {
      const categoryNames = SEED_CATEGORIES.map((c) => c.name);
      expect(categoryNames).toContain('Fruits');
      expect(categoryNames).toContain('Dairy');
      expect(categoryNames).toContain('Bakery');
    });
  });

  describe('SEED_INGREDIENTS', () => {
    it('should have at least 20 ingredients', () => {
      expect(SEED_INGREDIENTS.length).toBeGreaterThanOrEqual(20);
    });

    it('should have unique ingredient IDs', () => {
      const ids = SEED_INGREDIENTS.map((i) => i.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have IDs prefixed with "ing-"', () => {
      for (const ingredient of SEED_INGREDIENTS) {
        expect(ingredient.id).toMatch(/^ing-/);
      }
    });

    it('should have non-empty names', () => {
      for (const ingredient of SEED_INGREDIENTS) {
        expect(ingredient.name.trim().length).toBeGreaterThan(0);
        expect(ingredient.name_pt.trim().length).toBeGreaterThan(0);
      }
    });

    it('should reference valid category IDs', () => {
      const categoryIds = new Set(SEED_CATEGORIES.map((c) => c.id));
      for (const ingredient of SEED_INGREDIENTS) {
        expect(categoryIds.has(ingredient.categoryId)).toBe(true);
      }
    });

    it('should have valid meal types', () => {
      const validMealTypes = ['breakfast', 'snack'];
      for (const ingredient of SEED_INGREDIENTS) {
        expect(ingredient.mealTypes.length).toBeGreaterThan(0);
        for (const mealType of ingredient.mealTypes) {
          expect(validMealTypes).toContain(mealType);
        }
      }
    });

    it('should contain expected ingredients', () => {
      const ingredientNames = SEED_INGREDIENTS.map((i) => i.name);
      expect(ingredientNames).toContain('Milk');
      expect(ingredientNames).toContain('Greek Yogurt');
      expect(ingredientNames).toContain('Cereals');
      expect(ingredientNames).toContain('Banana');
    });

    it('should have at least one ingredient per category', () => {
      const categoryIds = new Set(SEED_CATEGORIES.map((c) => c.id));
      const usedCategoryIds = new Set(SEED_INGREDIENTS.map((i) => i.categoryId));

      for (const categoryId of categoryIds) {
        expect(usedCategoryIds.has(categoryId)).toBe(true);
      }
    });
  });

  describe('SEED_PAIRING_RULES', () => {
    it('should have at least 10 pairing rules', () => {
      expect(SEED_PAIRING_RULES.length).toBeGreaterThanOrEqual(10);
    });

    it('should have valid rule types', () => {
      const validRuleTypes = ['positive', 'negative'];
      for (const rule of SEED_PAIRING_RULES) {
        expect(validRuleTypes).toContain(rule.ruleType);
      }
    });

    it('should reference valid ingredient IDs', () => {
      const ingredientIds = new Set(SEED_INGREDIENTS.map((i) => i.id));
      for (const rule of SEED_PAIRING_RULES) {
        expect(ingredientIds.has(rule.ingredientAId)).toBe(true);
        expect(ingredientIds.has(rule.ingredientBId)).toBe(true);
      }
    });

    it('should not have self-pairing rules', () => {
      for (const rule of SEED_PAIRING_RULES) {
        expect(rule.ingredientAId).not.toBe(rule.ingredientBId);
      }
    });

    it('should have both positive and negative rules', () => {
      const positiveRules = SEED_PAIRING_RULES.filter((r) => r.ruleType === 'positive');
      const negativeRules = SEED_PAIRING_RULES.filter((r) => r.ruleType === 'negative');

      expect(positiveRules.length).toBeGreaterThan(0);
      expect(negativeRules.length).toBeGreaterThan(0);
    });

    it('should contain expected positive pairings', () => {
      const hasRule = (aId: string, bId: string, type: 'positive' | 'negative') =>
        SEED_PAIRING_RULES.some(
          (r) =>
            ((r.ingredientAId === aId && r.ingredientBId === bId) ||
              (r.ingredientAId === bId && r.ingredientBId === aId)) &&
            r.ruleType === type
        );

      // Milk + Cereals
      expect(hasRule('ing-milk', 'ing-cereals', 'positive')).toBe(true);
      // Greek Yogurt + Honey
      expect(hasRule('ing-greek-yogurt', 'ing-honey', 'positive')).toBe(true);
    });

    it('should contain expected negative pairings', () => {
      const hasRule = (aId: string, bId: string, type: 'positive' | 'negative') =>
        SEED_PAIRING_RULES.some(
          (r) =>
            ((r.ingredientAId === aId && r.ingredientBId === bId) ||
              (r.ingredientAId === bId && r.ingredientBId === aId)) &&
            r.ruleType === type
        );

      // Milk + Orange (dairy + citrus)
      expect(hasRule('ing-milk', 'ing-orange', 'negative')).toBe(true);
    });
  });

  describe('getAllSeedIngredientIds', () => {
    it('should return all ingredient IDs', () => {
      const ids = getAllSeedIngredientIds();
      expect(ids.length).toBe(SEED_INGREDIENTS.length);
      expect(ids).toContain('ing-milk');
      expect(ids).toContain('ing-banana');
    });

    it('should return an array of strings', () => {
      const ids = getAllSeedIngredientIds();
      for (const id of ids) {
        expect(typeof id).toBe('string');
      }
    });
  });

  describe('getAllSeedCategoryIds', () => {
    it('should return all category IDs', () => {
      const ids = getAllSeedCategoryIds();
      expect(ids.length).toBe(SEED_CATEGORIES.length);
      expect(ids).toContain('cat-fruits');
      expect(ids).toContain('cat-dairy');
    });

    it('should return an array of strings', () => {
      const ids = getAllSeedCategoryIds();
      for (const id of ids) {
        expect(typeof id).toBe('string');
      }
    });
  });

  describe('validateSeedData', () => {
    it('should return empty array for valid seed data', () => {
      const errors = validateSeedData();
      expect(errors).toEqual([]);
    });

    it('should validate referential integrity', () => {
      // This is already covered by the function - if seed data is invalid,
      // it would return errors. We verify it passes with current data.
      const errors = validateSeedData();
      expect(errors.length).toBe(0);
    });
  });

  describe('type exports', () => {
    it('should export SeedCategory type correctly', () => {
      const category: SeedCategory = {
        id: 'test-cat',
        name: 'Test',
        name_pt: 'Teste',
      };
      expect(category.id).toBe('test-cat');
    });

    it('should export SeedIngredient type correctly', () => {
      const ingredient: SeedIngredient = {
        id: 'test-ing',
        name: 'Test',
        name_pt: 'Teste',
        categoryId: 'cat-test',
        mealTypes: ['breakfast'],
      };
      expect(ingredient.id).toBe('test-ing');
    });

    it('should export SeedPairingRule type correctly', () => {
      const rule: SeedPairingRule = {
        ingredientAId: 'ing-a',
        ingredientBId: 'ing-b',
        ruleType: 'positive',
      };
      expect(rule.ruleType).toBe('positive');
    });
  });
});

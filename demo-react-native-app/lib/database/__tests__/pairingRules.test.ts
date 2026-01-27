import { initDatabase, resetDatabase, getDatabase } from '../index';
import { addIngredient } from '../ingredients';
import {
  getAllPairingRules,
  getPairingRuleById,
  getPairingRulesForIngredient,
  addPairingRule,
  deletePairingRule,
  pairingRuleExists,
  getPairingRuleForPair,
} from '../pairingRules';
import { resetTestDatabase } from './testDb';

jest.mock('../index');

describe('PairingRule Operations', () => {
  // Helper to create test ingredients
  let ingredientA: { id: string };
  let ingredientB: { id: string };
  let ingredientC: { id: string };

  beforeEach(async () => {
    resetTestDatabase();
    resetDatabase();
    await initDatabase();

    // Create test ingredients for pairing rules
    const db = getDatabase();
    ingredientA = await addIngredient(db, {
      name: 'Milk',
      category: 'protein',
      mealTypes: ['breakfast'],
    });
    ingredientB = await addIngredient(db, {
      name: 'Cereals',
      category: 'carb',
      mealTypes: ['breakfast'],
    });
    ingredientC = await addIngredient(db, {
      name: 'Yogurt',
      category: 'protein',
      mealTypes: ['breakfast'],
    });
  });

  describe('getAllPairingRules', () => {
    test('returns empty array when no rules exist', async () => {
      const db = getDatabase();
      const rules = await getAllPairingRules(db);
      expect(rules).toEqual([]);
    });

    test('returns all added rules', async () => {
      const db = getDatabase();
      await addPairingRule(db, ingredientA.id, ingredientB.id, 'positive');
      await addPairingRule(db, ingredientB.id, ingredientC.id, 'negative');

      const rules = await getAllPairingRules(db);
      expect(rules).toHaveLength(2);
    });

    test('returns rules sorted by creation date descending', async () => {
      const db = getDatabase();
      const rule1 = await addPairingRule(db, ingredientA.id, ingredientB.id, 'positive');
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      const rule2 = await addPairingRule(db, ingredientB.id, ingredientC.id, 'negative');

      const rules = await getAllPairingRules(db);
      expect(rules[0].id).toBe(rule2.id); // Newer first
      expect(rules[1].id).toBe(rule1.id);
    });
  });

  describe('addPairingRule', () => {
    test('creates rule with generated ID and timestamp', async () => {
      const db = getDatabase();
      const rule = await addPairingRule(db, ingredientA.id, ingredientB.id, 'positive');

      expect(rule).toBeDefined();
      expect(rule.id).toBeDefined();
      expect(typeof rule.id).toBe('string');
      expect(rule.id.length).toBeGreaterThan(0);
      expect(rule.ingredientAId).toBe(ingredientA.id);
      expect(rule.ingredientBId).toBe(ingredientB.id);
      expect(rule.ruleType).toBe('positive');
      expect(rule.createdAt).toBeDefined();
      expect(new Date(rule.createdAt).getTime()).toBeGreaterThan(0);
    });

    test('creates positive rule type', async () => {
      const db = getDatabase();
      const rule = await addPairingRule(db, ingredientA.id, ingredientB.id, 'positive');

      expect(rule.ruleType).toBe('positive');
    });

    test('creates negative rule type', async () => {
      const db = getDatabase();
      const rule = await addPairingRule(db, ingredientA.id, ingredientC.id, 'negative');

      expect(rule.ruleType).toBe('negative');
    });

    test('rule is retrievable after creation', async () => {
      const db = getDatabase();
      const created = await addPairingRule(db, ingredientA.id, ingredientB.id, 'positive');

      const found = await getPairingRuleById(db, created.id);
      expect(found).not.toBeNull();
      expect(found?.ingredientAId).toBe(ingredientA.id);
      expect(found?.ingredientBId).toBe(ingredientB.id);
    });
  });

  describe('getPairingRuleById', () => {
    test('returns the correct rule', async () => {
      const db = getDatabase();
      const created = await addPairingRule(db, ingredientA.id, ingredientB.id, 'positive');

      const found = await getPairingRuleById(db, created.id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.ingredientAId).toBe(ingredientA.id);
      expect(found?.ingredientBId).toBe(ingredientB.id);
      expect(found?.ruleType).toBe('positive');
      expect(found?.createdAt).toBe(created.createdAt);
    });

    test('returns null for non-existent ID', async () => {
      const db = getDatabase();
      const found = await getPairingRuleById(db, 'non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('getPairingRulesForIngredient', () => {
    test('returns rules where ingredient is ingredient A', async () => {
      const db = getDatabase();
      await addPairingRule(db, ingredientA.id, ingredientB.id, 'positive');

      const rules = await getPairingRulesForIngredient(db, ingredientA.id);
      expect(rules).toHaveLength(1);
      expect(rules[0].ingredientAId).toBe(ingredientA.id);
    });

    test('returns rules where ingredient is ingredient B', async () => {
      const db = getDatabase();
      await addPairingRule(db, ingredientA.id, ingredientB.id, 'positive');

      const rules = await getPairingRulesForIngredient(db, ingredientB.id);
      expect(rules).toHaveLength(1);
      expect(rules[0].ingredientBId).toBe(ingredientB.id);
    });

    test('returns all rules involving ingredient (as A or B)', async () => {
      const db = getDatabase();
      // B is in both rules - as A in one, as B in the other
      await addPairingRule(db, ingredientA.id, ingredientB.id, 'positive');
      await addPairingRule(db, ingredientB.id, ingredientC.id, 'negative');

      const rules = await getPairingRulesForIngredient(db, ingredientB.id);
      expect(rules).toHaveLength(2);
    });

    test('returns empty array when ingredient has no rules', async () => {
      const db = getDatabase();
      await addPairingRule(db, ingredientA.id, ingredientB.id, 'positive');

      const rules = await getPairingRulesForIngredient(db, ingredientC.id);
      expect(rules).toEqual([]);
    });

    test('returns rules sorted by creation date descending', async () => {
      const db = getDatabase();
      const rule1 = await addPairingRule(db, ingredientA.id, ingredientB.id, 'positive');
      await new Promise(resolve => setTimeout(resolve, 10));
      const rule2 = await addPairingRule(db, ingredientB.id, ingredientC.id, 'negative');

      const rules = await getPairingRulesForIngredient(db, ingredientB.id);
      expect(rules[0].id).toBe(rule2.id); // Newer first
      expect(rules[1].id).toBe(rule1.id);
    });
  });

  describe('deletePairingRule', () => {
    test('removes rule from database', async () => {
      const db = getDatabase();
      const created = await addPairingRule(db, ingredientA.id, ingredientB.id, 'positive');

      const result = await deletePairingRule(db, created.id);
      expect(result.success).toBe(true);

      const found = await getPairingRuleById(db, created.id);
      expect(found).toBeNull();
    });

    test('returns error for non-existent rule', async () => {
      const db = getDatabase();
      const result = await deletePairingRule(db, 'non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Pairing rule not found');
    });

    test('only deletes the specified rule', async () => {
      const db = getDatabase();
      const rule1 = await addPairingRule(db, ingredientA.id, ingredientB.id, 'positive');
      const rule2 = await addPairingRule(db, ingredientB.id, ingredientC.id, 'negative');

      await deletePairingRule(db, rule1.id);

      const rules = await getAllPairingRules(db);
      expect(rules).toHaveLength(1);
      expect(rules[0].id).toBe(rule2.id);
    });
  });

  describe('pairingRuleExists', () => {
    test('returns true when rule exists (A-B order)', async () => {
      const db = getDatabase();
      await addPairingRule(db, ingredientA.id, ingredientB.id, 'positive');

      const exists = await pairingRuleExists(db, ingredientA.id, ingredientB.id);
      expect(exists).toBe(true);
    });

    test('returns true when rule exists (B-A order - reverse lookup)', async () => {
      const db = getDatabase();
      await addPairingRule(db, ingredientA.id, ingredientB.id, 'positive');

      // Query with reversed order should still find the rule
      const exists = await pairingRuleExists(db, ingredientB.id, ingredientA.id);
      expect(exists).toBe(true);
    });

    test('returns false when no rule exists', async () => {
      const db = getDatabase();
      const exists = await pairingRuleExists(db, ingredientA.id, ingredientB.id);
      expect(exists).toBe(false);
    });

    test('returns false for different ingredient pair', async () => {
      const db = getDatabase();
      await addPairingRule(db, ingredientA.id, ingredientB.id, 'positive');

      const exists = await pairingRuleExists(db, ingredientA.id, ingredientC.id);
      expect(exists).toBe(false);
    });
  });

  describe('getPairingRuleForPair', () => {
    test('returns rule for exact pair match (A-B order)', async () => {
      const db = getDatabase();
      const created = await addPairingRule(db, ingredientA.id, ingredientB.id, 'positive');

      const found = await getPairingRuleForPair(db, ingredientA.id, ingredientB.id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
    });

    test('returns rule for reversed pair (B-A order)', async () => {
      const db = getDatabase();
      const created = await addPairingRule(db, ingredientA.id, ingredientB.id, 'positive');

      // Query with reversed order should still find the rule
      const found = await getPairingRuleForPair(db, ingredientB.id, ingredientA.id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
    });

    test('returns null when no rule exists for pair', async () => {
      const db = getDatabase();
      const found = await getPairingRuleForPair(db, ingredientA.id, ingredientB.id);
      expect(found).toBeNull();
    });

    test('returns correct rule type (positive)', async () => {
      const db = getDatabase();
      await addPairingRule(db, ingredientA.id, ingredientB.id, 'positive');

      const found = await getPairingRuleForPair(db, ingredientA.id, ingredientB.id);
      expect(found?.ruleType).toBe('positive');
    });

    test('returns correct rule type (negative)', async () => {
      const db = getDatabase();
      await addPairingRule(db, ingredientA.id, ingredientC.id, 'negative');

      const found = await getPairingRuleForPair(db, ingredientA.id, ingredientC.id);
      expect(found?.ruleType).toBe('negative');
    });
  });

  describe('Rule structure and properties', () => {
    test('rule has correct structure after retrieval', async () => {
      const db = getDatabase();
      await addPairingRule(db, ingredientA.id, ingredientB.id, 'positive');

      const rules = await getAllPairingRules(db);
      const rule = rules[0];

      expect(rule).toHaveProperty('id');
      expect(rule).toHaveProperty('ingredientAId');
      expect(rule).toHaveProperty('ingredientBId');
      expect(rule).toHaveProperty('ruleType');
      expect(rule).toHaveProperty('createdAt');
    });

    test('ruleType is properly typed as string union', async () => {
      const db = getDatabase();
      const positive = await addPairingRule(db, ingredientA.id, ingredientB.id, 'positive');
      const negative = await addPairingRule(db, ingredientB.id, ingredientC.id, 'negative');

      expect(positive.ruleType).toBe('positive');
      expect(negative.ruleType).toBe('negative');
      expect(['positive', 'negative']).toContain(positive.ruleType);
      expect(['positive', 'negative']).toContain(negative.ruleType);
    });
  });
});

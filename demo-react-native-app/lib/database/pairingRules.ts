import * as Crypto from 'expo-crypto';
import type { DatabaseAdapter } from './adapters/types';
import type { PairingRule } from '../../types/database';

/**
 * Database row type for pairing_rules table.
 * Maps SQLite column names to TypeScript types.
 */
interface PairingRuleRow {
  id: string;
  ingredient_a_id: string;
  ingredient_b_id: string;
  rule_type: string;
  created_at: string;
}

/**
 * Converts a database row to a PairingRule object.
 * @param row - Raw database row
 * @returns PairingRule with proper TypeScript types
 */
function rowToPairingRule(row: PairingRuleRow): PairingRule {
  return {
    id: row.id,
    ingredientAId: row.ingredient_a_id,
    ingredientBId: row.ingredient_b_id,
    ruleType: row.rule_type as 'positive' | 'negative',
    createdAt: row.created_at,
  };
}

/**
 * Retrieves all pairing rules from the database.
 * @param db - Database adapter instance
 * @returns Array of all pairing rules, sorted by creation date descending
 */
export async function getAllPairingRules(db: DatabaseAdapter): Promise<PairingRule[]> {
  const rows = await db.getAllAsync<PairingRuleRow>(
    `SELECT id, ingredient_a_id, ingredient_b_id, rule_type, created_at
     FROM pairing_rules
     ORDER BY created_at DESC`
  );
  return rows.map(rowToPairingRule);
}

/**
 * Retrieves a single pairing rule by its ID.
 * @param db - Database adapter instance
 * @param id - Pairing rule UUID
 * @returns The pairing rule or null if not found
 */
export async function getPairingRuleById(
  db: DatabaseAdapter,
  id: string
): Promise<PairingRule | null> {
  const row = await db.getFirstAsync<PairingRuleRow>(
    'SELECT id, ingredient_a_id, ingredient_b_id, rule_type, created_at FROM pairing_rules WHERE id = ?',
    [id]
  );
  return row ? rowToPairingRule(row) : null;
}

/**
 * Retrieves all pairing rules that involve a specific ingredient.
 * Returns rules where the ingredient is either ingredient A or ingredient B.
 * @param db - Database adapter instance
 * @param ingredientId - Ingredient UUID
 * @returns Array of pairing rules involving the ingredient
 */
export async function getPairingRulesForIngredient(
  db: DatabaseAdapter,
  ingredientId: string
): Promise<PairingRule[]> {
  const rows = await db.getAllAsync<PairingRuleRow>(
    `SELECT id, ingredient_a_id, ingredient_b_id, rule_type, created_at
     FROM pairing_rules
     WHERE ingredient_a_id = ? OR ingredient_b_id = ?
     ORDER BY created_at DESC`,
    [ingredientId, ingredientId]
  );
  return rows.map(rowToPairingRule);
}

/**
 * Adds a new pairing rule to the database.
 * @param db - Database adapter instance
 * @param ingredientAId - First ingredient UUID
 * @param ingredientBId - Second ingredient UUID
 * @param ruleType - 'positive' (pairs well) or 'negative' (avoid together)
 * @returns The created pairing rule
 * @throws Error if a rule for this ingredient pair already exists
 */
export async function addPairingRule(
  db: DatabaseAdapter,
  ingredientAId: string,
  ingredientBId: string,
  ruleType: 'positive' | 'negative'
): Promise<PairingRule> {
  const id = Crypto.randomUUID();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO pairing_rules (id, ingredient_a_id, ingredient_b_id, rule_type, created_at) VALUES (?, ?, ?, ?, ?)`,
    [id, ingredientAId, ingredientBId, ruleType, now]
  );

  return {
    id,
    ingredientAId,
    ingredientBId,
    ruleType,
    createdAt: now,
  };
}

/**
 * Deletes a pairing rule from the database.
 * @param db - Database adapter instance
 * @param id - Pairing rule UUID
 * @returns Object indicating success or failure with error message
 */
export async function deletePairingRule(
  db: DatabaseAdapter,
  id: string
): Promise<{ success: boolean; error?: string }> {
  // First check if the rule exists
  const rule = await getPairingRuleById(db, id);

  if (!rule) {
    return {
      success: false,
      error: 'Pairing rule not found',
    };
  }

  await db.runAsync('DELETE FROM pairing_rules WHERE id = ?', [id]);

  return { success: true };
}

/**
 * Checks if a pairing rule already exists for a given ingredient pair.
 * Checks both directions (A-B and B-A).
 * @param db - Database adapter instance
 * @param ingredientAId - First ingredient UUID
 * @param ingredientBId - Second ingredient UUID
 * @returns True if a rule for this pair exists
 */
export async function pairingRuleExists(
  db: DatabaseAdapter,
  ingredientAId: string,
  ingredientBId: string
): Promise<boolean> {
  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM pairing_rules
     WHERE (ingredient_a_id = ? AND ingredient_b_id = ?)
        OR (ingredient_a_id = ? AND ingredient_b_id = ?)`,
    [ingredientAId, ingredientBId, ingredientBId, ingredientAId]
  );
  return result ? result.count > 0 : false;
}

/**
 * Gets the pairing rule for a specific ingredient pair if it exists.
 * Checks both directions (A-B and B-A).
 * @param db - Database adapter instance
 * @param ingredientAId - First ingredient UUID
 * @param ingredientBId - Second ingredient UUID
 * @returns The pairing rule or null if none exists
 */
export async function getPairingRuleForPair(
  db: DatabaseAdapter,
  ingredientAId: string,
  ingredientBId: string
): Promise<PairingRule | null> {
  const row = await db.getFirstAsync<PairingRuleRow>(
    `SELECT id, ingredient_a_id, ingredient_b_id, rule_type, created_at
     FROM pairing_rules
     WHERE (ingredient_a_id = ? AND ingredient_b_id = ?)
        OR (ingredient_a_id = ? AND ingredient_b_id = ?)`,
    [ingredientAId, ingredientBId, ingredientBId, ingredientAId]
  );
  return row ? rowToPairingRule(row) : null;
}

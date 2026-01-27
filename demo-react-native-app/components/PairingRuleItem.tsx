import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from '../constants/colors';
import type { PairingRule, Ingredient } from '../types/database';

interface PairingRuleItemProps {
  rule: PairingRule;
  ingredients: Ingredient[];
  onDelete: (ruleId: string) => void;
}

export function PairingRuleItem({ rule, ingredients, onDelete }: PairingRuleItemProps) {
  const { t } = useTranslation('settings');

  const ingredientA = ingredients.find((i) => i.id === rule.ingredientAId);
  const ingredientB = ingredients.find((i) => i.id === rule.ingredientBId);

  const symbol = rule.ruleType === 'positive' ? '↔' : '✗';
  const symbolColor = rule.ruleType === 'positive' ? '#4CAF50' : colors.error;

  return (
    <View style={styles.container} testID={`pairing-rule-${rule.id}`}>
      <View style={styles.ingredientPair}>
        <Text style={styles.ingredientName}>
          {ingredientA?.name || 'Unknown'}
        </Text>
        <Text style={[styles.symbol, { color: symbolColor }]}>{symbol}</Text>
        <Text style={styles.ingredientName}>
          {ingredientB?.name || 'Unknown'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(rule.id)}
        testID={`delete-rule-${rule.id}`}
      >
        <Text style={styles.deleteButtonText}>{t('pairingRules.delete')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  ingredientPair: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  symbol: {
    fontSize: 18,
    marginHorizontal: 4,
  },
  deleteButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  deleteButtonText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
});

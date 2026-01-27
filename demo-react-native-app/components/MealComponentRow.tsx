import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { PreparationMethod } from '@/types/database';

interface MealComponentRowProps {
  ingredientName: string;
  selectedMethod: PreparationMethod | null;
  onPress: () => void;
  testID?: string;
}

/**
 * Displays an ingredient with its selected preparation method.
 * Tapping opens the PreparationMethodPicker modal.
 */
export function MealComponentRow({
  ingredientName,
  selectedMethod,
  onPress,
  testID,
}: MealComponentRowProps) {
  const { t } = useTranslation('suggestions');

  // Format the display text for the selected method
  const getMethodDisplayText = () => {
    if (!selectedMethod) {
      return t('preparation.none');
    }
    // For predefined methods, use i18n translation; for custom methods, use the name as-is
    return selectedMethod.isPredefined
      ? t(`prepMethods.${selectedMethod.name}`, { defaultValue: selectedMethod.name })
      : selectedMethod.name;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      testID={testID || `meal-component-row-${ingredientName}`}
      activeOpacity={0.7}
    >
      <Text style={styles.ingredientName}>{ingredientName}</Text>
      <View style={styles.methodSelector}>
        <Text style={[styles.methodText, !selectedMethod && styles.methodTextNone]}>
          {getMethodDisplayText()}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2f36',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  ingredientName: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  methodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a4049',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  methodText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  methodTextNone: {
    color: '#9dabb9',
  },
  chevron: {
    color: '#9dabb9',
    fontSize: 10,
  },
});

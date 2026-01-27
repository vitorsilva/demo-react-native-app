import { useTranslation } from 'react-i18next';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface MealNameInputProps {
  value: string;
  onChangeText: (text: string) => void;
  testID?: string;
}

/**
 * Optional text input for naming a meal.
 * Allows users to give custom names like "Mom's special" to their meal combinations.
 */
export function MealNameInput({ value, onChangeText, testID }: MealNameInputProps) {
  const { t } = useTranslation('suggestions');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('mealName.label')}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={t('mealName.placeholder')}
        placeholderTextColor="#6b7280"
        testID={testID || 'meal-name-input'}
        maxLength={100}
        autoCapitalize="sentences"
        returnKeyType="done"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#9dabb9',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2a2f36',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a4049',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
});

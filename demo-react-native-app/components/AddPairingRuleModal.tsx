import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { colors } from '../constants/colors';
import { modalStyles } from '../constants/shared-styles';
import type { Ingredient } from '../types/database';

interface AddPairingRuleModalProps {
  visible: boolean;
  ruleType: 'positive' | 'negative';
  ingredients: Ingredient[];
  onClose: () => void;
  onAdd: (ingredientAId: string, ingredientBId: string) => void;
}

export function AddPairingRuleModal({
  visible,
  ruleType,
  ingredients,
  onClose,
  onAdd,
}: AddPairingRuleModalProps) {
  const { t } = useTranslation('settings');
  const [ingredientA, setIngredientA] = useState<string | null>(null);
  const [ingredientB, setIngredientB] = useState<string | null>(null);
  const [selectingFor, setSelectingFor] = useState<'A' | 'B' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible) {
      setIngredientA(null);
      setIngredientB(null);
      setSelectingFor(null);
      setError(null);
    }
  }, [visible]);

  const handleSelectIngredient = (ingredientId: string) => {
    if (selectingFor === 'A') {
      setIngredientA(ingredientId);
    } else if (selectingFor === 'B') {
      setIngredientB(ingredientId);
    }
    setSelectingFor(null);
    setError(null);
  };

  const handleAdd = () => {
    if (!ingredientA || !ingredientB) {
      setError(t('pairingRules.validation.selectBoth'));
      return;
    }
    if (ingredientA === ingredientB) {
      setError(t('pairingRules.validation.sameIngredient'));
      return;
    }
    onAdd(ingredientA, ingredientB);
  };

  const getIngredientName = (id: string | null) => {
    if (!id) return t('pairingRules.selectIngredient');
    const ingredient = ingredients.find((i) => i.id === id);
    return ingredient?.name || t('pairingRules.selectIngredient');
  };

  // Active ingredients only
  const activeIngredients = ingredients.filter((i) => i.is_active);

  const title = ruleType === 'positive'
    ? t('pairingRules.addGoodPair')
    : t('pairingRules.addAvoidPair');

  const relationText = ruleType === 'positive'
    ? t('pairingRules.pairsWellWith')
    : t('pairingRules.shouldAvoid');

  // If we're selecting an ingredient, show the selection list
  if (selectingFor) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectingFor(null)}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={[modalStyles.modalContent, styles.selectionModal]}>
            <Text style={modalStyles.modalTitle}>
              {selectingFor === 'A' ? t('pairingRules.firstIngredient') : t('pairingRules.secondIngredient')}
            </Text>

            <ScrollView style={styles.ingredientList}>
              {activeIngredients.map((ingredient) => {
                // Filter out already selected ingredient
                const isDisabled = selectingFor === 'B' && ingredient.id === ingredientA;

                return (
                  <TouchableOpacity
                    key={ingredient.id}
                    style={[styles.ingredientItem, isDisabled && styles.ingredientItemDisabled]}
                    onPress={() => !isDisabled && handleSelectIngredient(ingredient.id)}
                    disabled={isDisabled}
                    testID={`select-ingredient-${ingredient.id}`}
                  >
                    <Text style={[styles.ingredientName, isDisabled && styles.ingredientNameDisabled]}>
                      {ingredient.name}
                    </Text>
                    <Text style={styles.ingredientCategory}>{ingredient.category}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectingFor(null)}
              testID="back-button"
            >
              <Text style={styles.backButtonText}>{t('common:buttons.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContent}>
          <Text style={modalStyles.modalTitle}>{title}</Text>

          {/* First ingredient selector */}
          <Text style={modalStyles.inputLabel}>{t('pairingRules.firstIngredient')}</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setSelectingFor('A')}
            testID="select-ingredient-a"
          >
            <Text style={[styles.selectorText, !ingredientA && styles.selectorPlaceholder]}>
              {getIngredientName(ingredientA)}
            </Text>
            <Text style={styles.selectorArrow}>▼</Text>
          </TouchableOpacity>

          {/* Relation text */}
          <Text style={styles.relationText}>{relationText}</Text>

          {/* Second ingredient selector */}
          <Text style={modalStyles.inputLabel}>{t('pairingRules.secondIngredient')}</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setSelectingFor('B')}
            testID="select-ingredient-b"
          >
            <Text style={[styles.selectorText, !ingredientB && styles.selectorPlaceholder]}>
              {getIngredientName(ingredientB)}
            </Text>
            <Text style={styles.selectorArrow}>▼</Text>
          </TouchableOpacity>

          {/* Error message */}
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          {/* Action buttons */}
          <View style={modalStyles.modalButtons}>
            <TouchableOpacity
              style={modalStyles.cancelButton}
              onPress={onClose}
              testID="cancel-pairing-rule"
            >
              <Text style={modalStyles.cancelButtonText}>{t('common:buttons.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={modalStyles.saveButton}
              onPress={handleAdd}
              testID="save-pairing-rule"
            >
              <Text style={modalStyles.saveButtonText}>{t('common:buttons.add')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  selectionModal: {
    maxHeight: '80%',
  },
  ingredientList: {
    maxHeight: 300,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundInput,
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
  },
  ingredientItemDisabled: {
    opacity: 0.4,
  },
  ingredientName: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  ingredientNameDisabled: {
    color: colors.textSecondary,
  },
  ingredientCategory: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundInput,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  selectorText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  selectorPlaceholder: {
    color: colors.textSecondary,
  },
  selectorArrow: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  relationText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  backButton: {
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.backgroundInactive,
    alignItems: 'center',
    marginTop: 16,
  },
  backButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
});

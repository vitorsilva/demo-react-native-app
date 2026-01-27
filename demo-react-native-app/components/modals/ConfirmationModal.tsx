import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { MealComponentRow } from '@/components/MealComponentRow';
import { MealNameInput } from '@/components/MealNameInput';
import { PreparationMethodPicker } from '@/components/PreparationMethodPicker';
import { haptics } from '@/lib/utils/haptics';
import type { Ingredient, PreparationMethod } from '@/types/database';

/**
 * Component data structure for the confirmation modal.
 * Tracks ingredient + preparation method selections.
 */
export interface MealComponentSelection {
  ingredientId: string;
  ingredientName: string;
  preparationMethodId: string | null;
}

interface ConfirmationModalProps {
  visible: boolean;
  mealType: string;
  /** Full ingredient objects for component selection */
  ingredientObjects: Ingredient[];
  /** Legacy support: ingredient names for backward compatibility */
  ingredients?: string[];
  /** Available preparation methods from the store */
  preparationMethods: PreparationMethod[];
  /** Callback when user confirms the meal */
  onDone: (components: MealComponentSelection[], mealName: string | undefined) => void;
  /** Callback to add a custom preparation method */
  onAddPreparationMethod: (name: string) => Promise<PreparationMethod>;
}

export function ConfirmationModal({
  visible,
  mealType,
  ingredientObjects,
  ingredients,
  preparationMethods,
  onDone,
  onAddPreparationMethod,
}: ConfirmationModalProps) {
  const { t } = useTranslation('suggestions');

  // State for meal name
  const [mealName, setMealName] = useState('');

  // State for component selections (ingredient + preparation method)
  const [componentSelections, setComponentSelections] = useState<MealComponentSelection[]>([]);

  // State for preparation method picker
  const [pickerVisible, setPickerVisible] = useState(false);
  const [activeIngredientIndex, setActiveIngredientIndex] = useState<number | null>(null);

  // Capitalize first letter for display
  const capitalizedMealType = mealType.charAt(0).toUpperCase() + mealType.slice(1);

  // Initialize component selections when modal opens
  useEffect(() => {
    if (visible && ingredientObjects.length > 0) {
      setComponentSelections(
        ingredientObjects.map((ing) => ({
          ingredientId: ing.id,
          ingredientName: ing.name,
          preparationMethodId: null,
        }))
      );
      setMealName('');
    }
  }, [visible, ingredientObjects]);

  const handleDone = () => {
    haptics.success();
    onDone(componentSelections, mealName.trim() || undefined);
  };

  const handleOpenPicker = (index: number) => {
    haptics.light();
    setActiveIngredientIndex(index);
    setPickerVisible(true);
  };

  const handleSelectMethod = (methodId: string | null) => {
    if (activeIngredientIndex === null) return;

    setComponentSelections((prev) =>
      prev.map((comp, i) =>
        i === activeIngredientIndex ? { ...comp, preparationMethodId: methodId } : comp
      )
    );
  };

  const handleClosePicker = () => {
    setPickerVisible(false);
    setActiveIngredientIndex(null);
  };

  // Get the preparation method for a given ID
  const getMethodById = (methodId: string | null): PreparationMethod | null => {
    if (!methodId) return null;
    return preparationMethods.find((m) => m.id === methodId) || null;
  };

  // Get the active ingredient name for the picker title
  const activeIngredientName =
    activeIngredientIndex !== null && componentSelections[activeIngredientIndex]
      ? componentSelections[activeIngredientIndex].ingredientName
      : '';

  // Get currently selected method ID for the picker
  const activeSelectedMethodId =
    activeIngredientIndex !== null && componentSelections[activeIngredientIndex]
      ? componentSelections[activeIngredientIndex].preparationMethodId
      : null;

  // Determine if we're in legacy mode (no ingredient objects provided)
  const isLegacyMode = ingredientObjects.length === 0 && ingredients && ingredients.length > 0;

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={handleDone}>
      {/* Semi-transparent overlay */}
      <View style={styles.overlay}>
        {/* Bottom sheet container */}
        <View style={styles.bottomSheet}>
          {/* Drag indicator */}
          <View style={styles.dragIndicator} />

          {/* Title */}
          <Text style={styles.title}>
            {t('confirmation.title', { mealType: capitalizedMealType })}
          </Text>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Meal Name Input */}
            {!isLegacyMode && (
              <MealNameInput
                value={mealName}
                onChangeText={setMealName}
                testID="meal-name-input"
              />
            )}

            {/* Selection label */}
            <Text style={styles.sectionLabel}>{t('confirmation.yourSelection')}</Text>

            {/* Component rows with preparation method selection */}
            {!isLegacyMode ? (
              componentSelections.map((comp, index) => (
                <MealComponentRow
                  key={comp.ingredientId}
                  ingredientName={comp.ingredientName}
                  selectedMethod={getMethodById(comp.preparationMethodId)}
                  onPress={() => handleOpenPicker(index)}
                  testID={`meal-component-${index}`}
                />
              ))
            ) : (
              /* Legacy mode: simple ingredient list */
              <View style={styles.legacyIngredientsList}>
                {ingredients?.map((ingredient, index) => (
                  <Text key={index} style={styles.legacyIngredientText}>
                    {ingredient}
                  </Text>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Enjoy message */}
          <Text style={styles.enjoyMessage}>{t('confirmation.enjoyMessage')}</Text>

          {/* Done button */}
          <TouchableOpacity style={styles.doneButton} onPress={handleDone} testID="done-button">
            <Text style={styles.doneButtonText}>{t('confirmation.done')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Preparation Method Picker Modal */}
      <PreparationMethodPicker
        visible={pickerVisible}
        ingredientName={activeIngredientName}
        preparationMethods={preparationMethods}
        selectedMethodId={activeSelectedMethodId}
        onSelect={handleSelectMethod}
        onAddCustom={onAddPreparationMethod}
        onClose={handleClosePicker}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#1c2127',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  dragIndicator: {
    width: 48,
    height: 4,
    backgroundColor: '#9dabb9',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  scrollContent: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: '#9dabb9',
    fontSize: 14,
    marginBottom: 12,
  },
  legacyIngredientsList: {
    marginBottom: 16,
  },
  legacyIngredientText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  enjoyMessage: {
    color: '#9dabb9',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  doneButton: {
    backgroundColor: '#3e96ef',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

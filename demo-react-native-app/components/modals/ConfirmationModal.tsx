import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

interface ConfirmationModalProps {
  visible: boolean;
  mealType: string; // Dynamic meal type name
  ingredients: string[];
  onDone: () => void;
}

export function ConfirmationModal({
  visible,
  mealType,
  ingredients,
  onDone,
}: ConfirmationModalProps) {
  const { t } = useTranslation('suggestions');

  // Capitalize first letter for display
  const capitalizedMealType = mealType.charAt(0).toUpperCase() + mealType.slice(1);

  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDone();
  };

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

          {/* Ingredients list */}
          <View style={styles.ingredientsList}>
            {ingredients.map((ingredient, index) => (
              <Text key={index} style={styles.ingredientText}>
                {ingredient}
              </Text>
            ))}
          </View>

          {/* Enjoy message */}
          <Text style={styles.enjoyMessage}>{t('confirmation.enjoyMessage')}</Text>

          {/* Done button */}
          <TouchableOpacity style={styles.doneButton} onPress={handleDone} testID="done-button">
            <Text style={styles.doneButtonText}>{t('confirmation.done')}</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    minHeight: 300,
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
  ingredientsList: {
    marginBottom: 24,
  },
  ingredientText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  enjoyMessage: {
    color: '#9dabb9',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
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

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { haptics } from '@/lib/utils/haptics';
import type { PreparationMethod } from '@/types/database';

interface PreparationMethodPickerProps {
  visible: boolean;
  ingredientName: string;
  preparationMethods: PreparationMethod[];
  selectedMethodId: string | null;
  onSelect: (methodId: string | null) => void;
  onAddCustom: (name: string) => Promise<PreparationMethod>;
  onClose: () => void;
}

/**
 * Modal picker for selecting a preparation method for an ingredient.
 * Displays predefined methods and allows adding custom ones.
 */
export function PreparationMethodPicker({
  visible,
  ingredientName,
  preparationMethods,
  selectedMethodId,
  onSelect,
  onAddCustom,
  onClose,
}: PreparationMethodPickerProps) {
  const { t } = useTranslation('suggestions');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customMethodName, setCustomMethodName] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  const handleSelectMethod = (methodId: string | null) => {
    haptics.light();
    onSelect(methodId);
    onClose();
  };

  const handleAddCustom = async () => {
    if (!customMethodName.trim()) return;

    setIsAddingCustom(true);
    try {
      const newMethod = await onAddCustom(customMethodName.trim());
      haptics.success();
      onSelect(newMethod.id);
      setCustomMethodName('');
      setShowCustomInput(false);
      onClose();
    } catch {
      haptics.error();
    } finally {
      setIsAddingCustom(false);
    }
  };

  const handleCancel = () => {
    setShowCustomInput(false);
    setCustomMethodName('');
    onClose();
  };

  // Sort methods: predefined first (alphabetically), then custom (alphabetically)
  const sortedMethods = [...preparationMethods].sort((a, b) => {
    if (a.isPredefined !== b.isPredefined) {
      return a.isPredefined ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <View style={styles.bottomSheet}>
          {/* Drag indicator */}
          <View style={styles.dragIndicator} />

          {/* Title */}
          <Text style={styles.title}>
            {t('preparation.title', { ingredient: ingredientName })}
          </Text>

          <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
            {/* None option */}
            <TouchableOpacity
              style={[styles.optionRow, selectedMethodId === null && styles.optionRowSelected]}
              onPress={() => handleSelectMethod(null)}
              testID="prep-method-none"
            >
              <View style={[styles.radio, selectedMethodId === null && styles.radioSelected]}>
                {selectedMethodId === null && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.optionText}>{t('preparation.none')}</Text>
            </TouchableOpacity>

            {/* Preparation methods */}
            {sortedMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[styles.optionRow, selectedMethodId === method.id && styles.optionRowSelected]}
                onPress={() => handleSelectMethod(method.id)}
                testID={`prep-method-${method.id}`}
              >
                <View style={[styles.radio, selectedMethodId === method.id && styles.radioSelected]}>
                  {selectedMethodId === method.id && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.optionText}>
                  {method.isPredefined ? t(`prepMethods.${method.name}`, { defaultValue: method.name }) : method.name}
                </Text>
                {!method.isPredefined && (
                  <Text style={styles.customBadge}>{t('preparation.custom')}</Text>
                )}
              </TouchableOpacity>
            ))}

            {/* Separator */}
            <View style={styles.separator} />

            {/* Add custom option */}
            {showCustomInput ? (
              <View style={styles.customInputContainer}>
                <TextInput
                  style={styles.customInput}
                  value={customMethodName}
                  onChangeText={setCustomMethodName}
                  placeholder={t('preparation.customPlaceholder')}
                  placeholderTextColor="#6b7280"
                  autoFocus
                  maxLength={50}
                  testID="custom-prep-method-input"
                />
                <TouchableOpacity
                  style={[styles.addButton, (!customMethodName.trim() || isAddingCustom) && styles.addButtonDisabled]}
                  onPress={handleAddCustom}
                  disabled={!customMethodName.trim() || isAddingCustom}
                  testID="add-custom-prep-method-button"
                >
                  <Text style={styles.addButtonText}>{t('preparation.add')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => setShowCustomInput(true)}
                testID="show-add-custom-input"
              >
                <Text style={styles.addCustomText}>{t('preparation.addCustom')}</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} testID="prep-picker-cancel">
              <Text style={styles.cancelButtonText}>{t('preparation.cancel')}</Text>
            </TouchableOpacity>
          </View>
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
    maxHeight: '70%',
  },
  dragIndicator: {
    width: 48,
    height: 4,
    backgroundColor: '#9dabb9',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  optionsList: {
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  optionRowSelected: {
    backgroundColor: 'rgba(62, 150, 239, 0.1)',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6b7280',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#3e96ef',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3e96ef',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  customBadge: {
    color: '#9dabb9',
    fontSize: 12,
    backgroundColor: '#2a2f36',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#3a4049',
    marginVertical: 8,
  },
  addCustomText: {
    color: '#3e96ef',
    fontSize: 16,
    paddingVertical: 4,
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  customInput: {
    flex: 1,
    backgroundColor: '#2a2f36',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a4049',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#3e96ef',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    color: '#9dabb9',
    fontSize: 16,
  },
});

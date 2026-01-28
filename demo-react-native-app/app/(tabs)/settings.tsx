import Slider from '@react-native-community/slider';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { modalStyles } from '../../constants/shared-styles';
import {
  SUPPORTED_LANGUAGES,
  getCurrentLanguage,
  changeLanguage,
} from '../../lib/i18n';
import { useStore } from '../../lib/store';
import { trackScreenView } from '../../lib/telemetry/screenTracking';
import type { MealType, PreparationMethod } from '../../types/database';

export default function SettingsScreen() {
  const { t } = useTranslation('settings');
  const router = useRouter();

  // Zustand store selectors
  const isDatabaseReady = useStore((state) => state.isDatabaseReady);
  const preferences = useStore((state) => state.preferences);
  const mealTypes = useStore((state) => state.mealTypes);
  const preparationMethods = useStore((state) => state.preparationMethods);
  const isLoading = useStore((state) => state.isLoading);
  const error = useStore((state) => state.error);

  // Store actions
  const loadPreferences = useStore((state) => state.loadPreferences);
  const updatePreferences = useStore((state) => state.updatePreferences);
  const loadMealTypes = useStore((state) => state.loadMealTypes);
  const addMealType = useStore((state) => state.addMealType);
  const updateMealType = useStore((state) => state.updateMealType);
  const deleteMealType = useStore((state) => state.deleteMealType);
  const loadPreparationMethods = useStore((state) => state.loadPreparationMethods);
  const addPreparationMethod = useStore((state) => state.addPreparationMethod);
  const deletePreparationMethod = useStore((state) => state.deletePreparationMethod);
  const resetAppData = useStore((state) => state.resetAppData);

  // Local state
  const [expandedMealType, setExpandedMealType] = useState<string | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newMealTypeName, setNewMealTypeName] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());
  const [isAddPrepMethodModalVisible, setIsAddPrepMethodModalVisible] = useState(false);
  const [newPrepMethodName, setNewPrepMethodName] = useState('');
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Load data when database is ready
  useEffect(() => {
    if (isDatabaseReady) {
      loadPreferences();
      loadMealTypes();
      loadPreparationMethods();
    }
  }, [isDatabaseReady, loadPreferences, loadMealTypes, loadPreparationMethods]);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      trackScreenView('settings');
      if (isDatabaseReady) {
        loadMealTypes();
        loadPreparationMethods();
      }
    }, [isDatabaseReady, loadMealTypes, loadPreparationMethods])
  );

  // Handle cooldown days change
  const handleCooldownChange = async (value: number) => {
    await updatePreferences({
      ...preferences,
      cooldownDays: Math.round(value),
    });
  };

  // Handle suggestions count change
  const handleSuggestionsCountChange = async (value: number) => {
    await updatePreferences({
      ...preferences,
      suggestionsCount: Math.round(value),
    });
  };

  // Handle meal type active toggle
  const handleToggleMealTypeActive = async (mealType: MealType) => {
    await updateMealType(mealType.id, { is_active: !mealType.is_active });
  };

  // Handle meal type setting changes
  const handleMealTypeSettingChange = async (
    mealType: MealType,
    field: 'min_ingredients' | 'max_ingredients' | 'default_cooldown_days',
    value: number
  ) => {
    const roundedValue = Math.round(value);

    // Validate min <= max
    if (field === 'min_ingredients' && roundedValue > mealType.max_ingredients) {
      return; // Don't allow min > max
    }
    if (field === 'max_ingredients' && roundedValue < mealType.min_ingredients) {
      return; // Don't allow max < min
    }

    await updateMealType(mealType.id, { [field]: roundedValue });
  };

  // Handle add meal type
  const handleAddMealType = async () => {
    const trimmedName = newMealTypeName.trim();
    if (!trimmedName) {
      Alert.alert(t('errors:generic.error'), t('mealTypes.validation.nameRequired'));
      return;
    }

    // Check for duplicate name
    const exists = mealTypes.some(
      (mt) => mt.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) {
      Alert.alert(t('errors:generic.error'), t('mealTypes.validation.nameTaken'));
      return;
    }

    await addMealType({
      name: trimmedName,
      min_ingredients: 2,
      max_ingredients: 4,
      default_cooldown_days: 3,
      is_active: true,
    });

    setIsAddModalVisible(false);
    setNewMealTypeName('');
  };

  // Handle delete meal type
  const handleDeleteMealType = async (mealType: MealType) => {
    Alert.alert(
      t('mealTypes.delete'),
      t('mealTypes.deleteConfirm', { name: mealType.name }),
      [
        { text: t('common:buttons.cancel'), style: 'cancel' },
        {
          text: t('mealTypes.delete'),
          style: 'destructive',
          onPress: async () => {
            const result = await deleteMealType(mealType.id);
            if (!result.success && result.error) {
              Alert.alert(t('errors:generic.error'), result.error);
            }
          },
        },
      ]
    );
  };

  // Handle add preparation method
  const handleAddPrepMethod = async () => {
    const trimmedName = newPrepMethodName.trim();
    if (!trimmedName) {
      Alert.alert(t('errors:generic.error'), t('preparationMethods.validation.nameRequired'));
      return;
    }

    // Check for duplicate name
    const exists = preparationMethods.some(
      (pm) => pm.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) {
      Alert.alert(t('errors:generic.error'), t('preparationMethods.validation.nameTaken'));
      return;
    }

    try {
      await addPreparationMethod(trimmedName);
      setIsAddPrepMethodModalVisible(false);
      setNewPrepMethodName('');
    } catch {
      Alert.alert(t('errors:generic.error'), t('preparationMethods.validation.nameTaken'));
    }
  };

  // Handle delete preparation method
  const handleDeletePrepMethod = async (method: PreparationMethod) => {
    Alert.alert(
      t('preparationMethods.delete'),
      t('preparationMethods.deleteConfirm', { name: method.name }),
      [
        { text: t('common:buttons.cancel'), style: 'cancel' },
        {
          text: t('preparationMethods.delete'),
          style: 'destructive',
          onPress: async () => {
            const result = await deletePreparationMethod(method.id);
            if (!result.success && result.error) {
              Alert.alert(t('errors:generic.error'), result.error);
            }
          },
        },
      ]
    );
  };

  // Handle language change
  const handleLanguageChange = async (langCode: string) => {
    const newLang = await changeLanguage(langCode);
    setCurrentLanguage(newLang);
  };

  // Handle haptic toggle
  const handleHapticToggle = async (value: boolean) => {
    await updatePreferences({
      ...preferences,
      hapticEnabled: value,
    });
  };

  // Handle reset app data
  const handleResetAppData = async () => {
    setIsResetting(true);
    try {
      await resetAppData();
      setIsResetModalVisible(false);
      Alert.alert(t('common:buttons.success'), t('dataManagement.resetSuccess'));
    } catch {
      Alert.alert(t('errors:generic.error'), t('errors:generic.unknownError'));
    } finally {
      setIsResetting(false);
    }
  };

  // Toggle expanded meal type
  const toggleExpandMealType = (id: string) => {
    setExpandedMealType(expandedMealType === id ? null : id);
  };

  // Render meal type item
  const renderMealTypeItem = (mealType: MealType) => {
    const isExpanded = expandedMealType === mealType.id;

    return (
      <View
        key={mealType.id}
        style={[styles.mealTypeItem, !mealType.is_active && styles.mealTypeItemInactive]}
        testID={`meal-type-${mealType.id}`}
      >
        {/* Header row */}
        <TouchableOpacity
          style={styles.mealTypeHeader}
          onPress={() => toggleExpandMealType(mealType.id)}
          testID={`meal-type-expand-${mealType.id}`}
        >
          <View style={styles.mealTypeInfo}>
            <Text
              style={[
                styles.mealTypeName,
                !mealType.is_active && styles.mealTypeNameInactive,
              ]}
            >
              {mealType.name}
            </Text>
            <Text style={styles.mealTypeSummary}>
              {mealType.min_ingredients}-{mealType.max_ingredients}{' '}
              {t('mealTypes.expanded.ingredients_other', { count: mealType.max_ingredients }).replace(`${mealType.max_ingredients} `, '')} |{' '}
              {t('mealTypes.expanded.cooldown', { count: mealType.default_cooldown_days })}
            </Text>
          </View>
          <View style={styles.mealTypeActions}>
            <Switch
              value={mealType.is_active}
              onValueChange={() => handleToggleMealTypeActive(mealType)}
              trackColor={{ false: '#3e3e3e', true: '#3e96ef' }}
              thumbColor={mealType.is_active ? '#FFFFFF' : '#9dabb9'}
              testID={`meal-type-toggle-${mealType.id}`}
            />
            <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
          </View>
        </TouchableOpacity>

        {/* Expanded settings */}
        {isExpanded && (
          <View style={styles.mealTypeSettings}>
            {/* Min Ingredients */}
            <View style={styles.sliderRow}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>{t('mealTypes.minIngredients')}</Text>
                <Text style={styles.sliderValue}>{mealType.min_ingredients}</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={6}
                step={1}
                value={mealType.min_ingredients}
                onSlidingComplete={(value) =>
                  handleMealTypeSettingChange(mealType, 'min_ingredients', value)
                }
                minimumTrackTintColor="#3e96ef"
                maximumTrackTintColor="#4a5568"
                thumbTintColor="#3e96ef"
              />
            </View>

            {/* Max Ingredients */}
            <View style={styles.sliderRow}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>{t('mealTypes.maxIngredients')}</Text>
                <Text style={styles.sliderValue}>{mealType.max_ingredients}</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={8}
                step={1}
                value={mealType.max_ingredients}
                onSlidingComplete={(value) =>
                  handleMealTypeSettingChange(mealType, 'max_ingredients', value)
                }
                minimumTrackTintColor="#3e96ef"
                maximumTrackTintColor="#4a5568"
                thumbTintColor="#3e96ef"
              />
            </View>

            {/* Cooldown Days */}
            <View style={styles.sliderRow}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>{t('mealTypes.cooldown')}</Text>
                <Text style={styles.sliderValue}>
                  {mealType.default_cooldown_days}
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={7}
                step={1}
                value={mealType.default_cooldown_days}
                onSlidingComplete={(value) =>
                  handleMealTypeSettingChange(mealType, 'default_cooldown_days', value)
                }
                minimumTrackTintColor="#3e96ef"
                maximumTrackTintColor="#4a5568"
                thumbTintColor="#3e96ef"
              />
            </View>

            {/* Delete button */}
            <TouchableOpacity
              style={styles.deleteMealTypeButton}
              onPress={() => handleDeleteMealType(mealType)}
              testID={`meal-type-delete-${mealType.id}`}
            >
              <Text style={styles.deleteMealTypeButtonText}>{t('mealTypes.delete')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('title')}</Text>

        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* === LANGUAGE SECTION === */}
        <Text style={styles.sectionTitle}>{t('language.title')}</Text>

        <View style={styles.languageList}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageCard,
                currentLanguage === lang.code && styles.languageCardSelected,
              ]}
              onPress={() => handleLanguageChange(lang.code)}
              testID={`language-option-${lang.code}`}
            >
              <Text style={styles.languageFlag}>{lang.flag}</Text>
              <Text style={styles.languageName}>{lang.name}</Text>
              {currentLanguage === lang.code && (
                <Text style={styles.languageCheck}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* === EXPERIENCE SECTION === */}
        <Text style={styles.sectionTitle}>{t('experience.title')}</Text>

        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <View style={styles.hapticLabelContainer}>
              <Text style={styles.settingLabel}>{t('experience.hapticFeedback')}</Text>
              <Text style={styles.hapticDescription}>{t('experience.hapticDescription')}</Text>
            </View>
            <Switch
              value={preferences.hapticEnabled}
              onValueChange={handleHapticToggle}
              trackColor={{ false: '#3e3e3e', true: '#3e96ef' }}
              thumbColor={preferences.hapticEnabled ? '#FFFFFF' : '#9dabb9'}
              testID="haptic-toggle"
            />
          </View>
        </View>

        {/* === GLOBAL PREFERENCES SECTION === */}
        <Text style={styles.sectionTitle}>{t('globalPreferences.title')}</Text>

        {/* Cooldown Days Setting */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <Text style={styles.settingLabel}>{t('globalPreferences.varietyCooldown.title')}</Text>
            <Text style={styles.settingValue}>
              {t('globalPreferences.varietyCooldown.day_other', { count: preferences.cooldownDays })}
            </Text>
          </View>
          <Text style={styles.settingDescription}>
            {t('globalPreferences.varietyCooldown.description')}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={7}
            step={1}
            value={preferences.cooldownDays}
            onSlidingComplete={handleCooldownChange}
            minimumTrackTintColor="#3e96ef"
            maximumTrackTintColor="#4a5568"
            thumbTintColor="#3e96ef"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>
              {t('globalPreferences.varietyCooldown.day_one', { count: 1 })}
            </Text>
            <Text style={styles.sliderLabelText}>
              {t('globalPreferences.varietyCooldown.day_other', { count: 7 })}
            </Text>
          </View>
        </View>

        {/* Suggestions Count Setting */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <Text style={styles.settingLabel}>{t('globalPreferences.suggestions.title')}</Text>
            <Text style={styles.settingValue}>{preferences.suggestionsCount}</Text>
          </View>
          <Text style={styles.settingDescription}>
            {t('globalPreferences.suggestions.description')}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={2}
            maximumValue={6}
            step={1}
            value={preferences.suggestionsCount}
            onSlidingComplete={handleSuggestionsCountChange}
            minimumTrackTintColor="#3e96ef"
            maximumTrackTintColor="#4a5568"
            thumbTintColor="#3e96ef"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>2</Text>
            <Text style={styles.sliderLabelText}>6</Text>
          </View>
        </View>

        {/* === PREPARATION METHODS SECTION === */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t('preparationMethods.title')}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setNewPrepMethodName('');
              setIsAddPrepMethodModalVisible(true);
            }}
            testID="add-prep-method-button"
          >
            <Text style={styles.addButtonText}>+ {t('preparationMethods.add')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionDescription}>
          {t('preparationMethods.description')}
        </Text>

        {/* System methods */}
        <View style={styles.prepMethodSection} testID="system-prep-methods">
          <Text style={styles.prepMethodSectionTitle}>{t('preparationMethods.system')}</Text>
          <Text style={styles.prepMethodSectionDescription}>{t('preparationMethods.systemDescription')}</Text>
          <View style={styles.prepMethodChips}>
            {preparationMethods
              .filter((pm) => pm.isPredefined)
              .map((method) => (
                <View key={method.id} style={styles.prepMethodChip} testID={`system-method-${method.id}`}>
                  <Text style={styles.prepMethodChipText}>{method.name}</Text>
                </View>
              ))}
          </View>
        </View>

        {/* Custom methods */}
        <View style={styles.prepMethodSection} testID="custom-prep-methods">
          <Text style={styles.prepMethodSectionTitle}>{t('preparationMethods.custom')}</Text>
          <Text style={styles.prepMethodSectionDescription}>{t('preparationMethods.customDescription')}</Text>
          {preparationMethods.filter((pm) => !pm.isPredefined).length === 0 ? (
            <Text style={styles.prepMethodEmptyText}>{t('preparationMethods.noCustom')}</Text>
          ) : (
            <View style={styles.customMethodsList}>
              {preparationMethods
                .filter((pm) => !pm.isPredefined)
                .map((method) => (
                  <View key={method.id} style={styles.customMethodItem} testID={`custom-method-${method.id}`}>
                    <Text style={styles.customMethodName}>{method.name}</Text>
                    <TouchableOpacity
                      style={styles.deleteMethodButton}
                      onPress={() => handleDeletePrepMethod(method)}
                      testID={`delete-method-${method.id}`}
                    >
                      <Text style={styles.deleteMethodButtonText}>{t('preparationMethods.delete')}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
          )}
        </View>

        {/* === MEAL TYPES SECTION === */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t('mealTypes.title')}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setNewMealTypeName('');
              setIsAddModalVisible(true);
            }}
            testID="add-meal-type-button"
          >
            <Text style={styles.addButtonText}>+ {t('mealTypes.add')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionDescription}>
          {t('mealTypes.description')}
        </Text>

        {/* Loading state */}
        {isLoading && mealTypes.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3e96ef" />
            <Text style={styles.loadingText}>{t('common:loading')}</Text>
          </View>
        )}

        {/* Meal types list */}
        {mealTypes.length === 0 && !isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{t('common:noItems')}</Text>
            <Text style={styles.emptyStateSubtext}>
              {t('mealTypes.addNew')}
            </Text>
          </View>
        ) : (
          <View style={styles.mealTypesList}>
            {mealTypes.map(renderMealTypeItem)}
          </View>
        )}

        {/* === PAIRING RULES SECTION === */}
        <Text style={styles.sectionTitle}>{t('pairingRules.title')}</Text>
        <Text style={styles.sectionDescription}>{t('pairingRules.description')}</Text>

        <TouchableOpacity
          style={styles.navigationCard}
          onPress={() => router.push('/pairing-rules')}
          testID="pairing-rules-link"
        >
          <Text style={styles.navigationCardText}>{t('pairingRules.title')}</Text>
          <Text style={styles.navigationCardArrow}>→</Text>
        </TouchableOpacity>

        {/* === DATA MANAGEMENT SECTION === */}
        <Text style={styles.sectionTitle}>{t('dataManagement.title')}</Text>

        <View style={styles.dataManagementCard} testID="data-management-section">
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => setIsResetModalVisible(true)}
            testID="reset-app-data-button"
          >
            <Text style={styles.resetButtonText}>{t('dataManagement.resetToDefaults')}</Text>
          </TouchableOpacity>
          <Text style={styles.resetDescription}>
            {t('dataManagement.resetDescription')}
          </Text>
          <Text style={styles.resetWarning}>
            ⚠️ {t('dataManagement.resetWarning')}
          </Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t('about.title')}</Text>
          <Text style={styles.infoText}>
            {t('about.globalDescription')}
          </Text>
          <Text style={styles.infoText}>
            {t('about.mealTypesDescription')}
          </Text>
        </View>
      </ScrollView>

      {/* Add Meal Type Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContent}>
            <Text style={modalStyles.modalTitle}>{t('mealTypes.addNew')}</Text>

            <Text style={modalStyles.inputLabel}>{t('mealTypes.name')}</Text>
            <TextInput
              style={modalStyles.textInput}
              value={newMealTypeName}
              onChangeText={setNewMealTypeName}
              placeholder={t('mealTypes.namePlaceholder')}
              placeholderTextColor="#9dabb9"
              autoFocus
              testID="meal-type-name-input"
            />

            <View style={modalStyles.modalButtons}>
              <TouchableOpacity
                style={modalStyles.cancelButton}
                onPress={() => {
                  setIsAddModalVisible(false);
                  setNewMealTypeName('');
                }}
                testID="cancel-button"
              >
                <Text style={modalStyles.cancelButtonText}>{t('common:buttons.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={modalStyles.saveButton}
                onPress={handleAddMealType}
                testID="save-button"
              >
                <Text style={modalStyles.saveButtonText}>{t('common:buttons.add')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Preparation Method Modal */}
      <Modal
        visible={isAddPrepMethodModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddPrepMethodModalVisible(false)}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContent}>
            <Text style={modalStyles.modalTitle}>{t('preparationMethods.addNew')}</Text>

            <Text style={modalStyles.inputLabel}>{t('preparationMethods.name')}</Text>
            <TextInput
              style={modalStyles.textInput}
              value={newPrepMethodName}
              onChangeText={setNewPrepMethodName}
              placeholder={t('preparationMethods.namePlaceholder')}
              placeholderTextColor="#9dabb9"
              autoFocus
              testID="prep-method-name-input"
            />

            <View style={modalStyles.modalButtons}>
              <TouchableOpacity
                style={modalStyles.cancelButton}
                onPress={() => {
                  setIsAddPrepMethodModalVisible(false);
                  setNewPrepMethodName('');
                }}
                testID="cancel-prep-method-button"
              >
                <Text style={modalStyles.cancelButtonText}>{t('common:buttons.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={modalStyles.saveButton}
                onPress={handleAddPrepMethod}
                testID="save-prep-method-button"
              >
                <Text style={modalStyles.saveButtonText}>{t('common:buttons.add')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reset App Data Confirmation Modal */}
      <Modal
        visible={isResetModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !isResetting && setIsResetModalVisible(false)}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContent}>
            <Text style={modalStyles.modalTitle}>{t('dataManagement.resetConfirmTitle')}</Text>

            <Text style={styles.resetModalMessage}>
              {t('dataManagement.resetConfirmMessage')}
            </Text>

            <View style={modalStyles.modalButtons}>
              <TouchableOpacity
                style={[modalStyles.cancelButton, isResetting && styles.buttonDisabled]}
                onPress={() => setIsResetModalVisible(false)}
                disabled={isResetting}
                testID="cancel-reset-button"
              >
                <Text style={modalStyles.cancelButtonText}>{t('dataManagement.resetCancelButton')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.resetConfirmButton, isResetting && styles.buttonDisabled]}
                onPress={handleResetAppData}
                disabled={isResetting}
                testID="confirm-reset-button"
              >
                {isResetting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.resetConfirmButtonText}>{t('dataManagement.resetConfirmButton')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111418',
  },
  content: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  // Error
  errorContainer: {
    backgroundColor: '#ff4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // Section headers
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 8,
  },
  // Language picker
  languageList: {
    marginBottom: 24,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2329',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  languageCardSelected: {
    borderWidth: 2,
    borderColor: '#3e96ef',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  languageCheck: {
    fontSize: 18,
    color: '#3e96ef',
    fontWeight: 'bold',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#9BA1A6',
    marginBottom: 16,
  },
  // Setting cards
  settingCard: {
    backgroundColor: '#1f2329',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3e96ef',
  },
  settingDescription: {
    fontSize: 14,
    color: '#9BA1A6',
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderLabelText: {
    fontSize: 12,
    color: '#9BA1A6',
  },
  // Add button
  addButton: {
    backgroundColor: '#3e96ef',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Loading
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#9BA1A6',
    marginLeft: 8,
  },
  // Empty state
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#9BA1A6',
    fontSize: 14,
    textAlign: 'center',
  },
  // Meal types list
  mealTypesList: {
    marginBottom: 16,
  },
  mealTypeItem: {
    backgroundColor: '#1f2329',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  mealTypeItemInactive: {
    opacity: 0.7,
  },
  mealTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  mealTypeInfo: {
    flex: 1,
  },
  mealTypeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mealTypeNameInactive: {
    color: '#9BA1A6',
  },
  mealTypeSummary: {
    fontSize: 13,
    color: '#9BA1A6',
    marginTop: 4,
  },
  mealTypeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  expandIcon: {
    color: '#9BA1A6',
    fontSize: 12,
  },
  // Meal type expanded settings
  mealTypeSettings: {
    backgroundColor: '#171b20',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#283039',
  },
  sliderRow: {
    marginBottom: 16,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#9BA1A6',
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3e96ef',
  },
  deleteMealTypeButton: {
    backgroundColor: '#ff4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteMealTypeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Info card
  infoCard: {
    backgroundColor: '#1a2332',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3e96ef',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#9BA1A6',
    lineHeight: 20,
    marginBottom: 8,
  },
  infoBold: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Haptic settings
  hapticLabelContainer: {
    flex: 1,
  },
  hapticDescription: {
    fontSize: 13,
    color: '#9BA1A6',
    marginTop: 4,
  },
  // Preparation methods
  prepMethodSection: {
    backgroundColor: '#1f2329',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  prepMethodSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  prepMethodSectionDescription: {
    fontSize: 13,
    color: '#9BA1A6',
    marginBottom: 12,
  },
  prepMethodChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  prepMethodChip: {
    backgroundColor: '#283039',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  prepMethodChipText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  prepMethodEmptyText: {
    fontSize: 14,
    color: '#9BA1A6',
    fontStyle: 'italic',
  },
  customMethodsList: {
    gap: 8,
  },
  customMethodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#283039',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  customMethodName: {
    fontSize: 15,
    color: '#FFFFFF',
    flex: 1,
  },
  deleteMethodButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteMethodButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Navigation card
  navigationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1f2329',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  navigationCardText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  navigationCardArrow: {
    color: '#3e96ef',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Data Management
  dataManagementCard: {
    backgroundColor: '#1f2329',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: '#ff4444',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resetDescription: {
    fontSize: 14,
    color: '#9BA1A6',
    marginBottom: 8,
  },
  resetWarning: {
    fontSize: 13,
    color: '#ff8888',
  },
  resetModalMessage: {
    fontSize: 15,
    color: '#9BA1A6',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  resetConfirmButton: {
    backgroundColor: '#ff4444',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  resetConfirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

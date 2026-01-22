import Slider from '@react-native-community/slider';
import { useFocusEffect } from '@react-navigation/native';
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
import {
  SUPPORTED_LANGUAGES,
  getCurrentLanguage,
  changeLanguage,
} from '../../lib/i18n';
import { useStore } from '../../lib/store';
import { trackScreenView } from '../../lib/telemetry/screenTracking';
import type { MealType } from '../../types/database';

export default function SettingsScreen() {
  const { t } = useTranslation('settings');

  // Zustand store selectors
  const isDatabaseReady = useStore((state) => state.isDatabaseReady);
  const preferences = useStore((state) => state.preferences);
  const mealTypes = useStore((state) => state.mealTypes);
  const isLoading = useStore((state) => state.isLoading);
  const error = useStore((state) => state.error);

  // Store actions
  const loadPreferences = useStore((state) => state.loadPreferences);
  const updatePreferences = useStore((state) => state.updatePreferences);
  const loadMealTypes = useStore((state) => state.loadMealTypes);
  const addMealType = useStore((state) => state.addMealType);
  const updateMealType = useStore((state) => state.updateMealType);
  const deleteMealType = useStore((state) => state.deleteMealType);

  // Local state
  const [expandedMealType, setExpandedMealType] = useState<string | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newMealTypeName, setNewMealTypeName] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());

  // Load data when database is ready
  useEffect(() => {
    if (isDatabaseReady) {
      loadPreferences();
      loadMealTypes();
    }
  }, [isDatabaseReady, loadPreferences, loadMealTypes]);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      trackScreenView('settings');
      if (isDatabaseReady) {
        loadMealTypes();
      }
    }, [isDatabaseReady, loadMealTypes])
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

  // Handle language change
  const handleLanguageChange = async (langCode: string) => {
    const newLang = await changeLanguage(langCode);
    setCurrentLanguage(newLang);
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('mealTypes.addNew')}</Text>

            <Text style={styles.inputLabel}>{t('mealTypes.name')}</Text>
            <TextInput
              style={styles.textInput}
              value={newMealTypeName}
              onChangeText={setNewMealTypeName}
              placeholder={t('mealTypes.namePlaceholder')}
              placeholderTextColor="#9dabb9"
              autoFocus
              testID="meal-type-name-input"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsAddModalVisible(false);
                  setNewMealTypeName('');
                }}
                testID="cancel-button"
              >
                <Text style={styles.cancelButtonText}>{t('common:buttons.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddMealType}
                testID="save-button"
              >
                <Text style={styles.saveButtonText}>{t('common:buttons.add')}</Text>
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
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1f25',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    color: '#9dabb9',
    fontSize: 14,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#283039',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  modalHint: {
    color: '#9BA1A6',
    fontSize: 12,
    marginTop: 12,
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#283039',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#3e96ef',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

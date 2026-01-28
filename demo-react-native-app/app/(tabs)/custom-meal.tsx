import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
} from 'react-native';
import { MealNameInput } from '../../components/MealNameInput';
import {
  ConfirmationModal,
  MealComponentSelection,
} from '../../components/modals/ConfirmationModal';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/shared-styles';
import { useStore } from '../../lib/store';
import { logger } from '../../lib/telemetry/logger';
import { trackScreenView } from '../../lib/telemetry/screenTracking';
import {
  toggleIngredientSelection,
  isSelectionValid,
  isAtMaxIngredients,
  filterIngredientsByCategory,
  DEFAULT_MIN_INGREDIENTS,
  DEFAULT_MAX_INGREDIENTS,
} from '../../lib/utils/customMealSelection';
import { haptics } from '../../lib/utils/haptics';
import type { Ingredient, Category, MealType } from '../../types/database';

interface IngredientItemProps {
  ingredient: Ingredient;
  isSelected: boolean;
  categoryName: string;
  onToggle: (id: string) => void;
}

function IngredientItem({ ingredient, isSelected, categoryName, onToggle }: IngredientItemProps) {
  return (
    <TouchableOpacity
      style={[styles.ingredientItem, isSelected && styles.ingredientItemSelected]}
      onPress={() => onToggle(ingredient.id)}
      testID={`ingredient-item-${ingredient.id}`}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
    >
      <View style={styles.checkbox}>
        {isSelected && <View style={styles.checkboxInner} />}
      </View>
      <View style={styles.ingredientInfo}>
        <Text style={styles.ingredientName}>{ingredient.name}</Text>
        <Text style={styles.ingredientCategory}>{categoryName}</Text>
      </View>
    </TouchableOpacity>
  );
}

interface MealTypeSelectorProps {
  visible: boolean;
  mealTypes: MealType[];
  onSelect: (mealType: MealType) => void;
  onCancel: () => void;
}

function MealTypeSelector({ visible, mealTypes, onSelect, onCancel }: MealTypeSelectorProps) {
  const { t } = useTranslation(['suggestions', 'common']);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent} testID="meal-type-selector">
          <Text style={styles.modalTitle}>
            {t('suggestions:customMeal.selectMealType', { defaultValue: 'Select Meal Type' })}
          </Text>
          <Text style={styles.modalSubtitle}>
            {t('suggestions:customMeal.mealTypeHint', {
              defaultValue: 'This helps track variety for each meal type',
            })}
          </Text>

          <View style={styles.mealTypeList}>
            {mealTypes.map((mt) => (
              <TouchableOpacity
                key={mt.id}
                style={styles.mealTypeButton}
                onPress={() => onSelect(mt)}
                testID={`meal-type-${mt.name.toLowerCase()}`}
              >
                <Text style={styles.mealTypeButtonText}>
                  {mt.name.charAt(0).toUpperCase() + mt.name.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onCancel} testID="cancel-meal-type">
            <Text style={styles.cancelButtonText}>
              {t('common:cancel', { defaultValue: 'Cancel' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function CustomMealScreen() {
  const router = useRouter();
  const { t } = useTranslation(['suggestions', 'home', 'common']);

  // Store state
  const isDatabaseReady = useStore((state) => state.isDatabaseReady);
  const ingredients = useStore((state) => state.ingredients);
  const categories = useStore((state) => state.categories);
  const mealTypes = useStore((state) => state.mealTypes);
  const preparationMethods = useStore((state) => state.preparationMethods);

  // Store actions
  const loadIngredients = useStore((state) => state.loadIngredients);
  const loadCategories = useStore((state) => state.loadCategories);
  const loadMealTypes = useStore((state) => state.loadMealTypes);
  const loadPreparationMethods = useStore((state) => state.loadPreparationMethods);
  const addPreparationMethod = useStore((state) => state.addPreparationMethod);
  const logMealWithComponents = useStore((state) => state.logMealWithComponents);

  // Local state
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [mealName, setMealName] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Modal states
  const [showMealTypeSelector, setShowMealTypeSelector] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);

  // Load data when database is ready
  useEffect(() => {
    if (isDatabaseReady) {
      loadIngredients();
      loadCategories();
      loadMealTypes();
      loadPreparationMethods();
    }
  }, [isDatabaseReady, loadIngredients, loadCategories, loadMealTypes, loadPreparationMethods]);

  // Track screen view
  useFocusEffect(
    useCallback(() => {
      trackScreenView('custom_meal');
    }, [])
  );

  // Get active meal types only
  const activeMealTypes = useMemo(
    () => mealTypes.filter((mt) => mt.is_active),
    [mealTypes]
  );

  // Filter ingredients by category (using utility function)
  const filteredIngredients = useMemo(
    () => filterIngredientsByCategory(ingredients, categoryFilter, true),
    [ingredients, categoryFilter]
  );

  // Sort ingredients alphabetically
  const sortedIngredients = useMemo(
    () => [...filteredIngredients].sort((a, b) => a.name.localeCompare(b.name)),
    [filteredIngredients]
  );

  // Get selected ingredient objects for ConfirmationModal
  const selectedIngredientObjects = useMemo(
    () => ingredients.filter((ing) => selectedIngredients.includes(ing.id)),
    [ingredients, selectedIngredients]
  );

  // Get category name by ID
  const getCategoryName = useCallback(
    (categoryId?: string): string => {
      if (!categoryId) return t('common:uncategorized', { defaultValue: 'Uncategorized' });
      const category = categories.find((c) => c.id === categoryId);
      return category?.name || t('common:unknown', { defaultValue: 'Unknown' });
    },
    [categories, t]
  );

  // Toggle ingredient selection (using utility function)
  const handleToggleIngredient = useCallback((ingredientId: string) => {
    setSelectedIngredients((prev) => toggleIngredientSelection(prev, ingredientId));
  }, []);

  // Clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedIngredients([]);
    setMealName('');
  }, []);

  // Handle create meal - show meal type selector
  const handleCreateMeal = useCallback(() => {
    if (!isSelectionValid(selectedIngredients)) {
      return;
    }
    haptics.light();
    setShowMealTypeSelector(true);
  }, [selectedIngredients]);

  // Handle meal type selection
  const handleMealTypeSelected = useCallback((mealType: MealType) => {
    setSelectedMealType(mealType);
    setShowMealTypeSelector(false);
    setShowConfirmationModal(true);
  }, []);

  // Handle confirmation modal done
  const handleConfirmationDone = useCallback(
    async (components: MealComponentSelection[], finalMealName: string | undefined) => {
      if (!selectedMealType) return;

      const mealTypeName = selectedMealType.name.toLowerCase();

      // Track user action
      logger.action('custom_meal_created', {
        mealType: mealTypeName,
        ingredientCount: components.length,
        hasMealName: !!finalMealName,
        hasPreparationMethods: components.some((c) => c.preparationMethodId !== null),
      });

      // Log the meal
      await logMealWithComponents(
        mealTypeName,
        components.map((c) => ({
          ingredientId: c.ingredientId,
          preparationMethodId: c.preparationMethodId,
        })),
        finalMealName
      );

      haptics.success();
      setShowConfirmationModal(false);

      // Reset state
      setSelectedIngredients([]);
      setMealName('');
      setSelectedMealType(null);

      // Navigate back to home
      router.back();
    },
    [selectedMealType, logMealWithComponents, router]
  );

  // Handle add preparation method
  const handleAddPreparationMethod = useCallback(
    async (name: string) => {
      const newMethod = await addPreparationMethod(name);
      return newMethod;
    },
    [addPreparationMethod]
  );

  // Validation state (using utility functions)
  const selectionValid = isSelectionValid(selectedIngredients);
  const atMaxIngredients = isAtMaxIngredients(selectedIngredients);

  // Render category filter chip
  const renderCategoryChip = useCallback(
    (category: Category | null) => {
      const isSelected = category === null ? categoryFilter === null : categoryFilter === category?.id;
      return (
        <TouchableOpacity
          key={category?.id || 'all'}
          style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
          onPress={() => setCategoryFilter(category?.id || null)}
          testID={category ? `category-chip-${category.id}` : 'category-chip-all'}
        >
          <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
            {category?.name || t('common:all', { defaultValue: 'All' })}
          </Text>
        </TouchableOpacity>
      );
    },
    [categoryFilter, t]
  );

  // Render ingredient item
  const renderIngredientItem = useCallback(
    ({ item }: { item: Ingredient }) => (
      <IngredientItem
        ingredient={item}
        isSelected={selectedIngredients.includes(item.id)}
        categoryName={getCategoryName(item.category_id)}
        onToggle={handleToggleIngredient}
      />
    ),
    [selectedIngredients, getCategoryName, handleToggleIngredient]
  );

  return (
    <SafeAreaView style={screenStyles.container} testID="custom-meal-screen">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} testID="back-button">
          <Text style={styles.backButton}>{'<'} {t('common:back', { defaultValue: 'Back' })}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('suggestions:customMeal.title', { defaultValue: 'Create Custom Meal' })}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Meal Name Input */}
      <View style={styles.section}>
        <MealNameInput
          value={mealName}
          onChangeText={setMealName}
          testID="custom-meal-name-input"
        />
      </View>

      {/* Selection Counter */}
      <View style={styles.selectionInfo}>
        <Text style={styles.selectionText} testID="selection-counter">
          {t('suggestions:customMeal.selectedCount', {
            count: selectedIngredients.length,
            defaultValue: '{{count}} selected',
          })}
        </Text>
        {atMaxIngredients && (
          <Text style={styles.maxReachedText}>
            {t('suggestions:customMeal.maxReached', {
              max: DEFAULT_MAX_INGREDIENTS,
              defaultValue: 'Maximum {{max}} ingredients',
            })}
          </Text>
        )}
      </View>

      {/* Category Filter */}
      <View style={styles.categoryFilterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFilterContent}
        >
          {renderCategoryChip(null)}
          {categories.map((cat) => renderCategoryChip(cat))}
        </ScrollView>
      </View>

      {/* Ingredient List */}
      {sortedIngredients.length === 0 ? (
        <View style={screenStyles.emptyState}>
          <Text style={screenStyles.emptyStateText}>
            {t('suggestions:customMeal.noIngredients', { defaultValue: 'No ingredients available' })}
          </Text>
          <Text style={screenStyles.emptyStateSubtext}>
            {t('suggestions:customMeal.addIngredientsHint', {
              defaultValue: 'Add ingredients in the Ingredients tab',
            })}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedIngredients}
          renderItem={renderIngredientItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          testID="ingredient-list"
        />
      )}

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.clearButtonFooter}
          onPress={handleClearSelection}
          testID="clear-selection-button"
        >
          <Text style={styles.clearButtonText}>
            {t('suggestions:customMeal.clearSelection', { defaultValue: 'Clear' })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.createButton, !selectionValid && styles.createButtonDisabled]}
          onPress={handleCreateMeal}
          disabled={!selectionValid}
          testID="create-meal-button"
        >
          <Text style={[styles.createButtonText, !selectionValid && styles.createButtonTextDisabled]}>
            {t('suggestions:customMeal.createMeal', { defaultValue: 'Create Meal' })}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Meal Type Selector Modal */}
      <MealTypeSelector
        visible={showMealTypeSelector}
        mealTypes={activeMealTypes}
        onSelect={handleMealTypeSelected}
        onCancel={() => setShowMealTypeSelector(false)}
      />

      {/* Confirmation Modal with Prep Methods */}
      {selectedMealType && (
        <ConfirmationModal
          visible={showConfirmationModal}
          mealType={selectedMealType.name}
          ingredientObjects={selectedIngredientObjects}
          preparationMethods={preparationMethods}
          onDone={handleConfirmationDone}
          onAddPreparationMethod={handleAddPreparationMethod}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    color: colors.primary,
    fontSize: 16,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 60,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  selectionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selectionText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  maxReachedText: {
    color: colors.error,
    fontSize: 12,
  },
  categoryFilterContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryFilterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.backgroundInactive,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  categoryChipTextSelected: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100, // Space for footer
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  ingredientItemSelected: {
    backgroundColor: colors.backgroundHighlight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  ingredientCategory: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.backgroundFooter,
    borderTopWidth: 1,
    borderTopColor: colors.borderFooter,
    gap: 12,
  },
  clearButtonFooter: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.backgroundInactive,
    alignItems: 'center',
  },
  clearButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  createButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  createButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  createButtonTextDisabled: {
    color: colors.disabledText,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.backgroundModal,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  mealTypeList: {
    gap: 12,
    marginBottom: 16,
  },
  mealTypeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  mealTypeButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.backgroundInactive,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
});

import { useFocusEffect } from '@react-navigation/native';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useStore } from '../../lib/store';
import { trackScreenView } from '../../lib/telemetry/screenTracking';

type FilterOption = 'all' | string;

interface IngredientFormData {
  name: string;
  category: string;
  mealTypes: string[];
  category_id?: string;
}

export default function ManageIngredientsScreen() {
  const { t } = useTranslation('ingredients');

  // Store state
  const isDatabaseReady = useStore((state) => state.isDatabaseReady);
  const ingredients = useStore((state) => state.ingredients);
  const categories = useStore((state) => state.categories);
  const mealTypes = useStore((state) => state.mealTypes);
  const isLoading = useStore((state) => state.isLoading);
  const error = useStore((state) => state.error);

  // Store actions
  const loadIngredients = useStore((state) => state.loadIngredients);
  const loadCategories = useStore((state) => state.loadCategories);
  const loadMealTypes = useStore((state) => state.loadMealTypes);
  const addIngredient = useStore((state) => state.addIngredient);
  const updateIngredient = useStore((state) => state.updateIngredient);
  const toggleIngredientActive = useStore((state) => state.toggleIngredientActive);
  const deleteIngredient = useStore((state) => state.deleteIngredient);

  // Local state
  const [filterCategory, setFilterCategory] = useState<FilterOption>('all');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<string | null>(null);
  const [formData, setFormData] = useState<IngredientFormData>({
    name: '',
    category: '',
    mealTypes: [],
    category_id: undefined,
  });

  // Load data when database is ready
  useEffect(() => {
    if (isDatabaseReady) {
      loadIngredients();
      loadCategories();
      loadMealTypes();
    }
  }, [isDatabaseReady, loadIngredients, loadCategories, loadMealTypes]);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      trackScreenView('manage_ingredients');
      if (isDatabaseReady) {
        loadIngredients();
        loadCategories();
      }
    }, [isDatabaseReady, loadIngredients, loadCategories])
  );

  // Filter ingredients by category
  const filteredIngredients = filterCategory === 'all'
    ? ingredients
    : ingredients.filter((ing) => ing.category_id === filterCategory);

  // Sort ingredients: active first, then alphabetically
  const sortedIngredients = [...filteredIngredients].sort((a, b) => {
    if (a.is_active !== b.is_active) {
      return a.is_active ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  // Get category name by ID
  const getCategoryName = (categoryId?: string): string => {
    if (!categoryId) return t('categories:uncategorized', { defaultValue: 'Uncategorized' });
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || t('categories:unknown', { defaultValue: 'Unknown' });
  };

  // Handle add ingredient
  const handleAddIngredient = async () => {
    if (!formData.name.trim()) {
      Alert.alert(t('errors:generic.error'), t('validation.nameRequired'));
      return;
    }
    if (formData.mealTypes.length === 0) {
      Alert.alert(t('errors:generic.error'), t('validation.mealTypeRequired'));
      return;
    }

    // Convert IDs to names for storage
    const mealTypeNames = getMealTypeNamesFromIds(formData.mealTypes);

    await addIngredient({
      name: formData.name.trim(),
      category: formData.category || 'Other',
      mealTypes: mealTypeNames,
      category_id: formData.category_id,
      is_active: true,
    });

    setIsAddModalVisible(false);
    resetForm();
  };

  // Handle edit ingredient
  const handleEditIngredient = async () => {
    if (!editingIngredient || !formData.name.trim()) {
      Alert.alert(t('errors:generic.error'), t('validation.nameRequired'));
      return;
    }
    if (formData.mealTypes.length === 0) {
      Alert.alert(t('errors:generic.error'), t('validation.mealTypeRequired'));
      return;
    }

    // Convert IDs to names for storage
    const mealTypeNames = getMealTypeNamesFromIds(formData.mealTypes);

    await updateIngredient(editingIngredient, {
      name: formData.name.trim(),
      category: formData.category || 'Other',
      mealTypes: mealTypeNames,
      category_id: formData.category_id,
    });

    setIsEditModalVisible(false);
    setEditingIngredient(null);
    resetForm();
  };

  // Handle delete ingredient
  const handleDeleteIngredient = (id: string, name: string) => {
    Alert.alert(
      t('delete.title'),
      t('delete.confirm', { name }),
      [
        { text: t('common:buttons.cancel'), style: 'cancel' },
        {
          text: t('common:buttons.delete'),
          style: 'destructive',
          onPress: () => deleteIngredient(id),
        },
      ]
    );
  };

  // Open edit modal
  const openEditModal = (ingredient: typeof ingredients[0]) => {
    setEditingIngredient(ingredient.id);
    // Convert names to IDs for the form
    const mealTypeIds = getMealTypeIdsFromNames(ingredient.mealTypes);
    setFormData({
      name: ingredient.name,
      category: ingredient.category,
      mealTypes: mealTypeIds,
      category_id: ingredient.category_id,
    });
    setIsEditModalVisible(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      mealTypes: [],
      category_id: undefined,
    });
  };

  // Toggle meal type selection (stores IDs, not names)
  const toggleMealType = (mealTypeId: string) => {
    setFormData((prev) => ({
      ...prev,
      mealTypes: prev.mealTypes.includes(mealTypeId)
        ? prev.mealTypes.filter((id) => id !== mealTypeId)
        : [...prev.mealTypes, mealTypeId],
    }));
  };

  // Convert meal type IDs to names for saving
  const getMealTypeNamesFromIds = (ids: string[]): string[] => {
    return ids
      .map((id) => mealTypes.find((mt) => mt.id === id)?.name.toLowerCase())
      .filter((name): name is string => name !== undefined);
  };

  // Convert meal type names to IDs for editing
  const getMealTypeIdsFromNames = (names: string[]): string[] => {
    return names
      .map((name) => mealTypes.find((mt) => mt.name.toLowerCase() === name.toLowerCase())?.id)
      .filter((id): id is string => id !== undefined);
  };

  // Render filter buttons
  const renderFilterButtons = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      <TouchableOpacity
        style={[styles.filterButton, filterCategory === 'all' && styles.filterButtonActive]}
        onPress={() => setFilterCategory('all')}
        testID="filter-all"
      >
        <Text style={[styles.filterButtonText, filterCategory === 'all' && styles.filterButtonTextActive]}>
          {t('filter.all')} ({ingredients.length})
        </Text>
      </TouchableOpacity>
      {categories.map((category) => {
        const count = ingredients.filter((ing) => ing.category_id === category.id).length;
        return (
          <TouchableOpacity
            key={category.id}
            style={[styles.filterButton, filterCategory === category.id && styles.filterButtonActive]}
            onPress={() => setFilterCategory(category.id)}
            testID={`filter-${category.id}`}
          >
            <Text style={[styles.filterButtonText, filterCategory === category.id && styles.filterButtonTextActive]}>
              {category.name} ({count})
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  // Render ingredient item
  const renderIngredientItem = ({ item }: { item: typeof ingredients[0] }) => (
    <View style={[styles.ingredientItem, !item.is_active && styles.ingredientItemInactive]} testID={`ingredient-${item.id}`}>
      <View style={styles.ingredientInfo}>
        <Text style={[styles.ingredientName, !item.is_active && styles.ingredientNameInactive]}>
          {item.name}
        </Text>
        <Text style={styles.ingredientCategory}>
          {getCategoryName(item.category_id)} • {item.mealTypes.join(', ')}
        </Text>
        {item.is_user_added && (
          <Text style={styles.userAddedBadge}>{t('common:labels.custom', { defaultValue: 'Custom' })}</Text>
        )}
      </View>

      <View style={styles.ingredientActions}>
        <Switch
          value={item.is_active}
          onValueChange={() => toggleIngredientActive(item.id)}
          trackColor={{ false: '#3e3e3e', true: '#3e96ef' }}
          thumbColor={item.is_active ? '#FFFFFF' : '#9dabb9'}
          testID={`toggle-${item.id}`}
        />
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
          testID={`edit-${item.id}`}
        >
          <Text style={styles.editButtonText}>{t('common:buttons.edit')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteIngredient(item.id, item.name)}
          testID={`delete-${item.id}`}
        >
          <Text style={styles.deleteButtonText}>X</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render modal form
  const renderModalForm = (isEdit: boolean) => (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>{isEdit ? t('edit.title') : t('add.title')}</Text>

      <Text style={styles.inputLabel}>{t('form.name')}</Text>
      <TextInput
        style={styles.textInput}
        value={formData.name}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
        placeholder={t('form.namePlaceholder')}
        placeholderTextColor="#9dabb9"
        testID="ingredient-name-input"
      />

      <Text style={styles.inputLabel}>{t('form.category')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryOption,
              formData.category_id === category.id && styles.categoryOptionSelected,
            ]}
            onPress={() => setFormData((prev) => ({ ...prev, category_id: category.id, category: category.name }))}
            testID={`category-option-${category.id}`}
          >
            <Text
              style={[
                styles.categoryOptionText,
                formData.category_id === category.id && styles.categoryOptionTextSelected,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.inputLabel}>{t('form.mealTypes')}</Text>
      <View style={styles.mealTypeSelector}>
        {mealTypes.filter((mt) => mt.is_active).map((mealType) => (
          <TouchableOpacity
            key={mealType.id}
            style={[
              styles.mealTypeOption,
              formData.mealTypes.includes(mealType.id) && styles.mealTypeOptionSelected,
            ]}
            onPress={() => toggleMealType(mealType.id)}
            testID={`mealtype-option-${mealType.id}`}
          >
            <Text
              style={[
                styles.mealTypeOptionText,
                formData.mealTypes.includes(mealType.id) && styles.mealTypeOptionTextSelected,
              ]}
            >
              {mealType.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            if (isEdit) {
              setIsEditModalVisible(false);
            } else {
              setIsAddModalVisible(false);
            }
            setEditingIngredient(null);
            resetForm();
          }}
          testID="cancel-button"
        >
          <Text style={styles.cancelButtonText}>{t('common:buttons.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={isEdit ? handleEditIngredient : handleAddIngredient}
          testID="save-button"
        >
          <Text style={styles.saveButtonText}>{isEdit ? t('common:buttons.save') : t('common:buttons.add')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading && ingredients.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3e96ef" />
        <Text style={styles.loadingText}>{t('common:loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('title')}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setIsAddModalVisible(true);
          }}
          testID="add-ingredient-button"
        >
          <Text style={styles.addButtonText}>+ {t('common:buttons.add')}</Text>
        </TouchableOpacity>
      </View>

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Filter buttons */}
      {renderFilterButtons()}

      {/* Ingredients list */}
      {sortedIngredients.length === 0 ? (
        <View style={styles.emptyState} testID="empty-state">
          <Text style={styles.emptyStateText}>{t('empty.noResults')}</Text>
          <Text style={styles.emptyStateSubtext}>
            {filterCategory === 'all'
              ? t('empty.addFirst')
              : t('empty.noIngredients')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedIngredients}
          keyExtractor={(item) => item.id}
          renderItem={renderIngredientItem}
          testID="ingredients-list"
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Add Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          {renderModalForm(false)}
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          {renderModalForm(true)}
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#111418',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#3e96ef',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Error
  errorContainer: {
    backgroundColor: '#ff4444',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // Filter
  filterContainer: {
    minHeight: 35,
    maxHeight: 35,
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#283039',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3e96ef',
  },
  filterButtonText: {
    color: '#9dabb9',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  // List
  listContent: {
    paddingBottom: 20,
  },
  // Ingredient item
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#283039',
  },
  ingredientItemInactive: {
    opacity: 0.6,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  ingredientNameInactive: {
    color: '#9dabb9',
  },
  ingredientCategory: {
    color: '#9dabb9',
    fontSize: 12,
    marginTop: 2,
  },
  userAddedBadge: {
    color: '#3e96ef',
    fontSize: 10,
    marginTop: 4,
  },
  ingredientActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#283039',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#ff4444',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#9dabb9',
    fontSize: 14,
    textAlign: 'center',
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
    marginTop: 12,
  },
  textInput: {
    backgroundColor: '#283039',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  categorySelector: {
    maxHeight: 44,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#283039',
    marginRight: 8,
  },
  categoryOptionSelected: {
    backgroundColor: '#3e96ef',
  },
  categoryOptionText: {
    color: '#9dabb9',
    fontSize: 14,
  },
  categoryOptionTextSelected: {
    color: '#FFFFFF',
  },
  mealTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealTypeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#283039',
  },
  mealTypeOptionSelected: {
    backgroundColor: '#3e96ef',
  },
  mealTypeOptionText: {
    color: '#9dabb9',
    fontSize: 14,
  },
  mealTypeOptionTextSelected: {
    color: '#FFFFFF',
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

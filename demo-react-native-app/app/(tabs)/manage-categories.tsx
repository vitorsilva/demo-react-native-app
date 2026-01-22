import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { trackScreenView } from '../../lib/telemetry/screenTracking';
import { useStore } from '../../lib/store';

export default function ManageCategoriesScreen() {
  const { t } = useTranslation('categories');
  // Store state
  const isDatabaseReady = useStore((state) => state.isDatabaseReady);
  const categories = useStore((state) => state.categories);
  const ingredients = useStore((state) => state.ingredients);
  const isLoading = useStore((state) => state.isLoading);
  const error = useStore((state) => state.error);

  // Store actions
  const loadCategories = useStore((state) => state.loadCategories);
  const loadIngredients = useStore((state) => state.loadIngredients);
  const addCategory = useStore((state) => state.addCategory);
  const updateCategory = useStore((state) => state.updateCategory);
  const deleteCategory = useStore((state) => state.deleteCategory);

  // Local state
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');

  // Load data when database is ready
  useEffect(() => {
    if (isDatabaseReady) {
      loadCategories();
      loadIngredients();
    }
  }, [isDatabaseReady, loadCategories, loadIngredients]);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      trackScreenView('manage_categories');
      if (isDatabaseReady) {
        loadCategories();
        loadIngredients();
      }
    }, [isDatabaseReady, loadCategories, loadIngredients])
  );

  // Sort categories alphabetically
  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Get ingredient count for a category
  const getIngredientCount = (categoryId: string): number => {
    return ingredients.filter((ing) => ing.category_id === categoryId).length;
  };

  // Handle add category
  const handleAddCategory = async () => {
    const trimmedName = categoryName.trim();
    if (!trimmedName) {
      Alert.alert(t('errors:generic.error'), t('validation.nameRequired'));
      return;
    }

    // Check for duplicate name
    const exists = categories.some(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) {
      Alert.alert(t('errors:generic.error'), t('validation.nameTaken'));
      return;
    }

    await addCategory(trimmedName);
    setIsAddModalVisible(false);
    setCategoryName('');
  };

  // Handle edit category
  const handleEditCategory = async () => {
    const trimmedName = categoryName.trim();
    if (!editingCategory || !trimmedName) {
      Alert.alert(t('errors:generic.error'), t('validation.nameRequired'));
      return;
    }

    // Check for duplicate name (excluding current category)
    const exists = categories.some(
      (c) =>
        c.id !== editingCategory &&
        c.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) {
      Alert.alert(t('errors:generic.error'), t('validation.nameTaken'));
      return;
    }

    await updateCategory(editingCategory, trimmedName);
    setIsEditModalVisible(false);
    setEditingCategory(null);
    setCategoryName('');
  };

  // Handle delete category
  const handleDeleteCategory = async (id: string, name: string) => {
    const ingredientCount = getIngredientCount(id);

    if (ingredientCount > 0) {
      Alert.alert(
        t('delete.cannotDelete'),
        t('delete.hasIngredients', { count: ingredientCount })
      );
      return;
    }

    Alert.alert(t('delete.title'), t('delete.confirm', { name }), [
      { text: t('common:buttons.cancel'), style: 'cancel' },
      {
        text: t('common:buttons.delete'),
        style: 'destructive',
        onPress: async () => {
          const result = await deleteCategory(id);
          if (!result.success && result.error) {
            Alert.alert(t('errors:generic.error'), result.error);
          }
        },
      },
    ]);
  };

  // Open edit modal
  const openEditModal = (category: (typeof categories)[0]) => {
    setEditingCategory(category.id);
    setCategoryName(category.name);
    setIsEditModalVisible(true);
  };

  // Render category item
  const renderCategoryItem = ({ item }: { item: (typeof categories)[0] }) => {
    const ingredientCount = getIngredientCount(item.id);
    return (
      <View style={styles.categoryItem} testID={`category-${item.id}`}>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.ingredientCount}>
            {t('ingredientCount', { count: ingredientCount })}
          </Text>
        </View>

        <View style={styles.categoryActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditModal(item)}
            testID={`edit-${item.id}`}
          >
            <Text style={styles.editButtonText}>{t('common:buttons.edit')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.deleteButton,
              ingredientCount > 0 && styles.deleteButtonDisabled,
            ]}
            onPress={() => handleDeleteCategory(item.id, item.name)}
            testID={`delete-${item.id}`}
          >
            <Text
              style={[
                styles.deleteButtonText,
                ingredientCount > 0 && styles.deleteButtonTextDisabled,
              ]}
            >
              X
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render modal form
  const renderModalForm = (isEdit: boolean) => (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>
        {isEdit ? t('edit.title') : t('add.title')}
      </Text>

      <Text style={styles.inputLabel}>{t('form.name')}</Text>
      <TextInput
        style={styles.textInput}
        value={categoryName}
        onChangeText={setCategoryName}
        placeholder={t('form.namePlaceholder')}
        placeholderTextColor="#9dabb9"
        autoFocus
        testID="category-name-input"
      />

      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            if (isEdit) {
              setIsEditModalVisible(false);
            } else {
              setIsAddModalVisible(false);
            }
            setEditingCategory(null);
            setCategoryName('');
          }}
          testID="cancel-button"
        >
          <Text style={styles.cancelButtonText}>{t('common:buttons.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={isEdit ? handleEditCategory : handleAddCategory}
          testID="save-button"
        >
          <Text style={styles.saveButtonText}>{isEdit ? t('common:buttons.save') : t('common:buttons.add')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading && categories.length === 0) {
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
            setCategoryName('');
            setIsAddModalVisible(true);
          }}
          testID="add-category-button"
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

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          {t('summary.categories', { count: categories.length })} |{' '}
          {t('summary.totalIngredients', { count: ingredients.length })}
        </Text>
      </View>

      {/* Categories list */}
      {sortedCategories.length === 0 ? (
        <View style={styles.emptyState} testID="empty-state">
          <Text style={styles.emptyStateText}>{t('empty.noCategories')}</Text>
          <Text style={styles.emptyStateSubtext}>
            {t('empty.addFirst')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedCategories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoryItem}
          testID="categories-list"
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
        <View style={styles.modalOverlay}>{renderModalForm(false)}</View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>{renderModalForm(true)}</View>
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
  // Summary
  summaryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#283039',
  },
  summaryText: {
    color: '#9dabb9',
    fontSize: 14,
  },
  // List
  listContent: {
    paddingBottom: 20,
  },
  // Category item
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#283039',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  ingredientCount: {
    color: '#9dabb9',
    fontSize: 14,
    marginTop: 4,
  },
  categoryActions: {
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
  deleteButtonDisabled: {
    backgroundColor: '#4a4a4a',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButtonTextDisabled: {
    color: '#888888',
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
  },
  textInput: {
    backgroundColor: '#283039',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
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

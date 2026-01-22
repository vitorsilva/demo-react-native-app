import { useFocusEffect } from '@react-navigation/native';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
import {
  modalStyles,
  screenStyles,
  actionButtonStyles,
} from '../../constants/shared-styles';
import { useStore } from '../../lib/store';
import { trackScreenView } from '../../lib/telemetry/screenTracking';

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
            style={actionButtonStyles.editButton}
            onPress={() => openEditModal(item)}
            testID={`edit-${item.id}`}
          >
            <Text style={actionButtonStyles.editButtonText}>{t('common:buttons.edit')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              actionButtonStyles.deleteButton,
              ingredientCount > 0 && actionButtonStyles.deleteButtonDisabled,
            ]}
            onPress={() => handleDeleteCategory(item.id, item.name)}
            testID={`delete-${item.id}`}
          >
            <Text
              style={[
                actionButtonStyles.deleteButtonText,
                ingredientCount > 0 && actionButtonStyles.deleteButtonTextDisabled,
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
    <View style={modalStyles.modalContent}>
      <Text style={modalStyles.modalTitle}>
        {isEdit ? t('edit.title') : t('add.title')}
      </Text>

      <Text style={modalStyles.inputLabel}>{t('form.name')}</Text>
      <TextInput
        style={modalStyles.textInput}
        value={categoryName}
        onChangeText={setCategoryName}
        placeholder={t('form.namePlaceholder')}
        placeholderTextColor="#9dabb9"
        autoFocus
        testID="category-name-input"
      />

      <View style={modalStyles.modalButtons}>
        <TouchableOpacity
          style={modalStyles.cancelButton}
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
          <Text style={modalStyles.cancelButtonText}>{t('common:buttons.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={modalStyles.saveButton}
          onPress={isEdit ? handleEditCategory : handleAddCategory}
          testID="save-button"
        >
          <Text style={modalStyles.saveButtonText}>{isEdit ? t('common:buttons.save') : t('common:buttons.add')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading && categories.length === 0) {
    return (
      <View style={screenStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#3e96ef" />
        <Text style={screenStyles.loadingText}>{t('common:loading')}</Text>
      </View>
    );
  }

  return (
    <View style={screenStyles.container}>
      {/* Header */}
      <View style={screenStyles.header}>
        <Text style={screenStyles.headerTitle}>{t('title')}</Text>
        <TouchableOpacity
          style={screenStyles.addButton}
          onPress={() => {
            setCategoryName('');
            setIsAddModalVisible(true);
          }}
          testID="add-category-button"
        >
          <Text style={screenStyles.addButtonText}>+ {t('common:buttons.add')}</Text>
        </TouchableOpacity>
      </View>

      {/* Error message */}
      {error && (
        <View style={screenStyles.errorContainer}>
          <Text style={screenStyles.errorText}>{error}</Text>
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
        <View style={screenStyles.emptyState} testID="empty-state">
          <Text style={screenStyles.emptyStateText}>{t('empty.noCategories')}</Text>
          <Text style={screenStyles.emptyStateSubtext}>
            {t('empty.addFirst')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedCategories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoryItem}
          testID="categories-list"
          contentContainerStyle={screenStyles.listContent}
        />
      )}

      {/* Add Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={modalStyles.modalOverlay}>{renderModalForm(false)}</View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={modalStyles.modalOverlay}>{renderModalForm(true)}</View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Summary (screen-specific)
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
  // Category item (screen-specific)
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
});

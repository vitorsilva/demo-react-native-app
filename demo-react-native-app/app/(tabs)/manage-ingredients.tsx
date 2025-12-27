import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useStore } from '@/lib/store';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { IngredientForm } from '@/components/forms/IngredientForm';
import { Ingredient } from '@/types/database';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ManageIngredientsScreen() {
  const {
    ingredients,
    categories,
    isLoading,
    loadIngredients,
    loadCategories,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    toggleIngredientActive,
  } = useStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint'); // Usually blue

  // Derived colors
  const separatorColor = useThemeColor({ light: '#e4e4e7', dark: '#1c2127' }, 'icon');
  const sectionHeaderBg = useThemeColor({ light: '#f4f4f5', dark: '#1c2127' }, 'background');
  const activeColor = tintColor;
  const inactiveColor = iconColor;
  const deleteColor = '#ef4444';

  useEffect(() => {
    loadIngredients();
    loadCategories();
  }, [loadIngredients, loadCategories]);

  const sections = useMemo(() => {
    // Group ingredients by category
    const grouped = ingredients.reduce((acc, ingredient) => {
      // Find category name
      const category = categories.find((c) => c.id === ingredient.category_id);
      const categoryName = category ? category.name : 'Uncategorized';

      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(ingredient);
      return acc;
    }, {} as Record<string, Ingredient[]>);

    // Convert to SectionList format and sort categories alphabetically
    return Object.entries(grouped)
      .map(([title, data]) => ({
        title,
        data: data.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [ingredients, categories]);

  const handleAddPress = () => {
    setEditingIngredient(null);
    setModalVisible(true);
  };

  const handleEditPress = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setModalVisible(true);
  };

  const handleDeletePress = (ingredient: Ingredient) => {
    Alert.alert(
      'Delete Ingredient',
      `Are you sure you want to delete "${ingredient.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteIngredient(ingredient.id);
            } catch {
              Alert.alert('Error', 'Failed to delete ingredient');
            }
          },
        },
      ]
    );
  };

  const handleFormSubmit = async (values: {
    name: string;
    category_id: string;
    is_active: boolean;
  }) => {
    try {
      if (editingIngredient) {
        await updateIngredient(editingIngredient.id, values);
      } else {
        // Find category name for legacy support
        const category = categories.find(c => c.id === values.category_id);
        const categoryName = category ? category.name : 'Uncategorized';

        await addIngredient({
          ...values,
          category: categoryName,
          mealTypes: [],
        });
      }
      setModalVisible(false);
    } catch {
      Alert.alert('Error', 'Failed to save ingredient');
    }
  };

  if (isLoading && ingredients.length === 0) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={activeColor} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Ingredients</ThemedText>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: activeColor }]}
          onPress={handleAddPress}
          testID="add-ingredient-button"
        >
          <IconSymbol name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[
            styles.item,
            { borderBottomColor: separatorColor },
            !item.is_active && styles.itemInactive
          ]}>
            <View style={styles.itemContent}>
              <Text style={[
                styles.itemText,
                { color: textColor },
                !item.is_active && { color: inactiveColor, textDecorationLine: 'line-through' }
              ]}>
                {item.name}
              </Text>
              {!item.is_active && (
                <Text style={[styles.inactiveLabel, { color: inactiveColor }]}> (Inactive)</Text>
              )}
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                testID={`toggle-ingredient-${item.id}`}
                onPress={async () => {
                  try {
                    await toggleIngredientActive(item.id);
                  } catch {
                    Alert.alert('Error', 'Failed to toggle ingredient status');
                  }
                }}
              >
                <IconSymbol
                  name={item.is_active ? 'eye' : 'eye.slash'}
                  size={20}
                  color={item.is_active ? activeColor : inactiveColor}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                testID={`edit-ingredient-${item.id}`}
                onPress={() => handleEditPress(item)}
              >
                <IconSymbol name="pencil" size={20} color={inactiveColor} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                testID={`delete-ingredient-${item.id}`}
                onPress={() => handleDeletePress(item)}
              >
                <IconSymbol name="trash" size={20} color={deleteColor} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={[styles.sectionHeader, { backgroundColor: sectionHeaderBg }]}>
            <Text style={[styles.sectionHeaderText, { color: activeColor }]}>{title}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        {modalVisible && (
          <IngredientForm
            initialValues={
              editingIngredient
                ? {
                    name: editingIngredient.name,
                    category_id: editingIngredient.category_id || '',
                    is_active: editingIngredient.is_active,
                  }
                : undefined
            }
            categories={categories}
            onSubmit={handleFormSubmit}
            onCancel={() => setModalVisible(false)}
          />
        )}
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 12,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    marginTop: 16,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemInactive: {
    opacity: 0.7,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
  },
  inactiveLabel: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
});

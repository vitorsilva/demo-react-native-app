import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Platform,
  ScrollView,
} from 'react-native';
import { Category } from '@/types/database';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface IngredientFormProps {
  initialValues?: {
    name: string;
    category_id: string;
    is_active: boolean;
  };
  categories: Category[];
  onSubmit: (values: { name: string; category_id: string; is_active: boolean }) => void;
  onCancel: () => void;
}

export function IngredientForm({
  initialValues,
  categories,
  onSubmit,
  onCancel,
}: IngredientFormProps) {
  const [name, setName] = useState(initialValues?.name || '');
  const [categoryId, setCategoryId] = useState(initialValues?.category_id || '');
  const [isActive, setIsActive] = useState(initialValues?.is_active ?? true);
  const [errors, setErrors] = useState<{ name?: string; category?: string }>({});

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  // Custom colors derived from theme or hardcoded for now if not in theme
  // In a real app we'd extend the theme, but for now we'll adapt
  const inputBg = useThemeColor({ light: '#f4f4f5', dark: '#111418' }, 'background');
  const borderColor = useThemeColor({ light: '#e4e4e7', dark: '#3e454f' }, 'icon');
  const errorColor = '#ef4444';
  const primaryColor = tintColor;

  // Set default category if available and not set
  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const validate = () => {
    const newErrors: { name?: string; category?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!categoryId) {
      newErrors.category = 'Category is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({
        name: name.trim(),
        category_id: categoryId,
        is_active: isActive,
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Name</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: inputBg,
                borderColor: borderColor,
                color: textColor
              },
              errors.name ? { borderColor: errorColor } : null
            ]}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Avocado"
            placeholderTextColor={iconColor}
            autoFocus
          />
          {errors.name && <Text style={[styles.errorText, { color: errorColor }]}>{errors.name}</Text>}
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Category</ThemedText>
          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  { backgroundColor: inputBg, borderColor: borderColor },
                  categoryId === category.id && { backgroundColor: primaryColor, borderColor: primaryColor },
                ]}
                onPress={() => setCategoryId(category.id)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: iconColor },
                    categoryId === category.id && { color: '#FFFFFF', fontWeight: '600' },
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.category && <Text style={[styles.errorText, { color: errorColor }]}>{errors.category}</Text>}
        </View>

        <View style={styles.formGroup}>
          <View style={styles.switchRow}>
            <ThemedText style={styles.label}>Active</ThemedText>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: borderColor, true: primaryColor }}
              thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : isActive ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
          <Text style={[styles.helpText, { color: iconColor }]}>
            Inactive ingredients won&apos;t appear in suggestions
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: borderColor }]}>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: borderColor }]}
          onPress={onCancel}
        >
          <Text style={[styles.cancelButtonText, { color: textColor }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: primaryColor }]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  helpText: {
    fontSize: 12,
    marginTop: 4,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

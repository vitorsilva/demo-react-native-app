import { View, Text, StyleSheet, SectionList } from 'react-native';
import { useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { analytics } from '../../lib/telemetry/analytics';
import { useStore } from '../../lib/store';
import type { MealLog } from '../../types/database';

export default function HistoryScreen() {
  // Zustand store selectors
  const isDatabaseReady = useStore((state) => state.isDatabaseReady);
  const mealLogs = useStore((state) => state.mealLogs);
  const loadMealLogs = useStore((state) => state.loadMealLogs);
  const ingredients = useStore((state) => state.ingredients);
  const loadIngredients = useStore((state) => state.loadIngredients);

  // Load data when database is ready
  useEffect(() => {
    if (isDatabaseReady) {
      loadIngredients();
      loadMealLogs(30); // Load last 30 days
    }
  }, [isDatabaseReady, loadIngredients, loadMealLogs]);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      analytics.screenView('history');
      if (isDatabaseReady) {
        loadMealLogs(30);
      }
    }, [isDatabaseReady, loadMealLogs])
  );

  // Helper to format date as section title
  const formatDateSection = (dateString: string): string => {
    const mealDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time for comparison
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    const mealDateOnly = new Date(mealDate);
    mealDateOnly.setHours(0, 0, 0, 0);

    if (mealDateOnly.getTime() === today.getTime()) {
      return 'Today';
    } else if (mealDateOnly.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return mealDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  // Helper to get ingredient names
  const getIngredientNames = (ingredientIds: string[]): string => {
    const names = ingredientIds.map((id) => {
      const ingredient = ingredients.find((i) => i.id === id);
      return ingredient ? ingredient.name : id;
    });
    return names.join(' + ');
  };

  // Group meals by date
  const groupedMeals = mealLogs.reduce(
    (sections, meal) => {
      const sectionTitle = formatDateSection(meal.date);

      let section = sections.find((s) => s.title === sectionTitle);
      if (!section) {
        section = { title: sectionTitle, data: [] };
        sections.push(section);
      }
      section.data.push(meal);
      return sections;
    },
    [] as { title: string; data: MealLog[] }[]
  );

  // Render each meal item
  const renderMealItem = ({ item }: { item: MealLog }) => {
    const mealIcon = item.mealType === 'breakfast' ? '🌅' : '🍎';
    const mealTypeLabel = item.mealType === 'breakfast' ? 'Breakfast' : 'Snack';
    const ingredientNames = getIngredientNames(item.ingredients);

    return (
      <View style={styles.mealItem}>
        <View style={styles.mealHeader}>
          <Text style={styles.mealIcon}>{mealIcon}</Text>
          <Text style={styles.mealType}>{mealTypeLabel}</Text>
        </View>
        <Text style={styles.ingredients}>{ingredientNames}</Text>
      </View>
    );
  };

  // Render section header
  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  // Empty state
  if (mealLogs.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No meals logged yet</Text>
          <Text style={styles.emptySubtext}>Log your first meal from the Home screen</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={groupedMeals}
        keyExtractor={(item) => item.id}
        renderItem={renderMealItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111418',
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    backgroundColor: '#1a1d23',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  mealItem: {
    backgroundColor: '#1f2329',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  mealType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ingredients: {
    fontSize: 14,
    color: '#9BA1A6',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9BA1A6',
  },
});

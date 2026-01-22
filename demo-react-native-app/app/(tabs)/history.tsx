import { useFocusEffect } from '@react-navigation/native';
import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, SectionList } from 'react-native';
import { colors } from '../../constants/colors';
import { getCurrentLanguage } from '../../lib/i18n';
import { useStore } from '../../lib/store';
import { trackScreenView } from '../../lib/telemetry/screenTracking';
import { isToday, isYesterday } from '../../lib/utils/dateUtils';
import type { MealLog } from '../../types/database';

export default function HistoryScreen() {
  const { t } = useTranslation('history');

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
      trackScreenView('history');
      if (isDatabaseReady) {
        loadMealLogs(30);
      }
    }, [isDatabaseReady, loadMealLogs])
  );

  // Get locale for date formatting
  const getDateLocale = (): string => {
    const lang = getCurrentLanguage();
    // Map language codes to locale codes
    const localeMap: Record<string, string> = {
      en: 'en-US',
      'pt-PT': 'pt-PT',
    };
    return localeMap[lang] || 'en-US';
  };

  // Helper to format date as section title
  const formatDateSection = (dateString: string): string => {
    if (isToday(dateString)) {
      return t('date.today');
    } else if (isYesterday(dateString)) {
      return t('date.yesterday');
    } else {
      return new Date(dateString).toLocaleDateString(getDateLocale(), {
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

  // Get meal type icon based on name
  const getMealIcon = (mealType: string): string => {
    const iconMap: Record<string, string> = {
      breakfast: '🌅',
      snack: '🍎',
      lunch: '🍽️',
      dinner: '🌙',
    };
    return iconMap[mealType.toLowerCase()] || '🍴';
  };

  // Render each meal item
  const renderMealItem = ({ item }: { item: MealLog }) => {
    const mealIcon = getMealIcon(item.mealType);
    // Use the actual meal type name (capitalized)
    const mealTypeLabel = item.mealType.charAt(0).toUpperCase() + item.mealType.slice(1);
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
        <View style={styles.emptyState} testID="history-empty-state">
          <Text style={styles.emptyText}>{t('empty.title')}</Text>
          <Text style={styles.emptySubtext}>{t('empty.subtitle')}</Text>
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
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    backgroundColor: colors.historyCardBackground,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  mealItem: {
    backgroundColor: colors.backgroundCard,
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
    color: colors.textPrimary,
  },
  ingredients: {
    fontSize: 14,
    color: colors.textMuted,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
  },
});

import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useStore } from '../../lib/store';
import { trackScreenView } from '../../lib/telemetry/screenTracking';
import { getDaysAgo, isToday, isYesterday } from '../../lib/utils/dateUtils';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation('home');

  // Zustand store selectors
  const isDatabaseReady = useStore((state) => state.isDatabaseReady);
  const loadIngredients = useStore((state) => state.loadIngredients);
  const mealLogs = useStore((state) => state.mealLogs);
  const loadMealLogs = useStore((state) => state.loadMealLogs);
  const ingredients = useStore((state) => state.ingredients);
  const mealTypes = useStore((state) => state.mealTypes);
  const loadMealTypes = useStore((state) => state.loadMealTypes);

  // Load data when database is ready
  useEffect(() => {
    if (isDatabaseReady) {
      loadIngredients();
      loadMealLogs(30); // Load last 30 days of meals
      loadMealTypes();
    }
  }, [isDatabaseReady, loadIngredients, loadMealLogs, loadMealTypes]);

  // Reload data when screen comes into focus (after logging a new meal)
  useFocusEffect(
    useCallback(() => {
      trackScreenView('home');
      if (isDatabaseReady) {
        loadMealLogs(30);
        loadMealTypes();
      }
    }, [isDatabaseReady, loadMealLogs, loadMealTypes])
  );

  // Get active meal types only
  const activeMealTypes = mealTypes.filter((mt) => mt.is_active);

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    if (isToday(dateString)) {
      return t('date.today');
    } else if (isYesterday(dateString)) {
      return t('date.yesterday');
    } else {
      return t('date.daysAgo', { count: getDaysAgo(dateString) });
    }
  };

  // Helper function to get ingredient names from IDs
  const getIngredientNames = (ingredientIds: string[]): string => {
    const names = ingredientIds.map((id) => {
      const ingredient = ingredients.find((i) => i.id === id);
      return ingredient ? ingredient.name : id;
    });
    return names.join(' + ');
  };

  // Transform meal logs to UI format
  const recentMeals = mealLogs
    .slice(0, 10) // Show last 10 meals
    .map((log) => ({
      id: log.id,
      ingredients: getIngredientNames(log.ingredients),
      date: formatDate(log.date),
      mealType: log.mealType,
    }));

  // Navigate to suggestions for a meal type
  const handleMealTypePress = (mealTypeName: string) => {
    // Use lowercase for URL consistency
    const urlSlug = mealTypeName.toLowerCase();
    router.push(`/suggestions/${urlSlug}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.menuIcon}>
          <Text style={styles.menuIconText}>☰</Text>
        </View>
        <Text style={styles.headerTitle}>{t('title')}</Text>
      </View>

      {/* Meal Type Buttons - Dynamically generated */}
      <View style={styles.buttonsContainer}>
        {activeMealTypes.length === 0 ? (
          <View style={styles.noMealTypesContainer}>
            <Text style={styles.noMealTypesText}>{t('noMealTypes')}</Text>
            <Text style={styles.noMealTypesSubtext}>{t('configureMealTypes')}</Text>
          </View>
        ) : (
          activeMealTypes.map((mealType) => (
            <TouchableOpacity
              key={mealType.id}
              style={styles.mealTypeButton}
              onPress={() => handleMealTypePress(mealType.name)}
              testID={`${mealType.name.toLowerCase()}-ideas-button`}
              accessible={true}
              accessibilityLabel={t('accessibility.navigateToSuggestions', {
                mealType: mealType.name.toLowerCase(),
              })}
              accessibilityHint={t('accessibility.opensSuggestionsHint', {
                mealType: mealType.name.toLowerCase(),
              })}
              accessibilityRole="button"
            >
              <Text style={styles.mealTypeButtonText}>
                {t('mealTypeIdeas', { mealType: mealType.name })}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Recent Meals Section */}
      <Text style={styles.sectionTitle}>{t('recentMeals')}</Text>

      {recentMeals.length === 0 ? (
        <View style={styles.emptyState} testID="empty-state">
          <Text style={styles.emptyStateText}>{t('noRecentMeals')}</Text>
          <Text style={styles.emptyStateSubtext}>
            {activeMealTypes.length > 0
              ? t('getStartedWithMealType', { mealType: activeMealTypes[0].name })
              : t('getStartedConfigureMealTypes')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={recentMeals}
          keyExtractor={(item) => item.id}
          testID="recent-meals-list"
          renderItem={({ item }) => (
            <View style={styles.mealItem} testID={`meal-item-${item.id}`}>
              <View style={styles.checkIcon}>
                <Text style={styles.checkIconText}>✓</Text>
              </View>
              <View style={styles.mealItemContent}>
                <Text style={styles.mealItemTitle}>{item.ingredients}</Text>
                <Text style={styles.mealItemSubtitle} testID={`meal-subtitle-${item.id}`}>
                  {item.date}, {item.mealType}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111418',
  },
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  menuIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconText: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  // Button styles
  buttonsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  mealTypeButton: {
    backgroundColor: '#3e96ef',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealTypeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // No meal types state
  noMealTypesContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noMealTypesText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  noMealTypesSubtext: {
    color: '#9dabb9',
    fontSize: 14,
    marginTop: 4,
  },
  // Section title
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 20,
  },
  // Meal item styles
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 72,
    gap: 16,
  },
  checkIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#283039',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIconText: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  mealItemContent: {
    flex: 1,
  },
  mealItemTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  mealItemSubtitle: {
    color: '#9dabb9',
    fontSize: 14,
  },
  // Empty state
  emptyState: {
    padding: 32,
    alignItems: 'center',
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
});

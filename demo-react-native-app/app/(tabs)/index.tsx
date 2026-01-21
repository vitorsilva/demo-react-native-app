import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
// TODO: Analytics will be added back in Step 5.8
import { useStore } from '../../lib/store';

export default function HomeScreen() {
  const router = useRouter();

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
      // TODO: Screen tracking will be added back in Step 5.8
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
      const daysAgo = Math.floor(
        (today.getTime() - mealDateOnly.getTime()) / (1000 * 60 * 60 * 24)
      );
      return `${daysAgo} days ago`;
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
        <Text style={styles.headerTitle}>SaborSpin</Text>
      </View>

      {/* Meal Type Buttons - Dynamically generated */}
      <View style={styles.buttonsContainer}>
        {activeMealTypes.length === 0 ? (
          <View style={styles.noMealTypesContainer}>
            <Text style={styles.noMealTypesText}>No meal types configured</Text>
            <Text style={styles.noMealTypesSubtext}>
              Go to Settings to add meal types
            </Text>
          </View>
        ) : (
          activeMealTypes.map((mealType) => (
            <TouchableOpacity
              key={mealType.id}
              style={styles.mealTypeButton}
              onPress={() => handleMealTypePress(mealType.name)}
              testID={`${mealType.name.toLowerCase()}-ideas-button`}
              accessible={true}
              accessibilityLabel={`Navigate to ${mealType.name.toLowerCase()} suggestions`}
              accessibilityHint={`Opens a screen with ${mealType.name.toLowerCase()} meal combinations`}
              accessibilityRole="button"
            >
              <Text style={styles.mealTypeButtonText}>{mealType.name} Ideas</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Recent Meals Section */}
      <Text style={styles.sectionTitle}>Recent Meals</Text>

      {recentMeals.length === 0 ? (
        <View style={styles.emptyState} testID="empty-state">
          <Text style={styles.emptyStateText}>No meals logged yet</Text>
          <Text style={styles.emptyStateSubtext}>
            {activeMealTypes.length > 0
              ? `Tap "${activeMealTypes[0].name} Ideas" to get started!`
              : 'Configure meal types in Settings to get started!'}
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

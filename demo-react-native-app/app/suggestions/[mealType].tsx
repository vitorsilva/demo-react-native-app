import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { ConfirmationModal, MealComponentSelection } from '../../components/modals/ConfirmationModal';
import { NewBadge } from '../../components/NewBadge';
import { VarietyIndicator } from '../../components/VarietyIndicator';
import { useStore } from '../../lib/store';
import { logger } from '../../lib/telemetry/logger';
import { trackScreenView } from '../../lib/telemetry/screenTracking';
import { haptics } from '../../lib/utils/haptics';
import { isNewCombination, getVarietyColor } from '../../lib/utils/variety';
import type { Ingredient } from '../../types/database';

// Conditionally import LinearGradient only for native platforms
let LinearGradient: React.ComponentType<{
  colors: string[];
  style?: object;
  children?: React.ReactNode;
}> | null = null;
if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  LinearGradient = require('expo-linear-gradient').LinearGradient;
}

// Placeholder images for suggestions (we'll use random food images)
const SUGGESTION_IMAGES = [
  'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=300&fit=crop',
];

export default function SuggestionsScreen() {
  const { mealType } = useLocalSearchParams<{ mealType: string }>();
  const router = useRouter();
  const { t } = useTranslation('suggestions');

  // Zustand store selectors
  const suggestedCombinations = useStore((state) => state.suggestedCombinations);
  const isLoading = useStore((state) => state.isLoading);
  const error = useStore((state) => state.error);
  const generateMealSuggestions = useStore((state) => state.generateMealSuggestions);
  const logMeal = useStore((state) => state.logMeal);
  const logMealWithComponents = useStore((state) => state.logMealWithComponents);
  const ingredients = useStore((state) => state.ingredients);
  const loadIngredients = useStore((state) => state.loadIngredients);
  const isDatabaseReady = useStore((state) => state.isDatabaseReady);
  const mealTypes = useStore((state) => state.mealTypes);
  const loadMealTypes = useStore((state) => state.loadMealTypes);
  const mealLogs = useStore((state) => state.mealLogs);
  const loadMealLogs = useStore((state) => state.loadMealLogs);
  const toggleMealLogFavorite = useStore((state) => state.toggleMealLogFavorite);
  const preparationMethods = useStore((state) => state.preparationMethods);
  const loadPreparationMethods = useStore((state) => state.loadPreparationMethods);
  const addPreparationMethod = useStore((state) => state.addPreparationMethod);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIngredientObjects, setSelectedIngredientObjects] = useState<Ingredient[]>([]);
  const hasGeneratedRef = useRef(false);

  // Find the meal type from the database (case-insensitive match)
  const currentMealType = mealTypes.find(
    (mt) => mt.name.toLowerCase() === mealType?.toLowerCase()
  );

  // Format title for display - use meal type name from database or fallback to URL param
  const displayName = currentMealType?.name || mealType || t('common:labels.meal', { defaultValue: 'Meal' });
  // Capitalize first letter for display
  const capitalizedDisplayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  const screenTitle = t('title', { mealType: capitalizedDisplayName });

  // Track screen view and generate suggestions on mount
  useEffect(() => {
    trackScreenView('suggestions');

    // Ensure data is loaded before generating suggestions
    const generateSuggestions = async () => {
      // Prevent multiple generation calls
      if (hasGeneratedRef.current) {
        return;
      }

      // Wait for database to be ready
      if (!isDatabaseReady) {
        console.log('Waiting for database to be ready...');
        return;
      }

      // Load meal types if not already loaded
      if (mealTypes.length === 0) {
        console.log('Loading meal types...');
        await loadMealTypes();
        return;
      }

      // Load ingredients if not already loaded
      if (ingredients.length === 0) {
        console.log('Loading ingredients before generating suggestions...');
        await loadIngredients();
        // Don't generate yet - useEffect will re-run when ingredients load
        return;
      }

      // Load meal logs to check for favorites
      await loadMealLogs();

      // Load preparation methods
      await loadPreparationMethods();

      // Mark as generated to prevent re-runs
      hasGeneratedRef.current = true;

      // Generate suggestions with meal type config
      generateMealSuggestions(mealType);
    };

    generateSuggestions();
  }, [
    mealType,
    generateMealSuggestions,
    isDatabaseReady,
    ingredients.length,
    loadIngredients,
    mealTypes.length,
    loadMealTypes,
    loadMealLogs,
    loadPreparationMethods,
  ]);

  // Helper to check if a combination is favorited
  const isCombinationFavorited = (ingredientIds: string[]): { isFavorite: boolean; mealLogId?: string } => {
    // Sort ingredient IDs for comparison
    const sortedIds = [...ingredientIds].sort().join(',');

    // Find a meal log with matching ingredients and favorite status
    const favoritedLog = mealLogs.find((log) => {
      const logIngredientIds = [...log.ingredients].sort().join(',');
      return logIngredientIds === sortedIds && log.isFavorite;
    });

    return {
      isFavorite: !!favoritedLog,
      mealLogId: favoritedLog?.id,
    };
  };

  // Transform store data to UI format
  const suggestions = suggestedCombinations.map((ingredientArray, index) => {
    const ingredientIds = ingredientArray.map((i) => i.id);
    const favoriteStatus = isCombinationFavorited(ingredientIds);
    const isNew = isNewCombination(ingredientIds, mealLogs);
    const varietyColor = getVarietyColor(ingredientIds, mealLogs);

    return {
      id: String(index),
      ingredients: ingredientArray,
      imageUrl: SUGGESTION_IMAGES[index % SUGGESTION_IMAGES.length],
      isFavorite: favoriteStatus.isFavorite,
      mealLogId: favoriteStatus.mealLogId,
      isNew,
      varietyColor,
    };
  });

  const handleBackPress = () => {
    router.back();
  };

  const handleSelectSuggestion = (suggestionId: string) => {
    haptics.light();
    const suggestion = suggestions.find((s) => s.id === suggestionId);
    if (suggestion) {
      setSelectedIngredientObjects(suggestion.ingredients);
      setModalVisible(true);
    }
  };

  const handleModalDone = async (
    components: MealComponentSelection[],
    mealName: string | undefined
  ) => {
    // Use the meal type name from URL (or database if found)
    const mealTypeName = currentMealType?.name.toLowerCase() || mealType || 'meal';

    // Track user action
    logger.action('suggestion_accepted', {
      mealType: mealTypeName,
      ingredientCount: components.length,
      hasMealName: !!mealName,
      hasPreparationMethods: components.some((c) => c.preparationMethodId !== null),
    });

    // Use the new logMealWithComponents for Phase 2 data model
    await logMealWithComponents(
      mealTypeName,
      components.map((c) => ({
        ingredientId: c.ingredientId,
        preparationMethodId: c.preparationMethodId,
      })),
      mealName
    );

    setModalVisible(false);
    // Navigate back to home
    router.back();
  };

  const handleGenerateNew = () => {
    haptics.medium();

    // Track user action
    logger.action('regenerate_suggestions', { mealType });

    // Generate new suggestions with meal type config
    generateMealSuggestions(mealType);
  };

  const handleToggleFavorite = async (suggestionId: string) => {
    haptics.medium();
    const suggestion = suggestions.find((s) => s.id === suggestionId);

    if (!suggestion) return;

    // Track user action
    logger.action('toggle_favorite_from_suggestion', {
      mealType,
      isFavorite: !suggestion.isFavorite,
    });

    if (suggestion.mealLogId) {
      // Already exists as a meal log, just toggle its favorite status
      await toggleMealLogFavorite(suggestion.mealLogId);
    } else {
      // Create a new meal log with favorite status
      const mealTypeName = currentMealType?.name.toLowerCase() || mealType || 'meal';
      await logMeal({
        date: new Date().toISOString(),
        ingredients: suggestion.ingredients.map((i) => i.id),
        mealType: mealTypeName,
        isFavorite: true,
      });
    }

    // Reload meal logs to update favorite status
    await loadMealLogs();
  };

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress} testID="back-button">
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{screenTitle}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Pick one subtitle */}
      <Text style={styles.subtitle}>{t('pickOne', { defaultValue: 'Pick one:' })}</Text>

      {/* Suggestions list */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Loading state */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3e96ef" />
            <Text style={styles.loadingText}>{t('loading')}</Text>
          </View>
        )}

        {/* Error state */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleGenerateNew}>
              <Text style={styles.retryButtonText}>{t('error.tryAgain')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Suggestions */}
        {!isLoading &&
          !error &&
          suggestions.map((suggestion) => (
            <View
              key={suggestion.id}
              style={styles.suggestionCard}
              testID={`suggestion-${suggestion.id}`}
            >
              {/* Image with gradient overlay */}
              <ImageBackground
                source={{ uri: suggestion.imageUrl }}
                style={styles.cardImage}
                imageStyle={styles.cardImageStyle}
              >
                {Platform.OS !== 'web' && LinearGradient ? (
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.gradient}
                  >
                    <VarietyIndicator color={suggestion.varietyColor} style={styles.varietyIndicator} />
                    <NewBadge visible={suggestion.isNew} style={styles.newBadge} />
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>
                        {suggestion.ingredients.map((i) => i.name).join(' + ')}
                      </Text>
                      <View style={styles.cardActions}>
                        <TouchableOpacity
                          style={styles.selectButton}
                          onPress={() => handleSelectSuggestion(suggestion.id)}
                          testID={`select-button-${suggestion.id}`}
                        >
                          <Text style={styles.selectButtonText}>{t('actions.accept')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.favoriteButton}
                          onPress={() => handleToggleFavorite(suggestion.id)}
                          testID={`favorite-button-${suggestion.id}`}
                        >
                          <Text style={styles.favoriteIcon}>
                            {suggestion.isFavorite ? '⭐' : '☆'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </LinearGradient>
                ) : (
                  // Web fallback: simple dark overlay
                  <View style={styles.webGradientFallback}>
                    <VarietyIndicator color={suggestion.varietyColor} style={styles.varietyIndicator} />
                    <NewBadge visible={suggestion.isNew} style={styles.newBadge} />
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>
                        {suggestion.ingredients.map((i) => i.name).join(' + ')}
                      </Text>
                      <View style={styles.cardActions}>
                        <TouchableOpacity
                          style={styles.selectButton}
                          onPress={() => handleSelectSuggestion(suggestion.id)}
                          testID={`select-button-${suggestion.id}`}
                        >
                          <Text style={styles.selectButtonText}>{t('actions.accept')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.favoriteButton}
                          onPress={() => handleToggleFavorite(suggestion.id)}
                          testID={`favorite-button-${suggestion.id}`}
                        >
                          <Text style={styles.favoriteIcon}>
                            {suggestion.isFavorite ? '⭐' : '☆'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              </ImageBackground>
            </View>
          ))}

        {/* Generate New Ideas button */}
        {!isLoading && (
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateNew}
            testID="generate-new-ideas-button"
          >
            <Text style={styles.generateButtonText}>{t('actions.regenerate')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={modalVisible}
        mealType={currentMealType?.name.toLowerCase() || mealType || 'meal'}
        ingredientObjects={selectedIngredientObjects}
        preparationMethods={preparationMethods}
        onDone={handleModalDone}
        onAddPreparationMethod={addPreparationMethod}
      />
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
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48, // Balance the back button
  },
  // Subtitle
  subtitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  // Scroll view
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  // Suggestion card styles
  suggestionCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  varietyIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 1,
  },
  newBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  cardImage: {
    height: 200,
    justifyContent: 'flex-end',
  },
  cardImageStyle: {
    borderRadius: 12,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    borderRadius: 12,
  },
  webGradientFallback: {
    flex: 1,
    justifyContent: 'flex-end',
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectButton: {
    backgroundColor: '#4a96e3',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  favoriteIcon: {
    fontSize: 20,
  },
  // Generate button
  generateButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3e96ef',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  generateButtonText: {
    color: '#3e96ef',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Loading state
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#9dabb9',
    fontSize: 16,
    marginTop: 16,
  },
  // Error state
  errorContainer: {
    padding: 24,
    backgroundColor: '#2a1a1a',
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3e96ef',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { trackScreenView } from '../../lib/telemetry/screenTracking';
import { logger } from '../../lib/telemetry/logger';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { useStore } from '../../lib/store';
import * as Haptics from 'expo-haptics';

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

  // Zustand store selectors
  const suggestedCombinations = useStore((state) => state.suggestedCombinations);
  const isLoading = useStore((state) => state.isLoading);
  const error = useStore((state) => state.error);
  const generateMealSuggestions = useStore((state) => state.generateMealSuggestions);
  const logMeal = useStore((state) => state.logMeal);
  const ingredients = useStore((state) => state.ingredients);
  const loadIngredients = useStore((state) => state.loadIngredients);
  const isDatabaseReady = useStore((state) => state.isDatabaseReady);
  const mealTypes = useStore((state) => state.mealTypes);
  const loadMealTypes = useStore((state) => state.loadMealTypes);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const hasGeneratedRef = useRef(false);

  // Find the meal type from the database (case-insensitive match)
  const currentMealType = mealTypes.find(
    (mt) => mt.name.toLowerCase() === mealType?.toLowerCase()
  );

  // Format title for display - use meal type name from database or fallback to URL param
  const displayName = currentMealType?.name || mealType || 'Meal';
  const screenTitle = `${displayName} Ideas`;

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
  ]);

  // Transform store data to UI format
  const suggestions = suggestedCombinations.map((ingredientArray, index) => ({
    id: String(index),
    ingredients: ingredientArray,
    imageUrl: SUGGESTION_IMAGES[index % SUGGESTION_IMAGES.length],
  }));

  const handleBackPress = () => {
    router.back();
  };

  const handleSelectSuggestion = (suggestionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const suggestion = suggestions.find((s) => s.id === suggestionId);
    if (suggestion) {
      setSelectedIngredients(suggestion.ingredients.map((i) => i.name));
      setModalVisible(true);
    }
  };

  const handleModalDone = async () => {
    // Log the meal to database
    const suggestion = suggestions.find(
      (s) => s.ingredients.map((i) => i.name).join(',') === selectedIngredients.join(',')
    );

    if (suggestion) {
      // Use the meal type name from URL (or database if found)
      const mealTypeName = currentMealType?.name.toLowerCase() || mealType || 'meal';

      // Track user action
      logger.action('suggestion_accepted', {
        mealType: mealTypeName,
        ingredientCount: suggestion.ingredients.length,
      });

      await logMeal({
        date: new Date().toISOString(),
        ingredients: suggestion.ingredients.map((i) => i.id),
        mealType: mealTypeName,
      });
    }

    setModalVisible(false);
    // Navigate back to home
    router.back();
  };

  const handleGenerateNew = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Track user action
    logger.action('regenerate_suggestions', { mealType });

    // Generate new suggestions with meal type config
    generateMealSuggestions(mealType);
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
      <Text style={styles.subtitle}>Pick one:</Text>

      {/* Suggestions list */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Loading state */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3e96ef" />
            <Text style={styles.loadingText}>Generating suggestions...</Text>
          </View>
        )}

        {/* Error state */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleGenerateNew}>
              <Text style={styles.retryButtonText}>Try Again</Text>
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
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>
                        {suggestion.ingredients.map((i) => i.name).join(' + ')}
                      </Text>
                      <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => handleSelectSuggestion(suggestion.id)}
                        testID={`select-button-${suggestion.id}`}
                      >
                        <Text style={styles.selectButtonText}>Select</Text>
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                ) : (
                  // Web fallback: simple dark overlay
                  <View style={styles.webGradientFallback}>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>
                        {suggestion.ingredients.map((i) => i.name).join(' + ')}
                      </Text>
                      <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => handleSelectSuggestion(suggestion.id)}
                        testID={`select-button-${suggestion.id}`}
                      >
                        <Text style={styles.selectButtonText}>Select</Text>
                      </TouchableOpacity>
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
            <Text style={styles.generateButtonText}>Generate New Ideas</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={modalVisible}
        mealType={currentMealType?.name.toLowerCase() || mealType || 'meal'}
        ingredients={selectedIngredients}
        onDone={handleModalDone}
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

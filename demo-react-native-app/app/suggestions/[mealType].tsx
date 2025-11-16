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
import { useEffect, useState } from 'react';
import { analytics } from '../../lib/telemetry/analytics';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { useStore } from '../../lib/store';

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

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  // Track screen view and generate suggestions on mount
  useEffect(() => {
    analytics.screenView('suggestions');
    // Generate 3 suggestions with 7-day cooldown
    generateMealSuggestions(3, 7);
  }, [mealType, generateMealSuggestions]);

  // Format title for display
  const screenTitle = mealType === 'breakfast' ? 'Breakfast Ideas' : 'Snack Ideas';

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
      await logMeal({
        date: new Date().toISOString(),
        ingredients: suggestion.ingredients.map((i) => i.id),
        mealType: (mealType as 'breakfast' | 'snack') || 'breakfast',
      });
      console.log('Meal logged to database:', selectedIngredients);
    }

    setModalVisible(false);
    // Navigate back to home
    router.back();
  };

  const handleGenerateNew = () => {
    // Generate new suggestions
    generateMealSuggestions(3, 7);
    console.log('Generating new meal ideas...');
  };

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
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
            <View key={suggestion.id} style={styles.suggestionCard}>
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
          <TouchableOpacity style={styles.generateButton} onPress={handleGenerateNew}>
            <Text style={styles.generateButtonText}>Generate New Ideas</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={modalVisible}
        mealType={(mealType as 'breakfast' | 'snack') || 'breakfast'}
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

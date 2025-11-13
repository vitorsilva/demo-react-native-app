import { View, Text, StyleSheet, Button, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { tracer, meter } from '../../lib/telemetry';
import { log } from '../../lib/logger';
import { useFocusEffect } from '@react-navigation/native';
import { analytics } from '../../lib/analytics';
import { useStore } from '../../lib/store';

// Create a counter metric to track button presses
const buttonPressCounter = meter.createCounter('button.presses', {
  description: 'Number of times the button was pressed',
});

// Create a histogram to track distribution of input text lengths
const inputLengthHistogram = meter.createHistogram('input.length', {
  description: 'Distribution of input text lengths',
  unit: 'characters',
});

export default function HomeScreen() {
  const [inputValue, setInputValue] = useState('');
  const [displayText, setDisplayText] = useState('');

  // Zustand store selectors
  const ingredients = useStore((state) => state.ingredients);
  const isLoading = useStore((state) => state.isLoading);
  const error = useStore((state) => state.error);
  const isDatabaseReady = useStore((state) => state.isDatabaseReady); // ← ADD THIS
  const loadIngredients = useStore((state) => state.loadIngredients);

  // Load ingredients when component mounts
  useEffect(() => {
    if (isDatabaseReady) {
      loadIngredients();
    }
  }, [isDatabaseReady, loadIngredients]);

  // Track screen view every time this screen is focused
  useFocusEffect(() => {
    analytics.screenView('home');
  });

  const handlePress = () => {
    // Create a span to track this operation
    const span = tracer.startSpan('button.press');

    // Add metadata about what happened
    span.setAttribute('input.length', inputValue.length);
    span.setAttribute('input.value', inputValue);

    // Increment the button press counter
    //buttonPressCounter.add(1); // not needed anymore - using analytics.userAction below

    inputLengthHistogram.record(inputValue.length);
    analytics.userAction('button_press', {
      inputLength: String(inputValue.length),
    });

    // Log the button press with trace correlation
    log.info('Button pressed', {
      inputLength: inputValue.length,
      inputValue: inputValue,
    });

    // Do the actual work
    setDisplayText(inputValue);

    // End the span (marks operation as complete)
    span.end();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Meals Randomizer</Text>

      {/* Database not ready */}
      {!isDatabaseReady && <Text style={styles.text}>Initializing database...</Text>}

      {/* Loading state */}
      {isDatabaseReady && isLoading && <Text style={styles.text}>Loading ingredients...</Text>}

      {/* Error state */}
      {error && <Text style={styles.errorText}>Error: {error}</Text>}

      {/* Ingredient count */}
      {isDatabaseReady && !isLoading && !error && (
        <Text style={styles.text}>{ingredients.length} ingredients loaded</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 12,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    color: 'white',
  },
  input: {
    height: 40,
    borderColor: 'white',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    color: 'white',
  },
});

import { View, Text, StyleSheet, Button, TextInput } from 'react-native';
import { useState } from 'react';
import { tracer, meter } from '../../lib/telemetry';
import { log } from '../../lib/logger';
import { useFocusEffect } from '@react-navigation/native';
import { analytics } from '../../lib/analytics';
import { getAllIngredients } from '../../lib/database/ingredients';
import { logMeal, getRecentMealLogs } from '../../lib/database/mealLogs';

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
  const [dbStatus, setDbStatus] = useState('');
  //const [showCrash, setShowCrash] = useState(false);

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

  const testDatabase = async () => {
    try {
      // Get all ingredients
      const ingredients = await getAllIngredients();
      console.log('📦 All ingredients:', ingredients);

      // Log a test meal (first 3 breakfast ingredients)
      const breakfastIngredients = ingredients
        .filter((ing) => ing.mealTypes.includes('breakfast'))
        .slice(0, 3);

      if (breakfastIngredients.length > 0) {
        const mealId = await logMeal({
          date: new Date().toISOString(),
          mealType: 'breakfast',
          ingredients: breakfastIngredients.map((ing) => ing.id),
        });
        console.log('✅ Logged meal:', mealId);
      }

      // Get recent meals
      const recentMeals = await getRecentMealLogs(7);
      console.log('📜 Recent meals:', recentMeals);

      setDbStatus(
        `✅ DB Working!\n` +
          `Ingredients: ${ingredients.length}\n` +
          `Recent meals: ${recentMeals.length}`
      );
    } catch (error) {
      console.error('❌ Database test failed:', error);
      setDbStatus(`❌ Error: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello World! </Text>
      <TextInput
        style={styles.input}
        placeholder="Type here..."
        value={inputValue}
        onChangeText={setInputValue}
      />
      <Button title="Press me" onPress={handlePress} />
      <Text style={styles.text}>{displayText}</Text>

      <View style={styles.separator} />
      <Button title="Test Database" onPress={testDatabase} />
      <Text style={styles.text}>{dbStatus}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  separator: {
    height: 40,
  },
});

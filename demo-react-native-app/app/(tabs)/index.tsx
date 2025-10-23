import { View, Text, StyleSheet, Button, TextInput } from 'react-native';
import { useState } from 'react';
import { tracer, meter } from '../../lib/telemetry';
import { log } from '../../lib/logger';

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

  const handlePress = () => {
    // Create a span to track this operation
    const span = tracer.startSpan('button.press');

    // Add metadata about what happened
    span.setAttribute('input.length', inputValue.length);
    span.setAttribute('input.value', inputValue);

    // Increment the button press counter
    buttonPressCounter.add(1);
    inputLengthHistogram.record(inputValue.length);

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
      <Text style={styles.text}>Hello World! </Text>
      <TextInput
        style={styles.input}
        placeholder="Type here..."
        value={inputValue}
        onChangeText={setInputValue}
      />
      <Button title="Press me" onPress={handlePress} />

      <Text style={styles.text}>{displayText}</Text>
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
});

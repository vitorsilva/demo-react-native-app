import { View, Text, StyleSheet, Button, TextInput } from 'react-native';
import { useState } from 'react';
import { tracer } from '../../lib/telemetry';

// Test comment - fifth attempt with correct config

export default function HomeScreen() {
  const [inputValue, setInputValue] = useState('');
  const [displayText, setDisplayText] = useState('');

  const handlePress = () => {
    // Create a span to track this operation
    const span = tracer.startSpan('button.press');

    // Add metadata about what happened
    span.setAttribute('input.length', inputValue.length);
    span.setAttribute('input.value', inputValue);

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

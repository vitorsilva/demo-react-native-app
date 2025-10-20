import { View, Text, StyleSheet, Button, TextInput } from 'react-native';
import { useState } from 'react';

// Test comment - fifth attempt with correct config

export default function HomeScreen() {
  const [inputValue, setInputValue] = useState('');
  const [displayText, setDisplayText] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello World! </Text>
      <TextInput
        style={styles.input}
        placeholder="Type here..."
        value={inputValue}
        onChangeText={setInputValue}
      />
      <Button title="Press me" onPress={() => setDisplayText(inputValue)} />

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

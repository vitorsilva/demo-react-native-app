import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { analytics } from '../../lib/telemetry/analytics';
import { useStore } from '../../lib/store';

export default function SettingsScreen() {
  // Zustand store selectors
  const isDatabaseReady = useStore((state) => state.isDatabaseReady);
  const preferences = useStore((state) => state.preferences);
  const loadPreferences = useStore((state) => state.loadPreferences);
  const updatePreferences = useStore((state) => state.updatePreferences);

  // Load preferences when database is ready
  useEffect(() => {
    if (isDatabaseReady) {
      loadPreferences();
    }
  }, [isDatabaseReady, loadPreferences]);

  // Track screen view
  useFocusEffect(
    useCallback(() => {
      analytics.screenView('settings');
    }, [])
  );

  // Handle cooldown days change
  const handleCooldownChange = async (value: number) => {
    await updatePreferences({
      ...preferences,
      cooldownDays: Math.round(value),
    });
  };

  // Handle suggestions count change
  const handleSuggestionsCountChange = async (value: number) => {
    await updatePreferences({
      ...preferences,
      suggestionsCount: Math.round(value),
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {/* Cooldown Days Setting */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <Text style={styles.settingLabel}>Variety Cooldown</Text>
            <Text style={styles.settingValue}>{preferences.cooldownDays} days</Text>
          </View>
          <Text style={styles.settingDescription}>
            How many days to wait before showing the same ingredient again
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={7}
            step={1}
            value={preferences.cooldownDays}
            onSlidingComplete={handleCooldownChange}
            minimumTrackTintColor="#3e96ef"
            maximumTrackTintColor="#4a5568"
            thumbTintColor="#3e96ef"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>1 day</Text>
            <Text style={styles.sliderLabel}>7 days</Text>
          </View>
        </View>

        {/* Suggestions Count Setting */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <Text style={styles.settingLabel}>Number of Suggestions</Text>
            <Text style={styles.settingValue}>{preferences.suggestionsCount}</Text>
          </View>
          <Text style={styles.settingDescription}>
            How many meal combinations to generate at once
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={2}
            maximumValue={6}
            step={1}
            value={preferences.suggestionsCount}
            onSlidingComplete={handleSuggestionsCountChange}
            minimumTrackTintColor="#3e96ef"
            maximumTrackTintColor="#4a5568"
            thumbTintColor="#3e96ef"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>2</Text>
            <Text style={styles.sliderLabel}>6</Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 About These Settings</Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoBold}>Variety Cooldown:</Text> Controls how often you see the
            same ingredients. Higher values = more variety between meals.
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoBold}>Number of Suggestions:</Text> More suggestions give you
            more choices, but take slightly longer to generate.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111418',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
    marginTop: 8,
  },
  settingCard: {
    backgroundColor: '#1f2329',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3e96ef',
  },
  settingDescription: {
    fontSize: 14,
    color: '#9BA1A6',
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#9BA1A6',
  },
  infoCard: {
    backgroundColor: '#1a2332',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3e96ef',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#9BA1A6',
    lineHeight: 20,
    marginBottom: 8,
  },
  infoBold: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

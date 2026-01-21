import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
// TODO: Telemetry will be initialized in Step 5.7
// import '../lib/telemetry/telemetry';
import ErrorBoundary from '../components/ErrorBoundary';
import { useColorScheme } from '../hooks/use-color-scheme';
import { useEffect } from 'react';
import { initDatabase } from '../lib/database';
import { seedDatabase } from '../lib/database/seed';
import { useStore } from '../lib/store';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const setDatabaseReady = useStore((state) => state.setDatabaseReady);

  useEffect(() => {
    async function setup() {
      try {
        await initDatabase();
        await seedDatabase();
        console.log('✅ Database ready');
        setDatabaseReady();
      } catch (error) {
        console.error('❌ Database initialization failed:', error);
      }
    }
    setup();
  }, [setDatabaseReady]);

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="suggestions/[mealType]" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

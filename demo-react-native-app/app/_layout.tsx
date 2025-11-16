import * as Sentry from '@sentry/react-native';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../lib/telemetry/telemetry';
import ErrorBoundary from '../components/ErrorBoundary';
import { useColorScheme } from '../hooks/use-color-scheme';
import { useEffect } from 'react';
import { initDatabase } from '../lib/database';
import { seedDatabase } from '../lib/database/seed';
import { useStore } from '../lib/store';

Sentry.init({
  dsn: 'https://35bafc36022024afa7ddd747a1491ca5@o4510262174220288.ingest.de.sentry.io/4510262178021456',
  debug: true,
  tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
});

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

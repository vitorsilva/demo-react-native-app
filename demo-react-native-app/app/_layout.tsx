import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import 'react-native-reanimated';
import ErrorBoundary from '../components/ErrorBoundary';
import { useColorScheme } from '../hooks/use-color-scheme';
import { initDatabase } from '../lib/database';
import { seedDatabase } from '../lib/database/seed';
import { initI18n } from '../lib/i18n';
import { useStore } from '../lib/store';
import { initErrorHandling } from '../lib/telemetry/errorHandler';
import { logger } from '../lib/telemetry/logger';
import { trackAppBackground, trackAppForeground } from '../lib/telemetry/screenTracking';
import { isTelemetryEnabled } from '../lib/telemetry/telemetry';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const setDatabaseReady = useStore((state) => state.setDatabaseReady);
  const [isI18nReady, setIsI18nReady] = useState(false);

  // Initialize i18n
  useEffect(() => {
    initI18n()
      .then(() => {
        logger.info('i18n initialized');
        setIsI18nReady(true);
      })
      .catch((error) => {
        logger.error('i18n initialization failed', {
          error: error instanceof Error ? error.message : String(error),
        });
        // Still allow app to run with fallback translations
        setIsI18nReady(true);
      });
  }, []);

  // Initialize telemetry and error handling
  useEffect(() => {
    // Initialize error handling
    initErrorHandling();

    // Log app start
    logger.info('App started', { telemetryEnabled: isTelemetryEnabled });

    // Track app state changes (background/foreground)
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'background') {
        trackAppBackground();
      } else if (state === 'active') {
        trackAppForeground();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Initialize database
  useEffect(() => {
    async function setup() {
      try {
        await initDatabase();
        await seedDatabase();
        logger.info('Database ready');
        setDatabaseReady();
      } catch (error) {
        logger.error('Database initialization failed', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    setup();
  }, [setDatabaseReady]);

  // Wait for i18n to be ready before rendering
  if (!isI18nReady) {
    return null;
  }

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

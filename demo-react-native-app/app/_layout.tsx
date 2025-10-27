import * as Sentry from 'sentry-expo';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../lib/telemetry';
import ErrorBoundary from '../components/ErrorBoundary';
import { useColorScheme } from '../hooks/use-color-scheme';
Sentry.init({
  dsn: 'https://35bafc36022024afa7ddd747a1491ca5@o4510262174220288.ingest.de.sentry.io/4510262178021456',
  enableInExpoDevelopment: true,
  debug: true,
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

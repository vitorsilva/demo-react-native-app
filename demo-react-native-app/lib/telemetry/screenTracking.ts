import { tracer, meter } from './telemetry';
import { logger } from './logger';

// Metrics for screen time
const screenTimeHistogram = meter.createHistogram('screen_time_ms', {
  description: 'Time spent on each screen',
  unit: 'ms',
});

const screenViewCounter = meter.createCounter('screen_views', {
  description: 'Number of screen views',
});

// Track current screen for time measurement
let lastScreen = '';
let screenStartTime = 0;

/**
 * Track a screen view event
 * @param screenName - Name of the screen (e.g., 'home', 'settings')
 */
export function trackScreenView(screenName: string): void {
  const now = Date.now();

  // Record time spent on previous screen
  if (lastScreen && screenStartTime > 0) {
    const duration = now - screenStartTime;
    screenTimeHistogram.record(duration, { screen: lastScreen });
  }

  // Record screen view
  screenViewCounter.add(1, { screen: screenName });

  // Create span for screen view event
  const span = tracer.startSpan('screen.view', {
    attributes: { 'screen.name': screenName },
  });
  span.end();

  logger.debug('Screen view', { screen: screenName });

  lastScreen = screenName;
  screenStartTime = now;
}

/**
 * Track app going to background
 * Records time on current screen before backgrounding
 */
export function trackAppBackground(): void {
  if (lastScreen && screenStartTime > 0) {
    const duration = Date.now() - screenStartTime;
    screenTimeHistogram.record(duration, { screen: lastScreen });
    screenStartTime = 0;
  }

  const span = tracer.startSpan('app.background');
  span.end();
}

/**
 * Track app returning to foreground
 * Restarts screen time tracking
 */
export function trackAppForeground(): void {
  screenStartTime = Date.now();
  const span = tracer.startSpan('app.foreground');
  span.end();
}

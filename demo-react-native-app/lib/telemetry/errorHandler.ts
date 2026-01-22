import { SpanStatusCode } from '@opentelemetry/api';
import { logger } from './logger';
import { tracer } from './telemetry';

// Store original handler for restoration
let originalErrorHandler: ((error: Error, isFatal?: boolean) => void) | null = null;

/**
 * Initialize global error handling with OTel integration.
 * Captures uncaught errors and creates OTel spans for them.
 */
export function initErrorHandling(): void {
  // Only initialize in React Native environment
  if (typeof ErrorUtils === 'undefined') {
    logger.info('ErrorUtils not available (web environment), skipping global error handler');
    return;
  }

  const globalHandler = ErrorUtils.getGlobalHandler();
  originalErrorHandler = globalHandler;

  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    // Create error span (will be exported to backend)
    const span = tracer.startSpan('error.uncaught', {
      attributes: {
        'error.type': isFatal ? 'fatal' : 'uncaught',
        'error.message': error.message,
        'error.stack': error.stack?.split('\n').slice(0, 5).join('\n'),
      },
    });
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    span.end();

    // Also log to console
    logger.error('Uncaught error', { message: error.message, isFatal });

    // Call original handler
    if (originalErrorHandler) {
      originalErrorHandler(error, isFatal);
    }
  });

  logger.info('Error handling initialized');
}

/**
 * Restore original error handler (useful for testing)
 */
export function restoreErrorHandling(): void {
  if (typeof ErrorUtils === 'undefined') return;

  if (originalErrorHandler) {
    ErrorUtils.setGlobalHandler(originalErrorHandler);
    originalErrorHandler = null;
  }
}

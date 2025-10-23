import pino from 'pino';
import { trace } from '@opentelemetry/api';

// Create base pino logger
const logger = pino({
  level: 'info',
  browser: {
    asObject: true,
  },
});

// Helper function to get current trace context
function getTraceContext() {
  const span = trace.getActiveSpan();

  if (span) {
    const spanContext = span.spanContext();
    return {
      traceId: spanContext.traceId,
      spanId: spanContext.spanId,
    };
  }

  return {};
}

// Enhanced logger that automatically includes trace context
export const log = {
  info: (message: string, data?: object) => {
    logger.info(
      {
        ...getTraceContext(),
        ...data,
      },
      message
    );
  },

  warn: (message: string, data?: object) => {
    logger.warn(
      {
        ...getTraceContext(),
        ...data,
      },
      message
    );
  },

  error: (message: string, error?: Error, data?: object) => {
    logger.error(
      {
        ...getTraceContext(),
        error: error?.message,
        stack: error?.stack,
        ...data,
      },
      message
    );
  },
};

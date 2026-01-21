import { tracer } from './telemetry';
import { SpanStatusCode } from '@opentelemetry/api';

/**
 * Keys that should be redacted from logs (PII and secrets)
 * Case-insensitive matching using .includes()
 */
const SENSITIVE_KEYS = [
  // Secrets and credentials
  'apikey',
  'key',
  'password',
  'token',
  'secret',
  'authorization',
  'credential',
  'auth',
  // Personal Identifiable Information (PII)
  'email',
  'phone',
  'address',
  'ssn',
  'name',
  'firstname',
  'lastname',
  'ip',
  'ipaddress',
  'deviceid',
  'userid',
  'accountid',
];

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

/**
 * Recursively redact sensitive data from objects
 * Replaces values with [REDACTED] for keys that match sensitive patterns
 */
function redactSensitive(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redactSensitive);

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive))) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      result[key] = redactSensitive(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Create a logger instance with optional module prefix
 */
function createLogger(modulePrefix?: string) {
  const prefix = modulePrefix ? `[${modulePrefix}]` : '';

  const log = (level: LogLevel, message: string, context?: LogContext) => {
    const safeContext = context ? (redactSensitive(context) as Record<string, unknown>) : {};
    const fullMessage = prefix ? `${prefix} ${message}` : message;

    // Console output (always)
    const consoleMethod =
      level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;

    if (Object.keys(safeContext).length > 0) {
      consoleMethod(`[${level.toUpperCase()}] ${fullMessage}`, safeContext);
    } else {
      consoleMethod(`[${level.toUpperCase()}] ${fullMessage}`);
    }

    // Create OTel span for warn and error (these get exported to backend)
    if (level === 'warn' || level === 'error') {
      const span = tracer.startSpan(`log.${level}`, {
        attributes: {
          'log.level': level,
          'log.message': fullMessage,
          ...safeContext,
        },
      });
      if (level === 'error') {
        span.setStatus({ code: SpanStatusCode.ERROR, message: fullMessage });
      }
      span.end();
    }
  };

  return {
    /**
     * Debug log - console only, not sent to backend
     */
    debug: (message: string, context?: LogContext) => log('debug', message, context),

    /**
     * Info log - console only, not sent to backend
     */
    info: (message: string, context?: LogContext) => log('info', message, context),

    /**
     * Warning log - console + OTel span (sent to backend)
     */
    warn: (message: string, context?: LogContext) => log('warn', message, context),

    /**
     * Error log - console + OTel span with ERROR status (sent to backend)
     */
    error: (message: string, context?: LogContext) => log('error', message, context),

    /**
     * Record a performance metric (creates OTel span)
     * @param name - Metric name (e.g., 'db_query', 'api_call')
     * @param data - Must include 'value' (duration in ms), optional status, error, etc.
     */
    perf: (name: string, data: { value: number; status?: string; [key: string]: unknown }) => {
      const safeData = redactSensitive(data) as Record<string, unknown>;
      const span = tracer.startSpan(`perf.${name}`, {
        attributes: {
          'perf.name': name,
          'perf.duration_ms': data.value,
          ...safeData,
        },
      });
      if (data.status === 'error') {
        span.setStatus({ code: SpanStatusCode.ERROR });
      }
      span.end();
    },

    /**
     * Track a user action (creates OTel span)
     * @param action - Action name (e.g., 'button_clicked', 'generate_suggestions')
     * @param data - Optional context data
     */
    action: (action: string, data?: LogContext) => {
      const safeData = data ? (redactSensitive(data) as Record<string, unknown>) : {};
      const span = tracer.startSpan(`action.${action}`, {
        attributes: {
          'action.name': action,
          ...safeData,
        },
      });
      span.end();
    },

    /**
     * Create child logger with module prefix
     * @param options - Object with 'module' property for the prefix
     */
    child: (options: { module: string }) => createLogger(options.module),
  };
}

/**
 * Default logger instance
 */
export const logger = createLogger();

/**
 * Export redactSensitive for testing
 */
export { redactSensitive };

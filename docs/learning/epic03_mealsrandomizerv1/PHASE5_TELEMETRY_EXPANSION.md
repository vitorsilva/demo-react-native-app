# Phase 5: Telemetry Expansion (Revised)

[← Back to Overview](./OVERVIEW.md) | [Previous: Phase 4](./PHASE4_POLISH_FEATURE.md)

---

## 🎯 Goal

Keep OpenTelemetry SDK for tracing/metrics but replace OTLP exporters with custom exporters that send data to the existing Saberloop PHP backend.

**Current State:** OpenTelemetry SDK configured to send to local Jaeger/Prometheus (requires Docker infrastructure).

**After Phase 5:** OpenTelemetry SDK sends to existing Saberloop backend via custom exporters. No local infrastructure needed.

**Approach:**
- ✅ Keep: OpenTelemetry SDK (tracer, meter, spans, metrics)
- ✅ Create: Custom SpanExporter and MetricExporter → simple JSON events
- ✅ Use: Existing Saberloop PHP backend (no backend changes)
- ❌ Remove: OTLP exporters, Sentry, Pino, Docker infrastructure

**Estimated Time:** 4-6 hours

---

## 🌿 Branching & Commit Strategy

### Branch

Create a new feature branch for this phase:

```bash
git checkout main
git pull origin main
git checkout -b feature/phase5-telemetry-saberloop
```

### Commit Strategy

We use **small, atomic commits** - each commit should:
- Do ONE thing well
- Be independently reviewable
- Pass all tests
- Have a clear, descriptive message

### Suggested Commits

| Steps | Commit Message |
|-------|----------------|
| 5.0 | `chore: remove OTLP exporters, Sentry, and Pino dependencies` |
| 5.0 | `chore: delete Docker infrastructure files and old telemetry modules` |
| 5.1-5.3 | `feat(telemetry): add custom exporters for Saberloop backend` |
| 5.4 | `feat(telemetry): add unified logger with sensitive data redaction` |
| 5.5-5.8 | `feat(telemetry): add error handler and screen tracking` |
| 5.9-5.10 | `feat(telemetry): instrument business logic and database with spans` |
| 5.11 | `feat(telemetry): track user actions` |
| 5.12-5.13 | `feat(telemetry): enable production telemetry and verify backend` |
| 5.14 | `test(telemetry): add unit and E2E tests for telemetry` |
| 5.15 | `docs: add telemetry guide` |

### Merge

After all steps complete and tests pass:

```bash
git checkout main
git merge feature/phase5-telemetry-saberloop
git push origin main
git branch -d feature/phase5-telemetry-saberloop
```

### Step Transition Protocol

**At the end of each step** (e.g., after completing 5.1 before starting 5.2), update the SESSION_STATUS.md with:

1. **Step completion status** - Mark step as done
2. **Unexpected errors** - Any errors encountered and how they were resolved
3. **Decisions made** - Any implementation choices or trade-offs
4. **Doubts clarified** - Questions that came up and their answers
5. **Fixes/workarounds** - Any bugs found and how they were fixed
6. **Learnings** - Key takeaways from the step

**Template for step notes:**
```markdown
### Step 5.X: [Step Name]
**Status:** ✅ Complete

**Errors & Resolutions:**
- [Error]: [How it was resolved]

**Decisions:**
- [Decision]: [Rationale]

**Fixes/Workarounds:**
- [Issue]: [Solution applied]

**Learnings:**
- [Key takeaway]
```

This ensures:
- Progress is tracked in real-time
- Issues are documented for future reference
- Context is preserved if session is interrupted
- Learnings are captured while fresh

---

## 🧹 Cleanup (Step 5.0)

Remove OTLP exporters and infrastructure, but **keep OpenTelemetry core SDK**.

### Files to Delete

| File | Reason |
|------|--------|
| `lib/telemetry/analytics.ts` | Will be replaced with spans/metrics |
| `lib/telemetry/logger.ts` | Uses Pino, will create new logger |
| `lib/telemetry/mealGenerationMetrics.ts` | Will use standard OTel metrics |
| `docker-compose.yml` | No longer need local Jaeger/Prometheus |
| `otel-collector-config.yaml` | No longer need OTel Collector |
| `prometheus.yml` | No longer need Prometheus |

### Files to Keep (and Modify)

| File | Action |
|------|--------|
| `lib/telemetry/telemetry.ts` | Modify: replace OTLP exporters with custom exporters |

### Dependencies to Remove

```bash
npm uninstall \
  @opentelemetry/exporter-metrics-otlp-http \
  @opentelemetry/exporter-trace-otlp-http \
  @sentry/react-native \
  pino
```

### Dependencies to Keep

```bash
# These stay - they're the core OTel SDK
@opentelemetry/api
@opentelemetry/sdk-trace-base
@opentelemetry/sdk-trace-web
@opentelemetry/sdk-metrics
@opentelemetry/resources
@opentelemetry/semantic-conventions
```

### Cleanup Commits

```bash
# First commit: remove dependencies
npm uninstall @opentelemetry/exporter-metrics-otlp-http @opentelemetry/exporter-trace-otlp-http @sentry/react-native pino
git add package.json package-lock.json
git commit -m "chore: remove OTLP exporters, Sentry, and Pino dependencies"

# Second commit: delete infrastructure files
rm docker-compose.yml otel-collector-config.yaml prometheus.yml
rm lib/telemetry/analytics.ts lib/telemetry/logger.ts lib/telemetry/mealGenerationMetrics.ts
git add -A
git commit -m "chore: delete Docker infrastructure files and old telemetry modules"
```

---

## 📋 Architecture Overview

### New Architecture (OTel SDK + Custom Exporters)

```
┌─────────────────────────────────────────────────────────────────┐
│                     React Native App                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  OpenTelemetry SDK                        │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │   │
│  │  │   Tracer    │  │   Meter     │  │   Resources     │   │   │
│  │  │  (spans)    │  │  (metrics)  │  │  (app metadata) │   │   │
│  │  └──────┬──────┘  └──────┬──────┘  └─────────────────┘   │   │
│  └─────────┼────────────────┼───────────────────────────────┘   │
│            │                │                                    │
│  ┌─────────▼────────────────▼───────────────────────────────┐   │
│  │              Custom Exporters                             │   │
│  │  ┌─────────────────────┐  ┌─────────────────────────┐    │   │
│  │  │  SaberloopSpan      │  │  SaberloopMetric        │    │   │
│  │  │  Exporter           │  │  Exporter               │    │   │
│  │  │  (spans → events)   │  │  (metrics → events)     │    │   │
│  │  └──────────┬──────────┘  └──────────┬──────────────┘    │   │
│  └─────────────┼────────────────────────┼───────────────────┘   │
│                │                        │                        │
│  ┌─────────────▼────────────────────────▼───────────────────┐   │
│  │              Batching + Offline Queue                     │   │
│  │  ┌─────────────────────┐  ┌─────────────────────────┐    │   │
│  │  │  Event Queue        │  │  AsyncStorage           │    │   │
│  │  │  (batches events)   │  │  (offline fallback)     │    │   │
│  │  └─────────────────────┘  └─────────────────────────┘    │   │
│  └──────────────────────────┬───────────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────────┘
                              │ HTTPS POST (batched JSON)
                              ▼
                 ┌─────────────────────────┐
                 │  Saberloop PHP Backend  │
                 │  ┌───────────────────┐  │
                 │  │   ingest.php      │  │
                 │  │  (token auth)     │  │
                 │  └─────────┬─────────┘  │
                 │            │            │
                 │  ┌─────────▼─────────┐  │
                 │  │   JSONL Logs      │  │
                 │  └───────────────────┘  │
                 └─────────────────────────┘
```

### Key Characteristics

- **OpenTelemetry SDK**: Full OTel tracing and metrics API
- **Custom Exporters**: Convert spans/metrics to simple JSON events
- **Batching**: Events queued and sent in batches (reduces network requests)
- **Offline resilience**: Events persisted to AsyncStorage if network unavailable
- **Privacy-conscious**: No IP logging, sensitive data can be redacted
- **Existing backend**: Uses Saberloop PHP endpoint (no changes needed)
- **No infrastructure**: No Docker/Jaeger/Prometheus/OTel Collector required

---

## 🛠️ Implementation Steps

### Step 5.1: Create Custom SpanExporter (1 hour)

**What you'll build:** A custom SpanExporter that converts OTel spans to simple JSON events for the Saberloop backend.

**File:** `lib/telemetry/SaberloopSpanExporter.ts` (new file)

```typescript
import { SpanExporter, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const CONFIG = {
  endpoint: Constants.expoConfig?.extra?.telemetryEndpoint ?? '',
  token: Constants.expoConfig?.extra?.telemetryToken ?? '',
  batchSize: Constants.expoConfig?.extra?.telemetryBatchSize ?? 10,
  flushInterval: Constants.expoConfig?.extra?.telemetryFlushInterval ?? 30000,
};

const STORAGE_KEY = 'saborspin_telemetry_queue';

interface TelemetryEvent {
  type: 'span';
  data: {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    name: string;
    kind: string;
    startTime: string;
    endTime: string;
    duration: number;
    status: string;
    attributes: Record<string, unknown>;
  };
  timestamp: string;
  app: string;
  appVersion: string;
}

export class SaberloopSpanExporter implements SpanExporter {
  private queue: TelemetryEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.loadOfflineQueue();
    this.startFlushTimer();
  }

  private async loadOfflineQueue(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.queue = [...parsed, ...this.queue];
        }
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.warn('[Telemetry] Failed to load offline queue:', error);
    }
  }

  private async saveOfflineQueue(): Promise<void> {
    if (this.queue.length === 0) return;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.warn('[Telemetry] Failed to save offline queue:', error);
    }
  }

  private startFlushTimer(): void {
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flushTimer = setInterval(() => this.forceFlush(), CONFIG.flushInterval);
  }

  /**
   * Convert OTel span to simple JSON event
   */
  private spanToEvent(span: ReadableSpan): TelemetryEvent {
    const startTime = span.startTime;
    const endTime = span.endTime;
    const durationNs = (endTime[0] - startTime[0]) * 1e9 + (endTime[1] - startTime[1]);
    const durationMs = durationNs / 1e6;

    return {
      type: 'span',
      data: {
        traceId: span.spanContext().traceId,
        spanId: span.spanContext().spanId,
        parentSpanId: span.parentSpanId,
        name: span.name,
        kind: span.kind.toString(),
        startTime: new Date(startTime[0] * 1000 + startTime[1] / 1e6).toISOString(),
        endTime: new Date(endTime[0] * 1000 + endTime[1] / 1e6).toISOString(),
        duration: Math.round(durationMs),
        status: span.status.code.toString(),
        attributes: span.attributes as Record<string, unknown>,
      },
      timestamp: new Date().toISOString(),
      app: 'saborspin',
      appVersion: Constants.expoConfig?.version ?? 'unknown',
    };
  }

  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): void {
    // Convert spans to events and add to queue
    for (const span of spans) {
      this.queue.push(this.spanToEvent(span));
    }

    // Auto-flush if batch size reached
    if (this.queue.length >= CONFIG.batchSize) {
      this.forceFlush()
        .then(() => resultCallback({ code: ExportResultCode.SUCCESS }))
        .catch(() => resultCallback({ code: ExportResultCode.FAILED }));
    } else {
      resultCallback({ code: ExportResultCode.SUCCESS });
    }
  }

  async forceFlush(): Promise<void> {
    if (this.queue.length === 0 || !CONFIG.endpoint) return;

    const eventsToSend = [...this.queue];
    this.queue = [];

    try {
      const response = await fetch(CONFIG.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telemetry-Token': CONFIG.token,
        },
        body: JSON.stringify({
          events: eventsToSend,
          sentAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      // Re-queue and save offline
      this.queue = [...eventsToSend, ...this.queue];
      await this.saveOfflineQueue();
      console.warn('[Telemetry] Flush failed, saved offline:', error);
    }
  }

  shutdown(): Promise<void> {
    if (this.flushTimer) clearInterval(this.flushTimer);
    return this.forceFlush();
  }
}
```

---

### Step 5.2: Create Custom MetricExporter (45 min)

**What you'll build:** A custom MetricExporter that converts OTel metrics to simple JSON events.

**File:** `lib/telemetry/SaberloopMetricExporter.ts` (new file)

```typescript
import {
  PushMetricExporter,
  ResourceMetrics,
  AggregationTemporality,
  InstrumentType,
} from '@opentelemetry/sdk-metrics';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import Constants from 'expo-constants';

const CONFIG = {
  endpoint: Constants.expoConfig?.extra?.telemetryEndpoint ?? '',
  token: Constants.expoConfig?.extra?.telemetryToken ?? '',
};

interface MetricEvent {
  type: 'metric';
  data: {
    name: string;
    description?: string;
    unit?: string;
    value: number;
    attributes: Record<string, unknown>;
  };
  timestamp: string;
  app: string;
  appVersion: string;
}

export class SaberloopMetricExporter implements PushMetricExporter {

  selectAggregationTemporality(instrumentType: InstrumentType): AggregationTemporality {
    return AggregationTemporality.CUMULATIVE;
  }

  export(
    metrics: ResourceMetrics,
    resultCallback: (result: ExportResult) => void
  ): void {
    const events: MetricEvent[] = [];

    for (const scopeMetrics of metrics.scopeMetrics) {
      for (const metric of scopeMetrics.metrics) {
        for (const dataPoint of metric.dataPoints) {
          const value = typeof dataPoint.value === 'number'
            ? dataPoint.value
            : (dataPoint.value as { sum?: number }).sum ?? 0;

          events.push({
            type: 'metric',
            data: {
              name: metric.descriptor.name,
              description: metric.descriptor.description,
              unit: metric.descriptor.unit,
              value,
              attributes: dataPoint.attributes as Record<string, unknown>,
            },
            timestamp: new Date().toISOString(),
            app: 'saborspin',
            appVersion: Constants.expoConfig?.version ?? 'unknown',
          });
        }
      }
    }

    if (events.length === 0 || !CONFIG.endpoint) {
      resultCallback({ code: ExportResultCode.SUCCESS });
      return;
    }

    fetch(CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Telemetry-Token': CONFIG.token,
      },
      body: JSON.stringify({
        events,
        sentAt: new Date().toISOString(),
      }),
    })
      .then((response) => {
        if (response.ok) {
          resultCallback({ code: ExportResultCode.SUCCESS });
        } else {
          resultCallback({ code: ExportResultCode.FAILED });
        }
      })
      .catch(() => {
        resultCallback({ code: ExportResultCode.FAILED });
      });
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}
```

---

### Step 5.3: Update telemetry.ts (30 min)

**What you'll modify:** Replace OTLP exporters with custom Saberloop exporters.

**File:** `lib/telemetry/telemetry.ts` (modify existing)

```typescript
import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import Constants from 'expo-constants';

// Import custom exporters (instead of OTLP)
import { SaberloopSpanExporter } from './SaberloopSpanExporter';
import { SaberloopMetricExporter } from './SaberloopMetricExporter';

// Check if telemetry is enabled
const isEnabled = Constants.expoConfig?.extra?.telemetryEnabled ?? false;

// Define metadata about your application
const resource = new Resource({
  [ATTR_SERVICE_NAME]: 'saborspin',
  [ATTR_SERVICE_VERSION]: Constants.expoConfig?.version ?? '1.0.0',
});

// === TRACER SETUP ===
const provider = new WebTracerProvider({ resource });

if (isEnabled) {
  // Use custom Saberloop exporter instead of OTLP
  const spanExporter = new SaberloopSpanExporter();
  provider.addSpanProcessor(new BatchSpanProcessor(spanExporter));
}

provider.register();

// === METRICS SETUP ===
const meterProvider = new MeterProvider({ resource });

if (isEnabled) {
  // Use custom Saberloop exporter instead of OTLP
  const metricExporter = new SaberloopMetricExporter();
  meterProvider.addMetricReader(
    new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 60000, // 60 seconds
    })
  );
}

// Export tracer and meter for use throughout the app
export const tracer = provider.getTracer('saborspin');
export const meter = meterProvider.getMeter('saborspin');

// Export enabled status
export const isTelemetryEnabled = isEnabled;
```

---

### Step 5.4: Create Unified Logger (45 min)

**What you'll build:** Logger that creates OTel spans for errors/warnings and redacts sensitive data.

**File:** `lib/telemetry/logger.ts` (new file)

```typescript
import { tracer } from './telemetry';
import { SpanStatusCode } from '@opentelemetry/api';

// Keys that should be redacted from logs (PII and secrets)
const SENSITIVE_KEYS = [
  // Secrets
  'apikey', 'key', 'password', 'token', 'secret', 'authorization', 'credential',
  // PII
  'email', 'phone', 'address', 'ssn', 'name', 'firstname', 'lastname',
  'ip', 'ipaddress', 'deviceid', 'userid', 'accountid',
];

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

function redactSensitive(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redactSensitive);

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive))) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      result[key] = redactSensitive(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function createLogger(modulePrefix?: string) {
  const prefix = modulePrefix ? `[${modulePrefix}]` : '';

  const log = (level: LogLevel, message: string, context?: LogContext) => {
    const safeContext = context ? redactSensitive(context) as Record<string, unknown> : {};
    const fullMessage = prefix ? `${prefix} ${message}` : message;

    // Console output (always)
    const consoleMethod = level === 'error' ? console.error
                        : level === 'warn' ? console.warn
                        : console.log;

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
    debug: (message: string, context?: LogContext) => log('debug', message, context),
    info: (message: string, context?: LogContext) => log('info', message, context),
    warn: (message: string, context?: LogContext) => log('warn', message, context),
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

    // Create child logger with module prefix
    child: (options: { module: string }) => createLogger(options.module),
  };
}

export const logger = createLogger();
```

**Usage Examples:**
```typescript
import { logger } from '../telemetry/logger';

// In a service file
const log = logger.child({ module: 'SuggestionService' });

// Console only (debug/info)
log.debug('Generating suggestions', { mealType, ingredientCount: 15 });
log.info('Generation complete');

// Console + OTel span (warn/error)
log.warn('Slow generation', { duration: 5000 });
log.error('Failed to generate', { error: error.message });

// OTel span only (perf/action) - for metrics that go to backend
log.perf('suggestion_generation', { value: 250, status: 'success', count: 4 });
log.action('generate_pressed', { mealType: 'dinner' });
```

---

### Step 5.5: Create Error Handler (30 min)

**What you'll build:** Global error capturing using OTel spans.

**File:** `lib/telemetry/errorHandler.ts` (new file)

```typescript
import { tracer } from './telemetry';
import { SpanStatusCode } from '@opentelemetry/api';
import { logger } from './logger';

let originalErrorHandler: ((error: Error, isFatal?: boolean) => void) | null = null;

export function initErrorHandling(): void {
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

export function restoreErrorHandling(): void {
  if (originalErrorHandler) {
    ErrorUtils.setGlobalHandler(originalErrorHandler);
    originalErrorHandler = null;
  }
}
```

---

### Step 5.6: Add Screen Tracking (30 min)

**What you'll build:** Screen view tracking using OTel spans.

**File:** `lib/telemetry/screenTracking.ts` (new file)

```typescript
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

let lastScreen: string = '';
let screenStartTime: number = 0;

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

export function trackAppBackground(): void {
  if (lastScreen && screenStartTime > 0) {
    const duration = Date.now() - screenStartTime;
    screenTimeHistogram.record(duration, { screen: lastScreen });
    screenStartTime = 0;
  }

  const span = tracer.startSpan('app.background');
  span.end();
}

export function trackAppForeground(): void {
  screenStartTime = Date.now();
  const span = tracer.startSpan('app.foreground');
  span.end();
}
```

---

### Step 5.7: Integrate Telemetry in App Entry (30 min)

**What you'll modify:** App initialization.

**File:** `app/_layout.tsx` (modify existing)

```typescript
import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { isTelemetryEnabled } from '../lib/telemetry/telemetry';
import { logger } from '../lib/telemetry/logger';
import { initErrorHandling } from '../lib/telemetry/errorHandler';
import { trackAppBackground, trackAppForeground } from '../lib/telemetry/screenTracking';

export default function RootLayout() {
  useEffect(() => {
    // Initialize error handling
    initErrorHandling();

    // Log app start
    logger.info('App started', { telemetryEnabled: isTelemetryEnabled });

    // Track app state changes
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

  // ... rest of layout
}
```

---

### Step 5.8: Add Screen Tracking to Tabs (15 min)

**What you'll modify:** Tab screens to track navigation.

**File:** Each tab screen (example: `app/(tabs)/index.tsx`)

```typescript
import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { trackScreenView } from '../../lib/telemetry/screenTracking';

export default function HomeScreen() {
  useFocusEffect(
    useCallback(() => {
      trackScreenView('home');
    }, [])
  );

  // ... rest of component
}
```

**Apply to all screens:**
- `app/(tabs)/index.tsx` → 'home'
- `app/(tabs)/history.tsx` → 'history'
- `app/(tabs)/manage-ingredients.tsx` → 'manage_ingredients'
- `app/(tabs)/manage-categories.tsx` → 'manage_categories'
- `app/(tabs)/settings.tsx` → 'settings'
- `app/suggestions/[mealType].tsx` → 'suggestions'

---

### Step 5.9: Instrument Business Logic (45 min)

**What you'll modify:** Add logging to core algorithms

**File:** `lib/business-logic/combinationGenerator.ts`

```typescript
import { logger } from '../telemetry/logger';

const log = logger.child({ module: 'CombinationGenerator' });

export function generateCombinations(
  ingredients: Ingredient[],
  count: number = 4,
  options?: { minIngredients?: number; maxIngredients?: number; filterInactive?: boolean }
): Ingredient[][] {
  const startTime = Date.now();

  log.debug('Generating combinations', {
    ingredientCount: ingredients.length,
    requestedCount: count,
    options,
  });

  try {
    // ... existing algorithm logic ...

    const duration = Date.now() - startTime;
    log.perf('combination_generation', {
      value: duration,
      status: 'success',
      inputCount: ingredients.length,
      outputCount: combinations.length,
    });

    return combinations;
  } catch (error) {
    const duration = Date.now() - startTime;
    log.error('Combination generation failed', { error: (error as Error).message });
    log.perf('combination_generation', {
      value: duration,
      status: 'error',
      error: (error as Error).message,
    });
    throw error;
  }
}
```

**File:** `lib/business-logic/varietyEngine.ts`

```typescript
import { logger } from '../telemetry/logger';

const log = logger.child({ module: 'VarietyEngine' });

export function filterByCooldown(
  availableIngredients: Ingredient[],
  recentMeals: MealLog[],
  cooldownDays: number
): Ingredient[] {
  const startTime = Date.now();

  log.debug('Filtering by cooldown', {
    availableCount: availableIngredients.length,
    recentMealsCount: recentMeals.length,
    cooldownDays,
  });

  // ... existing logic ...

  const duration = Date.now() - startTime;
  const excludedCount = availableIngredients.length - filtered.length;

  log.perf('cooldown_filter', {
    value: duration,
    status: 'success',
    inputCount: availableIngredients.length,
    outputCount: filtered.length,
    excludedCount,
  });

  return filtered;
}
```

---

### Step 5.10: Instrument Database Operations (45 min)

**What you'll modify:** Add logging to database functions

**File:** `lib/database/ingredients.ts`

```typescript
import { logger } from '../telemetry/logger';

const log = logger.child({ module: 'DB:Ingredients' });

export async function getAllIngredients(db: DatabaseAdapter): Promise<Ingredient[]> {
  const startTime = Date.now();

  try {
    const rows = await db.getAllAsync('SELECT * FROM ingredients ORDER BY name ASC');
    const duration = Date.now() - startTime;

    log.perf('db_query', {
      value: duration,
      status: 'success',
      table: 'ingredients',
      operation: 'getAll',
      rowCount: rows.length,
    });

    return rows as Ingredient[];
  } catch (error) {
    const duration = Date.now() - startTime;
    log.error('Database query failed', {
      table: 'ingredients',
      operation: 'getAll',
      error: (error as Error).message,
    });
    log.perf('db_query', {
      value: duration,
      status: 'error',
      table: 'ingredients',
      operation: 'getAll',
    });
    throw error;
  }
}

// Apply same pattern to: addIngredient, updateIngredient, deleteIngredient, etc.
```

**Apply to all database files:**
- `lib/database/ingredients.ts`
- `lib/database/categories.ts`
- `lib/database/mealTypes.ts`
- `lib/database/mealLogs.ts`

---

### Step 5.11: Track User Actions (30 min)

**What you'll modify:** Add action tracking to UI interactions

**File:** `app/suggestions/[mealType].tsx`

```typescript
import { logger } from '../../lib/telemetry/logger';

const log = logger.child({ module: 'SuggestionsScreen' });

// When generating new suggestions
const handleGenerateNew = () => {
  log.action('generate_suggestions', { mealType });
  generateMealSuggestions(4, 3);
};

// When selecting a meal
const handleSelectMeal = (index: number) => {
  log.action('select_meal', { mealType, index, ingredientCount: suggestions[index].length });
  setSelectedMealIndex(index);
  setIsModalVisible(true);
};

// When confirming a meal
const handleConfirmMeal = async () => {
  log.action('confirm_meal', { mealType, ingredientCount: selectedMeal.length });
  await logMeal(/* ... */);
};
```

**Apply to other screens:**
- Settings: `log.action('update_setting', { setting, value })`
- Manage Ingredients: `log.action('add_ingredient')`, `log.action('delete_ingredient')`
- Manage Categories: `log.action('add_category')`, `log.action('delete_category')`

---

### Step 5.12: Update App Configuration (15 min)

**What you'll modify:** Add telemetry config to app.json

**File:** `app.json`

```json
{
  "expo": {
    "extra": {
      "telemetryEnabled": false,
      "telemetryEndpoint": "",
      "telemetryToken": "",
      "telemetryBatchSize": 10,
      "telemetryFlushInterval": 30000
    }
  }
}
```

**File:** `.env.example` (create)

```bash
# Telemetry Configuration
# Set these in your local .env file (not committed to git)

# Enable telemetry (true/false)
EXPO_PUBLIC_TELEMETRY_ENABLED=false

# Backend endpoint URL
EXPO_PUBLIC_TELEMETRY_ENDPOINT=https://your-server.com/api/telemetry/ingest.php

# Auth token for endpoint
EXPO_PUBLIC_TELEMETRY_TOKEN=your-secure-token

# Batch size (send when this many events queued)
EXPO_PUBLIC_TELEMETRY_BATCH_SIZE=10

# Flush interval in ms (send at least this often)
EXPO_PUBLIC_TELEMETRY_FLUSH_INTERVAL=30000
```

---

### Step 5.13: Enable Production Telemetry & Backend Verification (30 min)

**Note:** We'll use the **existing Saberloop telemetry backend** which is already deployed. No new backend code needed.

**Backend Details:**
- **Endpoint:** Same PHP ingestion endpoint used by Saberloop
- **Location:** VPS at `saberloop.com/telemetry/ingest.php` (or similar)
- **Auth:** Uses `X-Telemetry-Token` header
- **Format:** Same event structure (type, data, timestamp, sessionId)

**Tasks:**

1. **Get credentials from Saberloop config:**
   - Get the telemetry endpoint URL
   - Generate a new auth token for SaborSpin (or reuse if appropriate)

2. **Configure production endpoint in app.json:**
   ```json
   // app.json
   {
     "expo": {
       "extra": {
         "telemetryEnabled": true,
         "telemetryEndpoint": "https://saberloop.com/telemetry/ingest.php",
         "telemetryToken": "your-saborspin-token"
       }
     }
   }
   ```

3. **Test locally with production endpoint:**
   - Run app with `npm start`
   - Perform several actions (navigate screens, generate suggestions, etc.)
   - Check flush occurs (watch network tab or console logs)

4. **Verify events arrive at backend:**
   - SSH into Saberloop VPS
   - Check JSONL log files for SaborSpin events:
     ```bash
     tail -f /path/to/telemetry/logs/*.jsonl | grep saborspin
     ```
   - Verify events contain expected fields (type, data, timestamp, app, appVersion)
   - Confirm no PII is present in any events

5. **Build and test production APK:**
   ```bash
   eas build --platform android --profile preview
   ```
   - Install APK on test device
   - Use app normally for 5-10 minutes
   - Verify events continue arriving at backend

**Considerations:**
- Events from SaborSpin will be distinguishable by `app: 'saborspin'` field
- Same JSONL log files will contain events from both apps (filterable by app field)

---

### Step 5.14: Write Tests (1.5 hours)

**What we test and why:**

| Component | Test? | Reason |
|-----------|-------|--------|
| SaberloopSpanExporter | ✅ Unit | Core logic: span conversion, batching, offline queue, flush |
| Logger | ✅ Unit | Security: sensitive data redaction, PII protection, OTel span creation |
| Telemetry Integration | ✅ E2E (Playwright) | Verify no crashes, screen tracking works, no PII in output |
| Telemetry Integration | ✅ E2E (Maestro) | Verify no crashes on mobile during telemetry operations |
| ErrorHandler | ❌ No | Just wires global handlers - E2E coverage sufficient |
| ScreenTracking | ❌ No | Simple wrapper calls OTel APIs - no complex logic |

**Target: ~24 unit tests + 4 Playwright E2E tests + 1 Maestro flow**

---

**File:** `lib/telemetry/__tests__/SaberloopSpanExporter.test.ts`

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SpanKind, SpanStatusCode } from '@opentelemetry/api';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      telemetryEnabled: true,
      telemetryEndpoint: 'https://test.com/telemetry',
      telemetryToken: 'test-token',
      telemetryBatchSize: 5,
      telemetryFlushInterval: 30000,
    },
    version: '1.0.0',
  },
}));

// Mock fetch
global.fetch = jest.fn();

// Import after mocks
import { SaberloopSpanExporter } from '../SaberloopSpanExporter';
import { ExportResultCode } from '@opentelemetry/core';

// Helper to create mock ReadableSpan
function createMockSpan(name: string, durationMs: number = 100) {
  const startTime = [Date.now() / 1000, 0] as [number, number];
  const endTime = [startTime[0] + durationMs / 1000, 0] as [number, number];

  return {
    name,
    kind: SpanKind.INTERNAL,
    spanContext: () => ({
      traceId: 'trace-123',
      spanId: 'span-456',
    }),
    parentSpanId: undefined,
    startTime,
    endTime,
    status: { code: SpanStatusCode.OK },
    attributes: { 'test.attr': 'value' },
  };
}

describe('SaberloopSpanExporter', () => {
  let exporter: SaberloopSpanExporter;

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockReset();
    exporter = new SaberloopSpanExporter();
  });

  describe('export()', () => {
    it('should convert span to JSON event format', () => {
      const mockCallback = jest.fn();
      const span = createMockSpan('test.operation');

      exporter.export([span as any], mockCallback);

      // Check callback was called with success
      expect(mockCallback).toHaveBeenCalledWith({ code: ExportResultCode.SUCCESS });
    });

    it('should include required event fields', async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: true });
      const mockCallback = jest.fn();
      const span = createMockSpan('test.operation', 250);

      // Export span and trigger flush by reaching batch size
      for (let i = 0; i < 5; i++) {
        exporter.export([span as any], mockCallback);
      }

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(fetch).toHaveBeenCalled();
      const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);

      expect(body.events[0]).toMatchObject({
        type: 'span',
        app: 'saborspin',
        appVersion: '1.0.0',
        timestamp: expect.any(String),
        data: expect.objectContaining({
          traceId: 'trace-123',
          spanId: 'span-456',
          name: 'test.operation',
        }),
      });
    });

    it('should auto-flush when batch size reached', async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: true });
      const mockCallback = jest.fn();
      const span = createMockSpan('test.operation');

      // Add 5 spans (batch size)
      for (let i = 0; i < 5; i++) {
        exporter.export([span as any], mockCallback);
      }

      await new Promise(resolve => setTimeout(resolve, 10));
      expect(fetch).toHaveBeenCalled();
    });

    it('should not flush before batch size reached', () => {
      const mockCallback = jest.fn();
      const span = createMockSpan('test.operation');

      // Add 4 spans (less than batch size of 5)
      for (let i = 0; i < 4; i++) {
        exporter.export([span as any], mockCallback);
      }

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('forceFlush()', () => {
    it('should send events to endpoint with correct headers', async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: true });
      const mockCallback = jest.fn();
      const span = createMockSpan('test.operation');

      exporter.export([span as any], mockCallback);
      await exporter.forceFlush();

      expect(fetch).toHaveBeenCalledWith(
        'https://test.com/telemetry',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Telemetry-Token': 'test-token',
          }),
        })
      );
    });

    it('should include sentAt in payload', async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: true });
      const mockCallback = jest.fn();
      const span = createMockSpan('test.operation');

      exporter.export([span as any], mockCallback);
      await exporter.forceFlush();

      const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);
      expect(body.sentAt).toBeDefined();
    });

    it('should save to AsyncStorage on network failure', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      const mockCallback = jest.fn();
      const span = createMockSpan('test.operation');

      exporter.export([span as any], mockCallback);
      await exporter.forceFlush();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'saborspin_telemetry_queue',
        expect.any(String)
      );
    });

    it('should re-queue events on HTTP error', async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });
      const mockCallback = jest.fn();
      const span = createMockSpan('test.operation');

      exporter.export([span as any], mockCallback);
      await exporter.forceFlush();

      // Should have saved to offline storage
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('offline queue', () => {
    it('should load saved queue on initialization', async () => {
      const savedEvents = JSON.stringify([
        { type: 'span', data: { name: 'saved' }, timestamp: '2025-01-01' }
      ]);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(savedEvents);

      const newExporter = new SaberloopSpanExporter();
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('saborspin_telemetry_queue');
    });

    it('should remove saved queue after loading', async () => {
      const savedEvents = JSON.stringify([]);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(savedEvents);

      const newExporter = new SaberloopSpanExporter();
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('saborspin_telemetry_queue');
    });
  });

  describe('shutdown()', () => {
    it('should flush remaining events', async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: true });
      const mockCallback = jest.fn();
      const span = createMockSpan('test.operation');

      exporter.export([span as any], mockCallback);
      await exporter.shutdown();

      expect(fetch).toHaveBeenCalled();
    });
  });
});
```

---

**File:** `lib/telemetry/__tests__/logger.test.ts`

```typescript
import { tracer } from '../telemetry';
import { SpanStatusCode } from '@opentelemetry/api';

// Mock the tracer
const mockSpan = {
  setStatus: jest.fn(),
  end: jest.fn(),
};

jest.mock('../telemetry', () => ({
  tracer: {
    startSpan: jest.fn(() => mockSpan),
  },
}));

import { logger } from '../logger';

describe('Logger', () => {
  let consoleSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('sensitive data redaction', () => {
    it('should redact apiKey', () => {
      logger.info('Test', { apiKey: 'secret123', name: 'visible' });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        expect.objectContaining({
          apiKey: '[REDACTED]',
          name: 'visible',
        })
      );
    });

    it('should redact password', () => {
      logger.info('Test', { password: 'secret', user: 'john' });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          password: '[REDACTED]',
          user: 'john',
        })
      );
    });

    it('should redact token', () => {
      logger.info('Test', { authToken: 'bearer-xyz', id: 123 });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          authToken: '[REDACTED]',
          id: 123,
        })
      );
    });

    it('should redact nested sensitive keys', () => {
      logger.info('Test', {
        config: {
          apiKey: 'secret',
          url: 'https://api.com'
        }
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          config: expect.objectContaining({
            apiKey: '[REDACTED]',
            url: 'https://api.com',
          }),
        })
      );
    });

    it('should handle null and undefined values', () => {
      expect(() => {
        logger.info('Test', { value: null, other: undefined });
      }).not.toThrow();
    });
  });

  describe('log levels', () => {
    it('debug() should log to console but NOT create OTel span', () => {
      logger.debug('Debug message', { data: 'test' });

      expect(consoleSpy).toHaveBeenCalled();
      expect(tracer.startSpan).not.toHaveBeenCalled();
    });

    it('info() should log to console but NOT create OTel span', () => {
      logger.info('Info message', { data: 'test' });

      expect(consoleSpy).toHaveBeenCalled();
      expect(tracer.startSpan).not.toHaveBeenCalled();
    });

    it('warn() should log to console AND create OTel span', () => {
      logger.warn('Warning message', { data: 'test' });

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(tracer.startSpan).toHaveBeenCalledWith('log.warn', expect.any(Object));
      expect(mockSpan.end).toHaveBeenCalled();
    });

    it('error() should log to console AND create error OTel span', () => {
      logger.error('Error message', { error: 'something failed' });

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(tracer.startSpan).toHaveBeenCalledWith('log.error', expect.any(Object));
      expect(mockSpan.setStatus).toHaveBeenCalledWith(
        expect.objectContaining({ code: SpanStatusCode.ERROR })
      );
      expect(mockSpan.end).toHaveBeenCalled();
    });
  });

  describe('perf()', () => {
    it('should create OTel span with performance data', () => {
      logger.perf('api_call', { value: 250, status: 'success' });

      expect(tracer.startSpan).toHaveBeenCalledWith('perf.api_call', {
        attributes: expect.objectContaining({
          'perf.name': 'api_call',
          'perf.duration_ms': 250,
        }),
      });
      expect(mockSpan.end).toHaveBeenCalled();
    });

    it('should set error status when status is error', () => {
      logger.perf('api_call', { value: 250, status: 'error' });

      expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: SpanStatusCode.ERROR });
    });

    it('should redact sensitive data in perf context', () => {
      logger.perf('api_call', { value: 100, apiKey: 'secret' });

      expect(tracer.startSpan).toHaveBeenCalledWith('perf.api_call', {
        attributes: expect.objectContaining({
          apiKey: '[REDACTED]',
        }),
      });
    });
  });

  describe('action()', () => {
    it('should create OTel span for user action', () => {
      logger.action('button_clicked', { button: 'save' });

      expect(tracer.startSpan).toHaveBeenCalledWith('action.button_clicked', {
        attributes: expect.objectContaining({
          'action.name': 'button_clicked',
          button: 'save',
        }),
      });
      expect(mockSpan.end).toHaveBeenCalled();
    });

    it('should work without data parameter', () => {
      logger.action('page_loaded');

      expect(tracer.startSpan).toHaveBeenCalledWith('action.page_loaded', {
        attributes: expect.objectContaining({
          'action.name': 'page_loaded',
        }),
      });
    });
  });

  describe('child()', () => {
    it('should create logger with module prefix', () => {
      const child = logger.child({ module: 'TestModule' });
      child.info('Child message');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TestModule]'),
        undefined
      );
    });

    it('should include prefix in OTel span messages', () => {
      const child = logger.child({ module: 'TestModule' });
      child.error('Child error');

      expect(tracer.startSpan).toHaveBeenCalledWith('log.error', {
        attributes: expect.objectContaining({
          'log.message': expect.stringContaining('[TestModule]'),
        }),
      });
    });
  });
});
```

---

**Test Summary:**

| File | Tests | Coverage |
|------|-------|----------|
| `SaberloopSpanExporter.test.ts` | ~12 | span conversion, batching, flush, offline queue |
| `logger.test.ts` | ~12 | redaction, log levels, perf, action, child |
| **Total** | **~24** | Core telemetry functionality |

**What we're NOT testing (and why):**
- `SaberloopMetricExporter` - Simple conversion, no complex logic
- `errorHandler.ts` - Wires global handlers, covered by E2E
- `screenTracking.ts` - Thin wrapper calls OTel APIs - no complex logic
- Integration between components - E2E tests cover this

---

### Step 5.15: Documentation (30 min)

**File:** `docs/developer-guide/TELEMETRY.md` (new)

```markdown
# Telemetry Guide

SaborSpin uses a lightweight, privacy-conscious telemetry system for error tracking and analytics.

## Architecture

- **TelemetryClient**: Singleton that batches and sends events
- **Logger**: Unified logging with automatic telemetry integration
- **ErrorHandler**: Global error capturing
- **ScreenTracking**: Navigation analytics

## Event Types

| Type | Description | When Sent |
|------|-------------|-----------|
| `error` | Errors and crashes | logger.error(), uncaught exceptions |
| `log` | Warnings | logger.warn() |
| `metric` | Performance data | logger.perf() |
| `event` | User actions | logger.action() |

## Usage

```typescript
import { logger } from '../lib/telemetry/logger';

const log = logger.child({ module: 'MyComponent' });

// Debug (console only)
log.debug('Starting process', { step: 1 });

// Info (console only)
log.info('Process complete');

// Warning (console + telemetry)
log.warn('Slow response', { duration: 5000 });

// Error (console + telemetry)
log.error('Failed to save', { error: error.message });

// Performance metric (telemetry)
log.perf('api_call', { value: 250, status: 'success' });

// User action (telemetry)
log.action('button_clicked', { button: 'save' });
```

## Configuration

Set in `.env` or `app.json`:

- `EXPO_PUBLIC_TELEMETRY_ENABLED`: Enable/disable (default: false)
- `EXPO_PUBLIC_TELEMETRY_ENDPOINT`: Backend URL
- `EXPO_PUBLIC_TELEMETRY_TOKEN`: Auth token
- `EXPO_PUBLIC_TELEMETRY_BATCH_SIZE`: Events per batch (default: 10)
- `EXPO_PUBLIC_TELEMETRY_FLUSH_INTERVAL`: Flush interval ms (default: 30000)

## Privacy

- No IP addresses logged
- Sensitive data auto-redacted (passwords, tokens, etc.)
- Events batched to reduce network traffic
- Offline queue for reliability
```

---

### Step 5.16: Final Validation via Automated Tests (1 hour)

**Goal:** Replace manual testing with automated E2E and unit tests wherever possible.

**1. Code Quality (automated in CI):**
```bash
npm test              # Unit tests
npx tsc --noEmit      # TypeScript
npm run lint          # ESLint
```

**2. E2E Telemetry Tests:**

**File:** `e2e/telemetry.spec.ts` (new)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Telemetry Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForTimeout(2000);
  });

  test('app starts without telemetry errors', async ({ page }) => {
    // No console errors related to telemetry
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('Telemetry')) {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(3000);
    expect(errors).toHaveLength(0);
  });

  test('screen tracking fires on navigation', async ({ page }) => {
    const telemetryEvents: string[] = [];

    // Intercept console logs for telemetry
    page.on('console', msg => {
      if (msg.text().includes('screen.view') || msg.text().includes('[DEBUG]')) {
        telemetryEvents.push(msg.text());
      }
    });

    // Navigate to suggestions
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForTimeout(1000);

    // Navigate back
    await page.goBack();
    await page.waitForTimeout(1000);

    // Should have logged screen views
    expect(telemetryEvents.length).toBeGreaterThan(0);
  });

  test('performance metrics logged on suggestion generation', async ({ page }) => {
    const perfLogs: string[] = [];

    page.on('console', msg => {
      if (msg.text().includes('perf.') || msg.text().includes('combination_generation')) {
        perfLogs.push(msg.text());
      }
    });

    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForTimeout(3000);

    // Should have performance logs from generation
    expect(perfLogs.length).toBeGreaterThan(0);
  });

  test('no PII in telemetry events', async ({ page }) => {
    const allLogs: string[] = [];
    const piiPatterns = [
      /email/i,
      /password/i,
      /phone/i,
      /address/i,
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email pattern
    ];

    page.on('console', msg => {
      allLogs.push(msg.text());
    });

    // Use app normally
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForTimeout(2000);
    await page.getByText('Generate New Ideas').click();
    await page.waitForTimeout(2000);

    // Check no PII patterns in logs
    for (const log of allLogs) {
      for (const pattern of piiPatterns) {
        expect(log).not.toMatch(pattern);
      }
    }
  });
});
```

**3. Maestro Tests (for mobile):**

**File:** `e2e/maestro/telemetry-flow.yaml` (new)

```yaml
appId: com.saborspin.app
---
- launchApp
- assertVisible: "What's for"
- tapOn: "Breakfast"
- assertVisible: "Breakfast Ideas"
- tapOn: "Generate New Ideas"
- waitForAnimationToEnd
# Maestro ensures no crashes during telemetry operations
- assertVisible: "Select a meal"
- tapOn:
    id: "meal-card-0"
- assertVisible: "Confirm"
- tapOn: "Cancel"
- assertVisible: "Breakfast Ideas"
```

**Run Maestro tests:**
```bash
maestro test e2e/maestro/telemetry-flow.yaml
```

**4. Unit Tests for Privacy (in logger.test.ts):**

```typescript
describe('PII Protection', () => {
  it('should never include email patterns in logs', () => {
    const log = logger.child({ module: 'Test' });
    log.info('User action', { email: 'test@example.com', name: 'John' });

    // Verify email was redacted
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ email: '[REDACTED]' })
    );
  });

  it('should never include phone patterns in logs', () => {
    const log = logger.child({ module: 'Test' });
    log.info('Contact', { phone: '555-123-4567', id: 123 });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ phone: '[REDACTED]' })
    );
  });
});
```

**5. Backend Verification (manual, one-time):**
- [ ] SSH into Saberloop VPS
- [ ] Run: `tail -f /path/to/logs/*.jsonl | grep saborspin`
- [ ] Verify events arrive with correct structure
- [ ] Confirm no PII present in any event

---

## ✅ Success Criteria

### Cleanup
- [ ] OTLP exporter dependencies removed (2 packages)
- [ ] Sentry dependency removed
- [ ] Pino dependency removed
- [ ] Old telemetry files deleted (3 files: analytics.ts, logger.ts, mealGenerationMetrics.ts)
- [ ] Docker/infrastructure files deleted (3 files)
- [ ] No remaining imports from removed packages

### Implementation
- [ ] Custom SaberloopSpanExporter with batching and offline queue
- [ ] Custom SaberloopMetricExporter for metrics
- [ ] Updated telemetry.ts using custom exporters
- [ ] Unified Logger with sensitive data redaction and OTel spans
- [ ] Global error handling with OTel spans
- [ ] Screen tracking with OTel metrics
- [ ] Business logic instrumentation (perf spans)
- [ ] Database operation logging (perf spans)
- [ ] User action tracking (action spans)

### Testing
- [ ] Unit tests for SaberloopSpanExporter (~12 tests)
- [ ] Unit tests for Logger including PII protection (~12 tests)
- [ ] E2E telemetry tests (no errors, screen tracking, perf metrics, no PII)
- [ ] Maestro tests pass on mobile (telemetry-flow.yaml)
- [ ] All existing tests still pass (101+ unit, 12+ E2E)

### Documentation
- [ ] TELEMETRY.md created
- [ ] Configuration documented
- [ ] Usage examples provided

### Privacy & PII Protection
- [ ] No IP addresses logged (backend doesn't store client IPs)
- [ ] No user identifiers (no user IDs, device IDs, or advertising IDs)
- [ ] No location data (no GPS, no city/country)
- [ ] No personal names or contact info
- [ ] Sensitive keys auto-redacted: `apiKey`, `password`, `token`, `secret`, `authorization`, `email`, `phone`
- [ ] E2E test verifies no PII patterns in telemetry output
- [ ] Unit tests verify redaction works correctly
- [ ] Telemetry disabled by default (opt-in)
- [ ] Only anonymous, aggregated usage data collected:
  - Screen views (screen name only)
  - Button clicks (action name only)
  - Performance metrics (duration, counts)
  - Error messages (no user context)

### Git
- [ ] Work done in feature branch
- [ ] Small, atomic commits
- [ ] All commits pass tests
- [ ] Clean merge to main

---

## 🎓 Learning Outcomes

After completing Phase 5, you'll understand:
- Singleton pattern for telemetry clients
- Event batching for network efficiency
- Offline-first data persistence
- Structured logging best practices
- Privacy-conscious telemetry design
- React Native error handling

---

## 📁 Files Created/Modified

### Deleted Files (Cleanup)
- `lib/telemetry/analytics.ts` - Old metrics module
- `lib/telemetry/logger.ts` - Old Pino-based logger (recreated with OTel)
- `lib/telemetry/mealGenerationMetrics.ts` - Old metrics module
- `docker-compose.yml` - Jaeger/Prometheus infrastructure
- `otel-collector-config.yaml` - OTel Collector config
- `prometheus.yml` - Prometheus config

### Removed Dependencies
- `@opentelemetry/exporter-metrics-otlp-http` - OTLP metrics exporter
- `@opentelemetry/exporter-trace-otlp-http` - OTLP trace exporter
- `@sentry/react-native` - Sentry error tracking
- `pino` - JSON logger

### Kept Dependencies (OpenTelemetry Core)
- `@opentelemetry/api` - OTel API
- `@opentelemetry/sdk-trace-base` - Trace SDK
- `@opentelemetry/sdk-trace-web` - Web tracer provider
- `@opentelemetry/sdk-metrics` - Metrics SDK
- `@opentelemetry/resources` - Resource attributes
- `@opentelemetry/semantic-conventions` - Standard attribute names

### New Files
- `lib/telemetry/SaberloopSpanExporter.ts` (~120 lines) - Custom span → JSON event exporter
- `lib/telemetry/SaberloopMetricExporter.ts` (~80 lines) - Custom metric → JSON event exporter
- `lib/telemetry/logger.ts` (~100 lines) - Unified logger with OTel spans
- `lib/telemetry/errorHandler.ts` (~50 lines) - Global error capture
- `lib/telemetry/screenTracking.ts` (~60 lines) - Screen view tracking
- `lib/telemetry/__tests__/SaberloopSpanExporter.test.ts` (~150 lines)
- `lib/telemetry/__tests__/logger.test.ts` (~150 lines)
- `e2e/telemetry.spec.ts` (~80 lines) - E2E telemetry tests (Playwright)
- `e2e/maestro/telemetry-flow.yaml` (~15 lines) - Maestro mobile tests
- `docs/developer-guide/TELEMETRY.md`
- `.env.example`

**Note:** No backend code needed - using existing Saberloop telemetry backend.

### Modified Files
- `lib/telemetry/telemetry.ts` - Replace OTLP exporters with custom exporters
- `app/_layout.tsx` - Initialize telemetry
- `app/(tabs)/*.tsx` - Screen tracking
- `app/suggestions/[mealType].tsx` - Action tracking
- `lib/business-logic/combinationGenerator.ts` - Perf logging
- `lib/business-logic/varietyEngine.ts` - Perf logging
- `lib/database/*.ts` - Query logging
- `app.json` - Telemetry config
- `package.json` - Removed 4 dependencies

**Total New Code:** ~700 lines (excluding tests)
**Total Removed:** ~200 lines + 4 dependencies + 3 config files

---

## 🚀 Next Steps

After completing Phase 5, proceed to **Phase 6: Validation & Iteration**:
1. Build production APK (V1.0.0)
2. Recruit 5-10 beta testers
3. Distribute APK and collect feedback
4. Use telemetry data to identify issues and priorities
5. Iterate with V1.1.0 and V1.2.0 releases

---

[← Back to Overview](./OVERVIEW.md) | [Previous: Phase 4](./PHASE4_POLISH_FEATURE.md)

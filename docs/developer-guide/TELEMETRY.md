# Telemetry Guide

SaborSpin uses a lightweight, privacy-conscious telemetry system for error tracking and analytics. The system is built on OpenTelemetry SDK with custom exporters that send data to the Saberloop backend.

## Architecture

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
                 └─────────────────────────┘
```

### Components

| Component | File | Description |
|-----------|------|-------------|
| **Tracer/Meter** | `lib/telemetry/telemetry.ts` | OpenTelemetry SDK setup |
| **SpanExporter** | `lib/telemetry/SaberloopSpanExporter.ts` | Custom exporter with batching and offline queue |
| **MetricExporter** | `lib/telemetry/SaberloopMetricExporter.ts` | Metrics to JSON events |
| **Logger** | `lib/telemetry/logger.ts` | Unified logging with automatic PII redaction |
| **ErrorHandler** | `lib/telemetry/errorHandler.ts` | Global error capturing |
| **ScreenTracking** | `lib/telemetry/screenTracking.ts` | Navigation analytics |

## Event Types

| Type | Description | When Sent |
|------|-------------|-----------  |
| `span` (error) | Errors and crashes | `logger.error()`, uncaught exceptions |
| `span` (log) | Warnings | `logger.warn()` |
| `span` (perf) | Performance data | `logger.perf()` |
| `span` (action) | User actions | `logger.action()` |
| `metric` | Aggregated metrics | Screen time, view counts |

## Usage

### Basic Logging

```typescript
import { logger } from '../lib/telemetry/logger';

// Create child logger with module prefix (recommended)
const log = logger.child({ module: 'MyComponent' });

// Debug (console only - not sent to backend)
log.debug('Starting process', { step: 1 });

// Info (console only - not sent to backend)
log.info('Process complete');

// Warning (console + OTel span - sent to backend)
log.warn('Slow response', { duration: 5000 });

// Error (console + OTel span with ERROR status - sent to backend)
log.error('Failed to save', { error: error.message });
```

### Performance Metrics

```typescript
// Track operation duration
const startTime = Date.now();
// ... operation ...
const duration = Date.now() - startTime;

log.perf('api_call', {
  value: duration,  // Required: duration in ms
  status: 'success',
  endpoint: '/api/data'
});

// For errors
log.perf('api_call', {
  value: duration,
  status: 'error',
  error: error.message
});
```

### User Action Tracking

```typescript
// Track button clicks, form submissions, etc.
log.action('button_clicked', { button: 'save' });
log.action('meal_selected', { mealType: 'breakfast', count: 3 });
log.action('settings_changed', { setting: 'cooldown', value: 3 });
```

### Screen Tracking

```typescript
import { trackScreenView } from '../lib/telemetry/screenTracking';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export default function MyScreen() {
  useFocusEffect(
    useCallback(() => {
      trackScreenView('my_screen');
    }, [])
  );

  // ... component
}
```

## Configuration

Telemetry is configured in `app.json` under `expo.extra`:

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

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `telemetryEnabled` | boolean | `false` | Enable/disable telemetry |
| `telemetryEndpoint` | string | `""` | Backend URL for ingestion |
| `telemetryToken` | string | `""` | Auth token for backend |
| `telemetryBatchSize` | number | `10` | Events per batch before auto-flush |
| `telemetryFlushInterval` | number | `30000` | Flush interval in ms (30s default) |

### Enabling for Production

1. Update `app.json`:
```json
{
  "expo": {
    "extra": {
      "telemetryEnabled": true,
      "telemetryEndpoint": "https://your-server.com/telemetry/ingest.php",
      "telemetryToken": "your-secure-token"
    }
  }
}
```

2. Rebuild the app with `eas build` or `npx expo start --clear`

## Privacy

SaborSpin's telemetry is designed with privacy as a core principle:

### What We DON'T Collect

- ❌ **IP addresses** - Backend doesn't log client IPs
- ❌ **User identifiers** - No user IDs, device IDs, or advertising IDs
- ❌ **Location data** - No GPS, city, or country data
- ❌ **Personal names or contact info** - Automatically redacted
- ❌ **Authentication tokens** - Automatically redacted

### Automatic PII Redaction

The logger automatically redacts values for keys matching these patterns:

```typescript
const SENSITIVE_KEYS = [
  // Secrets
  'apikey', 'key', 'password', 'token', 'secret',
  'authorization', 'credential', 'auth',
  // PII
  'email', 'phone', 'address', 'ssn', 'name',
  'firstname', 'lastname', 'ip', 'ipaddress',
  'deviceid', 'userid', 'accountid',
];
```

**Example:**
```typescript
// This input:
log.info('User logged in', {
  email: 'user@example.com',
  userId: '12345',
  action: 'login'
});

// Becomes:
// "[INFO] User logged in" { email: '[REDACTED]', userId: '[REDACTED]', action: 'login' }
```

### What We DO Collect

Only anonymous, aggregated usage data:

| Data | Example | Purpose |
|------|---------|---------|
| Screen views | `screen: 'home'` | Understand app flow |
| Button clicks | `action: 'generate_suggestions'` | Feature usage |
| Performance metrics | `duration: 250` | Identify slow operations |
| Error messages | `error: 'Network timeout'` | Fix bugs |

## Offline Resilience

Events are automatically saved to AsyncStorage when:
- Network is unavailable
- Backend returns an error
- App is closed before flush

Saved events are automatically sent on next app launch.

## Testing

### Unit Tests

```bash
# Run telemetry unit tests
npm test -- --testPathPattern="telemetry"
```

Tests cover:
- Span conversion and batching
- Offline queue persistence
- PII redaction
- Log levels and OTel span creation

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

Verifies:
- App starts without telemetry errors
- Screen tracking works during navigation
- Performance metrics logged on suggestion generation
- No PII patterns in console output

### E2E Tests (Maestro - Mobile)

```bash
maestro test e2e/maestro/telemetry-flow.yaml
```

Verifies telemetry doesn't crash the app during:
- App launch
- Screen navigation
- Suggestion generation
- Meal logging

## Disabling Telemetry

Set `telemetryEnabled: false` in `app.json` or leave endpoint empty:

```json
{
  "expo": {
    "extra": {
      "telemetryEnabled": false
    }
  }
}
```

When disabled:
- No spans are created
- No network requests are made
- Logger still outputs to console (for development)

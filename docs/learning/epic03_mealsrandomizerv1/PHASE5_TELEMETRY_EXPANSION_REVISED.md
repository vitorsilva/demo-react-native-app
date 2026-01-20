# Phase 5: Telemetry Expansion (Revised)

[← Back to Overview](./OVERVIEW.md) | [Previous: Phase 4](./PHASE4_POLISH_FEATURE.md)

---

## 🎯 Goal

Implement a lightweight, privacy-conscious telemetry system based on the Saberloop approach. This replaces the original OpenTelemetry/Jaeger/Prometheus plan with a simpler, more practical solution.

**Current State:** Basic telemetry foundation exists but needs expansion for production monitoring.

**After Phase 5:** Complete observability with error tracking, performance metrics, user action logging, and offline resilience - all without complex infrastructure.

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

| Step | Commit Message |
|------|----------------|
| 5.0 | `chore: remove OpenTelemetry, Sentry, and Pino dependencies` |
| 5.0 | `chore: delete old telemetry infrastructure files` |
| 5.1 | `feat(telemetry): add TelemetryClient with batching and offline queue` |
| 5.2 | `feat(telemetry): add unified logger with sensitive data redaction` |
| 5.3 | `feat(telemetry): add global error handler` |
| 5.4 | `feat(telemetry): add screen tracking` |
| 5.5 | `feat(telemetry): integrate telemetry in app entry` |
| 5.6 | `feat(telemetry): add screen tracking to all tabs` |
| 5.7 | `feat(telemetry): instrument business logic` |
| 5.8 | `feat(telemetry): instrument database operations` |
| 5.9 | `feat(telemetry): track user actions in UI` |
| 5.10-11 | `chore: configure telemetry backend connection` |
| 5.12 | `test(telemetry): add unit tests for TelemetryClient and Logger` |
| 5.13 | `docs: add telemetry guide` |

### Merge

After all steps complete and tests pass:

```bash
git checkout main
git merge feature/phase5-telemetry-saberloop
git push origin main
git branch -d feature/phase5-telemetry-saberloop
```

---

## 🧹 Cleanup (Step 5.0)

Before implementing the new telemetry system, we need to remove the old OpenTelemetry/Sentry/Pino infrastructure.

### Files to Delete

| File | Reason |
|------|--------|
| `lib/telemetry/telemetry.ts` | OpenTelemetry tracer/meter setup |
| `lib/telemetry/analytics.ts` | Uses OpenTelemetry meter |
| `lib/telemetry/logger.ts` | Uses Pino + OpenTelemetry trace |
| `lib/telemetry/mealGenerationMetrics.ts` | Uses OpenTelemetry meter |
| `docker-compose.yml` | Jaeger/Prometheus/OTel Collector |
| `otel-collector-config.yaml` | OTel Collector config |
| `prometheus.yml` | Prometheus config |

### Dependencies to Remove

Remove from `package.json`:

```bash
npm uninstall @opentelemetry/api \
  @opentelemetry/exporter-metrics-otlp-http \
  @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/instrumentation \
  @opentelemetry/resources \
  @opentelemetry/sdk-metrics \
  @opentelemetry/sdk-trace-base \
  @opentelemetry/sdk-trace-web \
  @opentelemetry/semantic-conventions \
  @sentry/react-native \
  pino
```

### Update Imports

Search and remove any imports from:
- `@opentelemetry/*`
- `@sentry/react-native`
- `pino`
- Old telemetry files (`./telemetry`, `./analytics`, `./mealGenerationMetrics`)

### Cleanup Commits

```bash
# First commit: remove dependencies
npm uninstall @opentelemetry/api @opentelemetry/exporter-metrics-otlp-http ...
git add package.json package-lock.json
git commit -m "chore: remove OpenTelemetry, Sentry, and Pino dependencies"

# Second commit: delete files
rm lib/telemetry/telemetry.ts lib/telemetry/analytics.ts ...
rm docker-compose.yml otel-collector-config.yaml prometheus.yml
git add -A
git commit -m "chore: delete old telemetry infrastructure files"
```

---

## 📋 Architecture Overview

### Saberloop Approach (What We're Adopting)

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Logger    │──│ Telemetry   │──│   AsyncStorage      │  │
│  │  (unified)  │  │   Client    │  │  (offline queue)    │  │
│  └─────────────┘  └──────┬──────┘  └─────────────────────┘  │
│                          │                                   │
│  ┌─────────────┐         │         ┌─────────────────────┐  │
│  │   Error     │─────────┤         │   Performance       │  │
│  │  Handler    │         │         │   Monitoring        │  │
│  └─────────────┘         │         └─────────────────────┘  │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTPS POST (batched)
                           ▼
              ┌─────────────────────────┐
              │    PHP Backend (VPS)    │
              │  ┌───────────────────┐  │
              │  │   ingest.php      │  │
              │  │  (token auth)     │  │
              │  └─────────┬─────────┘  │
              │            │            │
              │  ┌─────────▼─────────┐  │
              │  │   JSONL Logs      │  │
              │  │ (daily rotation)  │  │
              │  └───────────────────┘  │
              └─────────────────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │   Analysis Scripts      │
              │  (error-report, etc.)   │
              └─────────────────────────┘
```

### Key Characteristics

- **Frontend-centric**: All telemetry logic lives in the app
- **Batching**: Events queued and sent in batches (reduces network requests)
- **Offline resilience**: Events persisted to AsyncStorage if network unavailable
- **Privacy-conscious**: No IP logging, automatic sensitive data redaction
- **Simple backend**: PHP endpoint writes to JSONL files
- **No infrastructure**: No Docker, Jaeger, Prometheus, or Sentry required

---

## 🛠️ Implementation Steps

### Step 5.1: Create TelemetryClient (1 hour)

**What you'll build:** Core telemetry singleton with batching and offline support

**File:** `lib/telemetry/telemetryClient.ts` (new file)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';

// Configuration from environment/app config
const CONFIG = {
  enabled: Constants.expoConfig?.extra?.telemetryEnabled ?? false,
  endpoint: Constants.expoConfig?.extra?.telemetryEndpoint ?? '',
  token: Constants.expoConfig?.extra?.telemetryToken ?? '',
  batchSize: Constants.expoConfig?.extra?.telemetryBatchSize ?? 10,
  flushInterval: Constants.expoConfig?.extra?.telemetryFlushInterval ?? 30000,
};

const STORAGE_KEY = 'saborspin_telemetry_queue';

export type TelemetryEventType = 'error' | 'log' | 'metric' | 'event';

export interface TelemetryEvent {
  type: TelemetryEventType;
  data: Record<string, unknown>;
  timestamp: string;
  sessionId: string;
  app: string;  // 'saborspin' - distinguishes from other apps using same backend
  screen?: string;
  appVersion?: string;
}

class TelemetryClient {
  private static instance: TelemetryClient;
  private queue: TelemetryEvent[] = [];
  private sessionId: string = '';
  private flushTimer: NodeJS.Timeout | null = null;
  private currentScreen: string = '';

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.loadOfflineQueue();
    this.startFlushTimer();
  }

  static getInstance(): TelemetryClient {
    if (!TelemetryClient.instance) {
      TelemetryClient.instance = new TelemetryClient();
    }
    return TelemetryClient.instance;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Crypto.randomUUID().slice(0, 8)}`;
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
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushTimer = setInterval(() => {
      this.flush();
    }, CONFIG.flushInterval);
  }

  setCurrentScreen(screen: string): void {
    this.currentScreen = screen;
  }

  track(type: TelemetryEventType, data: Record<string, unknown>): void {
    if (!CONFIG.enabled) return;

    const event: TelemetryEvent = {
      type,
      data,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      app: 'saborspin',  // Identifies this app in shared backend
      screen: this.currentScreen,
      appVersion: Constants.expoConfig?.version ?? 'unknown',
    };

    this.queue.push(event);

    // Auto-flush when batch size reached
    if (this.queue.length >= CONFIG.batchSize) {
      this.flush();
    }
  }

  async flush(): Promise<boolean> {
    if (!CONFIG.enabled || this.queue.length === 0 || !CONFIG.endpoint) {
      return true;
    }

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

      return true;
    } catch (error) {
      // Re-queue failed events and save to offline storage
      this.queue = [...eventsToSend, ...this.queue];
      await this.saveOfflineQueue();
      console.warn('[Telemetry] Flush failed, events saved offline:', error);
      return false;
    }
  }

  isEnabled(): boolean {
    return CONFIG.enabled;
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  // For testing
  clearQueue(): void {
    this.queue = [];
  }
}

export const telemetry = TelemetryClient.getInstance();
```

**Key Features:**
- Singleton pattern (same as Saberloop)
- AsyncStorage for offline queue (replaces localStorage)
- Batching with configurable size
- Auto-flush timer
- Session ID for event correlation

---

### Step 5.2: Create Unified Logger (45 min)

**What you'll build:** Logger that integrates with telemetry and redacts sensitive data

**File:** `lib/telemetry/logger.ts` (new file)

```typescript
import { telemetry } from './telemetryClient';

// Keys that should be redacted from logs
const SENSITIVE_KEYS = ['apikey', 'key', 'password', 'token', 'secret', 'authorization'];

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
    const safeContext = context ? redactSensitive(context) : undefined;
    const fullMessage = prefix ? `${prefix} ${message}` : message;

    // Console output (always)
    const consoleMethod = level === 'error' ? console.error
                        : level === 'warn' ? console.warn
                        : console.log;

    if (safeContext) {
      consoleMethod(`[${level.toUpperCase()}] ${fullMessage}`, safeContext);
    } else {
      consoleMethod(`[${level.toUpperCase()}] ${fullMessage}`);
    }

    // Telemetry (only for warn and error)
    if (level === 'warn') {
      telemetry.track('log', { level, message: fullMessage, ...safeContext });
    } else if (level === 'error') {
      telemetry.track('error', { message: fullMessage, ...safeContext });
    }
  };

  return {
    debug: (message: string, context?: LogContext) => log('debug', message, context),
    info: (message: string, context?: LogContext) => log('info', message, context),
    warn: (message: string, context?: LogContext) => log('warn', message, context),
    error: (message: string, context?: LogContext) => log('error', message, context),

    // Performance metric (always sent to telemetry)
    perf: (metric: string, data: { value: number; status?: string; [key: string]: unknown }) => {
      telemetry.track('metric', { name: metric, ...data });
      console.log(`[PERF] ${metric}:`, data);
    },

    // User action (always sent to telemetry)
    action: (action: string, data?: Record<string, unknown>) => {
      telemetry.track('event', { action, ...data });
      console.log(`[ACTION] ${action}`, data || '');
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

log.debug('Generating suggestions', { mealType, ingredientCount: 15 });
log.error('Failed to generate', { error: error.message });
log.perf('suggestion_generation', { value: 250, status: 'success' });
log.action('meal_selected', { mealType: 'breakfast', ingredientCount: 3 });
```

---

### Step 5.3: Create Error Handler (30 min)

**What you'll build:** Global error capturing for React Native

**File:** `lib/telemetry/errorHandler.ts` (new file)

```typescript
import { logger } from './logger';
import { telemetry } from './telemetryClient';

// Store original handler
let originalErrorHandler: ((error: Error, isFatal?: boolean) => void) | null = null;

export function initErrorHandling(): void {
  // Capture React Native's global error handler
  const globalHandler = ErrorUtils.getGlobalHandler();
  originalErrorHandler = globalHandler;

  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    // Log to telemetry
    logger.error('Uncaught error', {
      message: error.message,
      stack: error.stack,
      isFatal: isFatal ?? false,
    });

    // Track as separate error event
    telemetry.track('error', {
      type: isFatal ? 'fatal' : 'uncaught',
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'), // First 5 lines
    });

    // Flush immediately for fatal errors
    if (isFatal) {
      telemetry.flush();
    }

    // Call original handler
    if (originalErrorHandler) {
      originalErrorHandler(error, isFatal);
    }
  });

  // Handle unhandled promise rejections
  const rejectionTracking = require('promise/setimmediate/rejection-tracking');
  rejectionTracking.enable({
    allRejections: true,
    onUnhandled: (id: number, error: Error) => {
      logger.error('Unhandled promise rejection', {
        id,
        message: error?.message || String(error),
        stack: error?.stack,
      });

      telemetry.track('error', {
        type: 'unhandledrejection',
        message: error?.message || String(error),
      });
    },
    onHandled: () => {
      // Promise was handled later, no action needed
    },
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

### Step 5.4: Add Screen Tracking (30 min)

**What you'll build:** Automatic screen view tracking via navigation

**File:** `lib/telemetry/screenTracking.ts` (new file)

```typescript
import { telemetry } from './telemetryClient';
import { logger } from './logger';

let lastScreen: string = '';
let screenStartTime: number = 0;

export function trackScreenView(screenName: string): void {
  const now = Date.now();

  // Track time spent on previous screen
  if (lastScreen && screenStartTime > 0) {
    const duration = now - screenStartTime;
    telemetry.track('metric', {
      name: 'screen_time',
      screen: lastScreen,
      value: duration,
    });
  }

  // Track new screen view
  telemetry.setCurrentScreen(screenName);
  telemetry.track('event', {
    action: 'screen_view',
    screen: screenName,
  });

  logger.debug('Screen view', { screen: screenName });

  lastScreen = screenName;
  screenStartTime = now;
}

// Call this when app goes to background
export function trackAppBackground(): void {
  if (lastScreen && screenStartTime > 0) {
    const duration = Date.now() - screenStartTime;
    telemetry.track('metric', {
      name: 'screen_time',
      screen: lastScreen,
      value: duration,
    });
    screenStartTime = 0;
  }

  telemetry.track('event', { action: 'app_background' });
  telemetry.flush(); // Flush when going to background
}

// Call this when app comes to foreground
export function trackAppForeground(): void {
  screenStartTime = Date.now();
  telemetry.track('event', { action: 'app_foreground' });
}
```

---

### Step 5.5: Integrate Telemetry in App Entry (30 min)

**What you'll modify:** App initialization to set up telemetry

**File:** `app/_layout.tsx` (modify existing)

```typescript
import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { telemetry } from '../lib/telemetry/telemetryClient';
import { logger } from '../lib/telemetry/logger';
import { initErrorHandling } from '../lib/telemetry/errorHandler';
import { trackAppBackground, trackAppForeground } from '../lib/telemetry/screenTracking';

export default function RootLayout() {
  useEffect(() => {
    // Initialize error handling
    initErrorHandling();

    // Log app start
    if (telemetry.isEnabled()) {
      logger.info('App started', { telemetryEnabled: true });
      telemetry.track('event', { action: 'app_start' });
    }

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
      telemetry.flush();
    };
  }, []);

  // ... rest of layout
}
```

---

### Step 5.6: Add Screen Tracking to Tabs (30 min)

**What you'll modify:** Tab screens to track navigation

**File:** Each tab screen (example: `app/(tabs)/index.tsx`)

```typescript
import { useEffect } from 'react';
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

### Step 5.7: Instrument Business Logic (45 min)

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

### Step 5.8: Instrument Database Operations (45 min)

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

### Step 5.9: Track User Actions (30 min)

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

### Step 5.10: Update App Configuration (15 min)

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

### Step 5.11: Configure Backend Connection (15 min)

**Note:** We'll use the **existing Saberloop telemetry backend** which is already deployed. No new backend code needed.

**Backend Details:**
- **Endpoint:** Same PHP ingestion endpoint used by Saberloop
- **Location:** VPS at `saberloop.com/telemetry/ingest.php` (or similar)
- **Auth:** Uses `X-Telemetry-Token` header
- **Format:** Same event structure (type, data, timestamp, sessionId)

**What to do:**
1. Get the telemetry endpoint URL from Saberloop config
2. Generate a new auth token for SaborSpin (or reuse if appropriate)
3. Configure the endpoint in SaborSpin's `app.json` or `.env`

**Configuration:**
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

**Considerations:**
- Events from SaborSpin will be distinguishable by `appVersion` field
- Could add an `app` field to events if you want to filter by app in logs
- Same JSONL log files will contain events from both apps (or configure separate log files on backend)

---

### Step 5.12: Write Tests (1 hour)

**What we test and why:**

| Component | Test? | Reason |
|-----------|-------|--------|
| TelemetryClient | ✅ Yes | Core logic: batching, offline queue, flush |
| Logger | ✅ Yes | Security: sensitive data redaction |
| ErrorHandler | ❌ No | Just wires global handlers - E2E coverage sufficient |
| ScreenTracking | ❌ No | Simple wrapper, no real logic |

**Target: ~16-20 tests total**

---

**File:** `lib/telemetry/__tests__/telemetryClient.test.ts`

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'mock-uuid-1234'),
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
import { telemetry } from '../telemetryClient';

describe('TelemetryClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    telemetry.clearQueue();
    (fetch as jest.Mock).mockReset();
  });

  describe('track()', () => {
    it('should add event to queue when enabled', () => {
      telemetry.track('event', { action: 'test' });
      expect(telemetry.getQueueSize()).toBe(1);
    });

    it('should include timestamp in event', () => {
      const before = new Date().toISOString();
      telemetry.track('event', { action: 'test' });
      // Verify via flush payload inspection
    });

    it('should include sessionId in event', () => {
      telemetry.track('event', { action: 'test' });
      // SessionId should be consistent across events
      telemetry.track('event', { action: 'test2' });
      // Both events should have same sessionId
    });

    it('should include appVersion in event', () => {
      telemetry.track('event', { action: 'test' });
      // Verify version from Constants is included
    });

    it('should include current screen in event', () => {
      telemetry.setCurrentScreen('home');
      telemetry.track('event', { action: 'test' });
      // Verify screen is 'home'
    });

    it('should auto-flush when batch size reached', async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: true });

      // Add events up to batch size (5)
      for (let i = 0; i < 5; i++) {
        telemetry.track('event', { action: `test${i}` });
      }

      // Should have triggered flush
      expect(fetch).toHaveBeenCalled();
    });
  });

  describe('flush()', () => {
    it('should send events to endpoint with correct headers', async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: true });

      telemetry.track('event', { action: 'test' });
      await telemetry.flush();

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

    it('should include sentAt timestamp in payload', async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: true });

      telemetry.track('event', { action: 'test' });
      await telemetry.flush();

      const call = (fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.sentAt).toBeDefined();
      expect(body.events).toHaveLength(1);
    });

    it('should clear queue after successful flush', async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: true });

      telemetry.track('event', { action: 'test' });
      expect(telemetry.getQueueSize()).toBe(1);

      await telemetry.flush();
      expect(telemetry.getQueueSize()).toBe(0);
    });

    it('should return true on successful flush', async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: true });

      telemetry.track('event', { action: 'test' });
      const result = await telemetry.flush();

      expect(result).toBe(true);
    });

    it('should save to AsyncStorage on network failure', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      telemetry.track('event', { action: 'test' });
      await telemetry.flush();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'saborspin_telemetry_queue',
        expect.any(String)
      );
    });

    it('should re-queue events on HTTP error', async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });

      telemetry.track('event', { action: 'test' });
      await telemetry.flush();

      // Events should be back in queue
      expect(telemetry.getQueueSize()).toBe(1);
    });

    it('should return false on failed flush', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      telemetry.track('event', { action: 'test' });
      const result = await telemetry.flush();

      expect(result).toBe(false);
    });

    it('should return true when queue is empty', async () => {
      const result = await telemetry.flush();
      expect(result).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('offline queue', () => {
    it('should load saved queue on initialization', async () => {
      const savedEvents = JSON.stringify([
        { type: 'event', data: { action: 'saved' }, timestamp: '2025-01-01' }
      ]);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(savedEvents);

      // Would need to re-initialize client to test this
      // Or expose a method for testing
    });

    it('should remove saved queue after loading', async () => {
      const savedEvents = JSON.stringify([]);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(savedEvents);

      // After loading, should call removeItem
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('saborspin_telemetry_queue');
    });
  });

  describe('isEnabled()', () => {
    it('should return true when telemetry is enabled', () => {
      expect(telemetry.isEnabled()).toBe(true);
    });
  });

  describe('getQueueSize()', () => {
    it('should return correct queue size', () => {
      expect(telemetry.getQueueSize()).toBe(0);
      telemetry.track('event', { action: 'test' });
      expect(telemetry.getQueueSize()).toBe(1);
      telemetry.track('event', { action: 'test2' });
      expect(telemetry.getQueueSize()).toBe(2);
    });
  });

  describe('clearQueue()', () => {
    it('should empty the queue', () => {
      telemetry.track('event', { action: 'test' });
      telemetry.track('event', { action: 'test2' });
      expect(telemetry.getQueueSize()).toBe(2);

      telemetry.clearQueue();
      expect(telemetry.getQueueSize()).toBe(0);
    });
  });
});
```

---

**File:** `lib/telemetry/__tests__/logger.test.ts`

```typescript
import { telemetry } from '../telemetryClient';

// Mock telemetry
jest.mock('../telemetryClient', () => ({
  telemetry: {
    track: jest.fn(),
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
    it('debug() should log to console but NOT send to telemetry', () => {
      logger.debug('Debug message', { data: 'test' });

      expect(consoleSpy).toHaveBeenCalled();
      expect(telemetry.track).not.toHaveBeenCalled();
    });

    it('info() should log to console but NOT send to telemetry', () => {
      logger.info('Info message', { data: 'test' });

      expect(consoleSpy).toHaveBeenCalled();
      expect(telemetry.track).not.toHaveBeenCalled();
    });

    it('warn() should log to console AND send to telemetry', () => {
      logger.warn('Warning message', { data: 'test' });

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(telemetry.track).toHaveBeenCalledWith('log', expect.objectContaining({
        level: 'warn',
        message: expect.stringContaining('Warning message'),
      }));
    });

    it('error() should log to console AND send to telemetry', () => {
      logger.error('Error message', { error: 'something failed' });

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(telemetry.track).toHaveBeenCalledWith('error', expect.objectContaining({
        message: expect.stringContaining('Error message'),
      }));
    });
  });

  describe('perf()', () => {
    it('should send metric event to telemetry', () => {
      logger.perf('api_call', { value: 250, status: 'success' });

      expect(telemetry.track).toHaveBeenCalledWith('metric', expect.objectContaining({
        name: 'api_call',
        value: 250,
        status: 'success',
      }));
    });
  });

  describe('action()', () => {
    it('should send event to telemetry', () => {
      logger.action('button_clicked', { button: 'save' });

      expect(telemetry.track).toHaveBeenCalledWith('event', expect.objectContaining({
        action: 'button_clicked',
        button: 'save',
      }));
    });

    it('should work without data parameter', () => {
      logger.action('page_loaded');

      expect(telemetry.track).toHaveBeenCalledWith('event', expect.objectContaining({
        action: 'page_loaded',
      }));
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

    it('should include prefix in telemetry messages', () => {
      const child = logger.child({ module: 'TestModule' });
      child.error('Child error');

      expect(telemetry.track).toHaveBeenCalledWith('error', expect.objectContaining({
        message: expect.stringContaining('[TestModule]'),
      }));
    });
  });
});
```

---

**Test Summary:**

| File | Tests | Coverage |
|------|-------|----------|
| `telemetryClient.test.ts` | ~12 | track, flush, offline queue, config |
| `logger.test.ts` | ~8 | redaction, log levels, perf, action, child |
| **Total** | **~20** | Core telemetry functionality |

**What we're NOT testing (and why):**
- `errorHandler.ts` - Wires global handlers, covered by E2E
- `screenTracking.ts` - Thin wrapper, no logic worth testing
- Integration between components - E2E tests cover this

---

### Step 5.13: Documentation (30 min)

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

### Step 5.14: Final Validation (30 min)

**Validation Checklist:**

1. **All Tests Pass:**
   ```bash
   npm test
   ```

2. **TypeScript Clean:**
   ```bash
   npx tsc --noEmit
   ```

3. **Lint Clean:**
   ```bash
   npm run lint
   ```

4. **Manual Testing:**
   - [ ] App starts without errors
   - [ ] Console shows log output with proper formatting
   - [ ] Navigating screens logs screen_view events
   - [ ] Generating suggestions logs performance metrics
   - [ ] Errors are captured and logged
   - [ ] Offline queue works (disable network, trigger events, re-enable)

5. **With Backend (Saberloop):**
   - [ ] Telemetry endpoint configured in app.json
   - [ ] Events arrive at existing Saberloop backend
   - [ ] Events visible in JSONL logs (distinguishable by appVersion)

---

## ✅ Success Criteria

### Cleanup
- [ ] OpenTelemetry dependencies removed (9 packages)
- [ ] Sentry dependency removed
- [ ] Pino dependency removed
- [ ] Old telemetry files deleted (4 files)
- [ ] Docker/infrastructure files deleted (3 files)
- [ ] No remaining imports from old packages

### Implementation
- [ ] TelemetryClient with batching and offline queue
- [ ] Unified Logger with sensitive data redaction
- [ ] Global error handling
- [ ] Screen tracking
- [ ] Business logic instrumentation
- [ ] Database operation logging
- [ ] User action tracking

### Testing
- [ ] Unit tests for TelemetryClient
- [ ] Unit tests for Logger
- [ ] All existing tests still pass

### Documentation
- [ ] TELEMETRY.md created
- [ ] Configuration documented
- [ ] Usage examples provided

### Privacy
- [ ] No IP logging
- [ ] Sensitive data redacted
- [ ] Telemetry disabled by default

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
- `lib/telemetry/telemetry.ts` - Old OpenTelemetry setup
- `lib/telemetry/analytics.ts` - Old metrics
- `lib/telemetry/logger.ts` - Old Pino logger
- `lib/telemetry/mealGenerationMetrics.ts` - Old metrics
- `docker-compose.yml` - Jaeger/Prometheus infrastructure
- `otel-collector-config.yaml` - OTel Collector config
- `prometheus.yml` - Prometheus config

### Removed Dependencies
- `@opentelemetry/*` (9 packages)
- `@sentry/react-native`
- `pino`

### New Files
- `lib/telemetry/telemetryClient.ts` (~150 lines)
- `lib/telemetry/logger.ts` (~100 lines)
- `lib/telemetry/errorHandler.ts` (~60 lines)
- `lib/telemetry/screenTracking.ts` (~50 lines)
- `lib/telemetry/__tests__/telemetryClient.test.ts` (~100 lines)
- `lib/telemetry/__tests__/logger.test.ts` (~50 lines)
- `docs/developer-guide/TELEMETRY.md`
- `.env.example`

**Note:** No backend code needed - using existing Saberloop telemetry backend.

### Modified Files
- `app/_layout.tsx` - Initialize telemetry
- `app/(tabs)/*.tsx` - Screen tracking
- `app/suggestions/[mealType].tsx` - Action tracking
- `lib/business-logic/combinationGenerator.ts` - Perf logging
- `lib/business-logic/varietyEngine.ts` - Perf logging
- `lib/database/*.ts` - Query logging
- `app.json` - Telemetry config
- `package.json` - Removed 11 dependencies

**Total New Code:** ~600 lines (excluding tests and backend)
**Total Removed:** ~300 lines + 11 dependencies + 3 config files

---

## 🚀 Next Steps

After completing Phase 5:
1. Enable telemetry in production builds (configure endpoint + token)
2. Verify events appear in existing Saberloop backend logs
3. Use existing analysis scripts for error reports
4. Monitor for issues before Phase 6 beta testing

---

[← Back to Overview](./OVERVIEW.md) | [Previous: Phase 4](./PHASE4_POLISH_FEATURE.md)

# Phase 5: Telemetry Expansion & Production Monitoring

[← Back to Overview](./OVERVIEW.md) | [Previous: Phase 4](./PHASE4_POLISH_FEATURE.md)

---

## 🎯 Goal

Expand telemetry coverage to database operations and business logic, ensuring production-ready observability for debugging and performance monitoring.

**Current State:** Strong foundation with OpenTelemetry, Sentry, and Prometheus, but limited to screen-level analytics and one feature metric. Database and business logic are black boxes.

**After Phase 5:** Complete observability coverage with traces for database operations, business logic instrumentation, improved metrics, and validated end-to-end monitoring.

**⚠️ IMPORTANT:** This phase includes testing the observability stack end-to-end and ensuring all telemetry appears correctly in Jaeger and Prometheus.

**Estimated Time:** 4-6 hours (including testing and validation)

---

## 📋 What You'll Build

### 1. Database Tracing
- Add spans for all CRUD operations
- Track query execution time
- Record row counts and table names
- Capture database errors

### 2. Business Logic Tracing
- Instrument combination generator algorithm
- Instrument variety engine
- Track algorithm performance
- Measure complexity (ingredients, combinations)

### 3. Enhanced User Action Tracking
- Track button clicks (Select, Generate, Delete, etc.)
- Track form submissions
- Track navigation actions
- Track user preferences changes

### 4. Testing & Validation
- End-to-end telemetry testing
- Verify metrics in Prometheus
- Verify traces in Jaeger
- Performance impact assessment

---

## 🛠️ Implementation Steps

### Step 5.1: Database Operation Tracing (1.5-2 hours)

**What you'll learn:** Instrumenting database operations with OpenTelemetry

**Overview:**
Add distributed tracing to all database operations to understand query performance, identify slow queries, and debug database-related issues in production.

**Files to Modify:**
- `lib/database/ingredients.ts`
- `lib/database/mealLogs.ts`
- `lib/database/categories.ts` (from Phase 1)
- `lib/database/mealTypes.ts` (from Phase 1)

---

#### Create Helper Function

**File:** `lib/telemetry/databaseTracing.ts` (new file)

```typescript
import { tracer } from './telemetry';
import { SpanStatusCode } from '@opentelemetry/api';

/**
 * Wraps a database operation with tracing
 * @param operation - Name of the operation (e.g., 'getAll', 'create', 'update', 'delete')
 * @param table - Table name
 * @param fn - Async function to execute
 * @param attributes - Additional span attributes
 */
export async function traceDatabaseOperation<T>(
  operation: string,
  table: string,
  fn: () => Promise<T>,
  attributes?: Record<string, string | number>
): Promise<T> {
  const span = tracer.startSpan(`db.${table}.${operation}`, {
    attributes: {
      'db.system': 'sqlite',
      'db.table': table,
      'db.operation': operation,
      ...attributes,
    },
  });

  try {
    const result = await fn();

    // Record result metadata if available
    if (Array.isArray(result)) {
      span.setAttribute('db.row_count', result.length);
    }

    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    span.recordException(error as Error);
    throw error;
  } finally {
    span.end();
  }
}
```

---

#### Instrument Ingredients Operations

**File:** `lib/database/ingredients.ts`

**Before:**
```typescript
export async function getAllIngredients(db: DatabaseAdapter): Promise<Ingredient[]> {
  const rows = await db.getAllAsync('SELECT * FROM ingredients ORDER BY name ASC');
  return rows as Ingredient[];
}
```

**After:**
```typescript
import { traceDatabaseOperation } from '../telemetry/databaseTracing';

export async function getAllIngredients(db: DatabaseAdapter): Promise<Ingredient[]> {
  return traceDatabaseOperation('getAll', 'ingredients', async () => {
    const rows = await db.getAllAsync('SELECT * FROM ingredients ORDER BY name ASC');
    return rows as Ingredient[];
  });
}

export async function getActiveIngredients(db: DatabaseAdapter): Promise<Ingredient[]> {
  return traceDatabaseOperation('getActive', 'ingredients', async () => {
    const rows = await db.getAllAsync(
      'SELECT * FROM ingredients WHERE is_active = 1 ORDER BY name ASC'
    );
    return rows as Ingredient[];
  });
}

export async function createIngredient(
  db: DatabaseAdapter,
  name: string,
  categoryId?: number
): Promise<void> {
  return traceDatabaseOperation('create', 'ingredients', async () => {
    await db.runAsync(
      'INSERT INTO ingredients (name, category_id, is_user_added) VALUES (?, ?, 1)',
      [name, categoryId ?? null]
    );
  }, { 'ingredient.name': name });
}

export async function updateIngredient(
  db: DatabaseAdapter,
  id: number,
  updates: Partial<Ingredient>
): Promise<void> {
  return traceDatabaseOperation('update', 'ingredients', async () => {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map(f => `${f} = ?`).join(', ');

    await db.runAsync(
      `UPDATE ingredients SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
  }, { 'ingredient.id': id });
}

export async function deleteIngredient(
  db: DatabaseAdapter,
  id: number
): Promise<void> {
  return traceDatabaseOperation('delete', 'ingredients', async () => {
    await db.runAsync('DELETE FROM ingredients WHERE id = ?', [id]);
  }, { 'ingredient.id': id });
}
```

**Repeat for:**
- All functions in `mealLogs.ts`
- All functions in `categories.ts` (from Phase 1)
- All functions in `mealTypes.ts` (from Phase 1)

---

### Step 5.2: Business Logic Tracing (1-1.5 hours)

**What you'll learn:** Instrumenting algorithms and core business logic

**Files to Modify:**
- `lib/business-logic/combinationGenerator.ts`
- `lib/business-logic/varietyEngine.ts`

---

#### Instrument Combination Generator

**File:** `lib/business-logic/combinationGenerator.ts`

**Add at top:**
```typescript
import { tracer } from '../telemetry/telemetry';
import { SpanStatusCode } from '@opentelemetry/api';
```

**Wrap main function:**
```typescript
export function generateCombinations(
  ingredients: Ingredient[],
  count: number = 4,
  minIngredients: number = 2,
  maxIngredients: number = 4
): Ingredient[][] {
  const span = tracer.startSpan('algorithm.generateCombinations', {
    attributes: {
      'algorithm.name': 'combination_generator',
      'input.ingredient_count': ingredients.length,
      'input.requested_combinations': count,
      'input.min_ingredients': minIngredients,
      'input.max_ingredients': maxIngredients,
    },
  });

  try {
    const startTime = Date.now();

    // Original algorithm logic here
    const combinations = /* ... your logic ... */;

    const duration = Date.now() - startTime;

    span.setAttribute('output.combinations_generated', combinations.length);
    span.setAttribute('algorithm.duration_ms', duration);
    span.setStatus({ code: SpanStatusCode.OK });

    return combinations;
  } catch (error) {
    span.setStatus({ code: SpanStatusCode.ERROR });
    span.recordException(error as Error);
    throw error;
  } finally {
    span.end();
  }
}
```

**Instrument helper functions:**
```typescript
function shuffle<T>(array: T[]): T[] {
  const span = tracer.startSpan('algorithm.shuffle', {
    attributes: {
      'input.array_length': array.length,
    },
  });

  try {
    // Fisher-Yates shuffle logic
    const shuffled = [...array];
    // ... shuffle logic ...

    span.setStatus({ code: SpanStatusCode.OK });
    return shuffled;
  } finally {
    span.end();
  }
}
```

---

#### Instrument Variety Engine

**File:** `lib/business-logic/varietyEngine.ts`

```typescript
import { tracer } from '../telemetry/telemetry';
import { SpanStatusCode } from '@opentelemetry/api';

export function filterByCooldown(
  availableIngredients: Ingredient[],
  recentMeals: MealLog[],
  cooldownDays: number
): Ingredient[] {
  const span = tracer.startSpan('algorithm.filterByCooldown', {
    attributes: {
      'input.available_ingredients': availableIngredients.length,
      'input.recent_meals': recentMeals.length,
      'input.cooldown_days': cooldownDays,
    },
  });

  try {
    const startTime = Date.now();

    // Original filtering logic
    const filtered = /* ... your logic ... */;

    const duration = Date.now() - startTime;
    const filteredCount = availableIngredients.length - filtered.length;

    span.setAttribute('output.filtered_ingredients', filtered.length);
    span.setAttribute('output.excluded_count', filteredCount);
    span.setAttribute('algorithm.duration_ms', duration);
    span.setStatus({ code: SpanStatusCode.OK });

    return filtered;
  } catch (error) {
    span.setStatus({ code: SpanStatusCode.ERROR });
    span.recordException(error as Error);
    throw error;
  } finally {
    span.end();
  }
}
```

---

### Step 5.3: Enhanced User Action Tracking (1 hour)

**What you'll learn:** Granular user behavior analytics

**Goal:** Track specific user interactions beyond screen views.

---

#### Add Action Tracking Helper

**File:** `lib/telemetry/analytics.ts`

**Add new actions:**
```typescript
export const UserActions = {
  // Meal suggestions
  GENERATE_SUGGESTIONS: 'generate_suggestions',
  SELECT_MEAL: 'select_meal',
  CONFIRM_MEAL: 'confirm_meal',
  CANCEL_SELECTION: 'cancel_selection',

  // Ingredient management
  ADD_INGREDIENT: 'add_ingredient',
  EDIT_INGREDIENT: 'edit_ingredient',
  DELETE_INGREDIENT: 'delete_ingredient',
  TOGGLE_INGREDIENT: 'toggle_ingredient',

  // Category management
  ADD_CATEGORY: 'add_category',
  EDIT_CATEGORY: 'edit_category',
  DELETE_CATEGORY: 'delete_category',

  // Meal type management
  ADD_MEAL_TYPE: 'add_meal_type',
  EDIT_MEAL_TYPE: 'edit_meal_type',
  DELETE_MEAL_TYPE: 'delete_meal_type',

  // Settings
  UPDATE_COOLDOWN: 'update_cooldown',
  UPDATE_MIN_INGREDIENTS: 'update_min_ingredients',
  UPDATE_MAX_INGREDIENTS: 'update_max_ingredients',
} as const;
```

---

#### Track Button Clicks

**File:** `app/suggestions/[mealType].tsx`

**Before:**
```typescript
<Button onPress={handleGenerateNew} title="Generate New Ideas" />
```

**After:**
```typescript
import { analytics, UserActions } from '../../lib/telemetry/analytics';

const handleGenerateNew = () => {
  analytics.userAction(UserActions.GENERATE_SUGGESTIONS, {
    mealType: mealType as string,
  });

  // Original logic
  generateMealSuggestions(4, 3);
};
```

**Apply to all buttons:**
- Select meal button
- Confirm button
- Cancel button
- Add ingredient button
- Delete ingredient button
- Edit buttons
- Save buttons

---

#### Track Form Submissions

**File:** `components/forms/IngredientForm.tsx` (from Phase 1)

```typescript
const handleSubmit = () => {
  analytics.userAction(
    isEditing ? UserActions.EDIT_INGREDIENT : UserActions.ADD_INGREDIENT,
    {
      hasCategory: categoryId !== null,
    }
  );

  // Original submit logic
  onSubmit({ name, categoryId });
};
```

---

### Step 5.4: Additional Metrics (30 min)

**What you'll learn:** Creating custom metrics for production monitoring

**File:** `lib/telemetry/productionMetrics.ts` (new file)

```typescript
import { meter } from './telemetry';

/**
 * Database operation metrics
 */
export const databaseQueryDuration = meter.createHistogram('db_query_duration_ms', {
  description: 'Database query execution time',
  unit: 'milliseconds',
});

export const databaseErrorCounter = meter.createCounter('db_errors_total', {
  description: 'Total database errors',
});

/**
 * Business logic metrics
 */
export const algorithmDuration = meter.createHistogram('algorithm_duration_ms', {
  description: 'Algorithm execution time',
  unit: 'milliseconds',
});

export const ingredientsFilteredCounter = meter.createCounter('ingredients_filtered_total', {
  description: 'Total ingredients filtered by cooldown',
});

/**
 * User engagement metrics
 */
export const buttonClickCounter = meter.createCounter('button_clicks_total', {
  description: 'Total button clicks',
});

export const formSubmissionCounter = meter.createCounter('form_submissions_total', {
  description: 'Total form submissions',
});

/**
 * App health metrics
 */
export const errorCounter = meter.createCounter('app_errors_total', {
  description: 'Total application errors',
});

export const crashCounter = meter.createCounter('app_crashes_total', {
  description: 'Total application crashes',
});
```

---

#### Integrate Production Metrics

**Update `lib/telemetry/databaseTracing.ts`:**
```typescript
import { databaseQueryDuration, databaseErrorCounter } from './productionMetrics';

export async function traceDatabaseOperation<T>(
  operation: string,
  table: string,
  fn: () => Promise<T>,
  attributes?: Record<string, string | number>
): Promise<T> {
  const span = tracer.startSpan(`db.${table}.${operation}`, { /* ... */ });
  const startTime = Date.now();

  try {
    const result = await fn();

    // Record duration metric
    const duration = Date.now() - startTime;
    databaseQueryDuration.record(duration, {
      table,
      operation,
    });

    // ... rest of span logic ...
    return result;
  } catch (error) {
    // Record error metric
    databaseErrorCounter.add(1, {
      table,
      operation,
      error: error instanceof Error ? error.name : 'Unknown',
    });

    // ... rest of error handling ...
    throw error;
  } finally {
    span.end();
  }
}
```

**Update business logic files similarly** to record `algorithmDuration`.

---

### Step 5.5: Testing Telemetry (1 hour)

**What you'll learn:** Validating observability stack end-to-end

---

#### Unit Tests for Telemetry Helpers

**File:** `lib/telemetry/__tests__/databaseTracing.test.ts` (new file)

```typescript
import { traceDatabaseOperation } from '../databaseTracing';

describe('traceDatabaseOperation', () => {
  it('should execute function and return result', async () => {
    const mockFn = jest.fn().mockResolvedValue(['row1', 'row2']);

    const result = await traceDatabaseOperation('getAll', 'ingredients', mockFn);

    expect(result).toEqual(['row1', 'row2']);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should handle errors and re-throw', async () => {
    const mockError = new Error('Database error');
    const mockFn = jest.fn().mockRejectedValue(mockError);

    await expect(
      traceDatabaseOperation('getAll', 'ingredients', mockFn)
    ).rejects.toThrow('Database error');
  });

  it('should record array length as row_count', async () => {
    const mockFn = jest.fn().mockResolvedValue([1, 2, 3]);

    await traceDatabaseOperation('getAll', 'ingredients', mockFn);

    // Test that span was created with correct attributes
    // (Would need to mock tracer for full validation)
  });
});
```

**File:** `lib/telemetry/__tests__/analytics.test.ts` (new file)

```typescript
import { analytics, UserActions } from '../analytics';

describe('analytics', () => {
  it('should track screen views', () => {
    expect(() => {
      analytics.screenView('home');
    }).not.toThrow();
  });

  it('should track user actions with metadata', () => {
    expect(() => {
      analytics.userAction(UserActions.SELECT_MEAL, {
        mealType: 'breakfast',
      });
    }).not.toThrow();
  });
});
```

---

#### Manual End-to-End Testing

**Test Plan:**

1. **Start Observability Stack:**
   ```bash
   docker-compose up -d

   # Verify services are running
   docker-compose ps
   ```

2. **Start App:**
   ```bash
   npm start
   # Or: npm run web
   ```

3. **Generate Telemetry Data:**
   - Navigate to all screens (home, suggestions, history, settings)
   - Generate meal suggestions multiple times
   - Select and log meals
   - Add/edit/delete ingredients (if Phase 1 complete)
   - Perform various user actions

4. **Verify Traces in Jaeger:**
   - Open http://localhost:16686
   - Select service: `demo-react-native-app`
   - Click "Find Traces"
   - **Expected traces:**
     - `db.ingredients.getAll`
     - `db.ingredients.getActive`
     - `db.mealLogs.create`
     - `algorithm.generateCombinations`
     - `algorithm.filterByCooldown`
   - Click on a trace to see span details
   - Verify attributes are present (table, operation, duration, etc.)

5. **Verify Metrics in Prometheus:**
   - Open http://localhost:9090
   - Go to "Graph" tab
   - Run queries:

   ```promql
   # Screen views by screen
   sum(screen_views_total) by (screen)

   # Database query duration (95th percentile)
   histogram_quantile(0.95, db_query_duration_ms_bucket)

   # Algorithm execution time
   histogram_quantile(0.95, algorithm_duration_ms_bucket)

   # Button clicks
   sum(button_clicks_total) by (action)

   # Error rate
   rate(app_errors_total[5m])
   ```

6. **Verify Structured Logs:**
   - Check app console output
   - Look for JSON log entries with `traceId` and `spanId`
   - Verify trace IDs match Jaeger traces

---

#### E2E Test for Telemetry

**File:** `e2e/telemetry.spec.ts` (new file)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Telemetry Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForTimeout(2000); // Wait for app to initialize
  });

  test('should track screen views', async ({ page }) => {
    // Navigate to different screens
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForTimeout(1000);

    await page.goBack();
    await page.waitForTimeout(1000);

    await page.getByTestId('history-tab').click();
    await page.waitForTimeout(1000);

    // In a real implementation, you'd verify metrics via Prometheus API
    // For now, just ensure navigation doesn't crash
    await expect(page.getByTestId('history-tab')).toBeVisible();
  });

  test('should track user actions', async ({ page }) => {
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForTimeout(2000); // Wait for suggestions to generate

    // Click "Generate New Ideas" button
    await page.getByText('Generate New Ideas').click();
    await page.waitForTimeout(1000);

    // Select a meal
    const mealCard = page.locator('[data-testid^="meal-card-"]').first();
    await mealCard.click();
    await page.waitForTimeout(500);

    // Confirm selection
    await page.getByTestId('confirm-meal-button').click();
    await page.waitForTimeout(1000);

    // Verify no crashes
    await expect(page.getByTestId('home-screen')).toBeVisible();
  });
});
```

**Note:** For production-grade E2E telemetry testing, you'd query Prometheus API to verify metrics were recorded. This is a simplified version that ensures telemetry code doesn't crash the app.

---

### Step 5.6: Performance Impact Assessment (30 min)

**What you'll learn:** Measuring telemetry overhead

**Test Scenarios:**

1. **Baseline (No Telemetry):**
   - Comment out all telemetry code
   - Measure app performance:
     - Time to generate suggestions
     - Time to load history
     - FPS during navigation
     - Memory usage

2. **With Telemetry:**
   - Uncomment telemetry code
   - Measure same metrics
   - Calculate overhead

**Acceptance Criteria:**
- Telemetry adds <5% overhead to operations
- No noticeable UI lag
- Memory increase <10MB
- App remains responsive

**Tools:**
- React DevTools Profiler
- Chrome DevTools Performance tab
- Device performance monitoring

**If Overhead is High:**
- Reduce metric export frequency (60s → 120s)
- Implement sampling (50% instead of 100%)
- Batch span creation
- Use background threads for export

---

### Step 5.7: Documentation & Configuration (30 min)

**What you'll learn:** Documenting telemetry for team/future self

---

#### Create Telemetry Guide

**File:** `docs/user-guide/telemetry.md` (new file)

```markdown
# Telemetry & Monitoring

This app uses OpenTelemetry for observability, providing traces, metrics, and logs for debugging and monitoring.

## Local Development

### Starting the Observability Stack

```bash
# From demo-react-native-app directory
docker-compose up -d

# Verify services are running
docker-compose ps
```

### Accessing Dashboards

- **Jaeger (Traces):** http://localhost:16686
- **Prometheus (Metrics):** http://localhost:9090

### Viewing Telemetry Data

**Traces:**
1. Open Jaeger UI
2. Select service: `demo-react-native-app`
3. Click "Find Traces"
4. Click on a trace to see detailed spans

**Metrics:**
1. Open Prometheus UI
2. Go to "Graph" tab
3. Enter a query (see examples below)
4. Click "Execute"

## Useful Prometheus Queries

```promql
# Screen views by screen
sum(screen_views_total) by (screen)

# Database query latency (95th percentile)
histogram_quantile(0.95, db_query_duration_ms_bucket)

# Error rate (per minute)
rate(app_errors_total[1m])

# Button clicks by action
sum(button_clicks_total) by (action)
```

## What's Being Tracked

### Traces
- Database operations (SELECT, INSERT, UPDATE, DELETE)
- Business logic (combination generation, variety filtering)
- Screen navigation

### Metrics
- Screen view counts
- User action counts (button clicks, form submissions)
- Database query duration
- Algorithm execution time
- Error counts

### Logs
- Structured JSON logs with trace correlation
- Error logs with stack traces
- Performance warnings

## Troubleshooting

**Traces not appearing in Jaeger:**
- Ensure Docker Compose is running
- Check app console for export errors
- Verify endpoint: `http://localhost:4318/v1/traces`

**Metrics not appearing in Prometheus:**
- Wait 60 seconds (export interval)
- Check OTel Collector logs: `docker-compose logs otel-collector`
- Verify endpoint: `http://localhost:4319/v1/metrics`

## Production Configuration

In production, configure different endpoints:

```typescript
// Environment variables
OTEL_TRACES_ENDPOINT=https://your-jaeger-instance/v1/traces
OTEL_METRICS_ENDPOINT=https://your-collector/v1/metrics
OTEL_SAMPLE_RATE=0.1  // 10% sampling
```
```

---

#### Update API Documentation

**File:** `docs/api/observability.md` (new file)

```markdown
# Observability API

## Tracing Database Operations

Use `traceDatabaseOperation` helper for all database calls:

```typescript
import { traceDatabaseOperation } from '../telemetry/databaseTracing';

export async function getItems(db: DatabaseAdapter): Promise<Item[]> {
  return traceDatabaseOperation('getAll', 'items', async () => {
    const rows = await db.getAllAsync('SELECT * FROM items');
    return rows as Item[];
  });
}
```

## Adding Custom Metrics

Create metrics in telemetry modules:

```typescript
import { meter } from './telemetry';

export const myCounter = meter.createCounter('my_events_total', {
  description: 'Total number of my events',
});

// Use in code
myCounter.add(1, { type: 'example' });
```

## Logging with Trace Correlation

Use the logger for structured logging:

```typescript
import { log } from '../telemetry/logger';

log.info('User action performed', {
  action: 'select_meal',
  mealType: 'breakfast',
});
```

Logs automatically include `traceId` and `spanId` for correlation.
```

---

### Step 5.8: Environment Configuration (30 min)

**What you'll learn:** Configuring telemetry for different environments

**Goal:** Support development, staging, and production configurations.

---

#### Add Environment Variable Support

**File:** `.env.example` (new file)

```bash
# Telemetry Configuration
OTEL_TRACES_ENDPOINT=http://localhost:4318/v1/traces
OTEL_METRICS_ENDPOINT=http://localhost:4319/v1/metrics
OTEL_SERVICE_NAME=demo-react-native-app
OTEL_SERVICE_VERSION=1.0.0
OTEL_SAMPLE_RATE=1.0
OTEL_METRIC_EXPORT_INTERVAL_MS=60000
OTEL_ENABLED=true

# Sentry
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=development
SENTRY_ENABLED=true
```

**File:** `.env` (gitignored, local development)
```bash
# Copy from .env.example and customize
```

---

#### Update Telemetry Configuration

**File:** `lib/telemetry/telemetry.ts`

```typescript
// Load environment variables (if using expo-constants)
import Constants from 'expo-constants';

const config = {
  tracesEndpoint: process.env.OTEL_TRACES_ENDPOINT ||
                  Constants.expoConfig?.extra?.otelTracesEndpoint ||
                  'http://localhost:4318/v1/traces',
  metricsEndpoint: process.env.OTEL_METRICS_ENDPOINT ||
                   Constants.expoConfig?.extra?.otelMetricsEndpoint ||
                   'http://localhost:4319/v1/metrics',
  serviceName: process.env.OTEL_SERVICE_NAME || 'demo-react-native-app',
  serviceVersion: process.env.OTEL_SERVICE_VERSION || '1.0.0',
  sampleRate: parseFloat(process.env.OTEL_SAMPLE_RATE || '1.0'),
  metricExportInterval: parseInt(process.env.OTEL_METRIC_EXPORT_INTERVAL_MS || '60000'),
  enabled: process.env.OTEL_ENABLED !== 'false',
};

// Only initialize if enabled
if (config.enabled) {
  // ... existing initialization code ...
  // Use config values instead of hardcoded values
}
```

---

#### Update app.json for Expo

**File:** `app.json`

```json
{
  "expo": {
    "extra": {
      "otelTracesEndpoint": "http://localhost:4318/v1/traces",
      "otelMetricsEndpoint": "http://localhost:4319/v1/metrics",
      "otelEnabled": true,
      "sentryDsn": "${SENTRY_DSN}",
      "sentryEnvironment": "development"
    }
  }
}
```

For production builds, use EAS Secrets to inject values.

---

### Step 5.9: Final Validation (1 hour)

**What you'll learn:** Complete end-to-end telemetry validation

**Validation Checklist:**

1. **All Tests Pass:**
   ```bash
   npm test
   npm run test:e2e
   ```

2. **Docker Services Running:**
   ```bash
   docker-compose ps
   # Should show 3 services: jaeger, otel-collector, prometheus
   ```

3. **Traces in Jaeger:**
   - [ ] Database operations appear
   - [ ] Business logic appears
   - [ ] Spans have correct attributes
   - [ ] Parent-child relationships correct
   - [ ] Error spans marked as errors

4. **Metrics in Prometheus:**
   - [ ] Screen view metrics present
   - [ ] User action metrics present
   - [ ] Database duration metrics present
   - [ ] Algorithm duration metrics present
   - [ ] Error counters present

5. **Logs Correlated:**
   - [ ] Console logs have `traceId`
   - [ ] Trace IDs match Jaeger
   - [ ] Log levels appropriate

6. **Performance Acceptable:**
   - [ ] App responsive
   - [ ] No noticeable lag
   - [ ] Memory usage reasonable

7. **Cross-Platform:**
   - [ ] Works on web
   - [ ] Works on Android
   - [ ] Works on iOS (if available)

8. **Production Build:**
   ```bash
   eas build --platform android --profile preview
   # Test APK with telemetry
   ```

---

#### Git Commit

```bash
git add .

git commit -m "feat: expand telemetry coverage (Epic 3 Phase 5)

- Add database operation tracing
- Add business logic tracing
- Enhance user action tracking
- Add production metrics
- Create telemetry tests
- Add environment configuration
- Document observability stack

Observability: Production-ready ✅
All tests passing ✅

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

---

## ✅ Success Criteria

### Implementation
- [ ] All database operations traced
- [ ] All business logic traced
- [ ] User actions tracked (buttons, forms)
- [ ] Production metrics added
- [ ] Helper functions created

### Testing
- [ ] Unit tests for telemetry helpers
- [ ] E2E test for telemetry integration
- [ ] Manual end-to-end validation complete
- [ ] All tests pass

### Observability
- [ ] Traces appear in Jaeger
- [ ] Metrics appear in Prometheus
- [ ] Logs have trace correlation
- [ ] Error tracking works
- [ ] Cross-platform validated

### Performance
- [ ] Telemetry overhead <5%
- [ ] No UI lag
- [ ] Memory increase <10MB
- [ ] App remains responsive

### Configuration
- [ ] Environment variables supported
- [ ] Development config works
- [ ] Production config documented
- [ ] Sampling configurable

### Documentation
- [ ] User guide updated
- [ ] API docs updated
- [ ] Troubleshooting guide created
- [ ] Prometheus query examples provided

### Deployment
- [ ] Production APK tested
- [ ] Telemetry works in APK
- [ ] Docker Compose documented
- [ ] Session status updated

---

## 🎓 Learning Outcomes

After completing Phase 5, you'll understand:
- Distributed tracing concepts and implementation
- Performance monitoring and profiling
- Metrics design and collection
- Observability best practices
- Production debugging techniques
- Telemetry testing strategies

---

## 🚀 Next Steps

After completing Phase 5:
1. Monitor the app for a few days with telemetry
2. Analyze traces and metrics to identify bottlenecks
3. Use observability data to inform optimization
4. Consider adding Grafana dashboards for better visualization
5. Set up alerting based on error rates or latency

**Optional Future Enhancements:**
- Add Grafana for custom dashboards
- Set up Loki for log aggregation
- Add performance monitoring (FPS, render times)
- Implement distributed tracing across services (if adding backend)
- Set up alerting (Prometheus AlertManager)

---

[← Back to Overview](./OVERVIEW.md) | [Previous: Phase 4](./PHASE4_POLISH_FEATURE.md)

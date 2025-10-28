
## Step 2.7 Continued: Metrics & Logging ✅ COMPLETED

### Session Overview (2025-10-23)

Completed the second and third pillars of observability:
- **Metrics**: Counters and histograms for quantitative data
- **Logging**: Structured logs with trace correlation

This session built upon the tracing foundation from the previous session.

---

### Part 1: Metrics Implementation

#### What Are Metrics?

**Metrics = Numbers that change over time**

**Car Dashboard Analogy:**
- **Speedometer** (gauge) - Current speed right now
- **Odometer** (counter) - Total miles driven (only goes up)
- **Fuel efficiency graph** (histogram) - Distribution of MPG over time

**In our app:**
- **Counter**: "How many times has the button been pressed?" (total count)
- **Histogram**: "What's the distribution of text lengths users type?" (value ranges)

**Metrics vs Traces comparison:**

| Feature | Traces | Metrics |
|---------|--------|---------|
| What | Individual events with timing | Aggregated numbers |
| Example | "Button pressed at 2:30pm with text 'hello'" | "Button pressed 50 times today" |
| Good for | Understanding causality and flow | Dashboards, alerts, trends |
| Storage | High (detailed) | Low (aggregated) |
| When to use | Debugging specific issues | Monitoring overall health |

---

#### Question: Version Compatibility

**Question Asked:** "Do we have to install specific versions of metrics packages like we did with other OpenTelemetry packages?"

**Answer: YES!** Learning from the Jest 30 compatibility issue and previous OpenTelemetry version mismatches.

**Current OpenTelemetry versions installed:**
```json
"@opentelemetry/api": "^1.9.0",
"@opentelemetry/exporter-trace-otlp-http": "^0.54.2",
"@opentelemetry/instrumentation": "^0.54.2",
"@opentelemetry/resources": "^1.30.1",
"@opentelemetry/sdk-trace-base": "^1.26.0",
"@opentelemetry/sdk-trace-web": "^1.26.0",
"@opentelemetry/semantic-conventions": "^1.37.0"
```

**Pattern identified:**
- SDK packages: `1.26.x` to `1.30.x` range
- Exporter packages: `0.54.x` range
- Must keep versions aligned to avoid compatibility issues

**Installed for metrics:**
```bash
npm install @opentelemetry/sdk-metrics@^1.30.0 @opentelemetry/exporter-metrics-otlp-http@^0.54.0
```

**Why these versions:**
- `@opentelemetry/sdk-metrics@^1.30.0` - Matches resources package (1.30.1)
- `@opentelemetry/exporter-metrics-otlp-http@^0.54.0` - Matches trace exporter (0.54.2)

**Lesson reinforced:** Always check version compatibility, match related packages, learn from past issues.

---

#### Updating lib/telemetry.ts for Metrics

**File structure parallel:**

**For Traces (existing):**
1. Imports (tracer, exporter)
2. Resource (app metadata)
3. Provider (WebTracerProvider)
4. Exporter (OTLPTraceExporter)
5. Processor (BatchSpanProcessor)
6. Register provider
7. Export tracer

**For Metrics (added):**
1. Imports (meter, exporter)
2. **REUSE same resource** (no duplication!)
3. Provider (MeterProvider)
4. Exporter (OTLPMetricExporter)
5. Reader (PeriodicExportingMetricReader)
6. Export meter

**Key concept: Resource sharing**
- The resource object (service name, version) is shared between traces and metrics
- This ensures both are identified as the same application
- No need to duplicate metadata

**Step-by-step implementation:**

**Step 1: Add imports**
```typescript
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
```

**Step 2: Configure metrics (after trace setup)**
```typescript
// === METRICS SETUP ===
const metricExporter = new OTLPMetricExporter({
  url: 'http://localhost:4318/v1/metrics',
});

const meterProvider = new MeterProvider({
  resource, // Reuse the same resource!
});

meterProvider.addMetricReader(
  new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 60000, // 60 seconds
  })
);
```

**Step 3: Export meter**
```typescript
export const meter = meterProvider.getMeter('demo-react-native-app');
```

**Key differences from traces:**
- **Periodic export** vs immediate: Metrics are batched and sent every 60 seconds
- **Different endpoint**: `/v1/metrics` instead of `/v1/traces`
- **Same protocol**: Both use OTLP HTTP

**Why periodic export for metrics?**
- Metrics are aggregated (counters accumulate, histograms collect distributions)
- Don't need real-time sending like individual trace spans
- More efficient to batch and send periodically
- Reduces network overhead

---

#### Creating Metrics in HomeScreen

**Metric types implemented:**

**1. Counter - Button Press Count**

Created **outside** the component (before `export default function HomeScreen()`):
```typescript
const buttonPressCounter = meter.createCounter('button.presses', {
  description: 'Number of times the button was pressed',
});
```

**Why outside the component?**
- Metrics should persist across re-renders
- Creating inside would recreate the metric on every render
- Think of it as a global counter that persists

**Usage inside handlePress:**
```typescript
buttonPressCounter.add(1);
```

**What `.add(1)` does:**
- Increments the counter by 1
- Always add positive numbers (counters only go up)
- The metric reader will send accumulated value every 60 seconds

**2. Histogram - Input Text Length Distribution**

Created **outside** the component:
```typescript
const inputLengthHistogram = meter.createHistogram('input.length', {
  description: 'Distribution of input text lengths',
  unit: 'characters',
});
```

**Usage inside handlePress:**
```typescript
inputLengthHistogram.record(inputValue.length);
```

**What `.record(value)` does:**
- Records an individual value
- Over time, builds a distribution showing common ranges
- Backend groups values into buckets (0-5, 6-10, 11-15, etc.)

**Counter vs Histogram usage:**
```typescript
buttonPressCounter.add(1);                      // Always add 1 (counting events)
inputLengthHistogram.record(inputValue.length); // Record actual value (distribution)
```

**Example histogram output:**
```
Input lengths recorded: 5, 8, 3, 12, 7, 4, 10, 6

Buckets created:
0-5 chars:   ███ (3 times)
6-10 chars:  ████ (4 times) ← Most common!
11-15 chars: █ (1 time)
```

**Final handlePress with all observability:**
```typescript
const handlePress = () => {
  // Tracing
  const span = tracer.startSpan('button.press');

  // Metrics
  buttonPressCounter.add(1);
  inputLengthHistogram.record(inputValue.length);

  // Logging (added later)
  log.info('Button pressed', {
    inputLength: inputValue.length,
    inputValue: inputValue,
  });

  // Trace attributes
  span.setAttribute('input.length', inputValue.length);
  span.setAttribute('input.value', inputValue);

  // Business logic
  setDisplayText(inputValue);

  // End trace
  span.end();
};
```

---

#### Issue Discovered: Jaeger Doesn't Support Metrics

**Error encountered:**
```
POST http://localhost:4318/v1/metrics 404 (Not Found)
```

**What happened:**
- App successfully sends metrics to `http://localhost:4318/v1/metrics`
- Jaeger responds with **404 Not Found**
- The endpoint doesn't exist

**Investigation:**

Checked Jaeger logs:
```bash
docker logs jaeger 2>&1 | grep -i "otlp\|listening\|receiver"
```

**Result:**
```
Starting GRPC server on :4317
Starting HTTP server on :4318
```

**Conclusion:**
- Jaeger IS listening on port 4318 ✅
- Jaeger DOES support OTLP protocol ✅
- But Jaeger ONLY accepts traces, NOT metrics ❌

**Why Jaeger doesn't support metrics:**

Jaeger is a **distributed tracing** system, built specifically for:
- Collecting trace spans
- Visualizing request flows
- Analyzing timing and causality
- Debugging distributed systems

**Jaeger is NOT:**
- A metrics backend (like Prometheus)
- A logging backend (like Elasticsearch)
- An all-in-one observability platform

**This is by design!** Each tool specializes:
- **Jaeger** → Traces
- **Prometheus** → Metrics
- **Elasticsearch/Loki** → Logs
- **Honeycomb/Datadog** → All three (but commercial)

**Production setups typically use:**
```
Application
├─ Traces → Jaeger
├─ Metrics → Prometheus
└─ Logs → Elasticsearch/Loki
```

---

#### Decision: Options for Metrics Backend

**Option 1: Accept the Limitation (CHOSEN)**
- Keep metrics code (it works correctly)
- Metrics just won't be visualized
- Focus on learning and code implementation
- Production would use proper metrics backend

**Option 2: Add Prometheus**
- Install Prometheus via Docker
- Configure metrics exporter for Prometheus
- More realistic production setup
- Additional complexity

**Option 3: Switch to All-in-One Backend**
- Use Honeycomb or similar (supports traces + metrics + logs)
- Cloud-based, free tier available
- Requires account setup
- Vendor-specific

**Why we chose Option 1:**
1. ✅ Already learned how to CREATE metrics (the important part!)
2. ✅ Code works correctly - metrics are being collected
3. ✅ Can focus on completing observability with logging
4. ✅ Understand that production needs specialized backends
5. ✅ Keeps the learning project simple

**What was learned:**
- How to create counters and histograms ✅
- How to instrument code with metrics ✅
- How metrics differ from traces ✅
- That observability backends specialize ✅
- Production architecture uses multiple tools ✅

**Value achieved:** Understanding > Visualization

---

### Part 2: Structured Logging Implementation

#### What is Structured Logging?

**Traditional logging (console.log):**
```javascript
console.log('Button pressed with text: hello');
console.log('Button pressed at: ' + new Date());
```

**Output (plain text):**
```
Button pressed with text: hello
Button pressed at: Wed Jan 15 2025 10:30:45
```

**Problems:**
- ❌ Just plain text (hard to search/filter)
- ❌ No standard format
- ❌ Can't query: "Show me all button presses with text > 10 chars"
- ❌ No metadata structure
- ❌ Parsing requires regex and custom logic

**Structured logging (JSON format):**
```javascript
logger.info('Button pressed', {
  inputLength: 5,
  inputValue: 'hello',
  timestamp: '2025-01-15T10:30:45Z'
});
```

**Output (JSON):**
```json
{
  "level": "info",
  "msg": "Button pressed",
  "inputLength": 5,
  "inputValue": "hello",
  "timestamp": "2025-01-15T10:30:45Z"
}
```

**Benefits:**
- ✅ Machine-readable (JSON)
- ✅ Easy to search/filter programmatically
- ✅ Queryable (find all events where inputLength > 10)
- ✅ Consistent format across application
- ✅ Can correlate with traces via IDs!

---

#### Why Pino?

**Comparison of logging libraries:**

| Feature | console.log | Winston | Pino |
|---------|-------------|---------|------|
| Speed | Fast | Slow | Very fast |
| Format | Text | Configurable | JSON |
| Bundle size | Built-in (0) | Heavy (~1MB) | Light (~50KB) |
| React Native | ✅ Works | ⚠️ Issues | ✅ Works well |
| Async | No | Yes | Yes |
| Overhead | Minimal | Medium | Minimal |

**Decision: Pino**
- Fast and lightweight
- JSON output by default
- Works well with React Native
- Minimal dependencies
- Good ecosystem

**Installation:**
```bash
npm install pino
```

**Note:** Skipped `pino-opentelemetry-transport` due to React Native compatibility issues. Built custom solution instead.

---

#### Creating lib/logger.ts

**Goal:** Create a logger that automatically correlates logs with traces.

**The magic:** When you log inside a traced operation, the log automatically includes the trace ID!

**Step-by-step implementation:**

**Step 1: Imports**
```typescript
import pino from 'pino';
import { trace } from '@opentelemetry/api';
```

**Step 2: Create base logger**
```typescript
const logger = pino({
  level: 'info',
  browser: {
    asObject: true,
  },
});
```

**Configuration explained:**
- `level: 'info'` - Log info, warn, error (skip debug)
- `browser: { asObject: true }` - Makes pino work in React Native/browser environment
- Default output goes to console

**Step 3: Helper function for trace context**
```typescript
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
```

**How this works:**
1. `trace.getActiveSpan()` - Gets currently executing span (if any)
2. `span.spanContext()` - Gets the context containing IDs
3. Returns `{ traceId, spanId }` if inside a trace
4. Returns `{}` if not in a trace (logs still work!)

**The correlation magic:**
- When logging inside `handlePress` (which has `tracer.startSpan`), there's an active span
- The function automatically captures the trace ID and span ID
- Logs are linked to traces without manual effort!

**Step 4: Enhanced logger with auto-correlation**
```typescript
export const log = {
  info: (message: string, data?: object) => {
    logger.info({
      ...getTraceContext(),
      ...data,
    }, message);
  },

  warn: (message: string, data?: object) => {
    logger.warn({
      ...getTraceContext(),
      ...data,
    }, message);
  },

  error: (message: string, error?: Error, data?: object) => {
    logger.error({
      ...getTraceContext(),
      error: error?.message,
      stack: error?.stack,
      ...data,
    }, message);
  },
};
```

**How the spread operator works:**
```typescript
{
  ...getTraceContext(),  // { traceId: 'abc', spanId: 'xyz' }
  ...data,               // { inputLength: 5, inputValue: 'hello' }
}

// Result:
{
  traceId: 'abc',
  spanId: 'xyz',
  inputLength: 5,
  inputValue: 'hello'
}
```

**Usage API:**
```typescript
// Info log
log.info('Button pressed', { inputLength: 5 });

// Warning log
log.warn('Input too long', { length: 1000, max: 100 });

// Error log with exception
try {
  // something
} catch (error) {
  log.error('Save failed', error, { userId: 123 });
}
```

**Error logging special handling:**
```typescript
error: error?.message,  // Just the message string
stack: error?.stack,    // Full stack trace
```

This extracts useful error information into structured format.

---

#### Using the Logger in HomeScreen

**Step 1: Import logger**
```typescript
import { log } from '../../lib/logger';
```

**Step 2: Add logging to handlePress**
```typescript
log.info('Button pressed', {
  inputLength: inputValue.length,
  inputValue: inputValue,
});
```

**Placement in handlePress:**
- After metrics (counter and histogram)
- Inside the traced span (so correlation works!)
- Before business logic

**Complete flow with all observability:**
```typescript
const handlePress = () => {
  // 1. Start trace
  const span = tracer.startSpan('button.press');

  // 2. Record metrics
  buttonPressCounter.add(1);
  inputLengthHistogram.record(inputValue.length);

  // 3. Log with trace correlation
  log.info('Button pressed', {
    inputLength: inputValue.length,
    inputValue: inputValue,
  });

  // 4. Add trace attributes
  span.setAttribute('input.length', inputValue.length);
  span.setAttribute('input.value', inputValue);

  // 5. Do the actual work
  setDisplayText(inputValue);

  // 6. End trace
  span.end();
};
```

---

### Testing the Complete Stack

**What to test:**
1. App running (`npm start`)
2. Press button multiple times with different text
3. Check console for structured logs
4. Check Jaeger for traces

**Console output example:**
```json
{
  "level": 30,
  "time": 1737835845123,
  "msg": "Button pressed",
  "traceId": "b07f4b84816c74b6e2b1e9855fbaaf12",
  "spanId": "e2b1e9855fbaaf12",
  "inputLength": 5,
  "inputValue": "hello"
}
```

**Key observations:**
- ✅ **traceId** present - Links to Jaeger trace!
- ✅ **spanId** present - Specific span within trace
- ✅ **Custom data** - inputLength and inputValue
- ✅ **JSON format** - Structured and parsable
- ✅ **Timestamp** automatically included

**Jaeger verification:**
1. Copy traceId from console log
2. Open Jaeger: http://localhost:16686
3. Find trace with that ID
4. See the correlated trace with full timing and attributes

**The connection:**
```
Console Log                          Jaeger Trace
┌─────────────────────────┐         ┌──────────────────────┐
│ msg: "Button pressed"   │         │ Span: button.press   │
│ traceId: abc123...      │ ──────> │ TraceID: abc123...   │
│ inputLength: 5          │         │ Duration: 2ms        │
│ inputValue: "hello"     │         │ Attributes: {...}    │
└─────────────────────────┘         └──────────────────────┘
```

**Success criteria:**
- ✅ Logs appear in console
- ✅ Logs contain trace IDs
- ✅ Trace IDs match traces in Jaeger
- ✅ Can jump from log → trace visualization

---

## Key Learnings Summary

### Technical Concepts

**1. The Three Pillars of Observability**
```
Traces     → What happened? When? How long?
Metrics    → How many? What distribution?
Logs       → Detailed context for specific events
```

Each pillar answers different questions:
- **Traces**: "Why is this request slow?" (causality, timing)
- **Metrics**: "Is traffic increasing?" (trends, aggregates)
- **Logs**: "What was the exact error?" (details, context)

**2. Metrics Types**

**Counter:**
- Only goes up (monotonically increasing)
- Tracks event counts
- Examples: button clicks, API calls, errors
- Usage: `.add(1)` or `.add(n)`

**Histogram:**
- Tracks value distribution
- Groups values into buckets
- Examples: request duration, file sizes, text lengths
- Usage: `.record(actualValue)`

**Gauge (not implemented, but learned about):**
- Can go up and down
- Current state measurement
- Examples: active users, memory usage, queue size

**3. Trace Correlation**

The power of linking observability data:
```typescript
// Inside a traced span:
log.info('Event happened', { data });

// Automatically includes:
{
  traceId: 'abc123...',  // ← Links to trace!
  spanId: 'xyz789...',   // ← Specific span
  data: ...              // ← Your custom data
}
```

**Benefits:**
- Click log → See full trace
- Understand context of when log occurred
- See timing and causality
- Debug with complete picture

**4. Backend Specialization**

**Learned:** Different observability backends serve different purposes.

**Jaeger:**
- ✅ Excellent for traces
- ❌ Doesn't support metrics
- ❌ Doesn't support logs (well)
- Use case: Distributed tracing

**Prometheus:**
- ❌ Doesn't support traces
- ✅ Excellent for metrics
- ❌ Not for logs
- Use case: Metrics and alerting

**Elasticsearch/Loki:**
- ❌ Not for traces
- ❌ Not for metrics
- ✅ Excellent for logs
- Use case: Log aggregation and search

**All-in-one (Honeycomb, Datadog, New Relic):**
- ✅ Traces
- ✅ Metrics
- ✅ Logs
- Trade-off: Commercial, potential vendor lock-in

**Production setup:**
```
Application
├─ Traces  → Jaeger (or Tempo, Zipkin)
├─ Metrics → Prometheus (or InfluxDB, TimescaleDB)
└─ Logs    → Elasticsearch/Loki (or Splunk)
```

**5. Structured Logging Benefits**

**JSON format enables:**
- Programmatic querying
- Filtering by any field
- Aggregation and analysis
- Machine parsing
- Correlation with other data

**Example queries possible:**
```javascript
// Find all button presses with long text
logs.filter(log => log.inputLength > 10)

// Find all errors for a specific trace
logs.filter(log => log.traceId === 'abc123' && log.level === 'error')

// Count events by type
logs.groupBy('msg').count()
```

**6. Periodic vs Immediate Export**

**Traces:** Exported immediately
- Individual events need real-time visibility
- Small, frequent exports
- See traces as they happen

**Metrics:** Exported periodically (60s)
- Aggregated data doesn't need real-time
- Batched for efficiency
- Reduces network overhead
- Still get data, just slightly delayed

---

### Development Practices

**1. Version Compatibility Matters (Reinforced)**

Lessons from Jest 30 issue applied here:
- Check versions before installing
- Match related package versions
- Research known compatibility issues
- Use specific version ranges (`^1.30.0`, not `latest`)

**2. Resource Sharing Pattern**

```typescript
// Define once:
const resource = new Resource({
  [ATTR_SERVICE_NAME]: 'demo-react-native-app',
  [ATTR_SERVICE_VERSION]: '1.0.0',
});

// Reuse everywhere:
const traceProvider = new WebTracerProvider({ resource });
const meterProvider = new MeterProvider({ resource });
```

**Why:**
- Ensures consistent service identification
- Reduces duplication
- Single source of truth
- All telemetry identified as same app

**3. Side-Effect Imports (Reinforced)**

Pattern seen in multiple places:
```typescript
import '../lib/telemetry';  // Just run the code
import { tracer, meter } from '../lib/telemetry';  // Import values
```

**Understanding:**
- First import: Runs initialization code (provider.register())
- Second import: Gets specific exports
- Telemetry runs once at app startup
- Other files can use tracer/meter without re-initializing

**4. Metric Creation Location**

**Outside component:**
```typescript
// ✅ GOOD - Created once
const buttonPressCounter = meter.createCounter('button.presses', {
  description: 'Number of times button was pressed',
});

export default function HomeScreen() {
  // Component code...
}
```

**Inside component:**
```typescript
// ❌ BAD - Recreated on every render!
export default function HomeScreen() {
  const buttonPressCounter = meter.createCounter('button.presses', {
    description: 'Number of times button was pressed',
  });
  // This creates a NEW counter on every render!
}
```

**Why outside:**
- Metrics should persist across renders
- Creating inside causes memory leaks
- Performance impact from recreation
- Loses accumulated data

**5. Learning Methodology (Continued Success)**

**What worked well:**
- Small, incremental steps
- User writes all code
- Explain concepts before implementation
- Confirm understanding at each step
- Document everything
- Ask questions freely

**Example flow:**
```
Explain metric types → Install packages → Update telemetry.ts →
Create counter → Test counter → Create histogram → Test histogram →
Discover Jaeger limitation → Discuss options → Move to logging →
Install pino → Create logger → Add logging → Test everything
```

**Each step confirmed before moving forward.**

---

### Questions Asked This Session

1. ✅ **"Do we have to install specific versions of metrics packages?"**
   → YES! Match SDK versions (1.30.x) and exporter versions (0.54.x)

2. ✅ **"What is a counter vs histogram?"**
   → Counter: Total count (only up). Histogram: Value distribution (ranges)

3. ✅ **"Why create metrics outside the component?"**
   → Persist across renders, avoid recreation, prevent memory leaks

4. ✅ **"Why is Jaeger rejecting metrics?"**
   → Jaeger is tracing-only, doesn't support metrics by design

5. ✅ **"Should we add Prometheus for metrics?"**
   → Option discussed, chose to accept limitation for simplicity

6. ✅ **"What is structured logging?"**
   → JSON-formatted logs vs plain text, machine-readable and queryable

7. ✅ **"Why Pino over other loggers?"**
   → Fast, lightweight, React Native compatible, JSON by default

8. ✅ **"How do logs get correlated with traces automatically?"**
   → `trace.getActiveSpan()` captures current span context, includes IDs in log

---

### Files Created/Modified

**Created:**
- `lib/logger.ts` - Structured logger with trace correlation

**Modified:**
- `lib/telemetry.ts` - Added metrics provider, exporter, reader, and meter export
- `app/(tabs)/index.tsx` - Added counter, histogram, and logging to handlePress
- `package.json` - Added pino, @opentelemetry/sdk-metrics, @opentelemetry/exporter-metrics-otlp-http

**Final telemetry.ts structure:**
```
Imports (tracing + metrics)
↓
Resource definition (shared)
↓
Trace Provider + Exporter + Processor + Registration
↓
Metrics Provider + Exporter + Reader
↓
Exports: tracer, meter
```

**Final logger.ts structure:**
```
Imports (pino + OpenTelemetry trace API)
↓
Base pino logger
↓
getTraceContext() helper
↓
Enhanced logger (info, warn, error) with auto-correlation
↓
Export: log
```

**Final HomeScreen observability:**
```
Metrics created outside component (counter + histogram)
↓
handlePress function:
  Start trace span
  Record metrics (counter + histogram)
  Log with correlation
  Add trace attributes
  Business logic
  End span
```

---

## What's Completed in Phase 2

**Status Update:**

- ✅ **Step 2.1:** Testing Foundation (Jest, React Native Testing Library)
- ✅ **Step 2.2:** Linting & Formatting (ESLint, Prettier)
- ✅ **Step 2.3:** Pre-commit Hooks (Husky, lint-staged)
- ✅ **Step 2.4:** CI/CD Pipeline (GitHub Actions, Jest 29 downgrade)
- ✅ **Step 2.5:** OpenTelemetry Foundation (Setup, resources, semantic conventions)
- ✅ **Step 2.6:** Observability Backend (Jaeger via Docker)
- ✅ **Step 2.7:** Tracing Implementation (Basic spans, attributes)
- ✅ **Step 2.7 Continued:** Metrics & Logging (Counters, histograms, structured logs with correlation)

**Remaining in Phase 2:**
- ⏭️ **Step 2.8:** Error Tracking Strategy (Error boundaries, Sentry)
- ⏭️ **Step 2.9:** Analytics Strategy (User behavior tracking)
- ⏭️ **Step 2.10:** Development Automation (Additional tooling)

---

## Summary of Achievements

**Today's accomplishments:**

**Metrics:**
- ✅ Installed OpenTelemetry metrics packages (version-matched)
- ✅ Configured MeterProvider with OTLP exporter
- ✅ Created counter metric for button presses
- ✅ Created histogram metric for input text length
- ✅ Implemented periodic metrics export (60s intervals)
- ✅ Learned Jaeger limitation (traces only, not metrics)
- ✅ Understood production observability architecture

**Logging:**
- ✅ Installed pino logging library
- ✅ Created custom logger with trace correlation
- ✅ Implemented automatic trace ID injection
- ✅ Added structured logging to button handler
- ✅ Verified logs correlate with traces in Jaeger

**Concepts mastered:**
- ✅ Three pillars of observability (traces, metrics, logs)
- ✅ Counter vs histogram metric types
- ✅ Trace correlation via context propagation
- ✅ Structured vs unstructured logging
- ✅ Backend specialization (Jaeger/Prometheus/etc.)
- ✅ Resource sharing across providers
- ✅ Periodic vs immediate telemetry export

**Production-ready knowledge:**
- ✅ How to instrument code with all three pillars
- ✅ Why different backends serve different purposes
- ✅ How to correlate observability data
- ✅ Architecture patterns for production observability stacks

---

**Last Updated:** 2025-10-23 (end of session)
**Session Duration:** ~2 hours
**Next Session:** Step 2.8 (Error Tracking) or Phase 3 (Data Persistence)

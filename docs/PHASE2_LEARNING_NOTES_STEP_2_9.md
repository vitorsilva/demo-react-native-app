# Phase 2 Learning Notes: Step 2.9 - Analytics Strategy

**Status:** ✅ COMPLETED
**Date:** 2025-10-28
**Session Duration:** ~3 hours

---

## Overview

Step 2.9 focused on implementing a complete analytics solution using OpenTelemetry metrics with Prometheus for visualization. This session went beyond the original plan to include setting up a full metrics pipeline with Docker Compose.

---

## What Was Accomplished

### 1. Analytics Strategy Discussion

**Explored three options:**
1. OpenTelemetry metrics only (vendor-neutral, already set up)
2. Dedicated analytics platforms (Amplitude, Mixpanel - proprietary)
3. Hybrid approach (both)

**Open-source alternatives discussed:**
- **PostHog** (recommended) - Full product analytics, MIT license, React Native SDK
- **Umami** - Simple, privacy-focused, limited mobile support
- **Plausible** - Web-focused, AGPL license
- **Matomo** - Google Analytics replacement, GPL

**Decision:** Implement OpenTelemetry analytics first, with option to add PostHog later

### 2. Created Analytics Module

**File:** `lib/analytics.ts`

**Key concepts learned:**
- **Creating counters vs incrementing counters**
  - Create once at module level (expensive operation)
  - Increment many times in functions (cheap operation)
  - Analogy: Install scoreboard once, update scores many times

**Implementation:**
```typescript
import { meter } from './telemetry';

const screenViewCounter = meter.createCounter('screen.views', {
  description: 'Number of times screens are viewed',
});

const userActionCounter = meter.createCounter('user.actions', {
  description: 'Number of user interactions',
});

export const analytics = {
  screenView: (screenName: string) => {
    screenViewCounter.add(1, { screen: screenName });
  },

  userAction: (action: string, metadata?: Record<string, string>) => {
    userActionCounter.add(1, { action, ...metadata });
  },
};
```

### 3. Implemented Screen View Tracking

**File:** `app/(tabs)/index.tsx`

**Key learning: Effects vs Handlers**

**Question:** Why are React hooks named with "Effect" instead of "Handler"?

**Answer:**
- **Event Handlers** = Direct user actions (onClick, onPress)
- **Effects** = Side effects from rendering/state changes
- React components should be pure (just return UI)
- Side effects (analytics, API calls, timers) go in `useEffect` or similar hooks
- Naming emphasizes these are for side effects, not pure rendering

**useEffect vs useFocusEffect:**
- `useEffect(() => {}, [])` - Runs once when component mounts
- `useFocusEffect(() => {})` - Runs every time screen gets focus
- For analytics, use `useFocusEffect` to track every screen visit

**Implementation:**
```typescript
import { useFocusEffect } from '@react-navigation/native';
import { analytics } from '../../lib/analytics';

useFocusEffect(() => {
  analytics.screenView('home');
});
```

**Anonymous functions refresher:**
```typescript
// Option 1: Anonymous arrow function
useFocusEffect(() => {
  analytics.screenView('home');
});

// Option 2: Named function (equivalent)
function trackHomeScreen() {
  analytics.screenView('home');
}
useFocusEffect(trackHomeScreen);
```

### 4. Implemented User Action Tracking

**Added to handlePress:**
```typescript
analytics.userAction('button_press', {
  inputLength: String(inputValue.length),
});
```

**Removed duplication:**
- Old: `buttonPressCounter.add(1)` (direct counter)
- New: `analytics.userAction('button_press')` (via analytics module)
- Cleaner, single source of truth

### 5. Set Up Prometheus Metrics Pipeline

**The Problem:** Jaeger only accepts traces, not metrics (404 on /v1/metrics)

**The Solution:** Multi-container setup with Docker Compose

**Architecture:**
```
React Native App → OpenTelemetry Collector → Prometheus
                   (port 4319)              (port 9090)
                   Converts OTLP to
                   Prometheus format
```

**Why OpenTelemetry Collector needed:**
- Prometheus doesn't directly accept OTLP format
- Collector converts OTLP → Prometheus format
- Standard practice in observability stacks

### 6. Configuration Files Created

**File: `otel-collector-config.yaml`**
```yaml
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318
        cors:
          allowed_origins:
            - "http://localhost:8081"
          allowed_headers:
            - "*"

exporters:
  prometheus:
    endpoint: 0.0.0.0:8889
  debug:
    verbosity: detailed

service:
  pipelines:
    metrics:
      receivers: [otlp]
      exporters: [prometheus, debug]
```

**Key learnings:**
- Originally tried `logging` exporter (deprecated)
- Fixed to use `debug` exporter instead
- CORS configuration required for browser access

**File: `prometheus.yml`**
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'otel-collector'
    static_configs:
      - targets: ['otel-collector:8889']
```

**Key concept:** Use container names, not localhost, for Docker networking

### 7. Docker Compose Setup

**File: `docker-compose.yml`**

**Services:**
1. **jaeger** (port 4318 for traces, 16686 for UI)
2. **otel-collector** (port 4319 for metrics, 8889 for Prometheus scraping)
3. **prometheus** (port 9090 for UI)

**Key decisions:**
- Added Jaeger to docker-compose for unified management
- Changed otel-collector port from 4318 → 4319 (avoid conflict with Jaeger)
- All services on shared `monitoring` network

**Benefits:**
- Start all services: `docker-compose up -d`
- Stop all services: `docker-compose down`
- Services communicate by container name
- Professional infrastructure-as-code approach

### 8. Dependency Version Assessment

**Before upgrading react-native-web:**
- Checked what depends on it (expo-router, expo-image, expo-system-ui)
- All accept any version (`*` in peer dependencies)
- Reviewed changelog (0.21.1 → 0.21.2)
- Assessed risk (PATCH version = lowest risk)

**Revert strategies discussed:**
1. Git revert (if committed)
2. Manual npm install of old version
3. `npm ci` to restore from lock file

**Outcome:** Successfully upgraded, but `pointerEvents` warning remains (library internal issue)

### 9. Updated Application Configuration

**File: `lib/telemetry.ts`**

**Port changes:**
```typescript
// Traces → Jaeger (unchanged)
const exporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces',
});

// Metrics → OTel Collector (changed)
const metricExporter = new OTLPMetricExporter({
  url: 'http://localhost:4319/v1/metrics',  // Changed from 4318
});
```

### 10. Successfully Visualized Metrics

**Prometheus UI:** `http://localhost:9090`

**Metrics visible:**
- `screen_views_total{screen="home"}` - Counter for screen views
- `user_actions_total{action="button_press"}` - Counter for button presses

**Prometheus automatically adds `_total` suffix to counters**

**Useful queries:**
```promql
# View screen views
screen_views_total

# Filter by screen
screen_views_total{screen="home"}

# Rate of button presses per minute
rate(user_actions_total[1m])

# Total across all screens
sum(screen_views_total)
```

---

## Key Concepts Learned

### 1. Docker Containers vs Services vs Machines

**Containers = Mini-computers inside your computer**
- All run on same physical machine
- Isolated from each other
- Share CPU/RAM but have separate filesystems
- Communicate via Docker networks

**Container naming for networking:**
- Inside container: `localhost` = that container only
- Between containers: Use container name (e.g., `otel-collector:8889`)
- Docker DNS resolves container names

### 2. Docker Compose

**What it does:**
- Looks for `docker-compose.yml` in current directory
- Orchestrates multiple containers
- Creates networks automatically
- Mounts config files via volumes

**Key commands:**
```bash
docker-compose up -d      # Start all services
docker-compose down       # Stop and remove all
docker-compose restart <service>  # Restart one service
docker-compose logs <service>     # View logs
docker ps                 # List running containers
```

### 3. OpenTelemetry Metrics vs Traces

**Traces:**
- Show individual event flow
- Visible in Jaeger
- Example: One button press with timing and attributes

**Metrics:**
- Aggregate counts over time
- Stored in Prometheus
- Example: Total button presses = 47

**Why both:**
- Traces: "What happened in THIS specific event?"
- Metrics: "How many times has this happened overall?"

### 4. Effects in React

**"Effect" terminology from functional programming:**
- Pure function: Just calculates, no outside world interaction
- Side effect: Anything that interacts with outside world (API, logs, timers, analytics)

**React's philosophy:**
- Components should be pure (just return UI)
- Side effects go in `useEffect`, `useFocusEffect`, etc.
- Naming emphasizes: "This is where side effects go"

### 5. CORS Configuration

**Encountered CORS errors twice:**
1. Jaeger (Step 2.6) - Fixed with environment variables
2. OTel Collector (Step 2.9) - Fixed in YAML config

**Pattern:**
- Browser enforces CORS for security
- Server must explicitly allow origins
- Wildcard `*` not allowed with credentials
- Use specific origin: `http://localhost:8081`

### 6. YAML Configuration Syntax

**Key concepts:**
- Indentation matters (like Python)
- Use spaces, not tabs
- `:` for key-value pairs
- `-` for list items
- `#` for comments

**Common mistake caught:**
- `loglevel: debug` doesn't exist
- Correct: `verbosity: detailed` (for debug exporter)

### 7. Semantic Versioning (Refresher)

**Format:** MAJOR.MINOR.PATCH
- **MAJOR** (0 → 1): Breaking changes
- **MINOR** (0.21 → 0.22): New features, backward compatible
- **PATCH** (0.21.1 → 0.21.2): Bug fixes only

**Risk assessment:**
- PATCH = Safest to upgrade
- MINOR = Usually safe
- MAJOR = Review breaking changes carefully

---

## Troubleshooting Log

### Issue 1: Jaeger Shows Traces but 404 on Metrics

**Error:** `http://localhost:4318/v1/metrics 404 (Not Found)`

**Root cause:** Jaeger is a tracing backend only, doesn't accept metrics

**Solution:** Set up OpenTelemetry Collector + Prometheus pipeline

### Issue 2: otel-collector Container Not Starting

**Error:**
```
'exporters' the logging exporter has been deprecated,
use the debug exporter instead
```

**Root cause:** Used deprecated `logging` exporter

**Solution:** Changed to `debug` exporter in config

### Issue 3: CORS Error on Metrics Endpoint

**Error:**
```
Access to resource at 'http://localhost:4319/v1/metrics'
has been blocked by CORS policy
```

**Root cause:** OTel Collector not configured to allow browser requests

**Solution:** Added CORS config to `otel-collector-config.yaml`:
```yaml
receivers:
  otlp:
    protocols:
      http:
        cors:
          allowed_origins:
            - "http://localhost:8081"
```

### Issue 4: Port Conflict Between Services

**Problem:** Jaeger and otel-collector both want port 4318

**Solution:**
- Jaeger keeps 4318 (traces)
- Changed otel-collector to 4319 (metrics)
- Updated `telemetry.ts` to send metrics to 4319

### Issue 5: react-native-web pointerEvents Warning

**Warning:** `props.pointerEvents is deprecated. Use style.pointerEvents`

**Investigation:**
- Not in user code
- Inside react-native-web library itself
- Upgraded 0.21.1 → 0.21.2 (no change)

**Conclusion:** Library maintainers need to fix, safe to ignore

---

## Complete Observability Stack

```
React Native App (localhost:8081)
│
├─ Traces → Jaeger (localhost:4318) → UI (localhost:16686)
│   └─ Individual event flows with timing
│
├─ Metrics → OTel Collector (localhost:4319) → Prometheus (localhost:9090)
│   └─ Aggregate counts and measurements
│
├─ Logs → Pino → Console (structured JSON with trace correlation)
│   └─ Event records with context
│
└─ Errors → Sentry (cloud) → Dashboard (sentry.io)
    └─ Exception tracking with stack traces
```

**All four pillars operational!**

---

## Files Created/Modified This Session

### Created Files:
1. `lib/analytics.ts` - Analytics module with OTel counters
2. `otel-collector-config.yaml` - OTel Collector configuration
3. `prometheus.yml` - Prometheus scraping configuration
4. `docker-compose.yml` - Multi-container orchestration

### Modified Files:
1. `app/(tabs)/index.tsx` - Added screen view and user action tracking
2. `lib/telemetry.ts` - Updated metrics port to 4319
3. `package.json` - Upgraded react-native-web to 0.21.2

---

## Questions Asked This Session

1. ✅ **"Should we use OpenTelemetry or skip to Phase 3?"**
   → Decided to complete analytics properly

2. ✅ **"What open-source analytics alternatives exist?"**
   → PostHog (recommended), Umami, Plausible, Matomo

3. ✅ **"Why are React hooks named with 'Effect'?"**
   → Functional programming: effects = side effects (not pure rendering)

4. ✅ **"What's the difference between creating and incrementing counters?"**
   → Create once (expensive), increment many times (cheap)

5. ✅ **"Is there really a loglevel: debug?"**
   → No, correct field is `verbosity: detailed` for debug exporter

6. ✅ **"Are otel-collector and prometheus on same machine or different?"**
   → Same machine, different containers (mini-computers inside your computer)

7. ✅ **"How does docker-compose know what to read?"**
   → Looks for `docker-compose.yml` in current directory

8. ✅ **"Shouldn't we add Jaeger to docker-compose?"**
   → Yes! Unified management is better

9. ✅ **"Won't upgrading break things? How to revert?"**
   → Risk assessment, revert strategies discussed

10. ✅ **"Weren't we going to explore viewing counters?"**
    → Yes! Set up Prometheus to visualize metrics

---

## Phase 2 Status: COMPLETE! 🎊

### All 9 Steps Completed:

1. ✅ Testing Foundation (Jest)
2. ✅ Linting & Formatting (ESLint, Prettier)
3. ✅ Pre-commit Hooks (Husky, lint-staged)
4. ✅ CI/CD Pipeline (GitHub Actions)
5. ✅ OpenTelemetry Foundation
6. ✅ Observability Backend (Jaeger)
7. ✅ Tracing, Metrics & Logging
8. ✅ Error Tracking (Sentry)
9. ✅ **Analytics Strategy (OpenTelemetry + Prometheus)** ← Completed today!

**(Step 2.10 Development Automation is optional)**

---

## What's Next

**Phase 3: Data Persistence & Storage**

**Step 3.1:** AsyncStorage - Make app remember data between sessions
- Install AsyncStorage
- Implement save/load functionality
- Test persistence

**Estimated time:** 1-2 hours

---

## Key Takeaways

### Technical Skills Gained:
- Docker Compose multi-container orchestration
- OpenTelemetry Collector configuration
- Prometheus setup and querying (PromQL)
- YAML configuration syntax
- Docker networking concepts
- CORS configuration for multiple services

### Development Practices:
- Risk assessment before upgrades
- Infrastructure-as-code approach
- Unified service management
- Deprecation handling
- Reading changelogs before upgrading

### Observability Strategy:
Complete professional-grade observability stack:
- **Traces** for causality (Jaeger)
- **Metrics** for aggregates (Prometheus)
- **Logs** for events (Pino)
- **Errors** for exceptions (Sentry)

### Problem-Solving:
- Breaking down complex setups into steps
- Troubleshooting container issues
- Reading error messages carefully
- Understanding deprecation warnings
- When to fix vs when to ignore warnings

---

**Session completed:** 2025-10-28
**Status:** Phase 2 complete, ready for Phase 3
**Docker services:** 3 containers running (jaeger, otel-collector, prometheus)
**Next session:** Phase 3 - AsyncStorage for data persistence

---

## Commands for Next Session

**Start observability stack:**
```bash
cd demo-react-native-app
docker-compose up -d
```

**Start React Native app:**
```bash
npm start
```

**Access dashboards:**
- Jaeger: http://localhost:16686
- Prometheus: http://localhost:9090
- Sentry: https://sentry.io

---

## Follow-up Session: Test Mocking Fix (2025-10-28)

### Issue Encountered

**Error:**
```
Error: Couldn't find a navigation object. Is your component inside NavigationContainer?
Jest
```

**Location:** `app/(tabs)/__tests__/index.test.tsx` line 7

**Root Cause:**
- HomeScreen uses `useFocusEffect` hook from `@react-navigation/native`
- Tests render the component in isolation without a NavigationContainer
- Navigation hooks require navigation context to function

### Solution: Mocking the Navigation Hook

**Added to test file:**
```tsx
// Mock the navigation hook that HomeScreen uses
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));
```

**What this does:**
- Tells Jest to replace `useFocusEffect` with a fake function (`jest.fn()`)
- Fake function does nothing, preventing the error
- Component can render without navigation context
- Test focuses on input/display logic, not navigation

### Key Concepts Learned

**Q1: What does `jest.mock()` do?**
- Creates a fake version of a module
- Intercepts imports and provides mock implementations
- Prevents real module code from running in tests
- Allows isolation of component logic

**Why needed here:**
- `HomeScreen` imports and uses `useFocusEffect`
- Real hook expects `NavigationContainer`
- Test doesn't provide container (and shouldn't need to)
- Mock lets component render without navigation setup

**Q2: Should we test the analytics call?**
- In more advanced testing: **yes, verify behavior**
- Could mock `analytics` module
- Use `jest.fn()` to track if `screenView` was called
- Assert it was called with correct argument: `'home'`

**Example advanced test:**
```tsx
jest.mock('../../lib/analytics');

it('tracks screen view on focus', () => {
  render(<HomeScreen />);
  expect(analytics.screenView).toHaveBeenCalledWith('home');
});
```

**For this learning project:**
- Current tests verify core input/display functionality ✅
- Testing analytics would be a nice-to-have
- Focus on learning fundamentals first
- Can add analytics tests later

### Testing Philosophy Reinforced

**What to mock:**
- External dependencies (navigation, analytics, storage)
- Network requests
- Timers and dates
- Anything outside component's control

**What NOT to mock:**
- The component you're testing
- React itself
- Component's internal logic
- Simple utility functions

**Rule of thumb:**
- Mock the boundaries
- Test the behavior
- Verify user-facing functionality

### Result

✅ Tests now pass successfully
✅ Both test cases working:
  - "renders correctly"
  - "updates display text when button is pressed"

---

**Session completed: 2025-10-28**

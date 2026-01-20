# Phase 2 Learning Notes (Part 3): Error Tracking Strategy

**Status:** ✅ COMPLETED
**Date:** 2025-10-27
**Session Duration:** ~1.5 hours

---

## Step 2.8: Error Tracking Strategy (Sentry)

### Overview

Step 2.8 focused on implementing production-ready error tracking using Sentry, integrated with the existing ErrorBoundary and structured logging setup.

---

## What Was Accomplished

### 1. Created Sentry Account and Project
- Signed up at https://sentry.io
- Created React Native project: "demo-react-native-app"
- Obtained DSN (Data Source Name): `https://35bafc36022024afa7ddd747a1491ca5@o4510262174220288.ingest.de.sentry.io/4510262178021456`
- Region: Germany (`ingest.de.sentry.io`)

### 2. Installed Sentry Package
```bash
cd demo-react-native-app
npx expo install sentry-expo
```

**Key Learning:** `npx expo install` vs regular `npx`
- User initially thought `npx` was only for one-time processes
- Clarified: `npx expo install` runs the local `expo` CLI tool
- It's a wrapper around `npm install` that ensures Expo SDK compatibility
- DOES add to `node_modules` and `package.json` permanently

### 3. Configured Sentry Initialization

**File:** `app/_layout.tsx`

Added at the very top (before other imports):
```typescript
import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: 'https://35bafc36022024afa7ddd747a1491ca5@o4510262174220288.ingest.de.sentry.io/4510262178021456',
  enableInExpoDevelopment: true,
  debug: true,
});
```

**Configuration explained:**
- `dsn`: Project address (like exporter URL in OpenTelemetry)
- `enableInExpoDevelopment: true`: Capture errors during `npm start` (for testing)
- `debug: true`: See Sentry logs in console (helpful for learning)

**Key Learning:** Initialize before other imports to catch errors during module loading (same pattern as OpenTelemetry side-effect import)

### 4. Integrated Sentry with ErrorBoundary

**File:** `components/ErrorBoundary.tsx`

Added Sentry import and updated `componentDidCatch`:
```typescript
import * as Sentry from 'sentry-expo';

componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  // Log locally with Pino (keep existing)
  log.error('React error boundary caught error', error, {
    componentStack: errorInfo.componentStack,
  });

  // Send to Sentry cloud
  Sentry.Native.captureException(error, {
    contexts: {
      react: {
        componentStack: errorInfo.componentStack,
      },
    },
  });
}
```

**Issue Encountered:** TypeScript error on `Sentry.captureException`
- `sentry-expo` wraps the native Sentry SDK
- Need to use `Sentry.Native.captureException()` instead of `Sentry.captureException()`
- `Sentry.init()` works directly (wrapper function)
- Other methods require `.Native` accessor

### 5. Handled Metro Bundler Cache Issue

**Error:** `Unable to resolve module ./worldwide.js`

**Solution:**
```bash
npx expo start -c
```

The `-c` flag clears Metro bundler cache. Similar to Jest 30 compatibility issue - sometimes packages need fresh install and cache clear.

### 6. Handled Web vs Native Environment Issue

**Error when testing in browser:** `Cannot read properties of undefined (reading 'captureException')`

**Root cause:** Running on web (browser) but `Sentry.Native` only exists in native environment

**Solution:** Handle both environments:
```typescript
if (Sentry.Native) {
  // Native environment (phone/mobile)
  Sentry.Native.captureException(error, { ... });
} else if (Sentry.Browser) {
  // Web environment (browser)
  Sentry.Browser.captureException(error, { ... });
}
```

### 7. Successfully Tested Integration

Created test crashing component:
```typescript
function CrashingComponent(): JSX.Element {
  throw new Error('Test Sentry integration - this is intentional!');
  return <Text>You will never see this</Text>;
}
```

**TypeScript issue:** Function inferred as returning `void` instead of JSX
**Solution:** Explicit return type annotation `: JSX.Element`

**Test Results:**
- ✅ ErrorBoundary caught error and showed fallback UI
- ✅ Pino logged error to console
- ✅ Sentry received error in dashboard
- ✅ Sentry showed full stack trace, environment info, and error context

---

## Key Concepts Learned

### 1. DSN (Data Source Name)
Similar to OpenTelemetry exporter URL - the address where errors are sent.

**Structure:**
```
https://[auth_key]@[organization_id].ingest.[region].sentry.io/[project_id]
```

### 2. Error Boundary Limitations (Reinforced)
- Only catches render errors
- Does NOT catch:
  - Event handlers (like button onClick)
  - Async code
  - Errors in the boundary itself

### 3. getDerivedStateFromError vs componentDidCatch (Reinforced)
- **`getDerivedStateFromError`**:
  - Called during render phase
  - Updates state for fallback UI
  - Must be pure (no side effects)
  - Static method

- **`componentDidCatch`**:
  - Called during commit phase (after fallback UI ready)
  - Can have side effects (logging, reporting)
  - Has access to `this`
  - Can do async operations

**Why separate?** React's render phase can be interrupted, so `getDerivedStateFromError` must be pure.

### 4. Hybrid Error Tracking Approach
The project now uses three layers:
1. **ErrorBoundary** - Graceful recovery (shows fallback UI)
2. **Pino Logger** - Local debugging (structured logs with trace correlation)
3. **Sentry** - Production monitoring (cloud dashboard for all users)

All three work together, not against each other!

### 5. Environment-Specific APIs
- `Sentry.Native` - For mobile (React Native)
- `Sentry.Browser` - For web (React DOM)
- Must check which exists before calling

---

## Comparison Learning: Sentry vs Grafana

### Discussion Topic: What's the difference?

**Sentry** = **Error Tracker** (collects and stores errors)
- Captures errors and exceptions automatically
- Stores error data in its own database
- Shows error details, stack traces, user context
- Groups similar errors together
- Alerts when errors occur

**Grafana** = **Visualization Dashboard** (displays data from other tools)
- Queries data from OTHER tools (doesn't collect itself)
- Creates dashboards with graphs and charts
- Combines data from multiple sources
- Real-time monitoring displays

**Analogy:**
- Sentry = A camera that records crashes
- Grafana = A TV screen that shows videos from different cameras

### When to Use Each

**Use Sentry when:**
- Need to know WHAT broke
- Want full error context
- Need user-level error tracking
- Application crashes are focus

**Use Grafana when:**
- Need to visualize TRENDS
- Have multiple data sources
- Want custom dashboards
- Operations monitoring is focus

**Use both when:**
- Running production systems
- Need error tracking AND performance monitoring
- Have operations team watching dashboards

### Production Architecture

```
Application
├─ Traces → Jaeger → Grafana (visualize)
├─ Metrics → Prometheus → Grafana (visualize)
├─ Logs → Loki/Elasticsearch → Grafana (visualize)
└─ Errors → Sentry (specialized error tracking)
```

---

## Loki Discussion (For Future)

### What is Loki?
Log aggregation system (like Prometheus, but for logs) by Grafana Labs.

**How it works:**
```
Your App (Pino logs) → Promtail (log shipper) → Loki (storage) → Grafana (query/view)
```

### Loki vs Elasticsearch

| Feature | Loki | Elasticsearch |
|---------|------|---------------|
| Index strategy | Labels only | Full-text index |
| Storage | Very cheap (~10x less) | Expensive |
| Complexity | Simple setup | Complex setup |
| Query speed | Fast for labeled queries | Fast for text search |
| RAM usage | Low (~500MB) | High (~2-4GB) |
| Best for | Structured logs (JSON) | Unstructured text |

### Why Not Add Loki Now?
- Pino logs already work great (console + structured format)
- Logs have trace correlation
- Would add 3+ more Docker containers
- Takes time away from React Native learning
- More valuable for multi-service architectures
- Better to add after Phase 3

**Decision:** Save for later. Current setup is sufficient for learning.

---

## Complete Error Flow (Current Setup)

```
1. Error occurs in app
   ↓
2. ErrorBoundary.componentDidCatch() catches it
   ↓
3. THREE things happen in parallel:
   ├─ getDerivedStateFromError() updates state
   │  └─ Shows fallback UI to user
   │
   ├─ Pino log.error() writes to console
   │  └─ Structured JSON with trace correlation
   │
   └─ Sentry.Native.captureException() sends to cloud
      └─ Dashboard shows error with full context
```

---

## Files Created/Modified

### Modified Files

**1. `app/_layout.tsx`**
- Added Sentry import and initialization at top
- Placed before other imports to catch early errors

**2. `components/ErrorBoundary.tsx`**
- Added Sentry import
- Updated `componentDidCatch` to send errors to Sentry
- Added environment check (Native vs Browser)

**3. `package.json`**
- Added `sentry-expo` dependency (via `npx expo install`)

---

## Questions Asked This Session

1. ✅ **"What's the difference between Sentry and Grafana?"**
   → Sentry collects errors; Grafana visualizes data from other tools

2. ✅ **"How does Loki work?"**
   → Log aggregation with label-based indexing, works with Grafana

3. ✅ **"Why use `npx expo install` instead of `npm install`?"**
   → Clarified that `npx expo install` wraps npm install with Expo SDK compatibility checking

4. ✅ **"Why initialize Sentry before other imports?"**
   → To catch errors during module loading (side-effect pattern)

5. ✅ **"What does the DSN represent?"**
   → Address where errors are sent (like OpenTelemetry exporter URL)

6. ✅ **"Why do we pass componentStack to Sentry?"**
   → Shows React component tree where error occurred

---

## Troubleshooting Log

### Issue 1: TypeScript Error on Sentry.captureException
**Error:** `Property 'captureException' does not exist`
**Cause:** `sentry-expo` wraps native SDK, methods need `.Native` accessor
**Solution:** Use `Sentry.Native.captureException()` instead

### Issue 2: Metro Bundler Module Resolution
**Error:** `Unable to resolve module ./worldwide.js`
**Cause:** Metro cache confused about Sentry package structure
**Solution:** Clear cache with `npx expo start -c`

### Issue 3: Undefined Error in Web Environment
**Error:** `Cannot read properties of undefined (reading 'captureException')`
**Cause:** Testing in browser, but `Sentry.Native` only exists on mobile
**Solution:** Check environment and use appropriate API (Native vs Browser)

### Issue 4: TypeScript Component Return Type
**Error:** `'CrashingComponent' cannot be used as a JSX component`
**Cause:** TypeScript inferred return type as `void` because of early throw
**Solution:** Explicit return type annotation `: JSX.Element`

---

## Phase 2 Progress Update

### Completed Steps (8 out of 10)

1. ✅ **Step 2.1:** Testing Foundation (Jest, React Native Testing Library)
2. ✅ **Step 2.2:** Linting & Formatting (ESLint, Prettier)
3. ✅ **Step 2.3:** Pre-commit Hooks (Husky, lint-staged)
4. ✅ **Step 2.4:** CI/CD Pipeline (GitHub Actions, Jest 29 downgrade)
5. ✅ **Step 2.5:** OpenTelemetry Foundation (Setup, resources, semantic conventions)
6. ✅ **Step 2.6:** Observability Backend (Jaeger via Docker)
7. ✅ **Step 2.7:** Tracing, Metrics & Logging (Complete observability stack)
8. ✅ **Step 2.8:** Error Tracking Strategy (Sentry) ← **COMPLETED TODAY**

### Remaining Steps (2)

9. ⏭️ **Step 2.9:** Analytics Strategy (User behavior tracking with OpenTelemetry)
10. ⏭️ **Step 2.10:** Development Automation (Additional tooling and scripts)

**Alternative:** Move to **Phase 3** - AsyncStorage for data persistence (more user-facing features)

---

## Key Takeaways

### Technical Skills
- Sentry integration with React Native and Expo
- Environment-specific error handling (Native vs Browser)
- Hybrid error tracking approach (local + cloud)
- Metro bundler cache management
- TypeScript component typing

### Development Practices
- Initialize observability tools first (before other imports)
- Use `npx expo install` for Expo SDK compatibility
- Clear cache when encountering module resolution issues
- Check environment before using platform-specific APIs
- Test error tracking with intentional crashes

### Observability Strategy
The complete stack now includes:
- **Traces** → Jaeger (OpenTelemetry)
- **Metrics** → Created (not visualized yet)
- **Logs** → Pino (structured, with trace correlation)
- **Errors** → Sentry (cloud dashboard)

All four pillars of observability are now instrumented!

---

## Next Session Preparation

### Options for Tomorrow

1. **Continue Phase 2.9** - Analytics Strategy
   - Build on OpenTelemetry metrics
   - Track user behavior events
   - Screen views and user actions
   - Estimated time: 30-45 minutes

2. **Continue Phase 2.10** - Development Automation
   - Additional npm scripts
   - Developer productivity tools
   - Workflow improvements
   - Estimated time: 30-45 minutes

3. **Move to Phase 3** - AsyncStorage (Data Persistence)
   - Make app remember data between sessions
   - More immediately useful
   - User-visible features
   - Estimated time: 1-2 hours

### Recommendation
Consider moving to Phase 3 after completing 8/10 Phase 2 steps. You have a solid automation and observability foundation. Phase 3 will add features users can actually see and use.

---

**Last Updated:** 2025-10-27 (end of session)
**Session completed successfully** ✅
**Next session:** To be determined (Analytics, Automation, or Data Persistence)

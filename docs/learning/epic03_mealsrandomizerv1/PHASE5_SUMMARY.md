# Phase 5: Telemetry Expansion - Quick Summary

**Full Guide:** [PHASE5_TELEMETRY_EXPANSION.md](./PHASE5_TELEMETRY_EXPANSION.md)

---

## 🎯 Why This Phase?

You already have a solid observability foundation from Epic 1, but **database and business logic are currently "black boxes"**.

This phase adds:
- ✅ Visibility into database query performance
- ✅ Understanding of algorithm execution
- ✅ Complete user interaction tracking
- ✅ Production-ready metrics

---

## 📊 Current State vs After Phase 5

### Current State (Epic 1 Foundation)

**What's Working:**
- ✅ Infrastructure: Jaeger, Prometheus, OTel Collector (Docker Compose)
- ✅ Screen views tracked (4 screens)
- ✅ Meal generation metrics (duration, count)
- ✅ Error tracking (Sentry + ErrorBoundary)
- ✅ Structured logging with trace correlation

**What's Missing:**
- ❌ Database operations (no tracing)
- ❌ Business logic (no tracing)
- ❌ Button clicks (not tracked individually)
- ❌ Form submissions (not tracked)
- ❌ Production metrics (query duration, algorithm performance)
- ❌ Telemetry tests

---

### After Phase 5

**New Capabilities:**
- ✅ **See every database query** in Jaeger with duration and row counts
- ✅ **Understand algorithm performance** with detailed traces
- ✅ **Track user behavior** at button/form level
- ✅ **Monitor production health** with comprehensive metrics
- ✅ **Debug issues** using correlated logs, traces, and metrics
- ✅ **Performance analysis** with percentile queries

---

## 🛠️ What You'll Build

### 1. Database Tracing (1.5-2 hours)

**Helper Function:**
```typescript
// lib/telemetry/databaseTracing.ts
traceDatabaseOperation('getAll', 'ingredients', async () => {
  return await db.getAllAsync('SELECT * FROM ingredients');
});
```

**Result:** Every DB query appears in Jaeger with:
- Table name
- Operation type (SELECT, INSERT, UPDATE, DELETE)
- Duration
- Row count
- Error details (if any)

---

### 2. Business Logic Tracing (1-1.5 hours)

**Wrap algorithms with spans:**
```typescript
// Combination generator
const span = tracer.startSpan('algorithm.generateCombinations');
span.setAttribute('input.ingredient_count', ingredients.length);
// ... algorithm runs ...
span.setAttribute('output.combinations', combinations.length);
span.end();
```

**Result:** See algorithm execution in Jaeger:
- Input parameters (ingredient count, min/max)
- Output results (combinations generated)
- Execution time
- Algorithm steps (shuffle, filter, select)

---

### 3. Enhanced User Tracking (1 hour)

**Track every interaction:**
```typescript
analytics.userAction(UserActions.SELECT_MEAL, {
  mealType: 'breakfast',
});

analytics.userAction(UserActions.ADD_INGREDIENT, {
  hasCategory: true,
});
```

**Result:** Know exactly what users do:
- Which buttons they click most
- Which features they use
- Where they spend time
- Where they drop off

---

### 4. Production Metrics (30 min)

**Add monitoring metrics:**
```typescript
databaseQueryDuration.record(duration, { table, operation });
algorithmDuration.record(duration);
buttonClickCounter.add(1, { action: 'select_meal' });
```

**Result:** Query in Prometheus:
```promql
# 95th percentile query time
histogram_quantile(0.95, db_query_duration_ms_bucket)

# Slowest tables
topk(5, db_query_duration_ms_bucket)

# Most clicked buttons
topk(10, button_clicks_total)
```

---

### 5. Testing & Validation (1 hour)

**Tests:**
- Unit tests for telemetry helpers
- E2E test for telemetry integration
- Manual validation in Jaeger/Prometheus
- Performance impact assessment

**Result:** Confidence that telemetry works correctly and has minimal overhead.

---

## 📈 Example Use Cases

### Use Case 1: Debug Slow Suggestions

**Problem:** "Why are suggestions sometimes slow?"

**Solution:**
1. Open Jaeger → Search traces
2. Find slow `generateMealSuggestions` trace
3. See child spans:
   - `db.ingredients.getActive` - 50ms ✅
   - `db.mealLogs.getRecent` - 45ms ✅
   - `algorithm.filterByCooldown` - 850ms ⚠️ **SLOW!**
   - `algorithm.generateCombinations` - 30ms ✅
4. Found the bottleneck: cooldown filtering needs optimization

---

### Use Case 2: Monitor Production Health

**Problem:** "Is the app performing well in production?"

**Solution:** Query Prometheus:
```promql
# Error rate
rate(app_errors_total[5m])

# Database health
histogram_quantile(0.95, db_query_duration_ms_bucket)

# User engagement
sum(button_clicks_total) by (action)

# Algorithm performance
histogram_quantile(0.99, algorithm_duration_ms_bucket)
```

**Dashboard shows:**
- ✅ Error rate: 0.1% (healthy)
- ✅ 95th percentile query time: 25ms (good)
- ⚠️ 99th percentile algorithm time: 1200ms (investigate)
- ✅ Most clicked: "Generate New Ideas" (feature is used!)

---

### Use Case 3: Understand User Behavior

**Problem:** "Which features do users actually use?"

**Solution:** Query metrics:
```promql
# Top actions
topk(10, sum(user_actions_total) by (action))
```

**Results:**
1. `generate_suggestions` - 450 clicks
2. `select_meal` - 380 clicks
3. `confirm_meal` - 375 clicks
4. `add_ingredient` - 12 clicks
5. `delete_ingredient` - 3 clicks

**Insight:** Users love generating suggestions, rarely customize ingredients. Maybe simplify ingredient management or add tutorial.

---

## ✅ Success Criteria

**After Phase 5, you can:**
- [ ] See all database queries in Jaeger
- [ ] See algorithm execution in Jaeger
- [ ] Query metrics in Prometheus
- [ ] Correlate logs with traces using trace ID
- [ ] Debug production issues using telemetry
- [ ] Monitor app health with dashboards
- [ ] Understand user behavior patterns
- [ ] Identify performance bottlenecks
- [ ] Prove telemetry has <5% overhead

---

## 🎓 What You'll Learn

1. **Distributed Tracing:** How to instrument code for observability
2. **Performance Monitoring:** How to track and optimize performance
3. **Production Debugging:** How to diagnose issues in production
4. **Metrics Design:** How to create useful metrics
5. **Observability Best Practices:** Industry-standard patterns

---

## 🚀 Time Investment

**Total:** 4-6 hours

**Breakdown:**
- Database tracing: 1.5-2 hours
- Business logic tracing: 1-1.5 hours
- User tracking: 1 hour
- Production metrics: 30 min
- Testing: 1 hour
- Documentation: 30 min
- Validation: 1 hour

**Return on Investment:**
- Save hours debugging production issues
- Prevent performance regressions
- Make data-driven decisions
- Ship with confidence

---

## 📚 Key Files Created/Modified

**New Files:**
- `lib/telemetry/databaseTracing.ts` - Database tracing helper
- `lib/telemetry/productionMetrics.ts` - Production metrics
- `lib/telemetry/__tests__/databaseTracing.test.ts` - Tests
- `lib/telemetry/__tests__/analytics.test.ts` - Tests
- `e2e/telemetry.spec.ts` - E2E test
- `docs/user-guide/telemetry.md` - User guide
- `docs/api/observability.md` - API docs

**Modified Files:**
- `lib/database/ingredients.ts` - Add tracing
- `lib/database/mealLogs.ts` - Add tracing
- `lib/database/categories.ts` - Add tracing
- `lib/database/mealTypes.ts` - Add tracing
- `lib/business-logic/combinationGenerator.ts` - Add tracing
- `lib/business-logic/varietyEngine.ts` - Add tracing
- `lib/telemetry/analytics.ts` - Add user actions
- All screens - Add button tracking
- All forms - Add submission tracking

---

## 🎯 Next Steps After Phase 5

1. **Monitor for a week** - Use Jaeger/Prometheus daily
2. **Identify bottlenecks** - Find slow queries/algorithms
3. **Optimize based on data** - Fix real performance issues
4. **Set up alerts** (optional) - Get notified of errors
5. **Add Grafana dashboards** (optional) - Better visualization

---

**Ready to start?** → [Full Guide: PHASE5_TELEMETRY_EXPANSION.md](./PHASE5_TELEMETRY_EXPANSION.md)

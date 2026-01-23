# Phase 1: Quick Wins (Polish)

**Status:** 📋 PLANNED

**Goal:** Low-effort, high-impact improvements with no architectural changes

**Dependencies:** None - can start immediately

---

## Overview

These features add immediate user value without requiring database migrations or architectural changes. They enhance the existing experience with visual feedback, personalization, and tactile polish.

---

## Features

| # | Feature | Effort | Description |
|---|---------|--------|-------------|
| 1.1 | [Favorite Combinations ⭐](./features/FEATURE_1.1_FAVORITES.md) | ~8 hrs | Mark combos as favorites for prioritized suggestions |
| 1.2 | ["New!" Badge 🆕](./features/FEATURE_1.2_NEW_BADGE.md) | ~3 hrs | Visual indicator for untried combinations |
| 1.3 | [Variety Color Coding 🎨](./features/FEATURE_1.3_COLOR_CODING.md) | ~3 hrs | Color-coded recency indicators |
| 1.4 | [Variety Stats 📊](./features/FEATURE_1.4_VARIETY_STATS.md) | ~7 hrs | Personalized variety statistics |
| 1.5 | [Haptic Feedback 📳](./features/FEATURE_1.5_HAPTIC_FEEDBACK.md) | ~1.5 hrs | Tactile feedback for interactions |

**Total Estimated Effort:** ~22.5 hours

---

## Implementation Order

| Order | Task | Effort | Notes |
|-------|------|--------|-------|
| 1 | Run existing test suites | ~15 min | Baseline: unit (220+), Playwright E2E (23) |
| 2 | Run quality baseline | ~30 min | lint, typecheck, security scan |
| 3 | [Feature 1.5: Haptic Feedback](./features/FEATURE_1.5_HAPTIC_FEEDBACK.md) | ~1.5 hrs | Add utility, sprinkle in components |
| 4 | [Feature 1.3: Variety Color Coding](./features/FEATURE_1.3_COLOR_CODING.md) | ~3 hrs | Suggestion card, utility function |
| 5 | [Feature 1.2: "New!" Badge](./features/FEATURE_1.2_NEW_BADGE.md) | ~3 hrs | Suggestion card, utility function |
| 6 | [Feature 1.1: Favorite Combinations](./features/FEATURE_1.1_FAVORITES.md) | ~8 hrs | DB migration, store, UI components |
| 7 | [Feature 1.4: Variety Stats](./features/FEATURE_1.4_VARIETY_STATS.md) | ~7 hrs | New component, calculation logic |
| 8 | Run full test suites | ~20 min | Verify no regressions |
| 9 | Run quality checks and compare | ~30 min | Compare to baseline |
| 10 | Document learning notes | ~30 min | Capture unexpected errors, workarounds |

---

## Database Migration

This phase requires one database migration for the Favorites feature. The project uses a **versioned migration system** in `lib/database/migrations.ts`.

**Current schema version:** 3

See [Feature 1.1: Favorites](./features/FEATURE_1.1_FAVORITES.md#database-migration) for the specific migration code.

**Key points:**
- Migrations run automatically on app startup
- Each migration is idempotent (safe to re-run)
- Helper functions: `columnExists()`, `recordExists()`
- New columns use `DEFAULT` values for existing rows

---

## Files Overview

### New Files
- `lib/utils/haptics.ts` - Haptic feedback utility
- `lib/utils/variety.ts` - Variety color, badge, and stats calculations
- `components/NewBadge.tsx` - "New!" badge component
- `components/VarietyStats.tsx` - Stats display component
- `docs/learning/epic04_feature_enhancement/PHASE1_LEARNING_NOTES.md` - Learning notes

### Modified Files
- `lib/database/migrations.ts` - Add `is_favorite` column (version 4)
- `lib/store/index.ts` - Add favorite actions, haptic preference
- `components/SuggestionCard.tsx` - Add badge, color, favorite icon, haptics
- `app/(tabs)/index.tsx` - Add stats card
- `app/(tabs)/history.tsx` - Add favorites filter
- `app/(tabs)/settings.tsx` - Add haptic toggle

---

## Testing Strategy

### Unit Tests
- `isNewCombination()` returns correct boolean
- `getVarietyColor()` returns correct color
- `calculateVarietyStats()` returns correct stats
- Favorite toggle updates state correctly
- Haptic utility functions work correctly

### E2E Tests (Playwright)
- Can mark a combination as favorite
- Favorites appear in filtered history
- Stats display on home screen
- Color coding visible on suggestion cards

### Mobile E2E Tests (Maestro)
- Mirror Playwright tests for mobile verification

---

## Deployment Strategy

### Release Type
**Standard Release** - Client-only features, no server dependencies

### Pre-Deployment Checklist
- [ ] All unit tests passing
- [ ] All E2E tests passing (Playwright + Maestro)
- [ ] Quality baseline comparison completed
- [ ] Manual QA on physical device
- [ ] Version bump in `app.json`

### Build & Release
```bash
# 1. Bump version
npm version patch  # or minor for feature release

# 2. Build preview APK for testing
eas build --platform android --profile preview

# 3. Test on physical devices

# 4. Build production release
eas build --platform android --profile production

# 5. Submit to Play Store (when ready)
eas submit --platform android
```

### Rollback Plan
- Revert to previous APK version via Play Store rollback
- No database migrations to revert (only adds nullable column)

### Post-Deployment
- Monitor OTel error spans for new errors
- Check telemetry for feature adoption (favorites usage, haptic toggles)

---

## Success Criteria

Phase 1 is complete when:
- [ ] All 5 features implemented and working
- [ ] Unit tests pass for new utility functions
- [ ] E2E tests pass for user flows
- [ ] No regressions in existing functionality
- [ ] Features feel polished and integrated

---

## Learning Notes

Document unexpected errors, workarounds, and fixes encountered during implementation:

**[Phase 1 Learning Notes →](./PHASE1_LEARNING_NOTES.md)**

---

## Reference

See [Potential Enhancements](../../product_info/meals-randomizer-exploration.md#potential-enhancements-post-v1) in the exploration document for original feature descriptions.

### Developer Guides

- [Testing Guide](../../developer-guide/TESTING.md) - Unit testing patterns
- [Maestro Testing](../../developer-guide/MAESTRO_TESTING.md) - Mobile E2E testing
- [Architecture Rules](../../developer-guide/ARCHITECTURE_RULES.md) - Architecture testing
- [Database Schema](../../architecture/DATABASE_SCHEMA.md) - Schema design patterns
- [State Management](../../architecture/STATE_MANAGEMENT.md) - Zustand store patterns

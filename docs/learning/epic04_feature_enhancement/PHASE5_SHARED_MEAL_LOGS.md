# Phase 5: Shared Meal Logs

**Status:** 📋 PLANNED

**Goal:** Enable meal sharing within families

**Dependencies:** Phase 4 (User Identity & Families)

---

## Branching Strategy

**Branch Name:** `FEATURE_5.0_SHARED_MEAL_LOGS`

**Approach:**
- Create feature branch from `main`
- Make small, focused commits for each task
- Commit message format: `feat(phase5): <description>` or `test(phase5): <description>`
- Run tests before each commit
- Squash merge to `main` when complete

---

## Tool Instructions

### Running Tests
```bash
cd demo-react-native-app

# Unit tests
npm test

# E2E tests (Playwright)
npm run test:e2e

# Linting
npm run lint
```

### Running Maestro Tests
```bash
npm start
maestro test e2e/maestro/
```

### Quality Checks
```bash
npm run arch:test
npm run lint:dead-code
npm run lint:duplicates
npm run security:scan
```

---

## I18N Considerations

### New Translation Keys

**English (`lib/i18n/locales/en/`):**
```json
// meals.json (additions)
{
  "privacy": {
    "label": "Share with family",
    "private": "Just me",
    "family": "Share with {{familyName}}"
  }
}

// history.json (additions)
{
  "tabs": {
    "myMeals": "My Meals",
    "family": "Family"
  },
  "familyHistory": {
    "todaySummary": "Today's Meals",
    "memberMeals": "{{name}}'s meals",
    "noMeals": "No meals logged today",
    "sharedBy": "Shared by {{name}}"
  }
}

// home.json (additions)
{
  "familySummary": {
    "title": "Family Today",
    "whoAteWhat": "{{name}} had {{mealType}}",
    "noActivity": "No family meals logged today"
  }
}

// settings.json (additions)
{
  "familySharing": {
    "title": "Family Sharing",
    "defaultVisibility": "Default meal visibility",
    "alwaysAsk": "Always ask",
    "alwaysPrivate": "Always private",
    "alwaysShare": "Always share"
  }
}
```

**Portuguese (`lib/i18n/locales/pt-PT/`):**
- Same structure with Portuguese translations

### Notes
- Family member names are user-entered, displayed as-is
- Meal type names should use existing translated meal type keys

---

## Overview

With families established in Phase 4, this phase enables:
1. Extending meal logs with user and family context
2. Privacy toggle when logging meals
3. Family meal history view
4. "Who ate what today" dashboard

No sync yet - that's Phase 6. Data is local but structured for future sync.

---

## UI Wireframes: Before & After

### Meal Logging - Privacy Toggle

**BEFORE (from Phase 2):**
```
┌─────────────────────────────────────┐
│  Log Breakfast                      │
├─────────────────────────────────────┤
│                                     │
│  Name this meal (optional):         │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  Your selection:                    │
│  • milk                             │
│  • bread (toasted)                  │
│                                     │
│  ┌─────────────────────────────────┐│
│  │         Confirm Meal            ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

**AFTER (with privacy toggle):**
```
┌─────────────────────────────────────┐
│  Log Breakfast                      │
├─────────────────────────────────────┤
│                                     │
│  Name this meal (optional):         │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  Your selection:                    │
│  • milk                             │
│  • bread (toasted)                  │
│                                     │
│  ┌─────────────────────────────────┐│  ← NEW: Privacy section
│  │ Share with Silva Household?     ││
│  │                        [====○] ││  ← Toggle
│  │ (Family members will see this)  ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │         Confirm Meal            ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### History Screen - Family Tab

**BEFORE:**
```
┌─────────────────────────────────────┐
│  History                            │
├─────────────────────────────────────┤
│  [All] [⭐ Favorites]               │
├─────────────────────────────────────┤
│                                     │
│  Today                              │
│  ┌─────────────────────────────────┐│
│  │ milk + cereals              [⭐]││
│  │ Breakfast • 8:30 AM             ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

**AFTER:**
```
┌─────────────────────────────────────┐
│  History                            │
├─────────────────────────────────────┤
│  [My Meals] [🏠 Family] [⭐ Favs]   │  ← NEW: Family tab
├─────────────────────────────────────┤
│                                     │
│  Today in Silva Household           │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 👤 João                         ││  ← Shows who
│  │ milk + cereals                  ││
│  │ Breakfast • 8:30 AM             ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 👤 Maria                        ││
│  │ yogurt + bread + jam            ││
│  │ Breakfast • 9:00 AM             ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 👤 Pedro                        ││
│  │ apple + cookies                 ││
│  │ Snack • 10:30 AM                ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### Home Screen - Family Day Summary

**BEFORE:**
```
┌─────────────────────────────────────┐
│  SaborSpin          [🏠 Silva ▼]   │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │ 📊 Your Variety This Month      ││
│  │ ...                             ││
│  └─────────────────────────────────┘│
│                                     │
│  What would you like?               │
│  [🍳 Breakfast] [🥪 Snack]          │
│                                     │
└─────────────────────────────────────┘
```

**AFTER:**
```
┌─────────────────────────────────────┐
│  SaborSpin          [🏠 Silva ▼]   │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │ 📊 Your Variety This Month      ││
│  │ ...                             ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│  ← NEW: Family summary
│  │ 🏠 Today in Silva Household     ││
│  │                                 ││
│  │ João                            ││
│  │ ✓ Breakfast  ✓ Snack  ○ Lunch   ││
│  │                                 ││
│  │ Maria                           ││
│  │ ✓ Breakfast  ○ Snack  ○ Lunch   ││
│  │                                 ││
│  │ Pedro                           ││
│  │ ○ Breakfast  ✓ Snack  ○ Lunch   ││
│  │                            [▼]  ││  ← Collapsible
│  └─────────────────────────────────┘│
│                                     │
│  What would you like?               │
│  [🍳 Breakfast] [🥪 Snack]          │
│                                     │
└─────────────────────────────────────┘
```

### Settings - Default Visibility

**NEW in Settings:**
```
┌─────────────────────────────────────┐
│  Settings                           │
├─────────────────────────────────────┤
│                                     │
│  Family Sharing                     │  ← NEW section
│  ┌─────────────────────────────────┐│
│  │ Default meal visibility:        ││
│  │                                 ││
│  │ ○ Personal (only me)            ││
│  │ ● Share with family             ││  ← Selected
│  │                                 ││
│  │ (Can change per meal)           ││
│  └─────────────────────────────────┘│
│                                     │
│  ...                                │
└─────────────────────────────────────┘
```

---

## Screenshot Capture

### Required Screenshots

| Screenshot | When to Capture | Filename |
|------------|-----------------|----------|
| Meal Logging BEFORE | Before privacy toggle added | `screenshot_before_meal_logging_privacy.png` |
| Meal Logging AFTER | After privacy toggle added | `screenshot_after_meal_logging_privacy.png` |
| History Screen BEFORE | Before Family tab | `screenshot_before_history_family.png` |
| History Screen - My Meals | My Meals tab selected | `screenshot_history_my_meals.png` |
| History Screen - Family | Family tab with multiple members | `screenshot_history_family.png` |
| Home Screen BEFORE | Before family summary | `screenshot_before_home_family_summary.png` |
| Home Screen AFTER | After family day summary added | `screenshot_after_home_family_summary.png` |
| Settings - Default Visibility | New Family Sharing section | `screenshot_settings_sharing.png` |

### Capture Instructions
1. For family history: Log meals from multiple family members
2. For day summary: Ensure varied meal states (completed, pending)
3. Show both personal and family visibility states
4. Save screenshots in `docs/learning/epic04_feature_enhancement/screenshots/`

---

## Features

### 5.1 Extend Meal Logs Schema

**Add columns to meal_logs:**

```sql
ALTER TABLE meal_logs ADD COLUMN user_id TEXT;
ALTER TABLE meal_logs ADD COLUMN family_id TEXT;
ALTER TABLE meal_logs ADD COLUMN visibility TEXT DEFAULT 'personal';
-- visibility: 'personal' | 'family'

-- Add foreign keys (SQLite doesn't enforce these retroactively, but good for documentation)
-- user_id REFERENCES users(id)
-- family_id REFERENCES families(id)
```

---

### Database Migration Pattern

This project uses a **versioned migration system** in `lib/database/migrations.ts`. Each migration has a version number and an idempotent `up` function.

**Add migration for meal sharing columns:**

```typescript
// In lib/database/migrations.ts - add to migrations array
// Version number depends on which phases are implemented first
// This migration MUST come after Phase 4 (users table exists)

{
  version: 9,  // Adjust based on current version
  up: async (db: DatabaseAdapter) => {
    // 1. Add user_id column to meal_logs (idempotent)
    if (!(await columnExists(db, 'meal_logs', 'user_id'))) {
      await db.runAsync(`ALTER TABLE meal_logs ADD COLUMN user_id TEXT`);
    }

    // 2. Add family_id column to meal_logs (idempotent)
    if (!(await columnExists(db, 'meal_logs', 'family_id'))) {
      await db.runAsync(`ALTER TABLE meal_logs ADD COLUMN family_id TEXT`);
    }

    // 3. Add visibility column to meal_logs (idempotent)
    if (!(await columnExists(db, 'meal_logs', 'visibility'))) {
      await db.runAsync(`ALTER TABLE meal_logs ADD COLUMN visibility TEXT DEFAULT 'personal'`);
    }
  },
},

{
  version: 10,  // Data migration in separate version
  up: async (db: DatabaseAdapter) => {
    // Migrate existing logs to current user
    // Get the first (and typically only) user
    const user = await db.getFirstAsync<{ id: string }>('SELECT id FROM users LIMIT 1');

    if (user) {
      // Update logs that don't have a user_id yet
      await db.runAsync(
        'UPDATE meal_logs SET user_id = ? WHERE user_id IS NULL',
        [user.id]
      );
    }
    // Note: Logs without a user_id will remain personal-only
    // This is safe - they'll still display for the device owner
  },
}
```

**How the migration system works:**
1. `migrations` table tracks applied versions
2. `runMigrations(db)` runs on app startup
3. Only migrations with `version > currentVersion` are executed
4. `columnExists()` helper ensures idempotency
5. Each migration is recorded after success

**Why split into two versions:**
- Version 9: Schema changes (columns) - safe to retry
- Version 10: Data migration - assigns existing logs to user

**Dependency:** Phase 4 must be implemented first (users table must exist)

---

**Updated Type:**

```typescript
interface MealLog {
  id: string;
  mealTypeId: string;
  name: string | null;
  date: string;
  userId: string;           // NEW
  familyId: string | null;  // NEW: null = personal only
  visibility: 'personal' | 'family';  // NEW
  createdAt: string;
  updatedAt: string;
}
```

---

### 5.2 Privacy Toggle on Logging

**Updated Logging Flow:**

1. User selects/generates meal suggestion
2. Confirms ingredients
3. **NEW:** If user is in a family, show privacy toggle:
   - "Share with family?" toggle (default based on user preference)
4. Log meal with visibility setting

**UI Component:**

```typescript
// In meal logging confirmation
{currentFamily && (
  <View style={styles.privacyToggle}>
    <Text>Share with {currentFamily.name}?</Text>
    <Switch
      value={shareWithFamily}
      onValueChange={setShareWithFamily}
    />
  </View>
)}
```

**Store Action Update:**

```typescript
async function logMeal(
  mealTypeId: string,
  ingredients: string[],
  options?: {
    name?: string;
    shareWithFamily?: boolean;
  }
): Promise<MealLog> {
  const user = await getCurrentUser();
  const family = options?.shareWithFamily ? getCurrentFamily() : null;

  const mealLog: MealLog = {
    id: Crypto.randomUUID(),
    mealTypeId,
    ingredients,
    name: options?.name || null,
    date: new Date().toISOString(),
    userId: user.id,
    familyId: family?.id || null,
    visibility: family ? 'family' : 'personal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.insert('meal_logs', mealLog);
  return mealLog;
}
```

---

### 5.3 Family Meal History View

**New Section in History Tab:**

```
┌─────────────────────────────────────┐
│  History                      🔽    │
├─────────────────────────────────────┤
│  [My Meals] [Family Meals]          │  ← Tab selector
├─────────────────────────────────────┤
│                                     │
│  Today                              │
│  ┌─────────────────────────────────┐│
│  │ 🍳 João - Breakfast             ││
│  │    milk + cereals               ││
│  │    8:30 AM                      ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 🥪 Maria - Snack                ││
│  │    apple + bread + cheese       ││
│  │    10:45 AM                     ││
│  └─────────────────────────────────┘│
│                                     │
│  Yesterday                          │
│  ...                                │
│                                     │
└─────────────────────────────────────┘
```

**Query for Family Meals:**

```typescript
async function getFamilyMealHistory(
  familyId: string,
  days: number = 7
): Promise<MealLogWithUser[]> {
  const cutoff = subDays(new Date(), days).toISOString();

  return db.query(`
    SELECT
      ml.*,
      fm.user_display_name as user_name
    FROM meal_logs ml
    JOIN family_members fm ON fm.user_id = ml.user_id AND fm.family_id = ml.family_id
    WHERE ml.family_id = ?
      AND ml.visibility = 'family'
      AND ml.date >= ?
    ORDER BY ml.date DESC
  `, [familyId, cutoff]);
}
```

---

### 5.4 "Who Ate What Today" Dashboard

**New Component on Home Screen:**

```
┌─────────────────────────────────────┐
│  Today in Silva Household           │
├─────────────────────────────────────┤
│                                     │
│  João                               │
│  ✓ Breakfast: milk + cereals        │
│  ✓ Snack: apple + cookies           │
│  ○ Lunch: -                         │
│                                     │
│  Maria                              │
│  ✓ Breakfast: yogurt + bread        │
│  ○ Snack: -                         │
│  ○ Lunch: -                         │
│                                     │
│  Pedro                              │
│  ○ Breakfast: -                     │
│  ○ Snack: -                         │
│  ○ Lunch: -                         │
│                                     │
└─────────────────────────────────────┘
```

**Implementation:**

```typescript
interface FamilyDaySummary {
  member: FamilyMember;
  meals: {
    mealType: MealType;
    logged: MealLog | null;
  }[];
}

async function getFamilyDaySummary(familyId: string): Promise<FamilyDaySummary[]> {
  const members = await getFamilyMembers(familyId);
  const mealTypes = await getMealTypes();
  const today = startOfDay(new Date()).toISOString();

  const summary: FamilyDaySummary[] = [];

  for (const member of members) {
    const memberMeals = await db.query(`
      SELECT * FROM meal_logs
      WHERE user_id = ?
        AND family_id = ?
        AND visibility = 'family'
        AND date >= ?
    `, [member.userId, familyId, today]);

    summary.push({
      member,
      meals: mealTypes.map(mt => ({
        mealType: mt,
        logged: memberMeals.find(m => m.mealTypeId === mt.id) || null,
      })),
    });
  }

  return summary;
}
```

---

### 5.5 User Preference: Default Visibility

**Add to Settings:**

```
┌─────────────────────────────────────┐
│  Family Sharing                     │
├─────────────────────────────────────┤
│                                     │
│  Default meal visibility            │
│  ○ Personal (only me)               │
│  ● Share with family                │
│                                     │
│  Can be changed per meal            │
│                                     │
└─────────────────────────────────────┘
```

**Store:**

```typescript
interface UserPreferences {
  // ... existing
  defaultMealVisibility: 'personal' | 'family';
}
```

---

## Implementation Order

| Order | Task | Type | Effort | Notes |
|-------|------|------|--------|-------|
| 1 | ▶️ RUN existing test suites | Testing | ~15 min | Baseline: unit, Playwright E2E, Maestro | not started |
| 2 | ▶️ RUN quality baseline | Quality | ~30 min | arch:test, lint:dead-code, lint:duplicates, security:scan | not started |
| 3 | Add columns to meal_logs | Implementation | ~1 hour | Migration | not started |
| 4 | 🧪 CREATE unit tests for migration | Testing | ~30 min | Test column additions | not started |
| 5 | Migrate existing logs | Implementation | ~1 hour | Migration script | not started |
| 6 | 🧪 CREATE unit tests for data migration | Testing | ~30 min | Test user_id/family_id assignment | not started |
| 7 | Update meal logging with user_id | Implementation | ~2 hours | Store | not started |
| 8 | 🧪 CREATE unit tests for updated logging | Testing | ~1 hour | Test user/family context | not started |
| 9 | Add privacy toggle to logging flow | Implementation | ~2 hours | UI | not started |
| 10 | 🧪 CREATE Playwright E2E test for privacy toggle | Testing | ~1 hour | Test toggle personal/family visibility | not started |
| 11 | 🧪 CREATE Maestro test for privacy toggle | Testing | ~1 hour | Mirror Playwright test for mobile | not started |
| 12 | Add default visibility preference | Implementation | ~1 hour | Settings | not started |
| 13 | 🧪 CREATE unit tests for visibility logic | Testing | ~30 min | Test default, toggle behavior | not started |
| 14 | Create family history query | Implementation | ~2 hours | Database | not started |
| 15 | 🧪 CREATE unit tests for family query | Testing | ~1 hour | Test filtering, privacy respect | not started |
| 16 | Add family tab to history screen | Implementation | ~3 hours | UI | not started |
| 17 | 🧪 CREATE Playwright E2E test for family history | Testing | ~1.5 hours | Test view family meals, filter | not started |
| 18 | 🧪 CREATE Maestro test for family history | Testing | ~1.5 hours | Mirror Playwright test for mobile | not started |
| 19 | Create family day summary component | Implementation | ~4 hours | Dashboard | not started |
| 20 | 🧪 CREATE unit tests for `getFamilyDaySummary()` | Testing | ~45 min | Test aggregation logic | not started |
| 21 | Update home screen with dashboard | Implementation | ~2 hours | UI | not started |
| 22 | 🧪 CREATE Playwright E2E test for dashboard | Testing | ~1 hour | Test summary displays on home | not started |
| 23 | 🧪 CREATE Maestro test for dashboard | Testing | ~1 hour | Mirror Playwright test for mobile | not started |
| 24 | ▶️ RUN full test suites | Testing | ~20 min | Unit + Playwright + Maestro, verify no regressions | not started |
| 25 | ▶️ RUN quality checks and compare | Quality | ~30 min | Compare to baseline; create remediation plan if worse | not started |
| 26 | Document learning notes | Documentation | ~30 min | Capture unexpected errors, workarounds, fixes | not started |
| 27 | Run all existing unit tests, Playwright tests and Maestro Tests | Quality | ~0.5 hours | not started |
| 28 | 📸 Capture BEFORE screenshots | Documentation | ~10 min | not started |
| 29 | 📸 Capture AFTER screenshots | Documentation | ~20 min | not started |

**Total Estimated Effort:** ~32.5 hours (including unit + Playwright + Maestro tests + quality checks)

**Legend:**
- 🧪 CREATE = Writing new tests
- 🔄 UPDATE = Modifying existing tests
- ▶️ RUN = Executing tests (baseline/verification)
- 📸 = Screenshot capture for documentation

---

## Data Flow (Pre-Sync)

```
┌─────────────────────────────────────────────────────────┐
│                     DEVICE A (João)                      │
│  ┌─────────────────────────────────────────────────────┐│
│  │ meal_logs                                           ││
│  │ ┌─────────────────────────────────────────────────┐ ││
│  │ │ id: abc, user: joão, family: silva, vis: family │ ││
│  │ │ id: def, user: joão, family: null, vis: personal│ ││
│  │ └─────────────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘

                    (No sync yet - Phase 6)

┌─────────────────────────────────────────────────────────┐
│                     DEVICE B (Maria)                     │
│  ┌─────────────────────────────────────────────────────┐│
│  │ meal_logs                                           ││
│  │ ┌─────────────────────────────────────────────────┐ ││
│  │ │ id: xyz, user: maria, family: silva, vis: family│ ││
│  │ └─────────────────────────────────────────────────┘ ││
│  │                                                     ││
│  │ (Maria can't see João's meals until Phase 6 sync)  ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

**Note:** In Phase 5, family meals are stored with family context but only visible on the device that logged them. Phase 6 enables cross-device visibility via sync.

---

## Testing Strategy

### Unit Tests (🧪 CREATE new tests)
- [ ] Meal logs include user_id correctly
- [ ] Visibility toggle updates correctly
- [ ] Family history query returns correct meals
- [ ] Day summary aggregates correctly
- [ ] Personal meals excluded from family history

### E2E Tests - Playwright (🧪 CREATE new tests)
- [ ] Can log meal with family visibility
- [ ] Can log meal with personal visibility
- [ ] Family history tab shows family meals
- [ ] Day summary shows all family members
- [ ] Default visibility preference works

### Mobile E2E Tests - Maestro (🧪 CREATE new tests)
- [ ] Mirror all Playwright tests for mobile verification

### Existing Tests (▶️ RUN for regression check)
- Run before implementation to establish baseline
- Run after implementation to verify no regressions

---

## Deployment Strategy

### Release Type
**Feature Extension** - Extends Phase 4 family system with meal sharing

### Prerequisites
- Phase 4 deployed and stable
- Users have created families in production

### Pre-Deployment Checklist
- [ ] All unit tests passing
- [ ] All E2E tests passing (Playwright + Maestro)
- [ ] Privacy toggle tested
- [ ] Family history view tested
- [ ] Quality baseline comparison completed
- [ ] Manual QA with multiple family members
- [ ] Version bump in `app.json`

### Build & Release
```bash
# 1. Bump version
npm version patch

# 2. Build preview APK
eas build --platform android --profile preview

# 3. Test scenarios:
#    - Log meal as personal (not shared)
#    - Log meal as family (shared)
#    - View family history
#    - Day summary with multiple members

# 4. Build production release
eas build --platform android --profile production

# 5. Release (users need Phase 4 families to use)
```

### Rollback Plan
- Revert to Phase 4 APK
- Shared meal data in extended columns, ignored by older version
- Personal meals continue to work

### Post-Deployment
- Monitor sharing adoption rate
- Track privacy toggle usage (personal vs family default)
- Check family history view performance

---

## Files to Create/Modify

**New Files:**
- `components/FamilyHistoryList.tsx` - Family meal history
- `components/FamilyDaySummary.tsx` - Who ate what today
- `components/PrivacyToggle.tsx` - Visibility selector
- `docs/learning/epic04_feature_enhancement/PHASE5_LEARNING_NOTES.md` - Learning notes

**Modified Files:**
- `lib/database/migrations.ts` - Add columns
- `lib/database/operations.ts` - Family queries
- `lib/store/index.ts` - Updated logMeal action
- `types/index.ts` - Updated MealLog type
- `app/(tabs)/history.tsx` - Add family tab
- `app/(tabs)/index.tsx` - Add day summary
- `app/suggestions/[mealType].tsx` - Add privacy toggle
- `app/(tabs)/settings.tsx` - Default visibility setting

---

## Success Criteria

Phase 5 is complete when:
- [ ] Meal logs have user_id and family_id
- [ ] Can toggle visibility when logging
- [ ] Family history shows family meals
- [ ] Day summary shows who ate what
- [ ] Personal meals stay private
- [ ] Default visibility preference works
- [ ] All tests pass

---

## Learning Notes

Document unexpected errors, workarounds, and fixes encountered during implementation:

**[Phase 5 Learning Notes →](./PHASE5_LEARNING_NOTES.md)**

---

## Reference

See [Approach 2: Family Kitchen - Section 2.3](../../product_info/meals-randomizer-exploration.md#23-what-gets-shared) for what gets shared design.

### Developer Guides

- [Testing Guide](../../developer-guide/TESTING.md) - Unit testing patterns
- [Maestro Testing](../../developer-guide/MAESTRO_TESTING.md) - Mobile E2E testing
- [Architecture Rules](../../developer-guide/ARCHITECTURE_RULES.md) - Architecture testing
- [Database Schema](../../architecture/DATABASE_SCHEMA.md) - Extended meal_logs schema
- [State Management](../../architecture/STATE_MANAGEMENT.md) - Shared data store patterns

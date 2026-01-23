# Phase 5: Shared Meal Logs

**Status:** 📋 PLANNED

**Goal:** Enable meal sharing within families

**Dependencies:** Phase 4 (User Identity & Families)

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

**Migration:**

```typescript
// Migrate existing logs to current user
async function migrateExistingLogs() {
  const user = await getCurrentUser();
  if (user) {
    await db.run(
      'UPDATE meal_logs SET user_id = ? WHERE user_id IS NULL',
      [user.id]
    );
  }
}
```

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

| Order | Task | Effort | Notes |
|-------|------|--------|-------|
| 1 | Run existing test suites | ~15 min | Baseline: unit, Playwright E2E, Maestro |
| 2 | Add columns to meal_logs | ~1 hour | Migration |
| 3 | Write unit tests for migration | ~30 min | Test column additions |
| 4 | Migrate existing logs | ~1 hour | Migration script |
| 5 | Write unit tests for data migration | ~30 min | Test user_id/family_id assignment |
| 6 | Update meal logging with user_id | ~2 hours | Store |
| 7 | Write unit tests for updated logging | ~1 hour | Test user/family context |
| 8 | Add privacy toggle to logging flow | ~2 hours | UI |
| 9 | Write Playwright E2E test for privacy toggle | ~1 hour | Test toggle personal/family visibility |
| 10 | Write Maestro test for privacy toggle | ~1 hour | Mirror Playwright test for mobile |
| 11 | Add default visibility preference | ~1 hour | Settings |
| 12 | Write unit tests for visibility logic | ~30 min | Test default, toggle behavior |
| 13 | Create family history query | ~2 hours | Database |
| 14 | Write unit tests for family query | ~1 hour | Test filtering, privacy respect |
| 15 | Add family tab to history screen | ~3 hours | UI |
| 16 | Write Playwright E2E test for family history | ~1.5 hours | Test view family meals, filter |
| 17 | Write Maestro test for family history | ~1.5 hours | Mirror Playwright test for mobile |
| 18 | Create family day summary component | ~4 hours | Dashboard |
| 19 | Write unit tests for `getFamilyDaySummary()` | ~45 min | Test aggregation logic |
| 20 | Update home screen with dashboard | ~2 hours | UI |
| 21 | Write Playwright E2E test for dashboard | ~1 hour | Test summary displays on home |
| 22 | Write Maestro test for dashboard | ~1 hour | Mirror Playwright test for mobile |
| 23 | Run full test suites | ~20 min | Unit + Playwright + Maestro, verify no regressions |

**Total Estimated Effort:** ~31 hours (including unit + Playwright + Maestro tests)

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

### Unit Tests
- [ ] Meal logs include user_id correctly
- [ ] Visibility toggle updates correctly
- [ ] Family history query returns correct meals
- [ ] Day summary aggregates correctly
- [ ] Personal meals excluded from family history

### E2E Tests
- [ ] Can log meal with family visibility
- [ ] Can log meal with personal visibility
- [ ] Family history tab shows family meals
- [ ] Day summary shows all family members
- [ ] Default visibility preference works

---

## Files to Create/Modify

**New Files:**
- `components/FamilyHistoryList.tsx` - Family meal history
- `components/FamilyDaySummary.tsx` - Who ate what today
- `components/PrivacyToggle.tsx` - Visibility selector

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

## Reference

See [Approach 2: Family Kitchen - Section 2.3](../../product_info/meals-randomizer-exploration.md#23-what-gets-shared) for what gets shared design.

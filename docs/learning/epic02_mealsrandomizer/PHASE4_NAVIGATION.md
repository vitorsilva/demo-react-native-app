# Phase 4: Navigation & User Flow (2-3 hours)

[← Back to Overview](./OVERVIEW.md) | [Previous: Phase 3](./PHASE3_BUILDING_UI.md) | [Next: Phase 5 →](./PHASE5_POLISH_TESTING.md)

---

## Goal

Complete the tab navigation structure, build History and Settings screens, and ensure smooth user flow throughout the app.

## Prerequisites

- Phase 3 completed (Home, Suggestions, Confirmation screens working)

---

## Phase Overview

In this phase, you'll complete:

1. **Tab Navigation Structure**
   - Configure tab navigator
   - Add History and Settings tabs
   - Set up tab icons

2. **History Screen**
   - Display past meals grouped by date
   - Use SectionList for grouped data
   - Show meal type and time

3. **Settings Screen**
   - Add cooldown days slider
   - Add suggestions count slider
   - Create ingredient management buttons

4. **User Flow Testing**
   - Test complete flows end-to-end
   - Verify data persistence
   - Check navigation transitions

---

## Key Steps

### Step 4.1: Setting Up Tab Navigation
Update `app/(tabs)/_layout.tsx` to include:
- Home tab
- History tab
- Settings tab
- Proper icons for each tab

### Step 4.2: Building the History Screen
- Group meals by date (Today, Yesterday, specific dates)
- Use SectionList for grouped rendering
- Display meal type icons (🌅 breakfast, 🍎 snack)
- Show ingredients for each meal

### Step 4.3: Building the Settings Screen
- Cooldown days slider (1-7 days)
- Suggestions count slider (2-6 suggestions)
- "Manage Ingredients" navigation button
- Real-time preference updates

### Step 4.4: User Flow Testing
Test complete flows:
1. Home → Breakfast Ideas → Select → Confirm → Back to Home
2. View History → See logged meal
3. Settings → Adjust preferences → Generate new suggestions
4. Verify variety enforcement respects new cooldown

---

## Important Concepts

### SectionList for Grouped Data
Better than FlatList when data is naturally grouped:
```typescript
<SectionList
  sections={sections}
  keyExtractor={item => item.id}
  renderItem={({ item }) => <MealHistoryItem log={item} />}
  renderSectionHeader={({ section }) => (
    <Text>{section.title}</Text>
  )}
/>
```

### Sliders for Preferences
Use @react-native-community/slider:
```bash
npx expo install @react-native-community/slider
```

```typescript
<Slider
  minimumValue={1}
  maximumValue={7}
  step={1}
  value={cooldownDays}
  onSlidingComplete={handleChange}
/>
```

### Date Grouping
Group meals by relative dates:
- "Today" for today's meals
- "Yesterday" for yesterday
- "Mon, Jan 1" format for older dates

---

## Testing Checklist

- [ ] All tabs navigate correctly
- [ ] History shows meals grouped by date
- [ ] Settings sliders update preferences
- [ ] Preferences persist after app restart
- [ ] User flow feels natural (< 20 seconds)
- [ ] No navigation bugs or crashes

---

## Phase 4 Summary

**What You'll Accomplish:**
- ✅ Completed tab navigation structure
- ✅ Built History screen with grouped lists
- ✅ Created Settings screen with sliders
- ✅ Added preference management
- ✅ Tested complete user flow

**Key Skills Learned:**
- Tab navigation configuration
- SectionList for grouped data
- Form inputs and sliders
- Preference persistence
- End-to-end user flow testing

**Next:** [Phase 5 - Polish, Testing & Observability](./PHASE5_POLISH_TESTING.md)

---

**For detailed implementation:** See [LEARNING_PLAN_BACKUP.md](./LEARNING_PLAN_BACKUP.md) lines 2015-2525

[← Back to Overview](./OVERVIEW.md) | [Previous: Phase 3](./PHASE3_BUILDING_UI.md) | [Next: Phase 5 →](./PHASE5_POLISH_TESTING.md)

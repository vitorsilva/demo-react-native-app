# Feature 1.5: Haptic Feedback 📳

**Status:** 📋 PLANNED

**Effort:** ~1 hour implementation + ~30 min testing

**Dependencies:** None

---

## Branching Strategy

**Branch Name:** `FEATURE_1.5_HAPTIC_FEEDBACK`

**Approach:**
- Create feature branch from `main` (or from Phase 1 branch if in progress)
- Small, focused commits per task
- Commit format: `feat(1.5): <description>` or `test(1.5): <description>`

---

## Tool Instructions

```bash
cd demo-react-native-app

# Unit tests
npm test

# E2E tests (Playwright)
npm run test:e2e

# Maestro tests
# see \docs\developer-guide\MAESTRO_TESTING.md for information on how starting process (adb)
maestro test e2e/maestro/

# Linting
npm run lint
```

---

## I18N Considerations

### New Translation Keys

**English (`lib/i18n/locales/en/settings.json`):**
```json
{
  "experience": {
    "title": "Experience",
    "hapticFeedback": "Haptic Feedback",
    "hapticDescription": "Vibration on interactions"
  }
}
```

**Portuguese (`lib/i18n/locales/pt-PT/settings.json`):**
```json
{
  "experience": {
    "title": "Experiência",
    "hapticFeedback": "Feedback Tátil",
    "hapticDescription": "Vibração nas interações"
  }
}
```

### Notes
- Haptic feedback is a device feature, no text shown during haptic events
- Only settings UI text needs translation

---

## Overview

Subtle vibration feedback for key interactions, enhancing the tactile experience.

---

## Haptic Mapping

| Action | Haptic Type | Expo Haptics Constant |
|--------|-------------|----------------------|
| Select suggestion | Light | `ImpactFeedbackStyle.Light` |
| Confirm meal logged | Success | `NotificationFeedbackType.Success` |
| Generate new ideas | Soft | `ImpactFeedbackStyle.Medium` |
| Add to favorites | Medium | `ImpactFeedbackStyle.Medium` |
| Error/rejection | Error | `NotificationFeedbackType.Error` |

---

## UI Wireframe

### Settings Screen (Before & After)

**BEFORE:**
```
┌─────────────────────────────────────┐
│  Settings                           │
├─────────────────────────────────────┤
│                                     │
│  Meal Settings                      │
│  ├─ Cooldown period: 3 days         │
│  └─ Suggestions count: 4            │
│                                     │
│  Data                               │
│  ├─ Manage Ingredients              │
│  ├─ Manage Categories               │
│  └─ Manage Meal Types               │
│                                     │
└─────────────────────────────────────┘
```

**AFTER:**
```
┌─────────────────────────────────────┐
│  Settings                           │
├─────────────────────────────────────┤
│                                     │
│  Meal Settings                      │
│  ├─ Cooldown period: 3 days         │
│  └─ Suggestions count: 4            │
│                                     │
│  Experience                         │  ← NEW section
│  └─ Haptic Feedback        [====○] │  ← Toggle
│                                     │
│  Data                               │
│  ├─ Manage Ingredients              │
│  ├─ Manage Categories               │
│  └─ Manage Meal Types               │
│                                     │
└─────────────────────────────────────┘
```

---

## Screenshot Capture

### Required Screenshots

| Screenshot | When to Capture | Filename |
|------------|-----------------|----------|
| Settings Screen BEFORE | Before implementation starts | `screenshot_before_settings_haptic.png` |
| Settings Screen AFTER | After haptic toggle is added | `screenshot_after_settings_haptic.png` |

### Capture Instructions
1. Navigate to Settings screen
2. For BEFORE: capture current Settings screen without "Experience" section
3. For AFTER: capture with new "Experience" section and haptic toggle visible
4. Save screenshots in `docs/learning/epic04_feature_enhancement/features/screenshots/`

---

## Implementation

### Utility Module

```typescript
// lib/utils/haptics.ts

import * as Haptics from 'expo-haptics';

// Light tap for selection
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Success for confirmation
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Create utility
export const haptics = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};
```

### Settings Integration

- Add "Haptic Feedback" toggle in Settings
- Default: enabled
- Respect system accessibility settings
- Store preference in AsyncStorage or Zustand

### Usage in Components

```typescript
// Example: SuggestionCard.tsx
import { haptics } from '@/lib/utils/haptics';

const handleSelect = () => {
  haptics.light();
  onSelect(suggestion);
};

// Example: After logging meal
const handleConfirm = () => {
  haptics.success();
  logMeal(mealData);
};
```

---

## Files to Create/Modify

**New Files:**
- `lib/utils/haptics.ts` - Haptic feedback utility

**Modified Files:**
- `lib/store/index.ts` - Add haptic preference state
- `app/(tabs)/settings.tsx` - Add haptic toggle
- `components/SuggestionCard.tsx` - Add haptic on select
- Various components - Sprinkle haptic calls

---

## Acceptance Criteria

- [ ] Haptic feedback on suggestion selection
- [ ] Haptic feedback on meal confirmation
- [ ] Haptic feedback on generate new ideas
- [ ] Haptic feedback on favorite toggle
- [ ] Can be disabled in settings
- [ ] Works on both iOS and Android

---

## Testing Strategy

### Unit Tests (🧪 CREATE new tests)
- [ ] Haptic utility functions call Expo Haptics correctly
- [ ] Haptic functions respect disabled setting
- [ ] No errors when haptics unavailable (web)

### Manual Testing (not automated)
- [ ] Test on physical iOS device
- [ ] Test on physical Android device
- [ ] Verify haptic intensity feels appropriate
- [ ] Verify toggle actually disables haptics

---

## Implementation Order

| Order | Task | Type | Effort |
|-------|------|------|--------|
| 1 | Create haptics utility module | Implementation | ~20 min | done |
| 2 | Add haptic preference to store | Implementation | ~15 min | done |
| 3 | Add toggle to Settings screen | Implementation | ~15 min | done |
| 4 | Integrate haptics into components | Implementation | ~30 min | done |
| 5 | 🧪 CREATE unit tests for haptics utility | Testing | ~30 min | done |
| 6 | Run all existing unit tests, Playwright tests and Maestro Tests (you can start abd for maestro testing, look documentation) | Quality | ~0.5 hours | done |
| 7 | 📸 Capture BEFORE screenshot of Settings screen | Documentation | ~5 min | not started |
| 8 | 📸 Capture AFTER screenshot with haptic toggle | Documentation | ~5 min | not started |

**Legend:**
- 🧪 CREATE = Writing new tests
- 🔄 UPDATE = Modifying existing tests
- ▶️ RUN = Executing tests (baseline/verification)
- 📸 = Screenshot capture for documentation

---

## Platform Notes

### iOS
- Haptics work via Taptic Engine
- Available on iPhone 7 and later

### Android
- Haptics work via vibration motor
- Quality varies by device

### Web
- Haptics not available
- Utility should gracefully handle this

---

## Reference

- [Phase 1 Overview](../PHASE1_QUICK_WINS.md)
- [Expo Haptics Documentation](https://docs.expo.dev/versions/latest/sdk/haptics/)

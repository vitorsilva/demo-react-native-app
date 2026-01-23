# Feature 1.5: Haptic Feedback 📳

**Status:** 📋 PLANNED

**Effort:** ~1 hour implementation + ~30 min testing

**Dependencies:** None

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

### Unit Tests
- [ ] Haptic utility functions call Expo Haptics correctly
- [ ] Haptic functions respect disabled setting
- [ ] No errors when haptics unavailable (web)

### Manual Testing
- [ ] Test on physical iOS device
- [ ] Test on physical Android device
- [ ] Verify haptic intensity feels appropriate
- [ ] Verify toggle actually disables haptics

---

## Implementation Order

| Order | Task | Effort |
|-------|------|--------|
| 1 | Create haptics utility module | ~20 min |
| 2 | Add haptic preference to store | ~15 min |
| 3 | Add toggle to Settings screen | ~15 min |
| 4 | Integrate haptics into components | ~30 min |
| 5 | Write unit tests for haptics utility | ~30 min |

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

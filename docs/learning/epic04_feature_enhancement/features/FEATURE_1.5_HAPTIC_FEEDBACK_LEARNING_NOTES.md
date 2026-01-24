# Feature 1.5: Haptic Feedback - Learning Notes

## Task 1: Create haptics utility module

### Date: 2026-01-24

### What was implemented
- Created `lib/utils/haptics.ts` - a utility module providing standardized haptic feedback functions
- Implemented functions for: light, medium, heavy impact; success, warning, error notifications; and selection feedback
- Added platform detection to gracefully handle web (where haptics are unavailable)
- Used try-catch in `safeHaptic` wrapper to handle devices without haptic hardware

### Key decisions
1. **Platform check approach**: Used `Platform.OS !== 'web'` to determine availability. This is simple and covers the main case where haptics don't work.
2. **Empty catch block**: Intentionally using empty catch to silently fail - haptics are enhancement, not critical functionality.
3. **Async all the way**: All haptic functions return `Promise<void>` since expo-haptics is async. Callers can await if needed but typically fire-and-forget.

### Patterns used
- Similar structure to existing `dateUtils.ts` in the utils folder
- JSDoc comments for documentation
- Export object pattern (`haptics = { light: ..., medium: ... }`) for easy imports

### No issues encountered
- expo-haptics was already installed in package.json
- TypeScript and linter checks passed without changes

## Task 2: Add haptic preference to store

### Date: 2026-01-24

### What was implemented
- Added `hapticEnabled: boolean` to `UserPreferences` interface in `lib/database/preferences.ts`
- Default value is `true` (haptics enabled by default)
- Updated `getPreferences()` to retrieve `hapticEnabled` from the key-value store
- Updated `setPreferences()` to persist `hapticEnabled` to the database
- Updated store default preferences to include `hapticEnabled: true`

### Key decisions
1. **Boolean as string in DB**: The existing preferences system stores all values as strings in a key-value table. Boolean is stored as `'true'`/`'false'` strings and parsed on retrieval.
2. **Default enabled**: Haptic feedback is enabled by default to match user expectations on modern devices. Users can opt-out in settings.
3. **Null check for backwards compatibility**: Used `hapticEnabledStr !== null` check before parsing to handle existing databases without this preference.

### Issues encountered and fixes
- **TypeScript errors in test files**: Multiple test files needed to be updated to include `hapticEnabled` in their preference objects:
  - `lib/database/__tests__/preferences.test.ts` - 9 occurrences
  - `lib/store/__tests__/favorites.test.ts` - 1 occurrence
  - `lib/store/__tests__/index.test.ts` - 1 occurrence
- **Structure test updated**: The test `'getPreferences returns correct structure'` was checking for exactly 2 keys, updated to check for 3 keys including `hapticEnabled`

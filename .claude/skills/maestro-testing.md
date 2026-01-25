# Maestro E2E Testing Skill

## Overview
This skill runs Maestro E2E tests for the SaborSpin React Native app on Android.

## Prerequisites
- Maestro CLI installed (`maestro --version`)
- ADB available (`adb --version`)
- Android emulator configured

## Workflow

### Step 1: Check/Start Android Emulator

```bash
# List available emulators
"/c/Users/omeue/AppData/Local/Android/Sdk/emulator/emulator.exe" -list-avds

# Start emulator (use the AVD name from above)
"/c/Users/omeue/AppData/Local/Android/Sdk/emulator/emulator.exe" -avd Medium_Phone_API_36.1 -no-snapshot-load &

# Wait for boot and verify connection
sleep 30 && adb devices
# Should show: emulator-5554   device
```

### Step 2: Check if App is Installed

```bash
adb shell pm list packages | grep saborspin
# Should show: package:com.vitorsilvavmrs.saborspin
```

### Step 3: Build/Install Latest APK (if needed)

**Option A: Download existing EAS build**
```bash
cd demo-react-native-app
eas build:list --platform android --limit 1 --non-interactive
# Get the "Application Archive URL"
curl -L -o saborspin-latest.apk "URL_FROM_ABOVE"
adb install -r saborspin-latest.apk
```

**Option B: Trigger new EAS cloud build**
```bash
cd demo-react-native-app
eas build --platform android --profile preview --non-interactive
# Wait 10-15 minutes for build to complete
# Then download and install as in Option A
```

### Step 4: Run Maestro Tests

```bash
cd demo-react-native-app

# Run all tests
maestro test e2e/maestro/

# Run single test with debug output
maestro test e2e/maestro/variety-stats.yaml --debug-output ./maestro-debug
```

### Step 5: Debug Failures

If tests fail:
1. Check debug screenshots in the output directory
2. Take manual screenshot: `adb exec-out screencap -p > screenshot.png`
3. Common issues:
   - **Element not found**: UI text may have changed - check i18n files
   - **Scroll needed**: Element may be off-screen - add `- scroll` before tap
   - **Timing**: Use `extendedWaitUntil` with timeout instead of `assertVisible`

## Common Test Fixes

### Text Matching
- Button text uses lowercase: `"breakfast Ideas"` not `"Breakfast"`
- Use regex for partial match: `text: ".*Logged.*"` to match "Breakfast Logged"
- Check actual text in `lib/i18n/locales/en/*.json`

### Element Visibility
- Use `extendedWaitUntil` with timeout for dynamic content:
```yaml
- extendedWaitUntil:
    visible:
      text: ".*Logged.*"
    timeout: 10000
```

### Off-screen Elements
- Scroll before tapping elements at bottom of screen:
```yaml
- scroll
- tapOn:
    id: "generate-new-ideas-button"
```

### Test IDs
Key testIDs in the app:
- `variety-stats-card`, `variety-stats-toggle`, `variety-stats-content`
- `select-button-0`, `select-button-1`, etc.
- `favorite-button-0`, `favorite-button-1`, etc.
- `done-button` (confirmation modal)
- `generate-new-ideas-button`

## Test Files Location
```
demo-react-native-app/e2e/maestro/
├── favorites-empty-state.yaml
├── favorites-flow.yaml
├── telemetry-flow.yaml
├── variety-stats.yaml
└── i18n/
```

## Quick Reference Commands

```bash
# Full workflow
"/c/Users/omeue/AppData/Local/Android/Sdk/emulator/emulator.exe" -avd Medium_Phone_API_36.1 &
sleep 30
adb devices
cd demo-react-native-app && maestro test e2e/maestro/

# Force restart app
adb shell am force-stop com.vitorsilvavmrs.saborspin
adb shell am start -n com.vitorsilvavmrs.saborspin/.MainActivity

# Take screenshot
adb exec-out screencap -p > screenshot.png

# View app logs
adb logcat | grep -i saborspin
```

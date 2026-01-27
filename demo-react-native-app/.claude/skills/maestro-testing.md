# Maestro E2E Testing Skill

## Overview
This skill runs Maestro E2E tests for the SaborSpin React Native app on Android.

## Prerequisites
- Maestro CLI installed (`maestro --version`)
- ADB available (`adb --version`)
- Android emulator configured

## Workflow

### Step 1: Check/Start Android Emulator

```powershell
# List available emulators
emulator -list-avds

# Start emulator (use the AVD name from above)
emulator -avd Medium_Phone_API_36.1

# Wait for boot and verify connection
adb devices
# Should show: emulator-5554   device
```

### Step 2: Check if App is Installed

```powershell
adb shell pm list packages | findstr saborspin
# Should show: package:com.vitorsilvavmrs.saborspin
```

### Step 3: Build/Install Latest APK (if needed)

**Option A: Use the helper script (recommended)**
```powershell
cd demo-react-native-app
.\scripts\download-apk.ps1 -Install
```

**Option B: Manual download**
```powershell
cd demo-react-native-app
eas build:list --platform android --limit 1 --non-interactive
# Get the "Application Archive URL"
Invoke-WebRequest -Uri "URL_FROM_ABOVE" -OutFile saborspin.apk
adb install -r saborspin.apk
```

**Option C: Trigger new EAS cloud build**
```powershell
cd demo-react-native-app
eas build --platform android --profile preview --non-interactive
# Wait 10-15 minutes for build to complete
# Then download and install as in Option B
```

### Step 4: Run Maestro Tests

```powershell
cd demo-react-native-app

# Run all tests
maestro test e2e/maestro/

# Run single test with debug output
maestro test e2e/maestro/telemetry-flow.yaml --debug-output ./maestro-debug

# Interactive mode (great for learning/debugging)
maestro studio
```

### Step 5: Debug Failures

If tests fail:
1. Check debug screenshots in `e2e/maestro/output/`
2. Take manual screenshot: `adb exec-out screencap -p > screenshot.png`
3. Common issues:
   - **Element not found**: UI text may have changed - check i18n files
   - **Scroll needed**: Element may be off-screen - add `- scroll` before tap
   - **Timing**: Use `extendedWaitUntil` with timeout instead of `assertVisible`

## Troubleshooting

### Emulator Won't Boot / Stuck / Offline

If the emulator shows a blank screen, gets stuck, or `adb devices` shows "offline":

```powershell
# Kill any stuck processes
adb kill-server
adb start-server

# Restart emulator with fresh boot (clears corrupted snapshot)
emulator -avd Medium_Phone_API_36.1 -no-snapshot-load

# Wait for full boot (home screen with app icons visible)
# Then verify connection
adb devices
# Should show: emulator-5554   device (not "offline")
```

The `-no-snapshot-load` flag forces a fresh boot instead of loading a potentially corrupted snapshot.

### ADB Not Found

```powershell
# Add to PATH permanently
$platformTools = "$env:LOCALAPPDATA\Android\Sdk\platform-tools"
$emulatorPath = "$env:LOCALAPPDATA\Android\Sdk\emulator"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
[Environment]::SetEnvironmentVariable("Path", "$currentPath;$platformTools;$emulatorPath", "User")
# Restart terminal
```

### App Not Found on Device

```
Unable to find app com.vitorsilvavmrs.saborspin
```

Install the app first using the helper script or manual download (see Step 3).

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

All Maestro tests are in `demo-react-native-app/e2e/maestro/`:

```
e2e/maestro/
├── config.yaml                      # Workspace configuration
├── telemetry-flow.yaml              # Telemetry integration test
├── favorites-flow.yaml              # Favorites functionality
├── favorites-empty-state.yaml       # Empty favorites state
├── variety-stats.yaml               # Variety statistics
├── meal-logging-phase2.yaml         # Phase 2 meal logging
├── meal-logging-phase2-custom-prep.yaml
├── meal-logging-phase2-anonymous.yaml
├── history-phase2-named-meal.yaml   # Phase 2 history features
├── history-phase2-prep-method.yaml
├── history-phase2-multiple-meals.yaml
├── prep-methods-settings.yaml       # Preparation methods
├── prep-methods-add-custom.yaml
├── prep-methods-delete-custom.yaml
├── prep-methods-full-workflow.yaml
└── i18n/                            # Internationalization tests
    ├── full-flow-pt.yaml
    └── language-switch.yaml
```

## Quick Reference Commands

```powershell
# Full workflow
emulator -avd Medium_Phone_API_36.1
# Wait for boot...
adb devices
cd demo-react-native-app
maestro test e2e/maestro/

# Force restart app
adb shell am force-stop com.vitorsilvavmrs.saborspin
adb shell am start -n com.vitorsilvavmrs.saborspin/.MainActivity

# Take screenshot
adb exec-out screencap -p > screenshot.png

# View app logs
adb logcat | findstr saborspin

# Interactive testing
maestro studio
```

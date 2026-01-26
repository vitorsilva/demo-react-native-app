# Maestro Testing Guide

## Overview

SaborSpin uses **Maestro** for mobile E2E testing on Android.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  SaborSpin  │────▶│   Maestro   │────▶│   Results   │
│     APK     │     │  (Device)   │     │ + Screenshots│
└─────────────┘     └─────────────┘     └─────────────┘
```

## Complete Setup Walkthrough (Windows)

Follow these steps in order to run Maestro tests from scratch:

```powershell
# Step 1: Install Maestro CLI
Invoke-WebRequest -Uri "https://github.com/mobile-dev-inc/maestro/releases/latest/download/maestro.zip" -OutFile "$env:USERPROFILE\Downloads\maestro.zip"
Expand-Archive -Path "$env:USERPROFILE\Downloads\maestro.zip" -DestinationPath "$env:USERPROFILE\maestro" -Force
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$env:USERPROFILE\maestro\maestro\bin", "User")

# Step 2: Set JAVA_HOME (Android Studio's JDK)
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Android\Android Studio\jbr", "User")

# Step 3: Add ADB and Emulator to PATH
$platformTools = "$env:LOCALAPPDATA\Android\Sdk\platform-tools"
$emulatorPath = "$env:LOCALAPPDATA\Android\Sdk\emulator"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
[Environment]::SetEnvironmentVariable("Path", "$currentPath;$platformTools;$emulatorPath", "User")

# Step 4: RESTART PowerShell, then verify installations
maestro --version    # Should show version number
adb --version        # Should show version number
java -version        # Should show Java version
emulator -list-avds  # Should list available emulators

# Step 5: Start Android emulator
emulator -avd Medium_Phone_API_36.1

# Step 6: Wait for emulator to boot, verify connection (in new terminal)
adb devices          # Should show: emulator-5554   device

# Step 7: Get and install the APK
cd demo-react-native-app
.\scripts\download-apk.ps1 -Install

# Step 8: Run Maestro tests
maestro test e2e/maestro/
```

## Prerequisites

### Install Maestro CLI

**Windows Setup** (native, NOT WSL):

```powershell
# 1. Download Maestro
Invoke-WebRequest -Uri "https://github.com/mobile-dev-inc/maestro/releases/latest/download/maestro.zip" -OutFile "$env:USERPROFILE\Downloads\maestro.zip"

# 2. Extract (creates nested folder)
Expand-Archive -Path "$env:USERPROFILE\Downloads\maestro.zip" -DestinationPath "$env:USERPROFILE\maestro" -Force

# 3. Add to PATH (note double maestro\maestro)
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$env:USERPROFILE\maestro\maestro\bin", "User")

# 4. Set JAVA_HOME to Android Studio's JDK
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Android\Android Studio\jbr", "User")

# 5. Add ADB and Emulator to PATH
$platformTools = "$env:LOCALAPPDATA\Android\Sdk\platform-tools"
$emulatorPath = "$env:LOCALAPPDATA\Android\Sdk\emulator"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
[Environment]::SetEnvironmentVariable("Path", "$currentPath;$platformTools;$emulatorPath", "User")

# 6. Restart PowerShell and verify
maestro --version
```

**macOS / Linux:**

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
maestro --version
```

### Android Setup

1. **Android Studio** with emulator
2. **ADB** in PATH
3. **JAVA_HOME** set to Android Studio's JDK

## Running Tests

### Option 1: Download Existing EAS Build (Recommended)

The fastest way to run Maestro tests is to download an existing EAS build. This avoids local build issues (like Windows path length limits) entirely.

**Using the helper script (easiest):**

```powershell
# Windows (PowerShell)
cd demo-react-native-app
.\scripts\download-apk.ps1 -Install

# macOS/Linux (Bash)
cd demo-react-native-app
./scripts/download-apk.sh --install
```

**Manual download:**

```powershell
# From demo-react-native-app/ directory
cd demo-react-native-app

# 1. List available builds
eas build:list --platform android --limit 5

# 2. Download the APK (copy URL from "Application Archive URL")
Invoke-WebRequest -Uri "https://expo.dev/artifacts/eas/YOUR_BUILD_ID.apk" -OutFile saborspin.apk

# 3. Install on emulator
adb install saborspin.apk

# 4. Run Maestro tests
maestro test e2e/maestro/
```

### Option 2: Local Development Build

Build a development APK locally (may hit Windows path length limits):

```bash
# Build development APK (first time takes ~10 min)
npx expo run:android

# Then run Maestro tests
maestro test e2e/maestro/
```

### Option 3: Cloud Build with EAS

Build in the cloud to avoid local environment issues:

```bash
# Build in the cloud
eas build --platform android --profile preview

# Download and install when ready
# (EAS will provide download link)
adb install path/to/downloaded.apk
```

### Option 4: Using Expo Go (Quick Testing)

1. Start the Expo dev server:
```bash
npm start
```

2. Install Expo Go on emulator (if not installed):
```bash
# Open Play Store in emulator and install "Expo Go"
# Or download APK from https://expo.dev/go
```

3. Open the app in Expo Go by scanning QR code or using deep link

4. Update test file's `appId` to `host.exp.exponent` for Expo Go testing

### Starting the Emulator

```powershell
# List available emulators
emulator -list-avds

# Start emulator (replace AVD_NAME with your emulator name)
emulator -avd AVD_NAME

# Wait for boot and verify
adb devices
# Should show: emulator-5554   device
```

## Test Files

All Maestro tests are in `e2e/maestro/`:

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

### config.yaml

The workspace configuration file:

```yaml
# Output directory for test artifacts (screenshots, logs, reports)
testOutputDir: e2e/maestro/output
```

This tells Maestro where to save:
- Screenshots taken during tests
- Debug screenshots on failures
- Test reports and logs

### Flow Files

Each `.yaml` file is a test flow. The flow starts with app configuration:

```yaml
appId: com.vitorsilvavmrs.saborspin  # Package name of the app
---
# Test steps follow...
```

The `appId` must match the installed app's package name. Find it with:
```powershell
adb shell pm list packages | findstr saborspin
```

## Quick Start

```powershell
# Run all tests
maestro test e2e/maestro/

# Run single test
maestro test e2e/maestro/telemetry-flow.yaml

# Run with debug output
maestro test e2e/maestro/telemetry-flow.yaml --debug-output

# Interactive mode (great for learning!)
maestro studio
```

## Writing Tests

### Basic Structure

```yaml
appId: com.vitorsilvavmrs.saborspin
---
- launchApp
- extendedWaitUntil:
    visible: "SaborSpin"
    timeout: 30000
- tapOn: "breakfast Ideas"
- extendedWaitUntil:
    visible: "Pick one:"
    timeout: 15000
- takeScreenshot: suggestions-screen
```

### Tips for Reliable Tests

1. **Use exact text from the UI** - Run `maestro studio` to inspect actual element text
2. **Use `extendedWaitUntil` with timeouts** - More reliable than simple `assertVisible`
3. **Avoid regex when possible** - Direct text matching is more reliable
4. **Take screenshots at key steps** - Helps debug failures
5. **Check debug output on failures** - Screenshots saved to `e2e/maestro/output/`

### Common Actions

```yaml
# App lifecycle
- launchApp
- stopApp

# Tap/Click
- tapOn: "Button Text"
- tapOn:
    text: "Select"
    index: 0          # First match

# Assertions
- assertVisible: "Welcome"
- assertNotVisible: "Error"
- extendedWaitUntil:
    visible: "Results"
    timeout: 30000

# Screenshots
- takeScreenshot: screenshot-name
```

## Debugging

### Maestro Studio (Interactive Mode)

```powershell
maestro studio
```

Features:
- Live device view
- Click to get selectors
- Test commands in real-time
- Record flows automatically

### View Screenshots

Screenshots saved to `e2e/maestro/output/`:

```powershell
ls e2e/maestro/output/
```

## Troubleshooting

### Emulator Won't Boot / Stuck / Frozen / Offline

If the emulator shows a blank screen, gets stuck on boot, or `adb devices` shows "offline":

```powershell
# 1. Kill any stuck adb processes
adb kill-server
adb start-server

# 2. Restart emulator with cold boot (clears corrupted snapshot)
emulator -avd Medium_Phone_API_36.1 -no-snapshot-load

# 3. Wait for Android to fully boot (home screen with app icons visible)

# 4. Verify device is online
adb devices
# Should show: emulator-5554   device (not "offline")

# 5. Then install/run tests
adb install saborspin.apk
maestro test e2e/maestro/
```

The `-no-snapshot-load` flag forces a fresh boot instead of loading a potentially corrupted snapshot. This is the most common fix for emulator issues.

### ADB Not Found

```
'adb' is not recognized as an internal or external command
```

**Fix:**
```powershell
$platformTools = "$env:LOCALAPPDATA\Android\Sdk\platform-tools"
$emulatorPath = "$env:LOCALAPPDATA\Android\Sdk\emulator"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
[Environment]::SetEnvironmentVariable("Path", "$currentPath;$platformTools;$emulatorPath", "User")
# Restart terminal
```

### JAVA_HOME Not Set

```
Error: JAVA_HOME is not set
```

**Fix:** Use Android Studio's bundled JDK:
```powershell
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Android\Android Studio\jbr", "User")
```

### Maestro Command Not Found

**Cause:** ZIP extracts to nested `maestro\maestro\bin`

**Fix:** Use correct nested path:
```powershell
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$env:USERPROFILE\maestro\maestro\bin", "User")
```

### WSL + Windows Emulator Doesn't Work

**Cause:** Maestro running in WSL cannot see devices on Windows host

**Fix:** Install Maestro natively on Windows, NOT in WSL

### App Not Found on Device

```
Unable to find app com.vitorsilvavmrs.saborspin
```

**Fix:** Install the app first using the helper script:
```powershell
cd demo-react-native-app
.\scripts\download-apk.ps1 -Install
```

### Windows Path Length Error (260 Character Limit)

```
ninja: error: Stat(...): Filename longer than 260 characters
```

**Cause:** Windows has a default 260-character path limit. React Native builds with node_modules paths often exceed this.

**Solutions:**

1. **Enable Long Paths (Recommended)** - Run as Administrator:
```powershell
# Enable long paths in Windows (requires reboot)
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
  -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force

# Also enable in Git
git config --system core.longpaths true
```

2. **Move Project to Shorter Path:**
```powershell
# Move from deep path to C:\dev
mv C:\Users\username\source\repos\demo-react-native-app C:\dev\saborspin
```

3. **Use EAS Build (Cloud Build):**
```powershell
# Build in the cloud - no local path issues
eas build --platform android --profile preview
```

4. **Use Expo Go for Testing:**
```powershell
# Skip native build entirely
npm start
# Use appId: host.exp.exponent in Maestro tests
```

## CI Integration

For GitHub Actions, see the Saberloop project's `.github/workflows/maestro.yml` as reference.

Key points:
- Use `reactivecircus/android-emulator-runner@v2` for emulator
- Cache AVD snapshots to speed up runs
- Use label-based triggers (tests take 20+ minutes)

## Related Documentation

- [Unit Testing](./TESTING.md) - Jest unit tests
- [Telemetry Guide](./TELEMETRY.md) - Telemetry system documentation

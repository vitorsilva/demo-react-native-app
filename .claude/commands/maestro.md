# /maestro - Run Maestro E2E Tests

Run Maestro E2E tests for the SaborSpin app on Android emulator.

## Usage
```
/maestro [test-file]
```

## Arguments
- `test-file` (optional): Specific test file to run (e.g., `variety-stats.yaml`)

## What this command does

1. **Check emulator status**
   - Verify Android emulator is running via `adb devices`
   - If not running, start `Medium_Phone_API_36.1` emulator

2. **Verify app installation**
   - Check if `com.vitorsilvavmrs.saborspin` is installed
   - If not installed or outdated, offer to download latest from EAS

3. **Run Maestro tests**
   - Run all tests: `maestro test e2e/maestro/`
   - Or specific test: `maestro test e2e/maestro/{test-file}`

4. **Report results**
   - Show pass/fail status for each flow
   - On failure, check debug screenshots and suggest fixes

## Common test files
- `variety-stats.yaml` - VarietyStats card tests
- `favorites-flow.yaml` - Favorites functionality
- `favorites-empty-state.yaml` - Empty favorites state
- `telemetry-flow.yaml` - Telemetry integration

## Example
```
/maestro                     # Run all tests
/maestro variety-stats.yaml  # Run specific test
```

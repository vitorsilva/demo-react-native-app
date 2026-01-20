# Troubleshooting

## Common Issues

### Metro Bundler Won't Start

**Symptom:** Metro bundler hangs or shows errors on startup.

**Solution:**
```bash
cd demo-react-native-app
npx expo start -c  # Clear cache and restart
```

### Database Not Working

**Symptom:** App shows empty state, no ingredients loaded.

**Check console for:**
```
Database ready
Migrations complete
Seeded XX ingredients
```

**If not appearing:**
1. Check `app/_layout.tsx` database initialization
2. Verify database adapter is correct for platform
3. Check for errors in console

### Can't Connect to Dev Server (Mobile)

**Symptom:** Phone can't scan QR code or connect to dev server.

**Solutions:**
1. Ensure phone and computer on same WiFi network
2. Check firewall allows ports 8081/8082
3. Try tunnel mode:
   ```bash
   npx expo start --tunnel
   ```

### Sentry Crashes on Web

**Symptom:** Error about Sentry on web platform.

**Already fixed:** Sentry init is wrapped in Platform check:
```typescript
if (Platform.OS !== 'web') {
  Sentry.init({ /* config */ });
}
```

### Playwright Strict Mode Violations

**Symptom:** E2E tests fail with "strict mode violation".

**Solution:** Use specific `testID` selectors:
```typescript
// Bad - matches multiple elements
await page.getByText('Snack Ideas').click();

// Good - unique selector
await page.getByTestId('snack-ideas-button').click();
```

### TypeScript Errors After Update

**Symptom:** TypeScript errors after pulling changes.

**Solution:**
```bash
cd demo-react-native-app
rm -rf node_modules
npm install
npx tsc --noEmit
```

### EAS Build Fails

**Symptom:** EAS build command fails.

**Check:**
1. Verify `eas.json` is valid JSON
2. Verify `app.json` is valid JSON
3. Check EAS CLI is logged in:
   ```bash
   eas whoami
   ```
4. Check build logs for specific errors

### SQLite Errors on Web

**Symptom:** Database errors when running in web mode.

**Note:** Web uses sql.js (in-memory). Data is lost on refresh. This is expected behavior.

### Tests Fail with "Cannot find module"

**Symptom:** Jest can't find modules.

**Solution:**
```bash
cd demo-react-native-app
npm install
npm test
```

If still failing, check Jest config in `package.json`.

### expo-sqlite Not Found (Web)

**Symptom:** Error about expo-sqlite on web.

**Already fixed:** Metro bundler excludes expo-sqlite from web bundle. Check `metro.config.js`.

## Environment-Specific Issues

### Windows

- Use Git Bash or WSL for better compatibility
- Paths with spaces may cause issues - avoid them
- Enable Developer Mode for symlinks

### macOS

- Xcode required for iOS simulator
- Accept Xcode license: `sudo xcodebuild -license accept`

### Linux

- May need to install additional dependencies for Android emulator
- Check `adb` is in PATH

## Getting Help

1. Check existing [GitHub Issues](https://github.com/vitorsilva/saborspin/issues)
2. Create a new issue with:
   - Description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment info (OS, Node version, etc.)

## Related Documentation

- [Installation Guide](./INSTALLATION.md)
- [Testing Guide](./TESTING.md)

# Installation Guide

## Prerequisites

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | Any | `git --version` |
| Expo CLI | Latest | `npx expo --version` |

### Optional (for device testing)
- Android Studio (for Android emulator)
- Xcode (for iOS simulator, macOS only)
- Expo Go app (for physical device testing)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/vitorsilva/saborspin.git
cd saborspin
```

### 2. Install Dependencies

The project has two package.json files:
- Root: Landing page dependencies
- `demo-react-native-app/`: React Native app dependencies

```bash
# Install landing page dependencies (optional)
npm install

# Install app dependencies
cd demo-react-native-app
npm install
```

### 3. Start Development Server

```bash
cd demo-react-native-app
npm start
```

This opens the Expo DevTools. From here you can:
- Press `w` for web
- Press `a` for Android
- Press `i` for iOS
- Scan QR code with Expo Go app

## Running Tests

### Unit Tests

```bash
cd demo-react-native-app

# Run all tests
npm test

# Watch mode
npm test -- --watch

# With coverage
npm test -- --coverage
```

### E2E Tests

```bash
cd demo-react-native-app

# Headless
npm run test:e2e

# With visible browser
npm run test:e2e:headed

# Interactive UI
npm run test:e2e:ui
```

## Verifying Installation

After installation, verify everything works:

```bash
cd demo-react-native-app

# 1. Run unit tests
npm test

# 2. TypeScript check
npx tsc --noEmit

# 3. Lint check
npm run lint

# 4. Start dev server
npm start
# Press 'w' for web mode
```

You should be able to:
- See the home screen with meal type buttons
- Navigate to suggestions screen
- Add/edit ingredients and categories
- Generate meal suggestions

## Building for Production

### Preview APK (for testing)

```bash
cd demo-react-native-app
eas build --platform android --profile preview
```

### Production Build

```bash
cd demo-react-native-app
eas build --platform android --profile production
```

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues.

## Next Steps

- [Testing Guide](./TESTING.md) - Running and writing tests
- [Architecture Overview](../architecture/SYSTEM_OVERVIEW.md) - Understanding the codebase
- [Contributing](../../CONTRIBUTING.md) - Making contributions

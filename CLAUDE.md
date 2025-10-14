# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native learning project focused on fundamentals.

## Architecture Decisions

### Project Type: Bare React Native (Not Expo)
**Decision Date:** 2025-10-14
**Rationale:** Chosen to gain deeper understanding of React Native fundamentals, native build tools, and full control over native modules. While this requires more setup (Xcode/Android Studio), it provides valuable learning experience with the complete React Native ecosystem.

### Technology Stack
- **React Native:** 0.82.0
- **Language:** TypeScript
- **Package Manager:** npm 9.6.7
- **Node Version:** 22.14.0
- **Testing:** Jest (pre-configured)
- **Bundler:** Metro
- **IDE:** Visual Studio Code

## Project Structure

```
demo-react-native-app/
├── DemoApp/                 # Main React Native application
│   ├── android/            # Android native code
│   ├── ios/                # iOS native code
│   ├── __tests__/          # Jest test files
│   ├── App.tsx             # Main application component
│   ├── index.js            # Application entry point
│   ├── package.json        # Dependencies and scripts
│   └── tsconfig.json       # TypeScript configuration
├── CLAUDE.md               # This file
└── README.md               # Project documentation
```

## Development Commands

All commands should be run from the `DemoApp/` directory:

```bash
cd DemoApp
```

### Running the App

**Android:**
```bash
npx react-native run-android
```
Prerequisites: Android Studio installed, Android emulator running or device connected

**iOS:** (macOS only)
```bash
npx react-native run-ios
```
Prerequisites: Xcode installed, iOS Simulator or device connected

### Development Tools

**Start Metro Bundler:**
```bash
npx react-native start
```

**Run Tests:**
```bash
npm test
```

**TypeScript Type Checking:**
```bash
npx tsc --noEmit
```

## VS Code Setup

This project is optimized for Visual Studio Code development.

### Recommended Extensions
- React Native Tools (msjsdiag.vscode-react-native)
- ES7+ React/Redux/React-Native snippets (dsznajder.es7-react-js-snippets)
- Prettier - Code formatter (esbenp.prettier-vscode)
- ESLint (dbaeumer.vscode-eslint)
- TypeScript and JavaScript Language Features (built-in)

### Workspace Settings
Configuration files located in `.vscode/` directory:
- `settings.json` - Editor and formatter settings
- `extensions.json` - Recommended extensions
- `launch.json` - Debug configurations

## Getting Started

### Initial Setup
1. Install prerequisites:
   - **Android:** Android Studio with SDK 31+
   - **iOS:** Xcode (macOS only)
   - Node.js (v22.14.0 recommended)

2. Navigate to project:
   ```bash
   cd DemoApp
   ```

3. Install dependencies (already done during init):
   ```bash
   npm install
   ```

4. Start development server:
   ```bash
   npx react-native start
   ```

5. Run on platform (in new terminal):
   ```bash
   npx react-native run-android
   # or
   npx react-native run-ios
   ```

## Learning Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Native Directory](https://reactnative.directory/) - Find libraries
- [Debugging Guide](https://reactnative.dev/docs/debugging)

## Notes for Claude Code

- Main application code in `DemoApp/App.tsx`
- When adding dependencies, run `npm install` from `DemoApp/` directory
- For iOS development, may need to run `pod install` in `DemoApp/ios/` directory
- Metro bundler must be running when testing on devices/simulators
- Use TypeScript for all new files (.tsx for components, .ts for utilities)

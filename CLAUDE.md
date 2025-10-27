# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a learning-focused React Native mobile application built with Expo. The project follows a structured, incremental learning approach where the developer is guided through React Native fundamentals step-by-step. The app is currently in early stages (Phase 1 completed) with a simple text input/display functionality.

**Key Characteristics:**
- Learning project (not production)
- Expo-managed workflow with React Native 0.81.4
- TypeScript-based
- File-based routing with Expo Router
- Tab navigation structure already in place
- EAS Build configured for Android APK generation

## Claude's Teaching Methodology (CRITICAL)

**IMPORTANT: Claude Code must act as an INSTRUCTOR, not an executor.**

### Teaching Principles

**Claude MUST:**
1. ✅ **Explain concepts** before showing code
2. ✅ **Provide commands/code** as text for the user to type
3. ✅ **Wait for user confirmation** after each step ("done", "ok", etc.)
4. ✅ **Ask questions** to reinforce learning (especially connecting to previous phases)
5. ✅ **Break tasks into very small steps** (one change at a time)
6. ✅ **Use read-only tools** (Read, Glob, Grep) to understand the codebase when needed

**Claude MUST NEVER:**
1. ❌ **Run Bash commands** (except read-only commands like `ls` when explicitly needed for teaching)
2. ❌ **Write or Edit files** (user writes all code themselves)
3. ❌ **Execute npm/build commands** (user runs all commands)
4. ❌ **Make git commits** (user makes commits when ready)
5. ❌ **Install packages** (user runs installation commands)
6. ❌ **Create or modify any files autonomously**

### Teaching Flow

**Correct pattern for each step:**

1. **Explain the concept** (2-3 sentences: what and why)
2. **Ask a reinforcement question** (connect to previous learning when possible)
3. **Provide the command/code** (formatted as text/code block for user to copy)
4. **Explain what it does** (line-by-line if complex)
5. **Wait for user** ("Please run this command and let me know the result")
6. **Review the result** (discuss what happened, celebrate success, debug issues)
7. **Move to next step** (only after user confirms)

**Example of CORRECT teaching:**
```
Claude: "We need to install Playwright. This is a development dependency,
so we use the --save-dev flag."

Claude: "Q: Why --save-dev instead of regular install?"

[User answers]

Claude: "Exactly! Here's the command:
```bash
npm install --save-dev @playwright/test
```

This will download Playwright and add it to your package.json devDependencies.
Please run this command and let me know what happens."

[User: "done, it installed"]

Claude: "Great! Now let's configure it..."
```

**Example of WRONG behavior (what NOT to do):**
```
Claude: "Let's install Playwright"
[Claude runs: Bash tool with npm install command] ❌ WRONG
```

### Asking Questions to Reinforce Learning

**Always ask questions when:**
- A new concept builds on previous learning
- User needs to understand "why" not just "how"
- A flag/option has special meaning (--save-dev, --global, -S, etc.)
- Connecting to concepts from earlier phases
- Multiple approaches exist (explain tradeoffs)

**Good question patterns:**
- "Do you remember when we used X in Phase Y? How is this similar/different?"
- "Why do you think we need [flag/option/setting] here?"
- "What do you think would happen if we didn't do this?"
- "This looks similar to [previous concept]. What's the connection?"

### Handling User Requests

**If user asks Claude to:**
- "Install X" → Provide the install command, explain it, user runs it
- "Create file Y" → Describe what to create, show the content, user creates it
- "Fix the bug" → Guide them through debugging, user makes the fix
- "Add this feature" → Break into steps, explain each step, user implements

### Exception: Documentation

The ONLY time Claude should write files is:
- Updating learning notes (PHASE*_LEARNING_NOTES.md)
- When user explicitly says "you write the learning notes" or similar

Even then, ask for confirmation first.

## Project Structure

The actual React Native app is located in the `demo-react-native-app/` subdirectory:

```
demo-react-native-app/
├── app/                    # Expo Router app directory (file-based routing)
│   ├── (tabs)/            # Tab navigation group
│   │   ├── index.tsx      # Home screen - main functionality (text input/display)
│   │   ├── explore.tsx    # Explore tab
│   │   └── _layout.tsx    # Tab layout configuration
│   ├── _layout.tsx        # Root layout with theme provider
│   └── modal.tsx          # Modal screen example
├── components/            # Reusable UI components
│   ├── ui/               # UI components (IconSymbol, Collapsible)
│   ├── themed-*.tsx      # Theme-aware components (ThemedText, ThemedView)
│   ├── parallax-scroll-view.tsx
│   └── external-link.tsx
├── constants/            # App constants
│   └── theme.ts         # Theme colors and values
├── hooks/               # Custom React hooks
│   ├── use-color-scheme.ts
│   └── use-theme-color.ts
├── assets/             # Images, icons, splash screens
├── app.json           # Expo configuration (app metadata, icons, splash)
├── eas.json          # EAS Build configuration
└── package.json      # Dependencies and scripts
```

## Development Commands

All commands should be run from the `demo-react-native-app/` directory:

```bash
cd demo-react-native-app

# Development
npm start              # Start Expo development server
npm run android        # Start on Android device/emulator
npm run ios            # Start on iOS simulator
npm run web            # Start web version

# Code Quality
npm run lint           # Run ESLint
npm run reset-project  # Reset to blank starter template

# Building
eas build --platform android --profile preview     # Build APK for testing
eas build --platform android --profile production  # Build AAB for Play Store
```

## Architecture & Key Concepts

### Expo Router (File-Based Routing)
- Routes are defined by file structure in `app/` directory
- `(tabs)/` is a layout group for tab navigation
- `_layout.tsx` files define layout/navigation structure
- `index.tsx` is the default route for a directory

### Theme System
- App uses `@react-navigation/native` for theming (DarkTheme/DefaultTheme)
- Theme-aware components in `components/themed-*.tsx`
- Color scheme detection with `useColorScheme()` hook
- Theme constants defined in `constants/theme.ts`

### Current App State (Phase 1 Complete)
The HomeScreen (`app/(tabs)/index.tsx`) currently implements:
- Text input field with controlled state (`useState`)
- Button that displays the input text
- Basic styling with StyleSheet
- No persistence (data lost on app restart)

### Planned Features (Not Yet Implemented)
According to LEARNING_PLAN.md:
- **Phase 2:** Testing, CI/CD, OpenTelemetry observability (planned but not started)
- **Phase 3:** AsyncStorage for data persistence
- **Phase 4:** UI polish, custom icons/splash screens
- **Phase 5:** Advanced features (multiple items, search, etc.)

## Important Development Notes

### Working Directory
**CRITICAL:** Always `cd demo-react-native-app` before running any npm/expo commands. The repository root is not the React Native project.

### New Architecture Enabled
This project uses React Native's new architecture (`"newArchEnabled": true` in app.json):
- Uses React 19.1.0
- Enables React Compiler (`"reactCompiler": true`)
- May have different behavior than legacy RN apps

### EAS Build Configuration
Build profiles in `eas.json`:
- **development:** Development client with internal distribution
- **preview:** APK for testing (internal distribution)
- **production:** AAB with auto-increment versioning for Play Store

### TypeScript Configuration
- Strict TypeScript setup with typed routes enabled (`"typedRoutes": true`)
- Type definitions in `expo-env.d.ts`
- Use path aliases: `@/` maps to project root (e.g., `@/hooks/use-color-scheme`)

### ESLint Setup
Uses Expo's ESLint config (`eslint-config-expo/flat`) with flat config format:
- Ignores `dist/*`
- Run `npm run lint` before committing

## Common Development Patterns

### Adding a New Screen
1. Create file in `app/` directory (e.g., `app/settings.tsx`)
2. Export default React component
3. File path becomes the route

### Creating Theme-Aware Components
```tsx
import { useThemeColor } from '@/hooks/use-theme-color';

export function MyComponent() {
  const color = useThemeColor({}, 'text');
  // Use color for styling
}
```

### State Management
Currently uses basic React hooks:
- `useState` for local component state
- No global state management library yet
- Future phases may add Context API or state library

## Learning Context

This project is designed for incremental learning:
- The learner writes all code (no copy-paste)
- Changes are made in small steps
- Each concept is explained and tested before moving on
- Learning notes are documented in `PHASE*_LEARNING_NOTES.md` files

**When starting a new session/day:**
- ALWAYS read PHASE*_LEARNING_NOTES.md files (especially the most recent one) to understand what has already been completed
- Review the learning notes to understand context from previous sessions, including:
  - What concepts were learned
  - What issues were encountered and resolved
  - What decisions were made
  - Current state of the project
- This helps maintain continuity and avoid re-explaining concepts or redoing work

**When assisting:**
- Break down tasks into small, manageable steps
- Explain concepts clearly (this is a learning project)
- Reference the LEARNING_PLAN.md for context on what's been completed
- Don't add complexity beyond the current phase unless requested
- Focus on teaching fundamentals before advanced patterns

**When the user asks "what's next" or similar questions:**
- ALWAYS check LEARNING_PLAN.md to identify the next phase or task
- Review the current phase status and what's been completed
- Provide clear guidance on the next steps in the learning journey
- Don't assume or guess - refer to the documented learning plan

**When the user signals session end (e.g., "that's a wrap", "let's call it a day", "let's pause", or similar):**
- Record the current state and progress in LEARNING_PLAN.md
- Update what was completed in this session
- Document what's currently in progress (if anything)
- Note what should be tackled next
- Update any relevant PHASE*_LEARNING_NOTES.md files with key learnings or decisions
- Provide a brief summary of what was accomplished

## Platform-Specific Notes

### Android
- Package name: `com.vitorsilvavmrs.demoreactnativeapp`
- Adaptive icons configured (foreground, background, monochrome)
- Edge-to-edge enabled
- Predictive back gesture disabled

### Development Server
- Metro bundler runs on port 8081
- Expo DevTools on port 8082
- Ensure firewall allows these ports
- QR code scanning for device connection

## Known Issues & Troubleshooting

### Metro Bundler Issues
If Metro won't start or has errors:
```bash
cd demo-react-native-app
npx expo start -c  # Clear cache
```

### Cannot Connect to Dev Server
- Verify phone and computer on same WiFi
- Check firewall settings for ports 8081/8082
- Try tunnel mode: `npx expo start --tunnel`

### Build Failures
- Verify `eas.json` and `app.json` are valid JSON
- Check EAS Build logs for specific errors
- Ensure EAS CLI is logged in: `eas whoami`

## Testing

**Current Status:** No testing infrastructure implemented yet.
- Phase 2 plans to add Jest with React Native Testing Library
- No test files exist in the project yet
- When implementing tests, follow LEARNING_PLAN.md Phase 2 guidance

## Git Workflow

- Main branch: `main`
- Repository is clean (no uncommitted changes at conversation start)
- No pre-commit hooks configured yet
- Conventional commit format planned for Phase 2

## Dependencies of Note

**Key Dependencies:**
- `expo: ~54.0.13` - Expo SDK
- `react: 19.1.0` - React (latest version)
- `react-native: 0.81.4` - React Native
- `expo-router: ~6.0.11` - File-based routing
- `@react-navigation/native: ^7.1.8` - Navigation primitives

**No Testing Libraries Yet** - Will be added in Phase 2

## Future-Proofing Notes

When adding new features, consider:
- The project will eventually add AsyncStorage (Phase 3)
- Testing infrastructure is planned (Phase 2)
- OpenTelemetry instrumentation is in the learning plan
- Keep implementations simple and educational
- Prioritize teaching value over production-readiness

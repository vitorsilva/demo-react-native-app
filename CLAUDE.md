# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a learning-focused React Native mobile application built with Expo. The project follows a structured, incremental learning approach organized into epics, where the developer is guided through concepts step-by-step.

**Current Status:**
- ✅ **Epic 1: Infrastructure & Foundation** - COMPLETED (2025-10-28)
  - Professional dev workflow, testing, CI/CD, observability stack
- ✅ **Epic 2: Meals Randomizer** - COMPLETED (2025-11-21)
  - Built a real app with SQLite, Zustand, and complex UI
  - All 5 phases complete: Data Foundation, State Management, Building UI, Navigation, Polish & Testing
  - 40 unit tests + 7 E2E tests passing, production APK built
- 🔄 **Epic 3: Meals Randomizer V1 - Production Readiness** - IN PROGRESS (Started 2025-01-21)
  - Transforming from learning project to production product
  - 🔄 Phase 1: User Customization - IN PROGRESS (~10%)
    - ✅ Step 1.1: Database Migrations - COMPLETE
    - 🔄 Step 1.2: Category CRUD - NEXT

**Key Characteristics:**
- Learning project (not production)
- Expo-managed workflow with React Native 0.81.4
- TypeScript-based
- File-based routing with Expo Router
- Tab navigation structure already in place
- EAS Build configured for Android APK generation
- Full observability stack (OpenTelemetry, Jaeger, Prometheus, Sentry)
- Zustand for global state management
- SQLite for local data persistence (with cross-platform adapters)
- Playwright E2E testing infrastructure

## Finding Current Session Information (CRITICAL)

**ALWAYS check these files at the start of a session to understand current progress:**

**For Epic 3 (CURRENT):**
1. **docs/epic03_mealsrandomizerv1/SESSION_STATUS.md** - Current progress tracking
2. **docs/epic03_mealsrandomizerv1/OVERVIEW.md** - Epic 3 overview and phase structure
3. **docs/epic03_mealsrandomizerv1/QUICK_START.md** - Quick resume guide
4. **docs/epic03_mealsrandomizerv1/PHASE*_SESSION_NOTES.md** - Session notes (check latest by date)

**When user asks "what's next":**
1. First check SESSION_STATUS.md for current phase and step
2. Look for the most recent PHASE*_SESSION_NOTES.md file
3. Check the corresponding PHASE*_*.md file for detailed instructions
4. Don't assume or guess - always check documentation first

**IMPORTANT:** Always verify by checking what's actually implemented in the codebase (app/, lib/, components/ folders).

**For Epic 2 reference (completed work):**
- docs/epic02_mealsrandomizer/OVERVIEW.md - Epic 2 overview
- docs/epic02_mealsrandomizer/SESSION_STATUS.md - Final status
- docs/epic02_mealsrandomizer/PHASE*_LEARNING_NOTES.md - Detailed notes

**For Epic 1 reference (completed work):**
- docs/epic01_infrastructure/LEARNING_PLAN.md - Completed epic
- docs/epic01_infrastructure/PHASE*_LEARNING_NOTES.md - Detailed notes

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
- Updating learning notes (docs/epic02_mealsrandomizer/*SESSION_NOTES.md or similar)
- Updating session status files
- When user explicitly says "you write the learning notes" or similar
- Updating root README.md or docs/README.md for progress tracking
- Updating CLAUDE.md itself when instructions are outdated

Even then, ask for confirmation first (unless user explicitly requests it).

## Project Structure

The actual React Native app is located in the `demo-react-native-app/` subdirectory.
**Note:** The docs folder is at the ROOT level, NOT inside demo-react-native-app/.

```
demo-react-native-app/           # Main React Native app
├── app/                          # Expo Router app directory (file-based routing)
│   ├── (tabs)/                   # Tab navigation group
│   │   ├── index.tsx             # Home screen - meal type buttons + recent meals
│   │   ├── explore.tsx           # Explore tab (default Expo template)
│   │   └── _layout.tsx           # Tab layout configuration
│   ├── suggestions/              # Dynamic route folder
│   │   └── [mealType].tsx        # Suggestions screen (breakfast/snack)
│   ├── _layout.tsx               # Root layout with database init + Sentry
│   └── modal.tsx                 # Modal screen example
├── components/                   # Reusable UI components
│   ├── modals/
│   │   └── ConfirmationModal.tsx # Meal confirmation modal
│   ├── ui/                       # UI components (IconSymbol, Collapsible)
│   ├── ErrorBoundary.tsx         # Sentry error boundary
│   ├── themed-*.tsx              # Theme-aware components
│   └── ...                       # Other components
├── lib/                          # Business logic and utilities
│   ├── database/                 # SQLite database layer
│   │   ├── adapters/             # Platform-specific adapters
│   │   │   ├── types.ts          # DatabaseAdapter interface
│   │   │   ├── native.ts         # expo-sqlite wrapper
│   │   │   ├── inMemory.ts       # sql.js wrapper for web
│   │   │   └── __tests__/        # Adapter tests
│   │   ├── index.ts              # Database init with platform detection
│   │   ├── schema.ts             # Table schemas
│   │   ├── ingredients.ts        # Ingredient CRUD operations
│   │   ├── mealLogs.ts           # Meal log CRUD operations
│   │   ├── seed.ts               # Seed data (19-22 Portuguese ingredients)
│   │   ├── __tests__/            # Database tests (14 tests)
│   │   └── __mocks__/            # Jest mocks
│   ├── business-logic/           # Core algorithms
│   │   ├── combinationGenerator.ts  # Meal combination algorithm
│   │   ├── varietyEngine.ts         # Cooldown tracking
│   │   └── __tests__/               # Algorithm tests (8 tests)
│   ├── store/                    # Zustand state management
│   │   └── index.ts              # Global store with actions
│   └── telemetry/                # Observability (refactored folder)
│       ├── telemetry.ts          # OpenTelemetry setup
│       ├── logger.ts             # Structured logging
│       ├── analytics.ts          # User analytics
│       └── mealGenerationMetrics.ts  # Feature-specific metrics
├── e2e/                          # Playwright E2E tests
│   ├── meal-logging.spec.ts      # 7 E2E tests for meal flow
│   └── screenshots/              # Test screenshots
├── types/                        # TypeScript type definitions
│   └── database.ts               # Database entity types
├── playwright.config.ts          # Playwright configuration
├── metro.config.js               # Metro bundler config (platform exclusions)
├── app.json                      # Expo configuration
├── eas.json                      # EAS Build configuration
└── package.json                  # Dependencies and scripts

docs/                             # Learning documentation (at ROOT level)
├── README.md                     # Documentation index
├── epic01_infrastructure/        # Epic 1: COMPLETED
│   ├── LEARNING_PLAN.md          # Epic 1 plan (completed)
│   └── PHASE*_LEARNING_NOTES.md  # Epic 1 notes
└── epic02_mealsrandomizer/       # Epic 2: IN PROGRESS
    ├── OVERVIEW.md               # Epic 2 overview and phase structure
    ├── SESSION_STATUS.md         # Overall progress tracking
    ├── QUICK_START_TOMORROW.md   # Quick resume guide
    ├── PHASE1_*.md               # Phase 1 guides and notes
    ├── PHASE2_*.md               # Phase 2 guides and notes
    ├── PHASE3_*.md               # Phase 3 guides and notes
    ├── PHASE3_SESSION_NOTES.md   # Latest session notes (most recent!)
    ├── PHASE4_NAVIGATION.md      # Phase 4 guide (NEXT)
    ├── PHASE5_POLISH_TESTING.md  # Phase 5 guide
    └── PHASE6_FUTURE_ENHANCEMENTS.md  # Future ideas
```

## Development Commands

All commands should be run from the `demo-react-native-app/` directory:

```bash
cd demo-react-native-app

# Development
npm start              # Start Expo development server
npm run android        # Start on Android device/emulator
npm run ios            # Start on iOS simulator
npm run web            # Start web version (uses sql.js for SQLite)

# Testing
npm test               # Run Jest unit tests (30+ tests)
npm run test:e2e       # Run Playwright E2E tests (7 tests)
npm run test:e2e:headed # Run E2E with visible browser
npm run test:e2e:ui    # Run E2E with interactive UI

# Code Quality
npm run lint           # Run ESLint
npx tsc --noEmit       # TypeScript type checking

# Building
eas build --platform android --profile preview     # Build APK for testing
eas build --platform android --profile production  # Build AAB for Play Store
```

## Architecture & Key Concepts

### Expo Router (File-Based Routing)
- Routes are defined by file structure in `app/` directory
- `(tabs)/` is a layout group for tab navigation
- `_layout.tsx` files define layout/navigation structure
- `[param].tsx` files create dynamic routes (e.g., `/suggestions/breakfast`)
- `index.tsx` is the default route for a directory

### Theme System
- App uses `@react-navigation/native` for theming (DarkTheme/DefaultTheme)
- Theme-aware components in `components/themed-*.tsx`
- Color scheme detection with `useColorScheme()` hook
- Dark theme with colors: `#111418` (background), `#FFFFFF` (text), `#3e96ef` (primary)

### Current App State (Phase 3 Complete)

**Home Screen (`app/(tabs)/index.tsx`):**
- "Breakfast Ideas" and "Snack Ideas" navigation buttons
- FlatList showing recent meals (last 10)
- Date formatting (Today, Yesterday, X days ago)
- Empty state when no meals logged
- Analytics screen tracking with `useFocusEffect`

**Suggestions Screen (`app/suggestions/[mealType].tsx`):**
- Dynamic route accepting breakfast or snack
- Image cards with gradient overlays (LinearGradient on native, fallback on web)
- Loading and error states with ActivityIndicator
- "Generate New Ideas" button
- Platform-specific conditional imports
- Database timing fix with useRef pattern

**ConfirmationModal (`components/modals/ConfirmationModal.tsx`):**
- Modal for confirming meal selection
- Logs meals to database via Zustand store

### Database Architecture (Cross-Platform)

```
Platform Detection (lib/database/index.ts)
├── Web → In-Memory Adapter (sql.js)
├── iOS → Native Adapter (expo-sqlite)
├── Android → Native Adapter (expo-sqlite)
└── Jest → Test Adapter (better-sqlite3)
```

**Key concepts:**
- Adapter Pattern (like C# IDbConnection)
- Dynamic imports to avoid bundling issues
- Metro bundler configuration excludes expo-sqlite from web bundle
- Structural typing for adapter compatibility

### State Management (Zustand)

Global store in `lib/store/index.ts`:
- `ingredients` - List of available ingredients
- `mealLogs` - Recent meal history
- `suggestedCombinations` - Generated suggestions
- `isDatabaseReady` - Database initialization flag
- `isLoading` / `error` - UI state

Actions:
- `loadIngredients()` - Fetch from database
- `loadMealLogs(days)` - Fetch recent meals
- `generateMealSuggestions(count, cooldownDays)` - Core algorithm
- `logMeal(meal)` - Save to database
- `setDatabaseReady(ready)` - Track initialization

### Business Logic

**Combination Generator** (`lib/business-logic/combinationGenerator.ts`):
- Fisher-Yates shuffle algorithm
- Generates varied meal combinations
- Pure functions for testability

**Variety Engine** (`lib/business-logic/varietyEngine.ts`):
- Tracks cooldown periods
- Prevents repetition within configured days
- Set data structure for uniqueness

## Important Development Notes

### Working Directory
**CRITICAL:** Always `cd demo-react-native-app` before running any npm/expo commands. The repository root is not the React Native project. However, documentation is at the ROOT level in `docs/`.

### New Architecture Enabled
This project uses React Native's new architecture (`"newArchEnabled": true` in app.json):
- Uses React 19.1.0
- Enables React Compiler (`"reactCompiler": true`)
- May have different behavior than legacy RN apps

### Platform-Specific Code
```typescript
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  // Web-only code (e.g., skip Sentry init)
}

if (Platform.OS !== 'web') {
  // Native-only code (e.g., LinearGradient)
}
```

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
- Common issues: unescaped quotes in JSX (use `&quot;`), missing useEffect dependencies

## Testing Infrastructure

### Unit Tests (Jest)
- **30+ tests passing** across database, business logic, and adapters
- Database tests use better-sqlite3 for Node.js environment
- Jest mocks at `__mocks__` folders
- Run with `npm test`

### E2E Tests (Playwright)
- **7 tests covering complete meal logging flow**
- Tests run in web mode (sql.js)
- Uses `testID` props for stable selectors
- Screenshots captured at each step
- Run with `npm run test:e2e`

**E2E Test Coverage:**
1. Empty state display
2. Navigate to breakfast suggestions
3. Log breakfast meal
4. Log snack meal
5. Generate new suggestions
6. Show multiple meals
7. Navigate back

## Learning Context

This project is designed for incremental learning:
- The learner writes all code (no copy-paste)
- Changes are made in small steps
- Each concept is explained and tested before moving on
- Learning notes are documented in `docs/epic02_mealsrandomizer/PHASE*_LEARNING_NOTES.md` files

**When starting a new session/day:**
1. Check docs/epic02_mealsrandomizer/OVERVIEW.md for phase structure
2. Find the most recent PHASE*_SESSION_NOTES.md file
3. Review what was completed and what's next
4. Verify by checking actual code implementation
5. This helps maintain continuity and avoid re-explaining concepts

**When assisting:**
- Break down tasks into small, manageable steps
- Explain concepts clearly (this is a learning project)
- Reference the OVERVIEW.md for phase context
- Connect new concepts to previous learning (e.g., "This is like the adapter pattern we used in Phase 3")
- Don't add complexity beyond the current phase unless requested
- Focus on teaching fundamentals before advanced patterns

**When the user asks "what's next" or similar questions:**
1. Check docs/epic02_mealsrandomizer/OVERVIEW.md for phase structure
2. Find the most recent PHASE*_SESSION_NOTES.md to see what was completed
3. Read the next PHASE*_*.md file for upcoming tasks
4. Verify what's already implemented in the codebase
5. Provide clear guidance on the next steps in the learning journey
6. Don't assume or guess - refer to the documented learning plan

**When the user signals session end (e.g., "that's a wrap", "let's call it a day", "let's pause", or similar):**
- Create or update PHASE*_SESSION_NOTES.md with session details
- Document what was completed in this session
- Document what's currently in progress (if anything)
- Note what should be tackled next
- Update SESSION_STATUS.md and QUICK_START_TOMORROW.md if needed
- Provide a brief summary of what was accomplished

## Platform-Specific Notes

### Android
- Package name: `com.vitorsilvavmrs.demoreactnativeapp`
- Adaptive icons configured (foreground, background, monochrome)
- Edge-to-edge enabled
- Predictive back gesture disabled

### Web Mode
- Uses sql.js (SQLite compiled to WebAssembly)
- In-memory database (data lost on refresh)
- Sentry SDK disabled (not web-compatible)
- LinearGradient uses CSS fallback
- Great for fast UI iteration with browser DevTools

### Development Server
- Metro bundler runs on port 8081
- Expo DevTools on port 8082
- Web runs on port 8081
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

### Database Not Working
Check console logs for:
```
✅ Database ready
✅ Seeded XX ingredients
```

### Sentry Crashes on Web
Already fixed - Sentry init is wrapped in Platform check:
```typescript
if (Platform.OS !== 'web') {
  Sentry.init({ /* config */ });
}
```

### Playwright Strict Mode Violations
Use specific `testID` selectors instead of text-based:
```typescript
// BAD
await page.getByText('Snack Ideas').click();

// GOOD
await page.getByTestId('snack-ideas-button').click();
```

## Git Workflow

- Main branch: `main`
- Repository is clean (no uncommitted changes at conversation start)
- Pre-commit hooks may run ESLint
- Commits should include emoji prefix: feat:, fix:, docs:, etc.

## Dependencies of Note

**Key Dependencies:**
- `expo: ~54.0.13` - Expo SDK
- `react: 19.1.0` - React (latest version)
- `react-native: 0.81.4` - React Native
- `expo-router: ~6.0.11` - File-based routing
- `expo-sqlite: ~15.2.1` - Native SQLite
- `zustand: ^5.0.3` - State management
- `@sentry/react-native: 6.14.1` - Error tracking
- `@react-navigation/native: ^7.1.8` - Navigation primitives
- `expo-linear-gradient: ~14.1.4` - Gradient overlays
- `sql.js: ^1.12.0` - SQLite for web (WebAssembly)

**Testing Dependencies:**
- `jest` - Unit testing
- `better-sqlite3` - SQLite for Jest tests
- `@playwright/test` - E2E testing

## Current Phase Status

**Epic 2: Meals Randomizer - COMPLETE ✅**
All 5 phases finished (2025-11-21):
- Phase 1: Data Foundation (SQLite, CRUD)
- Phase 2: State Management (Zustand, algorithms)
- Phase 3: Building UI (Home, Suggestions, Modal, E2E)
- Phase 4: Navigation (History, Settings, Preferences)
- Phase 5: Polish & Testing (Haptics, Accessibility, APK)
- 40 unit tests + 7 E2E tests passing

**Epic 3: Phase 1 - User Customization - IN PROGRESS (~10%)**
- ✅ Step 1.1: Database Migrations - COMPLETE (2025-11-26)
  - Created `lib/database/migrations.ts`
  - Added categories table, meal_types table
  - Idempotent migration operations
- 🔄 Step 1.2: Category CRUD - NEXT
  - Create `lib/database/categories.ts`
  - Add getAllCategories, addCategory, updateCategory, deleteCategory

**Reference:** See `docs/epic03_mealsrandomizerv1/PHASE1_USER_CUSTOMIZATION.md`

## Future-Proofing Notes

When adding new features, consider:
- The project has SQLite with cross-platform adapters
- Testing infrastructure is comprehensive (unit + E2E)
- OpenTelemetry metrics are instrumented
- Zustand handles global state
- Keep implementations simple and educational
- Prioritize teaching value over production-readiness
- Add testID props for E2E testability

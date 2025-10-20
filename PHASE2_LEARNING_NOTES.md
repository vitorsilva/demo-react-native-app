# Phase 2 Learning Notes: Automation & Observability

**Status:** In Progress
**Started:** 2025-10-20
**Current Step:** 2.2 Linting & Formatting (Completed Prettier Setup)

---

## Overview

Phase 2 focuses on establishing professional development practices:
- Automated testing with Jest
- Code quality tools (linting, formatting)
- CI/CD pipelines
- Observability with OpenTelemetry

---

## Step 2.1: Testing Foundation ✅ COMPLETED

### Decision: Jest vs Vitest vs Cypress/Playwright

**Question Asked:** "Is Jest the most used framework nowadays? What are the alternatives?"

**Comparison Made:**

#### Unit/Integration Testing:
- **Jest:** Most used for React Native, pre-configured with Expo, mature ecosystem
- **Vitest:** Faster and more modern, but React Native support is experimental
- **Node.js test runner:** Too basic for React Native

**Decision:** Chose Jest because:
1. Already included with Expo (zero configuration)
2. Best React Native ecosystem support
3. All learning resources use Jest
4. Easier troubleshooting for beginners
5. Skills transfer directly to Vitest if needed later

#### E2E Testing (Different Category):
- **Cypress/Playwright:** Web browsers only, don't work with React Native native apps
- **Detox:** React Native standard for E2E, but complex setup
- **Maestro:** Newer, easier E2E tool for mobile
- **Appium:** Cross-platform, very complex

**Decision:** Skip E2E testing for now, focus on unit/integration tests with Jest

---

### What We Installed

```bash
# First attempt - failed due to React version mismatch
npm install --save-dev @testing-library/react-native @testing-library/jest-native

# Solution: Upgraded React to match testing library requirements
npx expo install react@19.2.0

# Then installed testing libraries successfully
npm install --save-dev @testing-library/react-native @testing-library/jest-native

# Additional dependencies needed
npm install --save-dev jest
npm install --save-dev jest-expo
npm install --save-dev @types/jest
```

**Why each package:**
- `@testing-library/react-native`: Provides `render()` and `fireEvent` for testing components
- `@testing-library/jest-native`: Adds React Native-specific matchers like `toBeVisible()`
- `jest`: The test runner itself
- `jest-expo`: Expo-specific Jest configuration and transformers
- `@types/jest`: TypeScript type definitions for Jest globals

---

### Key Concept: `--save-dev` Flag

**Question Asked:** "What does the `--save-dev` flag mean?"

**Learned:**
- `dependencies`: Packages needed to RUN the app (included in production builds)
- `devDependencies`: Packages needed only for DEVELOPMENT (excluded from builds)

**Examples:**
- `react` → `dependencies` (app needs it to run)
- `jest` → `devDependencies` (only developers run tests)

**Shortcut:** `npm install -D package` is the same as `npm install --save-dev package`

**Why it matters:**
1. Smaller production bundles
2. Faster CI/CD builds
3. Clear distinction for other developers

---

### Key Concept: React Native Transformations

**Question Asked:** "What are React Native transformations?"

**Learned:**

**The Problem:**
- You write JSX, TypeScript, ES6+ imports
- Node.js (where Jest runs) only understands plain JavaScript with CommonJS

**The Solution: Transformers (Transpilers)**
- Convert JSX → `React.createElement()` calls
- Convert `import` → `require()`
- Convert TypeScript → JavaScript
- Mock React Native components for testing

**Example Transformation:**
```jsx
// What you write
<View><Text>Hello</Text></View>

// What Jest runs
React.createElement(View, null,
  React.createElement(Text, null, 'Hello')
);
```

**What `jest-expo` provides:**
1. Babel transformers for JSX/TypeScript
2. React Native component mocks
3. Asset import handling (images, fonts)
4. Platform-specific file resolution
5. Expo module transformations

**Why `transformIgnorePatterns` matters:**
- By default, Jest skips transforming `node_modules` (for speed)
- But React Native/Expo packages in `node_modules` contain untransformed code
- We must tell Jest: "Transform expo and react-native packages too!"

---

### Jest Configuration Created

**File:** `jest.config.js`

```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};
```

**What each setting does:**
- `preset: 'jest-expo'`: Uses Expo's pre-configured Jest setup
- `setupFilesAfterEnv`: Loads custom matchers after Jest initializes
- `transformIgnorePatterns`: Tells Jest which node_modules to transform
- `collectCoverageFrom`: Defines which files to include in coverage reports

---

### Test Scripts Added to package.json

```json
"scripts": {
  "test": "jest"
}
```

**Why needed:** `npm test` looks for a "test" script in package.json

---

### First Test Written

**File:** `app/(tabs)/__tests__/index.test.tsx`

**Convention:** Test files go in `__tests__` folders - Jest automatically finds them

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../index';

describe('HomeScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<HomeScreen />);

    expect(getByText('Hello World!')).toBeTruthy();
  });

  it('updates display text when button is pressed', () => {
    const { getByPlaceholderText, getByText } = render(<HomeScreen />);

    const input = getByPlaceholderText('Type here...');
    const button = getByText('Press me');

    fireEvent.changeText(input, 'Test message');
    fireEvent.press(button);

    expect(getByText('Test message')).toBeTruthy();
  });
});
```

**Test structure learned:**
1. `describe('ComponentName', ...)` - Groups related tests
2. `it('description', ...)` - Defines a single test
3. `render(<Component />)` - Renders component in test environment
4. Query functions - Find elements (`getByText`, `getByPlaceholderText`)
5. `fireEvent` - Simulate user actions (`press`, `changeText`)
6. `expect(...).toBeTruthy()` - Assert conditions

**Testing philosophy:** Test what users do and see, not implementation details

---

### Key Concept: Finding Elements in Tests

**Question Asked:** "What if we had 2 inputs with the same placeholder?"

**Query Functions Available:**

**Preferred (most like users):**
1. `getByRole` - Semantic roles
2. `getByLabelText` - Accessible labels
3. `getByPlaceholderText` - Input placeholders
4. `getByText` - Visible text

**Less preferred:**
5. `getByTestId` - Implementation detail

**Solution for duplicate elements:**

**Option 1: Use `testID` prop**
```tsx
<TextInput testID="name-input" placeholder="Type here..." />
<TextInput testID="email-input" placeholder="Type here..." />
```
```typescript
const nameInput = getByTestId('name-input');
const emailInput = getByTestId('email-input');
```

**Option 2: Use `getAllBy*`**
```typescript
const inputs = getAllByPlaceholderText('Type here...');
const firstInput = inputs[0];
const secondInput = inputs[1];
```

**Option 3: Accessibility labels**
```tsx
<TextInput accessibilityLabel="Email input" />
```
```typescript
const input = getByLabelText('Email input');
```

---

### Running Tests

**Command:** `npm test`

**Output when passing:**
```
PASS  app/(tabs)/__tests__/index.test.tsx
  HomeScreen
    ✓ renders correctly
    ✓ updates display text when button is pressed

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

---

### TypeScript Issue Encountered

**Problem:** VS Code showed error: "Cannot find name 'describe'"

**Cause:** TypeScript doesn't know about Jest's global functions

**Solution:** Install Jest type definitions
```bash
npm install --save-dev @types/jest
```

**What `@types/*` packages do:**
- Provide TypeScript type definitions for JavaScript libraries
- Give autocomplete and type checking
- Maintained by DefinitelyTyped community

---

## Troubleshooting Log

### Issue 1: Peer Dependency Conflict

**Error:**
```
Could not resolve dependency:
peer react@"^19.2.0" from react-test-renderer@19.2.0
Found: react@19.1.0
```

**Root Cause:** React Native Testing Library needed React 19.2.0, but Expo installed 19.1.0

**First Thought:** Use `--legacy-peer-deps` flag to override

**Better Solution (User's Idea):** Upgrade React to 19.2.0
```bash
npx expo install react@19.2.0
```

**Lesson:** Always try to fix root cause before using workarounds. Using `npx expo install` ensures compatibility with Expo SDK.

---

### Issue 2: Missing Jest Command

**Error:** `'jest' is not recognized as an internal or external command`

**Cause:** Jest wasn't installed (Expo includes the preset but not Jest itself)

**Solution:**
```bash
npm install --save-dev jest
```

---

### Issue 3: Missing jest-expo Preset

**Error:** `Preset jest-expo not found`

**Cause:** We referenced `jest-expo` in config but didn't install it

**Solution:**
```bash
npm install --save-dev jest-expo
```

---

## Key Learnings Summary

### Technical Concepts
1. **Dependencies vs DevDependencies** - Production vs development packages
2. **Transformations** - Converting modern code to Node.js-compatible code
3. **Testing philosophy** - Test user behavior, not implementation
4. **Query priority** - Use user-facing queries when possible
5. **Type definitions** - TypeScript needs `@types/*` for JavaScript libraries

### Decision-Making
1. **Tool selection matters** - Chose Jest over Vitest for ecosystem maturity
2. **Fix root causes** - Upgrading React better than peer dep workarounds
3. **Simplicity first** - Skip E2E testing until needed
4. **Learning value** - Sometimes "older" tech is better for learning

### Development Workflow
1. **Small steps** - One concept at a time prevents overwhelm
2. **Test early** - Run tests after each addition to verify
3. **Read errors carefully** - Error messages guide solutions
4. **Ask questions** - Understanding "why" is more important than "how"

---

## Step 2.2: Linting & Formatting ✅ COMPLETED

### What is Prettier?

**Prettier** is an opinionated code formatter that automatically formats code to look consistent.

**Key concepts:**
- **Linter (ESLint)** = Finds code problems (bugs, bad practices)
- **Formatter (Prettier)** = Makes code look pretty (formatting only)
- They work together, not in competition

**Benefits:**
- No debates about code style (semicolons, quotes, spacing)
- Saves time - no manual formatting
- Consistent code across entire team
- Focus on logic, not formatting

**Example transformation:**
```typescript
// Before
const greeting="hello world"
const numbers=[1,2,3,4,5]

// After Prettier
const greeting = 'hello world';
const numbers = [1, 2, 3, 4, 5];
```

---

### What We Installed

```bash
npm install --save-dev prettier eslint-config-prettier
```

**Packages:**
- `prettier` - The formatter itself
- `eslint-config-prettier` - Disables ESLint rules that conflict with Prettier

---

### Configuration Created

**File:** `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

**What each setting does:**
- `semi: true` - Add semicolons at end of statements
- `trailingComma: "es5"` - Add trailing commas in arrays/objects (ES5 compatible)
- `singleQuote: true` - Use `'single'` instead of `"double"` quotes
- `printWidth: 100` - Wrap lines longer than 100 characters
- `tabWidth: 2` - Use 2 spaces for indentation

**Note:** These are opinionated defaults. You can change them, but the goal of Prettier is to *stop* debating about style.

---

### Scripts Added to package.json

```json
"format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\"",
"format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,md}\""
```

**What they do:**
- `npm run format` - Formats all files and saves changes
- `npm run format:check` - Checks if files are formatted (doesn't modify)

**The glob pattern `**/*.{js,jsx,ts,tsx,json,md}`:**
- `**` = All directories (recursive)
- `*.{...}` = All files with these extensions
- Formats TypeScript, JavaScript, JSON, and Markdown files

---

### ESLint Integration

Updated `eslint.config.js` to avoid conflicts:

```javascript
module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      'prettier/prettier': 'off',
    },
  },
]);
```

**Why this matters:**
- ESLint has some formatting rules
- Prettier handles ALL formatting
- We turn off Prettier-related ESLint rules to avoid conflicts
- ESLint focuses on code quality, Prettier on formatting

---

### Running Prettier

**First run:**
```bash
npm run format
```

**Result:** All existing files were formatted according to the rules:
- Changed double quotes to single quotes
- Added/removed semicolons as needed
- Fixed indentation
- Wrapped long lines

**Check without changing:**
```bash
npm run format:check
```

This is useful in CI/CD - check if code is formatted without modifying it.

---

### Key Learnings

**Opinionated vs Configurable:**
- Prettier is intentionally opinionated (few options)
- ESLint is highly configurable (many rules)
- Philosophy: "Stop arguing about formatting, just pick one standard"

**When to Format:**
- During development (manually with `npm run format`)
- On file save (can configure in VS Code)
- Before commits (pre-commit hooks - next step!)
- In CI/CD (check formatting in automated builds)

**ESLint vs Prettier - When to Use Which:**

| Tool | Purpose | Example |
|------|---------|---------|
| ESLint | Logic errors, best practices | "Unused variable", "Missing return" |
| Prettier | Formatting, style | "Use single quotes", "Add semicolon" |

---

## What's Next

### Remaining Phase 2 Steps:
- ✅ Step 2.1: Testing Foundation (COMPLETED)
- ✅ Step 2.2: Linting & Formatting (COMPLETED)
- ⏭️ Step 2.3: Pre-commit Hooks (Husky, lint-staged)
- ⏭️ Step 2.4: CI/CD Pipeline (GitHub Actions)
- ⏭️ Step 2.5: OpenTelemetry Foundation
- ⏭️ Step 2.6: Observability Backend Setup
- ⏭️ Step 2.7: Tracing Implementation
- ⏭️ Step 2.8: Error Tracking Strategy
- ⏭️ Step 2.9: Analytics Strategy
- ⏭️ Step 2.10: Development Automation

---

## Commands Reference

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react-native @testing-library/jest-native
npm install --save-dev jest jest-expo @types/jest

# Run tests
npm test

# Install Prettier
npm install --save-dev prettier eslint-config-prettier

# Format code
npm run format           # Format all files
npm run format:check     # Check if files are formatted

# Upgrade React with Expo
npx expo install react@19.2.0
```

---

## Files Created/Modified

### Created:
- `jest.config.js` - Jest configuration
- `app/(tabs)/__tests__/index.test.tsx` - First tests
- `.prettierrc` - Prettier configuration

### Modified:
- `package.json` - Added test and format scripts, updated dependencies
- `eslint.config.js` - Added Prettier integration
- `package-lock.json` - Updated with new dependencies
- All `.ts/.tsx` files - Formatted by Prettier

---

**Last Updated:** 2025-10-20
**Current Progress:** Steps 2.1 and 2.2 completed, ready for Step 2.3 (Pre-commit Hooks)

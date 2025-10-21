# Phase 2 Learning Notes: Automation & Observability

**Status:** In Progress
**Started:** 2025-10-20
**Current Step:** 2.3 Pre-commit Hooks (Completed - Ready for CI/CD)

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

## Step 2.3: Pre-commit Hooks ✅ COMPLETED

### What Are Pre-commit Hooks?

**Pre-commit hooks** are scripts that run automatically RIGHT BEFORE you commit code.

**How it works:**
1. You run `git commit`
2. Git triggers the pre-commit hook
3. Hook runs checks (linting, formatting, tests)
4. If checks pass → commit succeeds ✅
5. If checks fail → commit is blocked ❌

**Benefits:**
- Never commit badly formatted code
- Catch errors before they reach the repo
- Enforces quality automatically
- No manual "remember to run lint" needed

---

### Key Concept: npm vs npx

**Question Asked:** "What is the difference between npx and npm?"

**npm** = Node Package Manager
- Installs and manages packages
- Commands: `npm install`, `npm test`, `npm run format`

**npx** = Node Package Execute
- Executes packages WITHOUT permanent installation
- Downloads temporarily, runs, cleans up
- Can also run locally installed packages

**Examples:**
```bash
# npm - Install and keep
npm install --save-dev husky

# npx - Execute once (downloads if needed)
npx create-expo-app my-app

# npx - Run local package
npx husky init  # Runs husky from node_modules
```

**When to use which:**
- **npm install** - Package needed in your project
- **npx** - One-time commands, running scripts

**npx execution order:**
1. Check local `node_modules/.bin/`
2. Check global npm packages
3. Download from npm registry temporarily

---

### Tool Decision: Husky vs Alternatives

**Question Asked:** "Is Husky a good tool for React projects? Does the community use something else?"

**Options compared:**

#### Husky (Chosen)
- **Popularity:** Most popular in JavaScript ecosystem (~80% market share)
- **Pros:** Standard choice, large community, well documented, works perfectly with lint-staged
- **Cons:** Slower than alternatives, written in JavaScript
- **Status:** Still the industry standard for React/React Native (2025)

#### Lefthook
- **Popularity:** Growing alternative (~10-15% market share)
- **Pros:** Much faster (written in Go), parallel execution, zero dependencies
- **Cons:** Smaller community, less React-specific docs
- **Who uses it:** Large companies (Shopify), performance-focused teams

#### simple-git-hooks
- **Popularity:** Niche, minimalist choice
- **Pros:** Tiny, zero dependencies, fast
- **Cons:** Very basic, manual config, small community

**Decision:** Chose Husky because:
1. Standard for React Native projects
2. Best documentation and troubleshooting resources
3. Perfect integration with lint-staged
4. Speed difference negligible for small projects
5. Skills transfer easily to alternatives later

---

### What We Installed

```bash
npm install --save-dev husky
npx husky init
npm install --save-dev lint-staged
```

**Packages:**
- `husky` - Manages git hooks
- `lint-staged` - Runs linters only on staged files (not entire codebase)

**Why lint-staged matters:**
```bash
# Without: Slow, runs on ALL files
npm run lint  # 1000+ files

# With: Fast, runs only on changed files
lint-staged   # 3 files you modified
```

---

### How Git Finds Hooks

**Question Asked:** "How does git know that it has to look into .husky folder?"

**Default git behavior:**
- Git looks for hooks in `.git/hooks/`
- Problem: `.git/` is not tracked by git, can't be shared

**Husky's solution:**
1. Creates `.husky/` folder (tracked by git)
2. Runs: `git config core.hooksPath .husky`
3. Git now looks in `.husky/` instead

**Configuration stored in:**
```
.git/config
```

**To verify:**
```bash
git config core.hooksPath
# Output: .husky (or demo-react-native-app/.husky in our case)
```

**What happens when someone clones:**
1. Clone repo (gets `.husky/` folder)
2. Run `npm install`
3. `prepare` script runs automatically
4. Git configured to use `.husky/` hooks
5. Hooks work immediately!

---

### Understanding Shell Scripts

The `.husky/pre-commit` file is a **shell script**.

**Every shell script needs:**

1. **Shebang** (`#!/usr/bin/env sh`)
   - First line of script
   - Tells system "this is a shell script"
   - `#!` pronounced "shebang" or "hashbang"

2. **Husky helper** (`. "$(dirname -- "$0")/_/husky.sh"`)
   - Loads Husky's setup functions
   - `dirname "$0"` = directory of current script
   - Looks for `.husky/_/husky.sh`

3. **Your command** (`npx lint-staged`)
   - The actual code to run

---

### Configuration Created

#### File: `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**Line-by-line:**
- Line 1: Shebang - marks as shell script
- Line 2: Load Husky helpers
- Line 3: Blank line
- Line 4: Run lint-staged

---

#### File: `.husky/_/husky.sh`

Helper script created with proper error handling and environment setup.

**What it does:**
- Sets up environment for hooks
- Handles errors gracefully
- Provides debugging capabilities
- Allows skipping hooks with `HUSKY=0`

---

#### File: `package.json` - lint-staged configuration

```json
"lint-staged": {
  "demo-react-native-app/**/*.{js,jsx,ts,tsx}": [
    "npx eslint --fix --config demo-react-native-app/eslint.config.js",
    "npx prettier --write --config demo-react-native-app/.prettierrc"
  ]
}
```

**What this does:**
- Pattern: Only match files inside `demo-react-native-app/` folder
- Run ESLint with auto-fix
- Run Prettier to format
- Both pointed to correct config files

---

#### File: `package.json` - prepare script

```json
"scripts": {
  "prepare": "husky"
}
```

**What this does:**
- Runs automatically after `npm install`
- Sets up Husky for new developers
- Configures git hooks path

---

### Troubleshooting Journey

#### Issue 1: Hook Not Running (First Attempt)

**Problem:** Committed but hook didn't run, no output

**Cause:** Missing shebang and Husky helper in pre-commit file

**Solution:** Added proper shell script structure:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**Lesson:** Shell scripts need proper headers to execute

---

#### Issue 2: Git Repository Structure

**Problem:** Hook still not running after fixing script

**Discovery:**
```bash
pwd  # demo-react-native-app/
git rev-parse --show-toplevel  # demo-react-native-app (parent!)
```

**Root cause:**
- Git repo root: `C:/Users/.../demo-react-native-app/`
- React Native project: `C:/Users/.../demo-react-native-app/demo-react-native-app/`
- Installed Husky in subdirectory, but git runs from root

**Solution:**
```bash
cd ..  # Go to git root
git config core.hooksPath demo-react-native-app/.husky
```

**Lesson:** Always check where git repository actually is vs where your project is

---

#### Issue 3: ESLint Not Found

**Problem:**
```
'eslint' is not recognized as an internal or external command
```

**Cause:**
- Hook runs from git root
- ESLint installed in `demo-react-native-app/node_modules/`
- Command can't find ESLint

**First attempt:** Used `npx` to find packages
```json
"npx eslint --fix"
```

**Still failed:** Found wrong ESLint version globally

---

#### Issue 4: ESLint Config Not Found

**Problem:**
```
ESLint couldn't find an eslint.config.js file
```

**Cause:**
- Hook runs from parent directory
- ESLint looks for config in current directory
- Config is in `demo-react-native-app/eslint.config.js`

**Solution:** Specify full paths in lint-staged config:
```json
"lint-staged": {
  "demo-react-native-app/**/*.{js,jsx,ts,tsx}": [
    "npx eslint --fix --config demo-react-native-app/eslint.config.js",
    "npx prettier --write --config demo-react-native-app/.prettierrc"
  ]
}
```

**Key changes:**
1. Pattern matches subdirectory files: `demo-react-native-app/**/*.{...}`
2. ESLint config path: `--config demo-react-native-app/eslint.config.js`
3. Prettier config path: `--config demo-react-native-app/.prettierrc`

**Success!** Hook finally worked on 5th attempt

---

### Testing the Hook

**Command:**
```bash
git add .
git commit -m "test message"
```

**Successful output:**
```
[STARTED] Backing up original state...
[COMPLETED] Backed up original state in git stash
[STARTED] Running tasks for staged files...
[STARTED] npx eslint --fix --config demo-react-native-app/eslint.config.js
[COMPLETED] npx eslint --fix --config demo-react-native-app/eslint.config.js
[STARTED] npx prettier --write --config demo-react-native-app/.prettierrc
[COMPLETED] npx prettier --write --config demo-react-native-app/.prettierrc
[COMPLETED] Running tasks for staged files...
[main abc1234] test message
```

**What happens:**
1. Git intercepts commit
2. Husky runs pre-commit hook
3. lint-staged finds changed files
4. ESLint checks and fixes issues
5. Prettier formats code
6. Changes applied
7. Commit succeeds

---

### Key Learnings

**Technical Concepts:**
1. **Pre-commit hooks** - Scripts that run before git commits
2. **Shell scripts** - Need shebang, proper structure
3. **npm vs npx** - Installing vs executing packages
4. **Git hooks path** - Configurable with `core.hooksPath`
5. **Monorepo/subdirectory** - Git repo can be parent of project folder

**Troubleshooting Skills:**
1. **Check git repo location** - Use `git rev-parse --show-toplevel`
2. **Verify git config** - Use `git config --list --local`
3. **Test hooks manually** - Run hook script directly to debug
4. **Path resolution** - Commands run from git root, not project root
5. **Config file locations** - Specify full paths when needed

**Development Practices:**
1. **Automation prevents errors** - Can't commit bad code
2. **Fast feedback** - Know immediately if something's wrong
3. **Shared configuration** - Team uses same standards
4. **Git hooks are powerful** - Enforce policies automatically

---

### Personal Note

**Reflection on the learning experience:**

I'm so glad I don't have to do this by hand and Google all this configuration. Having the LLM telling me what to do and assisting me in fixing errors is really a blessing. Without it, for me this would have been a non-starter.

**Why this setup was challenging:**
- Complex directory structure (git repo parent of project)
- Multiple configuration files interacting (git, Husky, ESLint, Prettier)
- Shell script syntax unfamiliar
- Path resolution issues
- Each tool has its own quirks

**What the LLM provided:**
- Step-by-step guidance without overwhelming
- Explanations of WHY, not just HOW
- Patient troubleshooting through 5 attempts
- Context about tool choices (Husky vs alternatives)
- Answers to all questions as they came up

**Learning vs Just Copying:**
- Still wrote all the code myself
- Understood each piece before moving on
- Asked questions when confused
- Built real understanding, not just following instructions

This combination of guided learning with an AI assistant made a professional dev setup accessible that would have otherwise been too frustrating to complete.

---

## What's Next

### Remaining Phase 2 Steps:
- ✅ Step 2.1: Testing Foundation (COMPLETED)
- ✅ Step 2.2: Linting & Formatting (COMPLETED)
- ✅ Step 2.3: Pre-commit Hooks (COMPLETED)
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

# Install Husky and lint-staged
npm install --save-dev husky lint-staged
npx husky init

# Configure git hooks path (if repo is parent of project)
git config core.hooksPath demo-react-native-app/.husky

# Check git configuration
git config --list --local
git rev-parse --show-toplevel  # Find git repo root

# Upgrade React with Expo
npx expo install react@19.2.0
```

---

## Files Created/Modified

### Created:
- `jest.config.js` - Jest configuration
- `app/(tabs)/__tests__/index.test.tsx` - First tests
- `.prettierrc` - Prettier configuration
- `.husky/pre-commit` - Pre-commit hook script
- `.husky/_/husky.sh` - Husky helper script

### Modified:
- `package.json` - Added test, format, and prepare scripts; added lint-staged config; updated dependencies
- `eslint.config.js` - Added Prettier integration
- `package-lock.json` - Updated with new dependencies
- All `.ts/.tsx` files - Formatted by Prettier
- `.git/config` - Set core.hooksPath to demo-react-native-app/.husky

---

## Step 2.4: CI/CD Pipeline with GitHub Actions 🚧 IN PROGRESS (PAUSED)

### What is CI/CD?

**CI = Continuous Integration**
- Automatically test your code every time you push changes
- Catches bugs immediately, before they reach production
- Runs in the "cloud" on GitHub's servers, not your computer
- Fast feedback loop for developers

**CD = Continuous Deployment**
- Automatically builds/deploys your app when tests pass
- In our case: automatically build APK when you push to main branch
- Reduces manual deployment steps

**Example flow:**
```
You push code → GitHub detects push → Runs workflow → Tests pass/fail → You see results
```

---

### What is GitHub Actions?

**GitHub Actions** is GitHub's built-in automation platform for CI/CD.

**How it works:**
1. You create **workflow files** (YAML format) in `.github/workflows/`
2. You define **when** it should run (on push, pull request, schedule, etc.)
3. You define **what** it should do (run tests, build app, deploy, etc.)
4. GitHub runs it automatically on their servers

**Key concepts learned:**
- **Workflow** - The entire automation (e.g., "CI workflow")
- **Job** - A set of steps that run together (e.g., "lint-and-test")
- **Step** - Individual action or command (e.g., "Run tests")
- **Runner** - GitHub's server that executes the workflow (e.g., ubuntu-latest)

---

### Question: GitHub Actions Free Tier Limits

**Question Asked:** "Are there any limits to a free account on GitHub? Can I constantly build, test, deploy?"

**Answer Learned:**

#### For Public Repositories (no cost!)
- ✅ **Unlimited minutes** - Build as much as you want
- ✅ **Unlimited builds**
- ✅ No charges ever
- GitHub supports open source this way

#### For Private Repositories
- **2,000 minutes per month FREE**
- **500 MB storage FREE**
- After that, you pay ($0.008 per minute)

**Realistic monthly usage for our project:**
- 50 commits × 5 minutes (CI) = 250 minutes
- 10 builds × 15 minutes (EAS) = 150 minutes
- **Total: ~400 minutes/month** (well under limit)

**Best practices to save minutes:**
1. Don't build on every push - only on main branch
2. Use caching (speeds up AND saves minutes)
3. Cancel old runs if you push twice quickly
4. Add `[skip ci]` to commit messages when needed

**Monitoring usage:**
- GitHub → Settings → Billing → Usage this month

---

### Question: Pre-commit Hooks vs GitHub Actions - Do They Collide?

**Question Asked:** "We configured a pre-commit task on Husky. Is this going to collide with what we are doing now?"

**Answer: They work TOGETHER, not against each other!**

#### Pre-commit Hooks (Husky) - LOCAL
- Runs on **your computer**
- Runs **before** code reaches GitHub
- **Fast** - only checks files you changed
- **First line of defense**

```
You type: git commit
↓
Husky runs (on your machine)
↓
Lint + format your changes
↓
Commit created locally
```

#### GitHub Actions (CI) - REMOTE
- Runs on **GitHub's servers**
- Runs **after** you push to GitHub
- Checks **entire project**
- **Second line of defense**

```
You type: git push
↓
Code goes to GitHub
↓
GitHub Actions runs (on their servers)
↓
Full lint + test suite runs
```

**Why have BOTH?**
1. **Bypass protection**: If someone uses `git commit --no-verify`, CI still catches it
2. **Team consistency**: Teammates might have different local setups, CI is consistent
3. **Different scope**: Pre-commit = fast local checks, CI = comprehensive testing
4. **Integration testing**: CI can test things that don't make sense locally

**Think of it like:**
- Pre-commit = Spell-check while typing (immediate feedback)
- GitHub Actions = Editor reviewing your article (thorough check)

You want BOTH!

---

### YAML Configuration Format

**What is YAML?**
- Configuration file format (like JSON but more readable)
- Used by GitHub Actions, Docker, Kubernetes, etc.
- Human-friendly syntax

**Key rules:**
- **Indentation matters** (like Python) - use 2 spaces
- **No tabs allowed** - only spaces
- Use `:` for key-value pairs
- Use `-` for list items
- Use `#` for comments

**Example:**
```yaml
name: My Workflow        # Key: value
on: push                 # Trigger event
jobs:                    # Start jobs section
  test:                  # Job name (2 spaces indent)
    runs-on: ubuntu-latest  # Job property (4 spaces)
    steps:               # List of steps (4 spaces)
      - name: Checkout   # List item (6 spaces)
        uses: action@v4  # Step property (8 spaces)
```

**Common mistakes:**
- Using tabs instead of spaces ❌
- Inconsistent indentation ❌
- Forgetting the `-` for list items ❌

---

### Understanding Action Versions

**Question Asked:** "Why checkout@v4? Does this mean we have different versions of checkout?"

**Answer: Yes! Actions have versions like npm packages.**

#### Breaking Down `actions/checkout@v4`
- `actions/checkout` - Name of the action (maintained by GitHub)
- `@v4` - Version number (version 4)

#### Why Versions Exist
Just like npm packages, GitHub Actions evolve:
- **v1** - Original (deprecated)
- **v2** - Added features (outdated)
- **v3** - Improved performance (still works)
- **v4** - Latest (current, recommended)

**Benefits:**
1. **Stability** - Workflow won't break if action updates
2. **Predictability** - You know exactly what you're getting
3. **Control** - You choose when to upgrade

#### How to Specify Versions

**Option 1: Major version (recommended)**
```yaml
- uses: actions/checkout@v4
# Gets: v4.1.2, v4.2.0, v4.x.x (any v4)
# Won't get: v5.0.0 (breaking changes)
```

**Option 2: Exact version (very strict)**
```yaml
- uses: actions/checkout@v4.1.2
# Gets: Only exactly v4.1.2
# More stable, but misses bug fixes
```

**Option 3: SHA commit hash (most secure)**
```yaml
- uses: actions/checkout@a12b3c4d5e6f
# Gets: Exact commit
# Used for security-critical applications
```

**Best practice:** Use major version (`@v4`)
- Gets bug fixes and patches automatically
- Won't get breaking changes

**Never do this:**
```yaml
- uses: actions/checkout  # No version - BAD!
# Defaults to @main (latest code)
# Could break your workflow unexpectedly
```

**How to find the right version:**
1. Check the action's README on GitHub
2. Look at GitHub Marketplace
3. See what other projects use
4. When in doubt, use latest major version

---

### Understanding Step Names

**Question Asked:** "Could I also do something like `- name: Checkout code` before `uses:`? I suppose the name shows up in console?"

**Answer: Yes! The `name` field is optional but helpful.**

#### With vs Without Names

**Option 1: Without name**
```yaml
- uses: actions/checkout@v4
```
**Shows in UI:** "Run actions/checkout@v4"

**Option 2: With name**
```yaml
- name: Checkout code
  uses: actions/checkout@v4
```
**Shows in UI:** "Checkout code"

Both work! The name is **optional** but makes logs clearer.

#### When to Use Names

**Add names when:**
- The step does something important (better documentation)
- You have multiple similar steps (helps distinguish them)
- You want clearer logs for debugging

**Skip names when:**
- The action name is already clear (`actions/checkout` is obvious)
- You're being lazy (it's optional!)

**Example logs with names:**
```
✅ Checkout code (2s)
✅ Setup Node.js (15s)
✅ Install dependencies (45s)
✅ Run linter (8s)
✅ Run tests (12s)
```

Clear and readable! ✨

---

### YAML Variables and Defaults

**Question Asked:** "We are constantly repeating `./demo-react-native-app`. Does YAML have the concept of variables?"

**Answer: Yes! Use `defaults` for working directories.**

#### The Problem: Repetition

```yaml
- name: Install dependencies
  run: npm ci
  working-directory: ./demo-react-native-app  # Repeated

- name: Run linter
  run: npm run lint
  working-directory: ./demo-react-native-app  # Repeated

- name: Run tests
  run: npm test
  working-directory: ./demo-react-native-app  # Repeated
```

#### The Solution: Use `defaults`

```yaml
jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: ./demo-react-native-app

    steps:
      - name: Install dependencies
        run: npm ci  # Clean! No repetition

      - name: Run linter
        run: npm run lint  # Clean!
```

**What this does:**
- `defaults:` - Set default values for steps
- `run:` - For any step that uses `run:` command
- `working-directory:` - All `run` commands use this directory

**Important:** `defaults` ONLY applies to `run:` commands, NOT to `uses:` actions!

```yaml
# ✅ Uses default working directory
- run: npm ci

# ❌ Does NOT use default (must specify explicitly)
- uses: actions/setup-node@v4
  with:
    cache-dependency-path: './demo-react-native-app/package-lock.json'
```

#### Other Variable Options

**Option 2: Environment variables**
```yaml
env:
  PROJECT_DIR: ./demo-react-native-app

steps:
  - run: npm ci
    working-directory: ${{ env.PROJECT_DIR }}
```

**Option 3: Job outputs**
(More advanced, not covered yet)

**Best practice:** Use `defaults` for working-directory - cleanest solution!

---

### What is Codecov?

**Codecov** is a cloud service that visualizes and tracks test coverage.

#### What It Does

**1. Visualizes Coverage**
- Shows which lines are tested (green) vs untested (red)
- Interactive UI to browse code
- Much nicer than raw coverage reports

**2. Tracks Coverage Over Time**
- Graphs showing coverage trends
- "Coverage went from 60% → 75% this month"
- Historical data per commit

**3. Pull Request Comments**
- Automatically comments on PRs
- "This PR decreased coverage by 5%"
- Shows which new lines aren't tested

**4. Status Badges**
```markdown
![Coverage](https://codecov.io/gh/username/repo/branch/main/graph/badge.svg)
```
Shows: `coverage: 75%` badge on README

#### How It Works

```
1. Jest runs tests with --coverage
   ↓
2. Jest creates coverage/lcov.info file
   ↓
3. codecov-action uploads file to Codecov
   ↓
4. Codecov processes and shows graphs
```

#### Free Tier
- ✅ **Unlimited** for public repositories
- ✅ All features
- ✅ No credit card needed

#### Setup Process
1. Sign up at https://codecov.io with GitHub account
2. Enable repository in Codecov dashboard
3. Copy the repository token
4. Add token as GitHub Secret (`CODECOV_TOKEN`)
5. Use token in workflow:
```yaml
- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
    token: ${{ secrets.CODECOV_TOKEN }}
    fail_ci_if_error: false
```

**Note:** For public repos, token is optional but recommended.

---

### GitHub Secrets

**What are GitHub Secrets?**
- Secure storage for sensitive information (tokens, passwords, API keys)
- Encrypted storage on GitHub
- Never visible in logs or public code
- Workflows can access them, but humans cannot read them

**Why use secrets?**
- ✅ Don't put tokens in code (security risk!)
- ✅ Forks don't get your secrets (safe)
- ✅ Credentials stay safe even if repo is public

**How to add a secret:**
1. Go to GitHub repo → Settings tab
2. Left sidebar → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Name: `CODECOV_TOKEN` (or whatever you need)
5. Value: Paste the secret token
6. Click "Add secret"

**Using secrets in workflows:**
```yaml
token: ${{ secrets.CODECOV_TOKEN }}
```

**In logs:**
```
token: ***  # Value is hidden for security
```

**Important:** Secret values are NEVER shown in logs, even to you!

---

### npm ci vs npm install

**Question context:** Why does CI use `npm ci` instead of `npm install`?

**npm install:**
- Installs packages from package.json
- Updates package-lock.json if needed
- Flexible, good for development
- Can install different versions than lockfile

**npm ci (Clean Install):**
- Installs EXACT versions from package-lock.json
- **Deletes node_modules first** (clean slate)
- **Faster** than npm install
- **Stricter** - fails if package.json and package-lock.json don't match
- **More reliable** for automated environments

**Why `npm ci` for CI/CD:**
1. **Consistency** - Everyone gets exact same versions
2. **Speed** - Optimized for automation
3. **Reliability** - Catches version mismatches
4. **Clean** - No leftover packages

**When to use which:**
- **Development (local):** `npm install` (flexible)
- **CI/CD (automation):** `npm ci` (reliable)

---

### Understanding `--` in npm Commands

**Question context:** What does `npm test -- --coverage` mean?

**The `--` separator:**
- Separates npm arguments from script arguments
- Everything after `--` goes to the script, not npm

**Example:**
```bash
npm test -- --coverage
         ↑
         This -- says "pass --coverage to jest, not npm"
```

**Without `--`:**
```bash
npm test --coverage
# npm tries to interpret --coverage (error!)
```

**With `--`:**
```bash
npm test -- --coverage
# npm runs: jest --coverage (correct!)
```

**How it works:**
1. `npm test` runs the "test" script in package.json
2. Our script is: `"test": "jest"`
3. `-- --coverage` appends `--coverage` to jest command
4. Final command: `jest --coverage`

---

### CI Workflow Created

**File:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: ./demo-react-native-app

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: './demo-react-native-app/package-lock.json'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          token: ${{ secrets.CODECOV_TOKEN }}
          fail_ci_if_error: false
```

**What each section does:**

**1. Workflow metadata:**
- `name: CI` - Workflow name shown in GitHub UI

**2. Triggers:**
- `on: push` - Run when code is pushed
- `branches: [ main, develop ]` - Only these branches
- `pull_request` - Also run on PRs to main

**3. Job configuration:**
- `lint-and-test:` - Job name (can be anything)
- `runs-on: ubuntu-latest` - Run on Ubuntu Linux server

**4. Defaults:**
- `defaults.run.working-directory` - All `run:` commands execute here

**5. Steps:**
- **Checkout** - Download repo code
- **Setup Node.js** - Install Node 22 with npm caching
- **Install dependencies** - `npm ci` for clean, fast install
- **Run linter** - ESLint checks
- **Run tests** - Jest with coverage report
- **Upload coverage** - Send coverage to Codecov

---

### Troubleshooting Journey

#### Issue 1: Cache Dependency Path Not Found

**Error:**
```
Dependencies lock file is not found in /home/runner/work/demo-react-native-app/demo-react-native-app.
Supported file patterns: package-lock.json
```

**Root cause:**
- `defaults.run.working-directory` only applies to `run:` commands
- `uses: actions/setup-node@v4` does NOT use the default
- Cache was looking in wrong directory

**Solution:**
Added explicit path to setup-node:
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '22'
    cache: 'npm'
    cache-dependency-path: './demo-react-native-app/package-lock.json'
```

**Lesson:** `defaults` don't apply to `uses:` actions, only `run:` commands!

---

#### Issue 2: Jest Test Environment Error (Expo Winter Runtime)

**Error:**
```
ReferenceError: You are trying to `import` a file outside of the scope of the test code.
at Runtime._execModule (node_modules/jest-runtime/build/index.js:1216:13)
at require (node_modules/expo/src/winter/runtime.native.ts:20:43)
```

**What is happening:**
- Expo's new "winter" runtime tries to load native-specific code
- Jest runs in Node.js environment, not React Native environment
- This causes import errors in certain configurations

**First attempted fix:**
Added `testEnvironment: 'node'` to `jest.config.js`:
```javascript
module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  // ... rest of config
};
```

**Result:** Tests pass locally ✅ but still fail in CI ❌

---

#### Issue 3: Node Version Mismatch

**Discovery:**
- **Local environment:** Node v22.14.0 (tests pass ✅)
- **CI environment:** Node v20 (tests fail ❌)

**Hypothesis:**
Expo's winter runtime behaves differently on Node 20 vs Node 22.

**Attempted fix:**
Changed workflow to use Node 22:
```yaml
with:
  node-version: '22'  # Changed from '20'
```

**Result:** Still failing in CI ❌

**Current status:** PAUSED for further investigation

---

### Current Status: PAUSED

**What works:**
- ✅ Workflow file created and valid
- ✅ Codecov account set up
- ✅ GitHub Secret configured
- ✅ Tests pass locally with coverage
- ✅ Linting passes in CI
- ✅ Dependencies install in CI

**What doesn't work:**
- ❌ Tests fail in CI with Expo winter runtime error
- Tests work locally but not in GitHub Actions

**Possible causes to investigate:**
1. Environment differences between local and CI
2. Expo winter runtime compatibility with Jest in CI
3. Missing environment variables or configuration in CI
4. Jest/Expo version incompatibility

**Next steps when resuming:**
1. Research Expo winter runtime and Jest compatibility
2. Check Expo GitHub issues for similar problems
3. Try alternative Jest configurations
4. Consider downgrading/upgrading Expo version
5. Reach out to Expo community for help

---

### Key Learnings Summary

**CI/CD Concepts:**
1. **Pre-commit vs CI** - Local checks vs remote checks, both needed
2. **GitHub Actions** - Workflows, jobs, steps, runners
3. **YAML syntax** - Indentation matters, no tabs, `-` for lists
4. **Action versions** - Use @v4 for stability, avoid unversioned
5. **GitHub Secrets** - Secure storage for tokens and credentials
6. **Codecov** - Visualizes test coverage, free for public repos

**Technical Skills:**
1. **npm ci** - Better than npm install for CI/CD
2. **`--` separator** - Pass flags through npm to scripts
3. **Working directories** - `defaults` for `run:`, explicit paths for `uses:`
4. **Node version matching** - Keep local and CI environments aligned
5. **YAML variables** - Use `defaults` to avoid repetition

**Troubleshooting:**
1. **Read errors carefully** - They tell you what's wrong
2. **Check file locations** - Working directory matters
3. **Match environments** - Local vs CI differences cause issues
4. **Test locally first** - Reproduce CI failures on your machine
5. **One change at a time** - Easier to identify what fixed/broke

**GitHub Actions Best Practices:**
1. **Use caching** - Speeds up builds, saves minutes
2. **Specify versions** - Don't use unversioned actions
3. **Use secrets** - Never hardcode tokens
4. **Add names to steps** - Makes logs readable
5. **Use `defaults`** - Reduce repetition

---

### Questions Asked This Session

1. ✅ "Are there limits to GitHub Actions free tier?" → Unlimited for public repos
2. ✅ "Does pre-commit collide with GitHub Actions?" → No, they complement each other
3. ✅ "Why checkout@v4? Different versions?" → Yes, version pinning for stability
4. ✅ "Can I add names to steps?" → Yes, optional but helpful for logs
5. ✅ "Does YAML have variables?" → Yes, use `defaults` for working directories
6. ✅ "What is Codecov?" → Coverage visualization service

---

**Last Updated:** 2025-10-21
**Current Progress:** Steps 2.1, 2.2, 2.3 completed. Step 2.4 (CI/CD) in progress but PAUSED due to Jest/Expo compatibility issue in CI environment

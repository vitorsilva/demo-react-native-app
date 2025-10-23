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

### Resolution: Debugging by Isolation (2025-10-22)

**Strategy:** Remove tests from CI to isolate the problem.

**What we did:**
1. Commented out the test steps in `.github/workflows/ci.yml`
2. Pushed changes to GitHub
3. Verified CI passed without tests

**Result:** ✅ CI passed!

**What this proved:**
- GitHub Actions setup is correct
- Node.js, dependencies, and linting all work
- **Problem is isolated specifically to Jest test execution in CI**

---

#### Issue 4: Jest 30 + Expo Incompatibility (ROOT CAUSE FOUND!)

**Research conducted:**
- Searched for "Expo winter runtime Jest CI GitHub Actions"
- Found multiple Stack Overflow and GitHub issues
- Discovered known incompatibility between Jest 30 and Expo SDK 53/54

**Key findings from Stack Overflow (December 2024):**

> "When using expo 53.0.9, downgrade jest and babel-jest from 30.0.4 to 29.7.0. This allows you to avoid downgrading Expo itself."

**Why this happens:**
- Jest 30 introduced changes to module loading
- Expo's "winter runtime" (internal module structure) conflicts with Jest 30
- Jest 29 is the last version fully compatible with Expo's current architecture
- This is a known issue in the Expo community

**Error signature:**
```
ReferenceError: You are trying to `import` a file outside of the scope of the test code
at require (node_modules/expo/src/winter/runtime.native.ts:20:43)
```

**Common across:**
- Expo SDK 52, 53, 54
- Jest 30.x versions
- Both local and CI environments (but CI fails more consistently)

---

#### Solution: Downgrade to Jest 29.7.0

**Packages to downgrade:**
```json
"devDependencies": {
  "jest": "29.7.0",           // Was: ^30.2.0
  "babel-jest": "29.7.0",     // Was: not installed
  "@types/jest": "^29.5.12"   // Was: ^30.0.0
}
```

**Why all three packages:**
1. `jest@29.7.0` - The test runner itself
2. `babel-jest@29.7.0` - Babel transformer for Jest (required)
3. `@types/jest@29.5.12` - TypeScript types matching Jest 29

**Installation commands:**
```bash
npm install --save-dev jest@29.7.0 babel-jest@29.7.0
npm install --save-dev @types/jest@29.5.12
```

**Testing locally:**
```bash
npm test  # Confirmed: Tests still pass with Jest 29
```

---

#### Issue 5: Codecov Path Resolution

**Problem after re-enabling tests:**
```
None of the following appear to exist as files: ./coverage/lcov.info
```

**Root cause:**
- `defaults.run.working-directory` applies to `run:` commands
- Codecov action (`uses:`) does NOT inherit this default
- Looking for coverage in wrong location

**Fix:**
Updated the Codecov step in `.github/workflows/ci.yml`:

**Before:**
```yaml
- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info  # Wrong path
```

**After:**
```yaml
- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./demo-react-native-app/coverage/lcov.info  # Correct path
```

**Lesson:** `uses:` actions need explicit paths, even when `defaults` are set.

---

### Final Status: ✅ COMPLETED!

**What works now:**
- ✅ Workflow file created and valid
- ✅ Codecov account set up
- ✅ GitHub Secret configured
- ✅ Tests pass locally with Jest 29
- ✅ **Tests pass in CI with Jest 29**
- ✅ Linting passes in CI
- ✅ Dependencies install in CI
- ✅ **Coverage reports upload to Codecov**
- ✅ **Full CI/CD pipeline operational**

**CI Pipeline summary:**
1. Checkout code
2. Setup Node.js 22 with npm caching
3. Install dependencies (`npm ci`)
4. Run ESLint
5. Run Jest tests with coverage
6. Upload coverage to Codecov

**View coverage:** https://app.codecov.io/github/vitorsilva/demo-react-native-app

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
6. **Version compatibility** - Jest 29 vs 30 with Expo, importance of matching versions

**Troubleshooting:**
1. **Read errors carefully** - They tell you what's wrong
2. **Check file locations** - Working directory matters
3. **Match environments** - Local vs CI differences cause issues
4. **Test locally first** - Reproduce CI failures on your machine
5. **One change at a time** - Easier to identify what fixed/broke
6. **Isolation technique** - Remove failing parts to narrow down the problem
7. **Research online** - Community often has solutions to common issues
8. **Version downgrading** - Sometimes newer isn't better, especially with dependencies

**GitHub Actions Best Practices:**
1. **Use caching** - Speeds up builds, saves minutes
2. **Specify versions** - Don't use unversioned actions
3. **Use secrets** - Never hardcode tokens
4. **Add names to steps** - Makes logs readable
5. **Use `defaults`** - Reduce repetition
6. **Explicit paths for `uses:`** - Actions don't inherit `defaults`

**Problem-Solving Methodology:**
1. **Isolate the problem** - Verify each component works independently
2. **Research the error** - Use exact error messages in searches
3. **Check community resources** - Stack Overflow, GitHub issues
4. **Test hypothesis** - Apply fix and verify it works
5. **Document the solution** - Help future you and others

---

### Questions Asked This Session

1. ✅ "Are there limits to GitHub Actions free tier?" → Unlimited for public repos
2. ✅ "Does pre-commit collide with GitHub Actions?" → No, they complement each other
3. ✅ "Why checkout@v4? Different versions?" → Yes, version pinning for stability
4. ✅ "Can I add names to steps?" → Yes, optional but helpful for logs
5. ✅ "Does YAML have variables?" → Yes, use `defaults` for working directories
6. ✅ "What is Codecov?" → Coverage visualization service
7. ✅ "Should we downgrade @types/jest too?" → Yes, match types to runtime version

---

### Reflection on the Troubleshooting Process

**What made this challenging:**
- Error was cryptic ("winter runtime")
- Worked locally but failed in CI
- Multiple possible causes (Node version, environment, configuration)
- Required research to find root cause

**What worked well:**
- Systematic isolation (removed tests to verify CI works)
- Online research found known issue quickly
- Testing fix locally before re-enabling in CI
- Small, incremental changes

**Key insight:**
When something fails in CI but works locally, don't assume it's a CI configuration problem. It could be a version incompatibility that manifests differently in different environments. Research the specific error message - someone has likely encountered it before.

---

**Last Updated:** 2025-10-23
**Current Progress:** Steps 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7 (partial) ✅ COMPLETED! Ready to continue with Step 2.7 (Metrics & Logging).

---

## Step 2.5: OpenTelemetry Foundation ✅ COMPLETED

### What is OpenTelemetry?

**OpenTelemetry (OTel)** is an open-source observability framework for collecting telemetry data (traces, metrics, logs) from applications.

**The Three Pillars of Observability:**

1. **Traces** - Track the flow of operations through your app
   - "Button clicked → handlePress runs → State updates → UI re-renders"
   - Shows causality and timing for each step

2. **Metrics** - Numerical measurements over time
   - "Button clicked 50 times in the last hour"
   - "Average response time: 150ms"
   - Good for dashboards and alerts

3. **Logs** - Individual event records
   - "User clicked save button at 2:30pm"
   - Traditional logging, but correlated with traces

### Key Decision: Is OpenTelemetry Worth It for a Learning Project?

**Question Asked:** "Should we use OpenTelemetry for this simple app, or skip to Phase 3?"

**Discussion Points:**

**Pros:**
- Learn industry-standard observability tool
- Vendor-neutral (not locked to one service)
- Future-proof skill
- Professional development practice

**Cons:**
- Complex setup
- React Native support less mature than web
- Might be overkill for simple app
- Takes time away from building features

**Alternatives considered:**
- Sentry (easier, but vendor lock-in)
- React Native Debugger (built-in, but limited)
- Skip for now (focus on features first)

**Decision:** Continue with OpenTelemetry because:
1. User committed to learning professional tools
2. Already invested time in Phase 2 automation
3. Previous phase laid groundwork
4. Keep implementation simple (don't overdo it)

---

### React Native OpenTelemetry Compatibility Research

**Question:** "What versions work with React Native + Expo SDK 54?"

**Research findings:**
- OpenTelemetry JS packages work with React Native but aren't officially supported
- May break with minor version updates
- Callstack's `react-native-open-telemetry` exists but is "highly experimental"
- React Native support is "an area of active development"

**Warning signs:**
- Official docs say: "not explicitly supported for React Native"
- Community solutions are experimental
- Similar risk to Jest 30 compatibility issues

**Decision:** Proceed carefully with standard JS packages, using known compatible versions.

---

### Package Versions and Compatibility

**Packages already installed (from previous work):**
```json
"@opentelemetry/api": "^1.9.0",
"@opentelemetry/exporter-trace-otlp-http": "^0.53.0",  // Outdated!
"@opentelemetry/sdk-trace-base": "^1.26.0",
"@opentelemetry/sdk-trace-web": "^1.26.0"
```

**Version mismatch identified:**
- API: 1.9.0
- SDK packages: 1.26.0
- Exporter: 0.53.0 (very outdated!)

**Packages installed/upgraded:**
```bash
npm install @opentelemetry/exporter-trace-otlp-http@^0.54.0 \
  @opentelemetry/instrumentation@^0.54.0 \
  @opentelemetry/resources@^1.28.0 \
  @opentelemetry/semantic-conventions@^1.28.0
```

**Why these versions:**
- Exporter 0.54.x - Latest stable for exporters
- Instrumentation 0.54.x - Matches exporter version
- Resources 1.28.x - Matches SDK versions
- Semantic conventions 1.28.x - Matches SDK versions

---

### Key Concepts Learned

#### 1. Resources

**What is a Resource?**
Think of it like a name tag for your app.

**Analogy:**
```
Conference name tag:
┌─────────────────┐
│ Name: John      │
│ Company: Acme   │
│ Role: Developer │
└─────────────────┘

Resource for your app:
┌──────────────────────────────┐
│ Service: demo-react-native-app │
│ Version: 1.0.0                │
│ Environment: development       │
└──────────────────────────────┘
```

**Why needed:**
- Identifies which app sent the traces
- Helps distinguish between multiple apps/versions
- Provides context for observability backends

**Implementation:**
```typescript
const resource = new Resource({
  [ATTR_SERVICE_NAME]: 'demo-react-native-app',
  [ATTR_SERVICE_VERSION]: '1.0.0',
});
```

---

#### 2. Semantic Conventions

**What are Semantic Conventions?**
Agreed-upon standard names for attributes so all tools understand each other.

**The problem they solve:**
```
Without standards:
Developer A: app_name, app-name, application_name, serviceName
Developer B: service, service_name, name
→ Chaos! No consistency!

With standards:
Everyone: ATTR_SERVICE_NAME (which equals 'service.name')
→ Consistency! All tools understand!
```

**Why use constants instead of strings:**

**Bad (hardcoded strings):**
```typescript
const resource = new Resource({
  "service.name": "my-app",    // Typo risk!
  "service.version": "1.0.0",  // Is it "version" or "app_version"?
});
```

**Good (constants):**
```typescript
const resource = new Resource({
  [ATTR_SERVICE_NAME]: "my-app",      // TypeScript catches typos!
  [ATTR_SERVICE_VERSION]: "1.0.0",    // Standard names guaranteed!
});
```

---

#### 3. Side-Effect Imports

**Question:** "Why does just importing the telemetry file work? We're not using anything from it!"

**Answer:** Side-effect import - just run the code, don't import values.

**Normal import (using exported values):**
```typescript
import { tracer } from '../lib/telemetry';  // Import to use tracer
tracer.startSpan('my-span');  // Use it
```

**Side-effect import (just run the code):**
```typescript
import '../lib/telemetry';  // Just run the file
// The code inside telemetry.ts executes immediately
// provider.register() runs and sets up OpenTelemetry globally
```

**What happens at app startup:**
1. React Native loads `app/_layout.tsx`
2. Sees `import '../lib/telemetry'`
3. Runs all code in `telemetry.ts`
4. `provider.register()` makes OpenTelemetry available globally
5. Any file can now use `tracer.startSpan()`

---

### Telemetry Configuration Created

**File:** `lib/telemetry.ts`

**Step-by-step build (following learning methodology):**

**Step 1: Add imports**
```typescript
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
```

**Step 2: Create resource object**
```typescript
const resource = new Resource({
  [ATTR_SERVICE_NAME]: 'demo-react-native-app',
  [ATTR_SERVICE_VERSION]: '1.0.0',
});
```

**Step 3: Connect resource to provider**
```typescript
const provider = new WebTracerProvider({
  resource,  // JavaScript shorthand for { resource: resource }
});
```

**Final telemetry.ts structure:**
1. Imports (tracer, exporter, resource, conventions)
2. Resource definition (app metadata)
3. Provider creation (with resource)
4. Exporter configuration (where to send traces)
5. Span processor (batches traces for efficiency)
6. Provider registration (makes it global)
7. Tracer export (for other files to use)

---

### Testing OpenTelemetry Initialization

**Command:** `npm start`

**Success indicators:**
- ✅ App starts normally (no crash)
- ✅ No errors about OpenTelemetry in console
- ⚠️ Warning about "Failed to connect to localhost:4318" is okay (backend not set up yet)

**Unrelated warning encountered:**
```
WARN props.pointerEvents is deprecated. Use style.pointerEvents
```
- From react-native-web
- Not related to OpenTelemetry
- Noted to fix at end of Phase 2

---

## Step 2.6: Observability Backend Setup (Jaeger) ✅ COMPLETED

### Backend Options Discussion

**Two main options:**

**Option A: Jaeger (Local, Docker)**
- Runs on your computer
- Free forever
- No account needed
- Good for learning
- Need Docker installed
- Data lost when stopped

**Option B: Honeycomb (Cloud, Free Tier)**
- Cloud-based
- Data persists
- Professional tool
- Free: 20M events/month
- Need account
- Internet required

**Decision:** Jaeger (local) - Quick setup, perfect for learning.

---

### Docker Installation Check

**Commands to verify Docker:**
```bash
docker --version
# Docker version 28.3.2, build 578ccf6

docker ps
# Shows running containers
```

**User already had Docker installed and running.** ✅

---

### Jaeger Container Setup

#### Understanding the Docker Command

```bash
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

**Breaking it down:**
- `docker run` - Start a new container
- `-d` - Detached mode (runs in background)
- `--name jaeger` - Friendly name "jaeger"
- `-p 16686:16686` - Jaeger UI (web interface)
- `-p 4318:4318` - OTLP HTTP receiver (where app sends traces)
- `jaegertracing/all-in-one:latest` - Jaeger all-in-one image

**Why these ports:**
- **16686** - Open `http://localhost:16686` to view traces
- **4318** - App sends traces here (matches telemetry.ts URL)

**First run:**
- Downloads Jaeger image (~1 minute)
- Starts container
- Returns container ID

---

### CORS Issues and Resolution

#### Issue 1: CORS Not Enabled

**Error:**
```
Access to resource at 'http://localhost:4318/v1/traces' from origin 'http://localhost:8081'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.
```

**What is CORS?**
CORS = Cross-Origin Resource Sharing

**The problem:**
```
Your app (localhost:8081) → Trying to send data → Jaeger (localhost:4318)
Browser: "Different origins! Need permission!"
Jaeger: [no CORS headers]
Browser: "BLOCKED for security!"
```

**First attempted fix:**
Restart Jaeger with CORS headers:
```bash
docker run -d --name jaeger \
  -e COLLECTOR_OTLP_HTTP_CORS_ALLOWED_ORIGINS=* \
  -e COLLECTOR_OTLP_HTTP_CORS_ALLOWED_HEADERS=* \
  -p 16686:16686 -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

- `-e` sets environment variables
- `COLLECTOR_OTLP_HTTP_CORS_ALLOWED_ORIGINS=*` - Allow any origin
- `*` means "allow everything" (wildcard)

---

#### Issue 2: Wildcard Not Allowed with Credentials

**New error after wildcard fix:**
```
The value of the 'Access-Control-Allow-Origin' header must not be the wildcard '*'
when the request's credentials mode is 'include'.
```

**What this means:**
- ✅ CORS is now working (Jaeger sending headers)
- ❌ But exporter sends requests with `credentials: 'include'`
- ❌ Browser security: "Can't use wildcard with credentials!"

**The fix:**
Use **specific origin** instead of wildcard:

```bash
docker run -d --name jaeger \
  -e COLLECTOR_OTLP_HTTP_CORS_ALLOWED_ORIGINS=http://localhost:8081 \
  -e COLLECTOR_OTLP_HTTP_CORS_ALLOWED_HEADERS=* \
  -p 16686:16686 -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

**What changed:**
- Before: `COLLECTOR_OTLP_HTTP_CORS_ALLOWED_ORIGINS=*` (wildcard)
- After: `COLLECTOR_OTLP_HTTP_CORS_ALLOWED_ORIGINS=http://localhost:8081` (exact match)

**Success!** ✅ CORS now working with credentials.

---

#### Understanding Environment Variables vs Headers

**Question:** "Is COLLECTOR_OTLP_HTTP_CORS_ALLOWED_ORIGINS some kind of header we must send?"

**Answer:** No! It's an **environment variable** that configures Jaeger.

**How it works:**
1. You set environment variable when starting Jaeger
2. Jaeger reads this config
3. When Jaeger receives requests, it sends CORS headers in its **response**
4. You don't send it - Jaeger sends it

**Think of it like:**
```
You: Tell Jaeger "allow localhost:8081" (via -e flag)
Jaeger: Remembers this setting
Your app: Sends trace request
Jaeger: Responds with "Access-Control-Allow-Origin: http://localhost:8081"
Browser: "Perfect! I'll allow this."
```

---

## Step 2.7: Tracing Implementation (Basic) ✅ COMPLETED

### Adding First Trace to App

**Target:** Add tracing to button press in HomeScreen.

**Learning methodology followed:**
- Small steps
- User writes all code
- Explain before each addition
- Confirm completion at each step

---

#### Step 1: Import the Tracer

**File:** `app/(tabs)/index.tsx`

**Added:**
```typescript
import { tracer } from '../../lib/telemetry';
```

**Question answered:** "Why `../../lib/telemetry`?"
- `..` = up one folder (from `(tabs)` to `app`)
- `..` = up another folder (from `app` to project root)
- `/lib/telemetry` = the telemetry file

---

#### Step 2: Create Button Handler Function

**Before (inline function):**
```typescript
<Button title="Press me" onPress={() => setDisplayText(inputValue)} />
```

**After (named function):**
```typescript
const handlePress = () => {
  setDisplayText(inputValue);
};
```

**Why:**
- Need a function body to add tracing code
- Cleaner and more maintainable
- Can add multiple operations

---

#### Step 3: Update Button to Use Handler

**Changed:**
```typescript
<Button title="Press me" onPress={handlePress} />
```

**Why this works:**
- `handlePress` is already a function
- Pass function reference (not calling it)
- React calls it when button pressed

---

#### Step 4: Add Tracing Code

**Final handlePress function:**
```typescript
const handlePress = () => {
  // Create a span to track this operation
  const span = tracer.startSpan('button.press');

  // Add metadata about what happened
  span.setAttribute('input.length', inputValue.length);
  span.setAttribute('input.value', inputValue);

  // Do the actual work
  setDisplayText(inputValue);

  // End the span (marks operation as complete)
  span.end();
};
```

**Explanation of each part:**

1. **`tracer.startSpan('button.press')`**
   - Creates new span (trace event)
   - `'button.press'` is the operation name
   - Shows up in Jaeger UI

2. **`span.setAttribute(...)`**
   - Adds metadata to span
   - `'input.length'` - character count
   - `'input.value'` - actual text typed
   - Helps understand what happened

3. **`span.end()`**
   - Marks span as finished
   - Records timing (duration)
   - Sends trace to Jaeger

---

### Testing and Verification

**Steps:**
1. App running (hot-reloaded automatically)
2. Type text in input field
3. Press "Press me" button multiple times
4. Open Jaeger UI: http://localhost:16686
5. Select service: "demo-react-native-app"
6. Click "Find Traces"

**What appeared in Jaeger:**
- ✅ Service "demo-react-native-app" in dropdown
- ✅ List of traces with "button.press" operations
- ✅ Timing information for each trace
- ✅ Trace details showing attributes:
  - `service.name: demo-react-native-app`
  - `service.version: 1.0.0`
  - `input.length: X`
  - `input.value: "typed text"`

**Example trace ID:** `b07f4b84816c74b6e2b1e9855fbaaf12`

**Success!** 🎉 First OpenTelemetry trace working end-to-end!

---

### Understanding the Jaeger UI

**Trace overview shows:**
- **Trace ID** - Unique identifier
- **Service** - Which app sent it
- **Operation** - What happened
- **Duration** - How long it took
- **Timestamp** - When it occurred

**Clicking on a trace shows:**
1. Span timeline (visual representation)
2. Tags/Attributes (metadata)
3. Process information (service details)
4. Duration breakdown

**Value of this data:**
- See when users interact with app
- Understand what data they enter
- Measure operation performance
- Identify patterns and trends
- Debug issues with full context

---

## Key Learnings Summary

### Technical Concepts

1. **OpenTelemetry Architecture**
   - Resources (app metadata)
   - Semantic Conventions (standard names)
   - Providers (trace collection)
   - Exporters (sending data)
   - Spans (individual operations)

2. **CORS (Cross-Origin Resource Sharing)**
   - Browser security feature
   - Blocks cross-origin requests by default
   - Need specific headers to allow
   - Wildcard not allowed with credentials
   - Environment variables configure server responses

3. **Side-Effect Imports**
   - Import just to run code
   - Don't import values
   - Runs at module load time
   - Good for initialization

4. **Docker for Development**
   - Run services locally
   - Environment variables for config
   - Port mapping for access
   - Persistent containers vs ephemeral

### Development Practices

1. **Version Compatibility Matters**
   - Check versions before installing
   - Match related packages
   - Research known issues
   - Similar to Jest 30 problem

2. **Learning Methodology**
   - Small steps work better
   - User writes all code
   - Explain concepts before coding
   - Confirm understanding at each step
   - Document all learnings

3. **Troubleshooting Process**
   - Read error messages carefully
   - Understand what changed
   - Research specific errors
   - Try solutions incrementally
   - Verify each fix

### OpenTelemetry Concepts

1. **Three Pillars**
   - Traces (causality)
   - Metrics (measurements)
   - Logs (events)

2. **Vendor Neutrality**
   - One standard, many backends
   - Switch backends without code changes
   - Industry-wide adoption

3. **Observability Value**
   - Understand app behavior
   - Debug production issues
   - Measure performance
   - Track user interactions

---

## Questions Asked This Session

1. ✅ "Should we use OpenTelemetry or skip to Phase 3?" → Continue with OTel (user committed)
2. ✅ "What versions are compatible with React Native?" → Research showed experimental support
3. ✅ "What is a Resource?" → Metadata container identifying your app
4. ✅ "What are Semantic Conventions?" → Standard attribute names
5. ✅ "Why does side-effect import work?" → Code runs at module load
6. ✅ "Which backend: Jaeger or Honeycomb?" → Jaeger (local, simpler)
7. ✅ "What is CORS?" → Browser security for cross-origin requests
8. ✅ "Is COLLECTOR_OTLP_HTTP_CORS_ALLOWED_ORIGINS a header we send?" → No, it's an environment variable that configures Jaeger

---

## What's Next

**Completed:**
- ✅ Step 2.5: OpenTelemetry Foundation
- ✅ Step 2.6: Observability Backend Setup (Jaeger)
- ✅ Step 2.7: Basic Tracing Implementation

**Remaining in Phase 2:**
- ⏭️ Step 2.7 continued: Metrics & Logging
- ⏭️ Step 2.8: Error Tracking Strategy
- ⏭️ Step 2.9: Analytics Strategy
- ⏭️ Step 2.10: Development Automation

**To fix:**
- ⚠️ `pointerEvents` deprecation warning (noted for end of Phase 2)

---

**Last Updated:** 2025-10-23 (after OpenTelemetry setup)
**Current Session:** Step 2.7 - Ready to add Metrics and Logging examples

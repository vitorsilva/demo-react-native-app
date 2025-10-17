# React Native Learning Plan: From Zero to Mobile App

## Project: "React Native Text Echo" - Your First Mobile App

---

## Table of Contents
1. [How This Learning Plan Works](#how-this-learning-plan-works)
2. [Project Overview](#project-overview)
3. [Key Concepts & Technologies](#key-concepts--technologies)
4. [Phase 1: Understanding the Basics (COMPLETED)](#phase-1-understanding-the-basics-completed)
5. [Phase 2: Automation & Observability](#phase-2-automation--observability)
6. [Phase 3: State Persistence & Data Storage](#phase-3-state-persistence--data-storage)
7. [Phase 4: App Polish & Distribution](#phase-4-app-polish--distribution)
8. [Phase 5: Advanced Features](#phase-5-advanced-features)
9. [Project Structure](#project-structure)
10. [Testing & Debugging](#testing--debugging)
11. [Deployment Guide](#deployment-guide)
12. [Additional Resources](#additional-resources)

---

## How This Learning Plan Works

### Learning Methodology

This project follows a **guided, incremental learning approach**:

**📝 You Write the Code**
- The instructor provides step-by-step guidance
- You write all the code yourself
- No copy-pasting of large code blocks

**🔍 Very Small Steps**
- Each concept broken into digestible pieces
- One small change at a time
- Verify each step works before moving on

**💬 Questions Encouraged**
- Ask "why" at any point
- Request more detail when needed
- Explore tangential topics that interest you

**📚 Documentation of Learning**
- All questions and explanations captured in `PHASE*_LEARNING_NOTES.md` files
- Creates a personalized reference guide
- Review notes anytime to refresh concepts

### How Each Phase Works

1. **Instructor explains the concept** (brief overview)
2. **Instructor provides code snippet** (small, focused piece)
3. **You add the code to your file**
4. **You confirm when done**
5. **Test together and discuss results**
6. **Ask questions, get detailed explanations**
7. **Move to next small step**

### Example Flow

```
Instructor: "Add these two lines to create state..."
You: [Write the code]
You: "ok"
Instructor: "Great! Now add this button..."
You: [Write the code]
You: "wait, what does useState do again?"
Instructor: [Provides detailed explanation]
You: "ok I understand now, done"
Instructor: "Perfect! Let's test it..."
```

### Your Responsibilities

- ✅ Write the code yourself
- ✅ Let instructor know when each step is complete
- ✅ Ask questions when something is unclear
- ✅ Test each change before moving forward
- ✅ Let instructor know if something doesn't work

### Instructor's Responsibilities

- ✅ Break down tasks into very small steps
- ✅ Provide code in small, manageable pieces
- ✅ Wait for your confirmation before continuing
- ✅ Explain concepts in detail when asked
- ✅ Never write code for you (only guide you)
- ✅ Document all learnings in PHASE notes files

---

## Project Overview

### What You'll Build
A fully functional React Native mobile app that:
- Takes text input from a textbox
- Displays the text in real-time when button is pressed
- Saves data locally (persists between app restarts)
- Works on both Android and iOS
- Has proper app icons and splash screens
- Can be distributed through APK or app stores

### Final Result
By the end of this journey, you'll have:
- A working mobile app deployed on your device
- Understanding of React Native fundamentals
- Knowledge of React state management
- Ability to persist data locally
- Skills to build and distribute mobile apps
- Foundation to build more complex mobile applications

---

## Key Concepts & Technologies

### 1. React Native
**What is it?**
React Native is a framework for building native mobile applications using JavaScript and React. Instead of building separate apps for iOS and Android, you write once and deploy to both platforms.

**Key Characteristics:**
- **Cross-platform**: One codebase for iOS and Android
- **Native components**: Uses real native UI components (not web views)
- **Hot reload**: See changes instantly during development
- **JavaScript/TypeScript**: Use familiar web technologies
- **Large ecosystem**: Thousands of libraries and packages
- **React-based**: Uses React concepts (components, hooks, state)

**React Native vs Web:**
```
Web                    React Native
<div>          →      <View>
<span>/<p>     →      <Text>
<input>        →      <TextInput>
<button>       →      <Button> or <Pressable>
CSS            →      StyleSheet (inline styles)
```

### 2. Expo
**What is it?**
Expo is a platform and set of tools built around React Native that makes development easier. It provides pre-configured native modules, development tools, and build services.

**Why Use Expo?**
- **No native code setup**: No need for Xcode or Android Studio initially
- **Managed workflow**: Expo handles native configuration
- **Built-in modules**: Camera, location, push notifications, etc.
- **Easy builds**: Cloud-based build service (EAS Build)
- **OTA updates**: Push updates without app store approval
- **Development tools**: Expo Go app for testing

**Expo vs Bare React Native:**
- **Expo**: Easier, faster to start, some limitations
- **Bare**: More control, access to all native code, more setup

### 3. JSX/TSX
**What is it?**
JSX (JavaScript XML) or TSX (TypeScript XML) is a syntax extension that lets you write HTML-like code in JavaScript/TypeScript files.

**Example:**
```tsx
// This looks like HTML, but it's JavaScript!
const element = (
  <View>
    <Text>Hello World!</Text>
  </View>
);
```

**Key Points:**
- Gets compiled to regular JavaScript
- You can embed JavaScript expressions with `{}`
- Component names must be capitalized
- All tags must be closed (`<View />` or `<View></View>`)

### 4. React Hooks
**What are they?**
Hooks are functions that let you use React features (like state) in functional components.

**Common Hooks:**

#### useState
Manages component state:
```tsx
const [value, setValue] = useState('initial');
// value: current state
// setValue: function to update state
```

#### useEffect
Runs side effects (data fetching, subscriptions):
```tsx
useEffect(() => {
  // Runs after render
  console.log('Component mounted');
}, []); // Empty array = run once
```

#### useCallback
Memoizes functions:
```tsx
const handlePress = useCallback(() => {
  console.log('Pressed');
}, []);
```

### 5. StyleSheet
**What is it?**
React Native's way of styling components. Similar to CSS but uses JavaScript objects.

**Key Differences from CSS:**
- All properties are camelCase (`backgroundColor`, not `background-color`)
- No units for dimensions (everything is in density-independent pixels)
- Flexbox by default (no `display: flex` needed)
- Limited set of properties compared to CSS

**Example:**
```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,              // Fill available space
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,         // No 'px' needed
    fontWeight: 'bold',
  },
});
```

### 6. Flexbox Layout
**What is it?**
The primary layout system in React Native. All containers use flexbox by default.

**Key Properties:**
- `flex`: How much space to take relative to siblings
- `flexDirection`: 'row' or 'column' (default: 'column')
- `justifyContent`: Main axis alignment (vertical by default)
- `alignItems`: Cross axis alignment (horizontal by default)

**Important Difference:**
- **Web**: Default flexDirection is 'row'
- **React Native**: Default flexDirection is 'column'

### 7. EAS (Expo Application Services)
**What is it?**
Cloud-based services for building and submitting React Native apps.

**Key Services:**
- **EAS Build**: Build iOS and Android apps in the cloud
- **EAS Submit**: Submit to app stores
- **EAS Update**: Push over-the-air updates

**Benefits:**
- No need for Mac to build iOS apps
- No need to configure Android Studio
- Consistent build environment
- CI/CD integration

---

## Phase 1: Understanding the Basics (COMPLETED)

### Goal
Build a basic working mobile app and understand React Native fundamentals.

### ✅ What You Accomplished

#### Step 1.1: Project Setup
**What you learned**: Expo CLI, project creation, file structure

**Key Concepts:**
- Created project with `npx create-expo-app@latest`
- Understood Expo vs bare React Native
- Learned about the file structure
- Used `expo start` to run development server

**Testing:**
- App loaded in Expo Go on mobile device
- Development server connected successfully

#### Step 1.2: Basic Components
**What you learned**: Core React Native components, JSX syntax

**Key Concepts:**
- `<View>` as container (like `<div>`)
- `<Text>` for displaying text (required for any text!)
- `<TextInput>` for text entry
- `<Button>` for user actions

**Testing:**
- Rendered "Hello World" text
- Added a text input
- Added a button

#### Step 1.3: State Management
**What you learned**: React hooks, state, controlled components

**Key Concepts:**
- `useState` hook for managing state
- Controlled components (value + onChange)
- State updates trigger re-renders
- Difference between state and direct DOM manipulation

**Code Example:**
```tsx
const [inputValue, setInputValue] = useState('');
const [displayText, setDisplayText] = useState('');
```

**Testing:**
- Type in input, value updates
- Press button, display text updates
- State persists during interaction (but not between sessions)

#### Step 1.4: Styling
**What you learned**: StyleSheet API, React Native styling

**Key Concepts:**
- `StyleSheet.create()` for defining styles
- Flexbox layout (default in React Native)
- Inline styles vs StyleSheet
- No CSS units needed

**Testing:**
- Styles applied correctly
- Layout centered on screen
- Text visible with proper color

#### Step 1.5: Development Workflow
**What you learned**: Hot reload, debugging, testing on device

**Key Concepts:**
- Expo Go app for testing
- Port 8081 for Metro bundler
- Firewall configuration
- QR code scanning for connection

**Testing:**
- Code changes reflected immediately
- App running smoothly on physical device

#### Step 1.6: Building APK
**What you learned**: EAS Build, deployment process

**Key Concepts:**
- EAS CLI installation and login
- `eas build:configure` creates eas.json
- Cloud builds vs local builds
- APK vs AAB formats
- Build profiles (development, preview, production)

**Commands:**
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

**Testing:**
- APK built successfully
- Installed on device
- Bypassed Play Protect warnings
- App runs independently (no Expo Go needed)

#### Step 1.7: App Configuration
**What you learned**: app.json configuration, icons, splash screens

**Key Concepts:**
- `app.json` contains all app metadata
- Package name for Android
- Icon and splash screen assets
- Adaptive icons for Android
- EAS project ID

**Testing:**
- Custom icons display correctly
- Splash screen shows on launch
- App has proper identity

---

## Phase 2: Automation & Observability (8-12 hours)

### Goal
Establish professional development practices with automated testing, code quality tools, CI/CD pipelines, and observability using OpenTelemetry before adding new features.

### Why This Phase Matters
Setting up automation and observability from the beginning:
- Catches bugs before they reach users
- Maintains code quality automatically
- Provides immediate feedback on changes
- Gives visibility into production issues
- Establishes professional habits early
- Makes future development faster and safer

---

### Step 2.1: Testing Foundation (1-2 hours)

**What you'll learn**: Unit testing with Jest, component testing, test coverage

**Tool Discussion Time:**
Before we start, let's discuss:
- **Q**: Why Jest? Are there alternatives?
- **A**: Jest comes pre-configured with Expo. Alternatives include Vitest (faster, more modern) and Mocha. For React Native, Jest has the best ecosystem support and React Native Testing Library integration.
- **Q**: Do we really need tests for such a simple app?
- **A**: Yes! Even simple apps benefit from tests. They serve as documentation, catch regressions, and teach good habits.
- **Q**: What's a realistic coverage goal? 80%? 100%?
- **A**: For learning: 60-70% is fine. For production: 80%+ for critical paths. 100% is often unrealistic and may test implementation details instead of behavior.

**Key Concepts:**
- Unit tests verify individual functions work correctly
- Component tests verify UI behaves as expected
- Mocking isolates code under test
- Coverage shows which code is tested
- @testing-library/react-native focuses on user behavior

**Installation:**
```bash
# Testing library for React Native components
npm install --save-dev @testing-library/react-native

# Additional matchers for better assertions
npm install --save-dev @testing-library/jest-native
```

**Configuration:**
Create/update `jest.config.js`:
```js
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

**First Test - HomeScreen Component:**
Create `app/(tabs)/__tests__/index.test.tsx`:
```tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../index';

describe('HomeScreen', () => {
  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<HomeScreen />);

    expect(getByText('Hello World!')).toBeTruthy();
    expect(getByPlaceholderText('Type here...')).toBeTruthy();
  });

  it('updates display text when button is pressed', () => {
    const { getByPlaceholderText, getByText } = render(<HomeScreen />);

    const input = getByPlaceholderText('Type here...');
    const button = getByText('Press me');

    // Type some text
    fireEvent.changeText(input, 'Test message');

    // Press the button
    fireEvent.press(button);

    // Check if the text appears
    expect(getByText('Test message')).toBeTruthy();
  });
});
```

**Add Scripts to package.json:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**Testing:**
```bash
npm test
npm run test:coverage
```

**Discussion Questions:**
- How do we know what to test?
- When should we mock vs use real implementations?
- Snapshot tests - useful or brittle?

---

### Step 2.2: Linting & Formatting (30 min - 1 hour)

**What you'll learn**: ESLint configuration, Prettier setup, pre-commit hooks

**Tool Discussion Time:**
- **Q**: ESLint vs alternatives - is it still the best?
- **A**: ESLint is still the standard for JavaScript/TypeScript. Alternatives like Biome are emerging but less mature. ESLint has the largest ecosystem.
- **Q**: Prettier - love it or hate it? Why use an opinionated formatter?
- **A**: Prettier eliminates bike-shedding about code style. Teams spend zero time debating formatting. Trade-off: less flexibility, but huge time savings.
- **Q**: Pre-commit hooks - helpful or annoying?
- **A**: Initially annoying if code is messy, but prevents bad commits from entering history. Can be bypassed with `--no-verify` in emergencies.

**Key Concepts:**
- Linters find code problems (bugs, bad practices)
- Formatters make code consistent (style, spacing)
- Pre-commit hooks run checks before commits
- Configuration can be shared across team

**ESLint Setup:**
Expo already includes ESLint! Check `eslint.config.js`.

Let's strengthen it:
```bash
npm install --save-dev eslint-plugin-react-hooks
```

**Prettier Setup:**
```bash
npm install --save-dev prettier eslint-config-prettier
```

Create `.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

**Pre-commit Hooks Discussion:**
- **Q**: Husky vs lint-staged vs lefthook?
- **A**: Husky is most popular. Lefthook is faster (Rust-based). lint-staged runs linters only on staged files (faster). We'll use Husky + lint-staged combo.

**Install Husky & lint-staged:**
```bash
npm install --save-dev husky lint-staged
npx husky init
```

**Configure lint-staged:**
Add to `package.json`:
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

**Create pre-commit hook:**
```bash
echo "npx lint-staged" > .husky/pre-commit
```

**Add Scripts:**
```json
{
  "scripts": {
    "lint": "expo lint",
    "lint:fix": "expo lint --fix",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\""
  }
}
```

**Testing:**
```bash
npm run lint
npm run format
# Make a change and try to commit with lint errors
```

---

### Step 2.3: CI/CD Pipeline (1-2 hours)

**What you'll learn**: Automated builds, testing on every commit, GitHub Actions

**Platform Discussion:**
- **Q**: GitHub Actions vs GitLab CI vs CircleCI?
- **A**:
  - GitHub Actions: Free tier generous (2000 min/month), tight GitHub integration, huge marketplace
  - GitLab CI: Better for GitLab users, generous free tier
  - CircleCI: Good free tier, fast, but requires separate account
  - **Recommendation**: GitHub Actions (assuming you're using GitHub)

**Q**: What should run on every push vs only on main branch?
**A**:
- Every push: Linting, unit tests (fast feedback)
- Main branch only: Builds, deployment (slower, expensive)
- Pull requests: Everything (gate quality)

**Key Concepts:**
- CI (Continuous Integration): Automatically test code changes
- CD (Continuous Deployment): Automatically deploy passing code
- Workflows: YAML files defining automation steps
- Actions: Reusable components in workflows
- Artifacts: Files produced by workflows (APKs, coverage reports)

**Create GitHub Actions Workflow:**

`.github/workflows/ci.yml`:
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

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

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
          fail_ci_if_error: false
```

**EAS Build Automation:**

`.github/workflows/eas-build.yml`:
```yaml
name: EAS Build

on:
  push:
    branches: [ main ]
  workflow_dispatch: # Manual trigger

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Build Android APK
        run: eas build --platform android --profile preview --non-interactive
```

**Setup Secrets:**
1. Get Expo token: `eas whoami` then create token in Expo dashboard
2. Add to GitHub: Settings → Secrets → Actions → New secret
3. Name: `EXPO_TOKEN`, Value: your token

**Add Status Badges to README.md:**
```markdown
![CI](https://github.com/YOUR_USERNAME/demo-react-native-app/workflows/CI/badge.svg)
![Coverage](https://codecov.io/gh/YOUR_USERNAME/demo-react-native-app/branch/main/graph/badge.svg)
```

**Testing:**
- Push to main branch
- Check Actions tab in GitHub
- Verify all steps pass

**Discussion:**
- How often should builds run? Every commit or scheduled?
- Notifications - Slack/Discord/Email when builds fail?
- Should CI block merging or just warn?

---

### Step 2.4: OpenTelemetry Foundation (1-2 hours)

**What you'll learn**: Modern observability, traces/metrics/logs, vendor-neutral instrumentation

**OpenTelemetry Discussion:**
- **Q**: What IS OpenTelemetry? Why not just use Sentry or Datadog SDK?
- **A**: OpenTelemetry is a vendor-neutral standard for collecting telemetry (traces, metrics, logs). Benefits:
  - **Vendor Independence**: Switch backends (Jaeger → Honeycomb → Datadog) without changing code
  - **Industry Standard**: CNCF project, widely adopted
  - **Future-Proof**: More tools adding OTel support
  - **Unified**: One SDK for traces, metrics, logs

- **Q**: React Native OTel maturity - is it production-ready?
- **A**: Honest answer: OpenTelemetry for React Native is less mature than web/backend. Some caveats:
  - Core instrumentation works well
  - Auto-instrumentation limited compared to web
  - Some exporters may need workarounds
  - Community smaller than web
  - **Recommendation**: Great for learning, usable in production with testing

- **Q**: Vendor lock-in vs simplicity - isn't Sentry easier?
- **A**: Yes! Sentry is simpler. Trade-off:
  - Sentry: Easier setup, better DX, some lock-in
  - OpenTelemetry: More setup, flexibility, no lock-in
  - **Hybrid**: Use both! Sentry for errors, OTel for traces/metrics

**The Three Pillars of Observability:**

1. **Traces**: Track requests through your app
   - "Button clicked → State updated → Data saved → UI re-rendered"
   - Shows causality and timing

2. **Metrics**: Numerical measurements over time
   - "Button clicked 50 times in last hour"
   - "Average save time: 100ms"
   - Good for dashboards and alerts

3. **Logs**: Individual event records
   - "User clicked save button at 2:30pm"
   - Traditional logging, but structured and correlated with traces

**Key Concepts:**
- **Span**: A single operation (e.g., "save data")
- **Trace**: Collection of spans showing full request path
- **Attributes**: Key-value metadata on spans/metrics
- **Context**: Connects spans across async operations
- **Exporter**: Sends telemetry to backend (Jaeger, Honeycomb, etc.)

**Installation:**
```bash
npm install @opentelemetry/api
npm install @opentelemetry/sdk-trace-base
npm install @opentelemetry/sdk-trace-web
npm install @opentelemetry/exporter-trace-otlp-http
npm install @opentelemetry/instrumentation
npm install @opentelemetry/context-async-hooks
```

**Basic Setup:**

Create `lib/telemetry.ts`:
```typescript
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'demo-react-native-app',
  [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
});

const provider = new WebTracerProvider({ resource });

// Configure exporter (we'll add backend in next step)
const exporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces', // Local for now
});

provider.addSpanProcessor(new BatchSpanProcessor(exporter));
provider.register();

export const tracer = provider.getTracer('demo-app-tracer');
```

**Initialize in app/_layout.tsx:**
```tsx
import './lib/telemetry'; // Add at top
```

**Testing:**
- Code compiles without errors
- App still runs normally
- Console shows OTel initialization (if logging enabled)

**Discussion Questions:**
- Is the complexity worth it for a small app?
- When would you choose OTel vs simpler solution?
- What are the performance implications?

---

### Step 2.5: Observability Backend Setup (1-2 hours)

**What you'll learn**: Choosing and configuring a telemetry backend

**Backend Discussion:**
- **Q**: Self-hosted vs commercial - what's best for learning?
- **A**:
  - **Local (Jaeger)**: Free, no account, good for learning, not for production
  - **Cloud Free Tier (Honeycomb, Lightstep)**: Free tier sufficient, easy setup, real production tool
  - **Self-hosted Stack (Grafana + Tempo)**: Free but complex setup, full control
  - **Commercial (Datadog, New Relic)**: Best features, expensive, generous trials

- **Q**: Which backend should I use?
- **A**: For this learning project:
  - **Start**: Jaeger locally (simplest)
  - **Then**: Honeycomb free tier (real cloud experience)
  - **Later**: Explore others if interested

**Option A: Jaeger (Local)**

Install Jaeger using Docker:
```bash
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

Access UI: http://localhost:16686

**Option B: Honeycomb (Cloud Free Tier)**

1. Sign up at honeycomb.io (free tier: 20M events/month)
2. Create dataset: "demo-react-native-app"
3. Get API key
4. Update exporter configuration:

```typescript
const exporter = new OTLPTraceExporter({
  url: 'https://api.honeycomb.io/v1/traces',
  headers: {
    'x-honeycomb-team': 'YOUR_API_KEY',
    'x-honeycomb-dataset': 'demo-react-native-app',
  },
});
```

**Option C: Grafana Cloud (Free Tier)**

1. Sign up at grafana.com (free tier: 50GB/month)
2. Get OTLP endpoint and credentials
3. Configure exporter with auth

**Environment Variables:**

Create `.env`:
```
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_EXPORTER_OTLP_HEADERS=
OTEL_SERVICE_NAME=demo-react-native-app
```

Add to `.gitignore`:
```
.env
.env.local
```

Install dotenv:
```bash
npm install dotenv
```

Update `lib/telemetry.ts` to use env vars:
```typescript
import 'dotenv/config';

const exporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
  headers: process.env.OTEL_EXPORTER_OTLP_HEADERS
    ? JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS)
    : {},
});
```

**Testing:**
- Start your chosen backend
- Run app
- Check backend UI for service appearing
- Verify connection (even if no traces yet)

---

### Step 2.6: Tracing Implementation (1-2 hours)

**What you'll learn**: Instrumenting code, creating spans, adding attributes

**Key Concepts:**
- Manual instrumentation: Explicitly create spans
- Automatic instrumentation: Libraries create spans automatically
- Span attributes: Metadata about what happened
- Span events: Points in time within a span
- Span context: Links spans together into traces

**Instrument Button Press:**

Update `app/(tabs)/index.tsx`:
```tsx
import { trace } from '@opentelemetry/api';
import { tracer } from '../../lib/telemetry';

export default function HomeScreen() {
  const [inputValue, setInputValue] = useState('');
  const [displayText, setDisplayText] = useState('');

  const handlePress = () => {
    // Create a span for this operation
    const span = tracer.startSpan('button.press');

    try {
      span.setAttribute('input.length', inputValue.length);
      span.setAttribute('input.value', inputValue);

      // Do the actual work
      setDisplayText(inputValue);

      span.setStatus({ code: SpanStatusCode.OK });
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
      });
      span.recordException(error);
    } finally {
      span.end();
    }
  };

  // ... rest of component
}
```

**Instrument AsyncStorage (Next Phase Preview):**

When you add AsyncStorage in Phase 3, instrument it:
```tsx
const saveData = async () => {
  const span = tracer.startSpan('storage.save');

  try {
    span.setAttribute('key', 'savedText');
    span.setAttribute('value.length', inputValue.length);

    await AsyncStorage.setItem('savedText', inputValue);
    setDisplayText(inputValue);

    span.setStatus({ code: SpanStatusCode.OK });
  } catch (error) {
    span.setStatus({ code: SpanStatusCode.ERROR });
    span.recordException(error);
    console.error('Error saving data:', error);
  } finally {
    span.end();
  }
};
```

**Helper Function for Cleaner Code:**

Create `lib/tracing-helpers.ts`:
```typescript
import { tracer } from './telemetry';
import { SpanStatusCode } from '@opentelemetry/api';

export async function traceAsync<T>(
  name: string,
  fn: () => Promise<T>,
  attributes?: Record<string, any>
): Promise<T> {
  const span = tracer.startSpan(name);

  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      span.setAttribute(key, value);
    });
  }

  try {
    const result = await fn();
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.setStatus({ code: SpanStatusCode.ERROR });
    span.recordException(error as Error);
    throw error;
  } finally {
    span.end();
  }
}

export function traceSync<T>(
  name: string,
  fn: () => T,
  attributes?: Record<string, any>
): T {
  const span = tracer.startSpan(name);

  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      span.setAttribute(key, value);
    });
  }

  try {
    const result = fn();
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.setStatus({ code: SpanStatusCode.ERROR });
    span.recordException(error as Error);
    throw error;
  } finally {
    span.end();
  }
}
```

Usage:
```tsx
const handlePress = () => {
  traceSync('button.press', () => {
    setDisplayText(inputValue);
  }, {
    'input.length': inputValue.length,
  });
};
```

**Testing:**
- Press button in app
- Check backend UI
- Find trace for button press
- Verify attributes are present
- Check timing information

**Discussion:**
- **Q**: How much tracing is too much?
- **A**: Trace:
  - User interactions (button clicks, navigation)
  - Async operations (API calls, storage)
  - Expensive computations
  - DON'T trace: Every render, every state update, hot paths
  - Rule of thumb: If it might be slow or fail, trace it

- **Q**: Performance impact?
- **A**: OpenTelemetry adds ~1-2ms overhead per span. Batching reduces impact. For mobile: trace selectively, use sampling in production.

---

### Step 2.7: Metrics & Logging (1-2 hours)

**What you'll learn**: Collecting metrics, structured logging, correlating logs with traces

**Metrics Setup:**

Install metrics packages:
```bash
npm install @opentelemetry/sdk-metrics
npm install @opentelemetry/exporter-metrics-otlp-http
```

Update `lib/telemetry.ts`:
```typescript
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';

// ... existing trace setup ...

// Metrics setup
const metricExporter = new OTLPMetricExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/metrics',
});

const meterProvider = new MeterProvider({ resource });

meterProvider.addMetricReader(
  new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 60000, // Export every 60 seconds
  })
);

export const meter = meterProvider.getMeter('demo-app-meter');
```

**Create Metrics:**

```typescript
// Counter: Tracks total count (only goes up)
const buttonPressCounter = meter.createCounter('button.presses', {
  description: 'Number of times button was pressed',
});

// Histogram: Records distribution of values
const inputLengthHistogram = meter.createHistogram('input.length', {
  description: 'Length of input text',
  unit: 'characters',
});

// Observable Gauge: Point-in-time measurement
const activeUsersGauge = meter.createObservableGauge('users.active', {
  description: 'Number of active users',
});

// In your component:
const handlePress = () => {
  buttonPressCounter.add(1, {
    screen: 'home',
  });

  inputLengthHistogram.record(inputValue.length, {
    screen: 'home',
  });

  setDisplayText(inputValue);
};
```

**Structured Logging:**

Install logging library:
```bash
npm install pino
npm install pino-opentelemetry-transport
```

Create `lib/logger.ts`:
```typescript
import pino from 'pino';
import { trace, context } from '@opentelemetry/api';

const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-opentelemetry-transport',
    options: {
      // Configure OTLP endpoint for logs
    },
  },
});

// Helper to include trace context in logs
export function getLogger(component: string) {
  return {
    info: (msg: string, data?: any) => {
      const span = trace.getActiveSpan();
      logger.info({
        component,
        traceId: span?.spanContext().traceId,
        spanId: span?.spanContext().spanId,
        ...data,
      }, msg);
    },
    error: (msg: string, error?: Error, data?: any) => {
      const span = trace.getActiveSpan();
      logger.error({
        component,
        traceId: span?.spanContext().traceId,
        spanId: span?.spanContext().spanId,
        error: error?.message,
        stack: error?.stack,
        ...data,
      }, msg);
    },
    // Add warn, debug as needed
  };
}
```

**Usage:**
```tsx
import { getLogger } from '../../lib/logger';

const log = getLogger('HomeScreen');

const handlePress = () => {
  log.info('Button pressed', {
    inputLength: inputValue.length,
  });

  setDisplayText(inputValue);
};
```

**Discussion:**
- **Q**: What metrics matter for a mobile app?
- **A**: Key mobile metrics:
  - App launch time
  - Screen load time
  - Button/interaction counts
  - Error rates
  - Crash rates (next section)
  - Network request latency
  - Battery/memory (advanced)

---

### Step 2.8: Error Tracking Strategy (1 hour)

**What you'll learn**: Error boundaries, crash reporting, integrating with OTel

**Strategy Discussion:**
- **Q**: OpenTelemetry for errors vs Sentry vs both?
- **A**: Recommended hybrid approach:
  - **Sentry**: User-facing errors, crashes, full context (screenshots, breadcrumbs)
  - **OpenTelemetry**: Application errors as part of traces, metrics on error rates
  - **Why both**: Sentry excels at error UX, OTel excels at causality

- **Q**: Does Sentry support OpenTelemetry?
- **A**: Yes! Sentry has OTel integration. Can:
  - Send OTel traces to Sentry
  - Sentry errors appear in OTel traces
  - Best of both worlds

**Error Boundary:**

Create `components/ErrorBoundary.tsx`:
```tsx
import React, { Component, ReactNode } from 'react';
import { View, Text, Button } from 'react-native';
import { getLogger } from '../lib/logger';

const log = getLogger('ErrorBoundary');

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    log.error('React error boundary caught error', error, {
      componentStack: errorInfo.componentStack,
    });

    // Also send to Sentry if using it
    // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 20, marginBottom: 10 }}>Something went wrong</Text>
          <Text style={{ color: '#666', marginBottom: 20 }}>{this.state.error?.message}</Text>
          <Button
            title="Try again"
            onPress={() => this.setState({ hasError: false, error: null })}
          />
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Wrap App in Error Boundary:**

Update `app/_layout.tsx`:
```tsx
import ErrorBoundary from '../components/ErrorBoundary';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      {/* existing layout */}
    </ErrorBoundary>
  );
}
```

**Sentry Integration (Optional but Recommended):**

```bash
npx expo install sentry-expo
```

Configure `app.json`:
```json
{
  "expo": {
    "plugins": ["sentry-expo"],
    "hooks": {
      "postPublish": [
        {
          "file": "sentry-expo/upload-sourcemaps",
          "config": {
            "organization": "your-org",
            "project": "demo-react-native-app"
          }
        }
      ]
    }
  }
}
```

Initialize in `app/_layout.tsx`:
```tsx
import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  enableInExpoDevelopment: true,
  debug: true,
});
```

**Integrating Sentry with OpenTelemetry:**

```typescript
import * as Sentry from 'sentry-expo';
import { trace } from '@opentelemetry/api';

// In error handler:
const span = trace.getActiveSpan();
Sentry.captureException(error, {
  contexts: {
    trace: {
      trace_id: span?.spanContext().traceId,
      span_id: span?.spanContext().spanId,
    },
  },
});
```

**Testing:**
Create a test crash button:
```tsx
<Button
  title="Test Crash"
  onPress={() => { throw new Error('Test crash'); }}
/>
```

Verify error appears in:
- Error boundary
- Logs (console/backend)
- Sentry (if configured)

---

### Step 2.9: Analytics Strategy (30 min - 1 hour)

**What you'll learn**: Analytics choices, privacy considerations, event tracking

**Analytics Discussion:**
- **Q**: Do we need dedicated analytics or is OTel enough?
- **A**: Depends on use case:
  - **OTel Sufficient**: Technical metrics, performance, errors
  - **Dedicated Analytics**: User behavior, funnels, retention, A/B testing
  - **Both**: Use OTel for system metrics, analytics for product metrics

- **Q**: Privacy - what should we track? User consent?
- **A**: Important considerations:
  - **GDPR/Privacy laws**: May require consent for analytics
  - **PII**: Never log emails, passwords, sensitive data
  - **Best practice**: Anonymous user IDs, aggregated data
  - **This project**: We're learning, so we'll track only technical events (no PII)

**Options:**
1. **OpenTelemetry Only**: Send events as metrics/spans
2. **Expo Analytics**: Simple, built-in, limited features
3. **Segment**: Meta-tool, sends to multiple destinations
4. **Amplitude/Mixpanel**: Feature-rich, good for product analytics
5. **Google Analytics**: Free, privacy concerns, overkill for mobile

**Implementation with OpenTelemetry:**

```typescript
// lib/analytics.ts
import { meter } from './telemetry';

const screenViewCounter = meter.createCounter('screen.views', {
  description: 'Screen view events',
});

const userActionCounter = meter.createCounter('user.actions', {
  description: 'User interaction events',
});

export const analytics = {
  screenView: (screenName: string) => {
    screenViewCounter.add(1, {
      screen: screenName,
    });
  },

  userAction: (action: string, metadata?: Record<string, string>) => {
    userActionCounter.add(1, {
      action,
      ...metadata,
    });
  },
};
```

**Usage:**
```tsx
import { analytics } from '../../lib/analytics';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  useFocusEffect(() => {
    analytics.screenView('home');
  });

  const handlePress = () => {
    analytics.userAction('button_press', {
      inputLength: String(inputValue.length),
    });
    setDisplayText(inputValue);
  };
}
```

**Testing:**
- Navigate between screens
- Check metrics in backend
- Verify events are recorded

---

### Step 2.10: Development Automation (1 hour)

**What you'll learn**: Git hooks in practice, useful scripts, VS Code setup

**Git Hooks Discussion:**
- **Q**: Are git hooks a productivity booster or pain point?
- **A**: Depends on configuration:
  - **Helpful**: Fast checks (linting, formatting), prevents obvious mistakes
  - **Annoying**: Slow checks (full test suite), overly strict rules
  - **Key**: Keep pre-commit fast (<5 seconds), heavy checks in CI

**Useful npm Scripts:**

Add to `package.json`:
```json
{
  "scripts": {
    "dev": "expo start",
    "dev:clear": "expo start --clear",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "expo lint",
    "lint:fix": "expo lint --fix",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,md}\"",
    "type-check": "tsc --noEmit",
    "validate": "npm run type-check && npm run lint && npm test",
    "build:preview": "eas build --platform android --profile preview",
    "build:production": "eas build --platform android --profile production"
  }
}
```

**VS Code Workspace Settings:**

Create `.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.exclude": {
    "**/.expo": true,
    "**/.expo-shared": true,
    "**/node_modules": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/.expo": true,
    "**/coverage": true
  }
}
```

**Recommended Extensions:**

`.vscode/extensions.json`:
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "expo.vscode-expo-tools",
    "orta.vscode-jest",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

**Git Commit Message Convention:**

Install commitlint:
```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

Create `commitlint.config.js`:
```js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting
        'refactor', // Code restructuring
        'test',     // Adding tests
        'chore',    // Maintenance
      ],
    ],
  },
};
```

Add commit-msg hook:
```bash
echo "npx commitlint --edit \$1" > .husky/commit-msg
```

**Example good commit messages:**
```
feat: add user authentication
fix: resolve AsyncStorage crash on Android
test: add HomeScreen component tests
docs: update README with setup instructions
```

**Testing:**
```bash
# Try a bad commit message
git commit -m "updated stuff"  # Fails

# Try a good commit message
git commit -m "feat: add button press tracking"  # Passes
```

---

### Phase 2 Summary

**What You've Accomplished:**
✅ Automated testing with Jest and React Native Testing Library
✅ Code quality enforcement with ESLint and Prettier
✅ Pre-commit hooks to prevent bad code
✅ CI/CD pipeline with GitHub Actions
✅ OpenTelemetry instrumentation for observability
✅ Telemetry backend (Jaeger/Honeycomb)
✅ Tracing, metrics, and structured logging
✅ Error tracking strategy with error boundaries
✅ Analytics event tracking
✅ Development workflow automation

**Key Takeaways:**
- Automation saves time and catches bugs early
- OpenTelemetry provides vendor-neutral observability
- Testing gives confidence when refactoring
- CI/CD provides fast feedback on changes
- Error tracking helps diagnose production issues
- Good developer experience speeds up development

**Trade-offs Discussed:**
- Complexity vs simplicity (OTel vs Sentry)
- Setup time vs long-term benefits
- Vendor lock-in vs ease of use
- Fast checks vs comprehensive checks

**What's Different Now:**
Before Phase 2:
- Manual testing only
- No code quality checks
- No visibility into production
- Manual builds

After Phase 2:
- Automated tests run on every change
- Code quality enforced automatically
- Full observability into app behavior
- Automated builds and deployments
- Professional development workflow

**Next Steps:**
Now that we have solid automation and observability foundations, we're ready to add new features with confidence. Phase 3 will add data persistence, and we'll be able to:
- Write tests for new code
- Track how storage operations perform
- Catch errors in storage logic
- Monitor storage metrics

---

## Phase 3: State Persistence & Data Storage (2-3 hours)

### Goal
Make your app remember data between sessions using local storage.

### Step 2.1: Introduction to AsyncStorage
**What you'll learn**: Persistent storage on mobile

**Key Concepts:**
- AsyncStorage is like localStorage but for React Native
- Asynchronous (requires await)
- Stores key-value pairs as strings
- Data persists between app restarts
- Must serialize/deserialize complex data (JSON)

**Installation:**
```bash
npx expo install @react-native-async-storage/async-storage
```

**Testing:**
- Package installed successfully
- Import works without errors

### Step 2.2: Save Data on Button Press
**What you'll learn**: Writing to persistent storage

**Key Concepts:**
- Use `AsyncStorage.setItem(key, value)`
- Must use `async/await` or `.then()`
- Data must be a string (use `JSON.stringify()` if needed)
- Error handling with try/catch

**Implementation:**
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

const saveData = async () => {
  try {
    await AsyncStorage.setItem('savedText', inputValue);
    setDisplayText(inputValue);
  } catch (error) {
    console.error('Error saving data:', error);
  }
};
```

**Testing:**
- Type text and press button
- Check console for errors
- Close and reopen app (data should persist)

### Step 2.3: Load Data on App Start
**What you'll learn**: Reading from persistent storage, useEffect hook

**Key Concepts:**
- `useEffect` runs after component mounts
- Load data when app starts
- `AsyncStorage.getItem(key)` returns a Promise
- Handle null values (no data saved yet)

**Implementation:**
```tsx
useEffect(() => {
  loadSavedData();
}, []); // Empty dependency array = run once

const loadSavedData = async () => {
  try {
    const savedText = await AsyncStorage.getItem('savedText');
    if (savedText !== null) {
      setDisplayText(savedText);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
};
```

**Testing:**
- Save some text
- Close app completely
- Reopen app
- Saved text should appear automatically

### Step 2.4: Add Clear Functionality
**What you'll learn**: Deleting stored data

**Key Concepts:**
- `AsyncStorage.removeItem(key)` deletes data
- Clear both state and storage
- Provide user feedback

**Implementation:**
Add a "Clear" button that:
- Clears `displayText` state
- Removes item from AsyncStorage
- Provides visual feedback

**Testing:**
- Save data
- Press clear button
- Verify data is cleared
- Restart app, data should not reappear

---

## Phase 4: App Polish & Distribution (2-3 hours)

### Goal
Make your app look professional and prepare it for distribution.

### Step 3.1: Improve UI/UX
**What you'll learn**: Better styling, user feedback

**Key Concepts:**
- Add loading states
- Show save confirmation
- Improve button styling
- Add icons using `@expo/vector-icons`
- Responsive design considerations

**Ideas to Implement:**
- Show "Saved!" message after saving
- Add icons to buttons
- Improve color scheme
- Add spacing and padding
- Make input full-width with proper styling

**Testing:**
- UI looks polished
- Feedback is clear
- Works on different screen sizes

### Step 3.2: Custom App Icon
**What you'll learn**: Icon requirements, asset generation

**Key Concepts:**
- iOS requires 1024x1024 icon
- Android needs adaptive icons (foreground + background)
- Use asset generator tools
- Update app.json with correct paths

**Tools:**
- [Figma](https://figma.com) - Design icons
- [Icon Kitchen](https://icon.kitchen) - Generate all sizes
- [Expo Icon Generator](https://easyappicon.com)

**Files to Update:**
- `assets/images/icon.png` (1024x1024)
- `assets/images/android-icon-foreground.png`
- `assets/images/android-icon-background.png`

**Testing:**
- Build new APK
- Install on device
- Check home screen icon
- Check app drawer icon

### Step 3.3: Custom Splash Screen
**What you'll learn**: Splash screen configuration

**Key Concepts:**
- Splash screen shows while app loads
- Configure in app.json
- Different images for light/dark mode
- Resize modes: contain, cover, native

**Configuration:**
```json
{
  "splash": {
    "image": "./assets/images/splash-icon.png",
    "resizeMode": "contain",
    "backgroundColor": "#ffffff"
  }
}
```

**Testing:**
- Build and install
- Launch app
- Observe splash screen on startup

### Step 3.4: Production Build
**What you'll learn**: Production vs preview builds, versioning

**Key Concepts:**
- Preview builds for testing (APK)
- Production builds for store submission (AAB)
- Version management
- Build optimization

**Commands:**
```bash
# Preview build (APK for testing)
eas build --platform android --profile preview

# Production build (AAB for Play Store)
eas build --platform android --profile production
```

**Testing:**
- Production APK works correctly
- Performance is good
- File size is reasonable

### Step 3.5: Share Your App
**What you'll learn**: Distribution options

**Options:**
1. **Direct APK sharing** (what you're doing now)
   - Send APK file directly
   - Users need to enable unknown sources
   - No app store approval needed

2. **Google Play Store (Internal Testing)**
   - Upload AAB to Play Console
   - Invite testers by email
   - No public review needed

3. **Google Play Store (Public)**
   - Full store listing
   - Review process
   - Public distribution

4. **App Store (iOS)**
   - Requires Apple Developer account ($99/year)
   - TestFlight for beta testing
   - App Store review for public release

**Testing:**
- Share APK with friend/family
- Verify they can install and use it

---

## Phase 5: Advanced Features (Optional, 3-4 hours)

### Goal
Add more functionality to make your app more useful.

### Step 4.1: Multiple Saved Items
**What you'll learn**: Working with arrays in AsyncStorage

**Key Concepts:**
- Store array of items
- CRUD operations (Create, Read, Update, Delete)
- FlatList for rendering lists
- Unique IDs for items

**Implementation:**
- Change from single text to list of texts
- Add timestamp to each item
- Display list of all saved items
- Ability to delete individual items

### Step 4.2: Categories/Tags
**What you'll learn**: More complex data structures

**Ideas:**
- Add categories to saved items
- Filter by category
- Use Picker component for selection
- Store complex objects in AsyncStorage

### Step 4.3: Search Functionality
**What you'll learn**: Filtering data, text processing

**Ideas:**
- Add search input
- Filter saved items in real-time
- Highlight search matches
- Show "no results" message

### Step 4.4: Navigation
**What you'll learn**: Multi-screen apps, Expo Router

**Key Concepts:**
- Expo Router file-based routing
- Navigate between screens
- Pass data between screens
- Tab navigation vs stack navigation

**Implementation:**
- Home screen (current functionality)
- Settings screen
- About screen
- Use tab navigation (already set up)

### Step 4.5: Sharing
**What you'll learn**: Native sharing capabilities

**Key Concepts:**
- Use `expo-sharing` or `react-native-share`
- Share text to other apps
- Export data as file
- System share sheet

**Implementation:**
```tsx
import * as Sharing from 'expo-sharing';

const shareText = async () => {
  await Sharing.shareAsync(displayText);
};
```

---

## Project Structure

```
demo-react-native-app/
│
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab navigation group
│   │   ├── index.tsx      # Home screen (main app)
│   │   ├── explore.tsx    # Explore tab
│   │   └── _layout.tsx    # Tab layout configuration
│   ├── _layout.tsx        # Root layout
│   └── modal.tsx          # Modal screen example
│
├── assets/                # Images, fonts, and other assets
│   ├── images/           # App icons, splash screens
│   └── fonts/            # Custom fonts
│
├── components/           # Reusable components
│   ├── ui/              # UI components
│   └── themed-*.tsx     # Theme-aware components
│
├── constants/           # App constants
│   └── theme.ts        # Theme colors and values
│
├── hooks/              # Custom React hooks
│   └── use-*.ts       # Custom hooks
│
├── scripts/           # Utility scripts
│   └── reset-project.js
│
├── app.json           # Expo configuration
├── eas.json          # EAS Build configuration
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript configuration
└── LEARNING_PLAN.md  # This file!
```

---

## Testing & Debugging

### Expo DevTools

#### Metro Bundler
- **What**: JavaScript bundler that serves your code
- **Port**: 8081 (metro bundler)
- **Port**: 8082 (Expo DevTools)

**Common Commands:**
- `r` - Reload app
- `m` - Toggle menu
- `d` - Open DevTools
- `j` - Open debugger

#### React DevTools
**Installation:**
```bash
npm install -g react-devtools
react-devtools
```

**Features:**
- Inspect component tree
- View props and state
- Profile performance
- Measure render times

### Console Logging

**Simple Logging:**
```tsx
console.log('Value:', inputValue);
console.warn('Warning message');
console.error('Error message');
```

**Object Inspection:**
```tsx
console.log('State:', { inputValue, displayText });
console.table([{ key: 'value' }]);
```

### Debugging Tools

#### Chrome DevTools
1. Shake device or press `Cmd+D` / `Ctrl+D`
2. Select "Debug remote JS"
3. Opens Chrome DevTools
4. Use breakpoints, console, network tab

#### React Native Debugger
- Standalone app combining React DevTools and Redux DevTools
- Better than Chrome DevTools for React Native
- [Download](https://github.com/jhen0409/react-native-debugger)

### Common Issues & Solutions

#### Issue: Metro Bundler Won't Start
**Solution:**
```bash
# Clear cache and restart
npx expo start -c
# Or
rm -rf node_modules
npm install
npx expo start
```

#### Issue: Can't Connect to Development Server
**Solution:**
- Ensure phone and computer are on same WiFi
- Check firewall allows port 8081
- Try tunnel mode: `npx expo start --tunnel`
- Use QR code instead of manual IP entry

#### Issue: App Crashes on Startup
**Solution:**
- Check console for error messages
- Verify all imports are correct
- Check for syntax errors
- Try rebuilding: `npx expo start -c`

#### Issue: AsyncStorage Not Working
**Solution:**
- Verify installation: `npx expo install @react-native-async-storage/async-storage`
- Check import statement
- Ensure using async/await correctly
- Check for typos in keys
- Log errors in catch blocks

#### Issue: Build Fails on EAS
**Solution:**
- Check eas.json configuration
- Verify app.json is valid JSON
- Check EAS Build logs for specific error
- Ensure all dependencies are installed
- Try building again (sometimes temporary issues)

---

## Deployment Guide

### Building APK (Android)

#### Preview Build (Testing)
```bash
# Build APK for testing
eas build --platform android --profile preview

# Wait for build to complete (10-20 minutes)
# Download from provided URL
# Install on device
```

#### Production Build
```bash
# Build AAB for Play Store
eas build --platform android --profile production

# This creates an Android App Bundle (.aab)
# Required for Play Store submission
```

### Building iOS App

**Requirements:**
- Apple Developer account ($99/year)
- Configured in EAS

**Commands:**
```bash
# Configure iOS
eas build:configure

# Build for App Store
eas build --platform ios --profile production

# Build for simulator (testing)
eas build --platform ios --profile preview
```

### Version Management

**In app.json:**
```json
{
  "expo": {
    "version": "1.0.0",  // User-visible version
    "android": {
      "versionCode": 1   // Auto-incremented by EAS
    },
    "ios": {
      "buildNumber": "1" // Auto-incremented by EAS
    }
  }
}
```

**Auto-increment (in eas.json):**
```json
{
  "build": {
    "production": {
      "autoIncrement": true
    }
  }
}
```

### Distribution Options

#### 1. Direct APK Distribution
**Pros:**
- No approval process
- Instant distribution
- Free

**Cons:**
- Users need to enable "Unknown sources"
- No automatic updates
- Play Protect warnings

#### 2. Play Store Internal Testing
**Pros:**
- Easier installation for testers
- Looks like real Play Store app
- No public review

**Cons:**
- Still requires Play Console account
- Limited to invited testers

#### 3. Play Store Public
**Pros:**
- Wide distribution
- Trusted source
- Automatic updates

**Cons:**
- Review process (can take days)
- Requires Play Console account ($25 one-time)
- Must follow Google's policies

---

## Additional Resources

### Official Documentation
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [React Hooks](https://react.dev/reference/react/hooks)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Expo Services
- [Expo Snack](https://snack.expo.dev/) - Online playground
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [EAS Update](https://docs.expo.dev/eas-update/introduction/)

### Learning Resources
- [React Native Express](https://www.reactnative.express/) - Comprehensive guide
- [React.dev](https://react.dev/learn) - Official React tutorial
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

### Useful Libraries
- [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) - Local storage
- [@expo/vector-icons](https://icons.expo.fyi/) - Icon library
- [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) - Touch handling
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) - Animations

### Community
- [React Native Community](https://www.reactnative.community/)
- [Expo Discord](https://discord.gg/expo)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)
- [r/reactnative](https://reddit.com/r/reactnative)

---

## Best Practices

1. **State Management**
   - Use useState for local component state
   - Consider Context API for global state
   - Use useReducer for complex state logic

2. **Performance**
   - Use `React.memo()` for expensive components
   - Avoid inline functions in render
   - Use `useCallback` and `useMemo` when appropriate
   - Optimize FlatList with `windowSize` and `maxToRenderPerBatch`

3. **Code Organization**
   - One component per file
   - Extract reusable components
   - Keep components small and focused
   - Use TypeScript for type safety

4. **Styling**
   - Define styles outside component (at bottom)
   - Use `StyleSheet.create()` for performance
   - Consider theme/constants for colors
   - Test on different screen sizes

5. **Data Persistence**
   - Always handle AsyncStorage errors
   - Validate data before saving
   - Consider data migration strategy
   - Clear old/unused data

6. **Security**
   - Never store sensitive data in AsyncStorage (use Secure Store)
   - Validate user input
   - Use HTTPS for API calls
   - Keep dependencies updated

7. **Testing**
   - Test on real devices (not just emulators)
   - Test offline scenarios
   - Test on low-end devices
   - Test different OS versions

---

## Next Steps After This Project

Once you've completed this app, consider:

1. **Add more features**:
   - Camera integration
   - Push notifications
   - Background tasks
   - Location services
   - Biometric authentication

2. **Build a real project**:
   - Todo app with categories
   - Note-taking app with rich text
   - Weather app with API integration
   - Expense tracker
   - Recipe book

3. **Learn advanced topics**:
   - Navigation (React Navigation deep dive)
   - State management (Redux, Zustand, Jotai)
   - Animations (Reanimated, Moti)
   - Native modules (write your own)
   - Performance optimization

4. **Explore other tools**:
   - Bare React Native workflow
   - Native development (Swift/Kotlin)
   - CI/CD pipelines
   - Automated testing (Jest, Detox)

---

## Glossary

**React Native**: Framework for building mobile apps using JavaScript and React

**Expo**: Platform and tools built around React Native for easier development

**JSX/TSX**: Syntax extension for writing HTML-like code in JavaScript/TypeScript

**Component**: Reusable piece of UI (function that returns JSX)

**State**: Data that changes over time in a component

**Props**: Data passed from parent to child component

**Hook**: Function that lets you use React features (useState, useEffect, etc.)

**StyleSheet**: React Native's styling system (similar to CSS)

**AsyncStorage**: Key-value storage system for React Native

**Metro Bundler**: JavaScript bundler that serves your React Native code

**EAS**: Expo Application Services (build, submit, update)

**APK**: Android Package (installable Android app file)

**AAB**: Android App Bundle (optimized format for Play Store)

---

## Troubleshooting Checklist

Before asking for help, check:
- [ ] Is Metro bundler running? (should see logs in terminal)
- [ ] Is your device on the same WiFi as computer?
- [ ] Have you tried clearing cache? (`npx expo start -c`)
- [ ] Are all dependencies installed? (`npm install`)
- [ ] Is your Expo Go app up to date?
- [ ] Have you checked the console for errors?
- [ ] Have you tried restarting Metro bundler?
- [ ] For build issues: Have you checked EAS build logs?
- [ ] For storage issues: Are you using async/await correctly?
- [ ] Have you tested on a different device?

---

**Good luck on your React Native journey! Remember: mobile development has its quirks compared to web development, but the core concepts are the same. Start simple, build incrementally, and don't be afraid to experiment!**

**Now, let's move to Phase 2 and add data persistence!**

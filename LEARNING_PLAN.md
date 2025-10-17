# React Native Learning Plan: From Zero to Mobile App

## Project: "React Native Text Echo" - Your First Mobile App

---

## Table of Contents
1. [How This Learning Plan Works](#how-this-learning-plan-works)
2. [Project Overview](#project-overview)
3. [Key Concepts & Technologies](#key-concepts--technologies)
4. [Phase 1: Understanding the Basics (COMPLETED)](#phase-1-understanding-the-basics-completed)
5. [Phase 2: State Persistence & Data Storage](#phase-2-state-persistence--data-storage)
6. [Phase 3: App Polish & Distribution](#phase-3-app-polish--distribution)
7. [Phase 4: Advanced Features](#phase-4-advanced-features)
8. [Project Structure](#project-structure)
9. [Testing & Debugging](#testing--debugging)
10. [Deployment Guide](#deployment-guide)
11. [Additional Resources](#additional-resources)

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

## Phase 2: State Persistence & Data Storage (2-3 hours)

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

## Phase 3: App Polish & Distribution (2-3 hours)

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

## Phase 4: Advanced Features (Optional, 3-4 hours)

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

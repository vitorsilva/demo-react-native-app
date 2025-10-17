# Phase 1 Learning Notes: Understanding React Native Basics

## Overview
This document captures all the concepts, questions, and explanations from Phase 1 of building your first React Native mobile app.

---

## Table of Contents
1. [Project Setup & Architecture](#project-setup--architecture)
2. [React Native vs Web Development](#react-native-vs-web-development)
3. [React State Management](#react-state-management)
4. [Component Fundamentals](#component-fundamentals)
5. [Styling in React Native](#styling-in-react-native)
6. [Development Workflow](#development-workflow)
7. [Building & Distribution](#building--distribution)

---

## Project Setup & Architecture

### Bare vs Expo

**Q: Should I use Expo or bare React Native?**

**A: Expo for Learning, Bare for Full Control**

**Expo Managed Workflow:**
```
Advantages:
✅ No native code setup required
✅ No Xcode or Android Studio needed initially
✅ Built-in modules (camera, location, etc.)
✅ Cloud builds (EAS Build)
✅ Over-the-air updates
✅ Faster development

Disadvantages:
❌ Some limitations with native modules
❌ Slightly larger app size
❌ Less control over native code
```

**Bare React Native:**
```
Advantages:
✅ Full control over native code
✅ Access to all native modules
✅ Smaller app size
✅ Can use any native library

Disadvantages:
❌ Requires Xcode (iOS) or Android Studio (Android)
❌ More configuration required
❌ Manual dependency linking
❌ Steeper learning curve
```

**Recommendation for This Project:**
Using Expo because:
1. Faster to get started
2. No native toolchain setup needed
3. Cloud builds available
4. Perfect for learning React Native fundamentals
5. Can always "eject" to bare workflow later if needed

**Q: Does using Expo feel like cheating?**

**A: No! It's a Smart Development Choice**

**Why Expo is NOT cheating:**
- You're still writing React Native code
- You're learning all the same concepts
- You're using the same components and APIs
- Many professional apps use Expo

**What Expo Abstracts Away:**
- Native build configuration
- Xcode and Android Studio setup
- Native module linking
- Platform-specific setup

**The Reality:**
```
Using Expo = Using a framework
Just like using React instead of vanilla JS
Or using Express instead of raw Node.js

You're building on top of good abstractions
That's smart engineering, not cheating!
```

### Creating the Project

**Command Used:**
```bash
npx create-expo-app@latest
```

**What This Does:**
1. Downloads latest Expo template
2. Creates project directory
3. Installs dependencies
4. Sets up file structure
5. Configures TypeScript
6. Creates example code

**Initial Thought:**

> "It didn't feel very complicated to do this but it still seems a lot of work to just get a compiled piece of software I built running on what effectively is a computer but happens to be a mobile phone."

**Why It Feels Complex:**

**The Reality of Mobile Development:**
```
Desktop/Web:
Code → Build → Run
(Same platform where you develop)

Mobile:
Code → Build → Sign → Package → Transfer → Install → Run
(Different platform than where you develop)

Additional Complexities:
- Different architectures (ARM vs x86)
- Security requirements (signing)
- Platform restrictions (sandboxing)
- Multiple target versions (Android 10, 11, 12, 13, 14...)
```

**What You're Actually Doing:**
1. Writing JavaScript/TypeScript
2. Bundling it with Metro
3. Compiling native components for ARM architecture
4. Creating Android APK with proper signatures
5. Installing on physically different device
6. Running in sandboxed environment

**Compared to Web:**
```
Web: Write → Save → Refresh browser
     (Runs on same computer)

Mobile: Write → Bundle → Compile → Build → Sign → Transfer → Install
        (Runs on different device with different OS and architecture)
```

**Expo Makes This Easier:**
Without Expo, you'd also need:
- Android Studio (gigabytes of downloads)
- SDK management
- Emulator setup
- Gradle configuration
- ProGuard rules
- Signing key generation

---

## React Native vs Web Development

### Component Mapping

**Q: Why can't I just use `<div>` and `<span>`?**

**A: React Native Uses Native Components, Not Web Components**

**The Key Difference:**

```
Web (HTML):
<div>, <span>, <p> → Browser renders these as DOM elements

React Native:
<View>, <Text> → Compiled to ACTUAL native components:
  - Android: android.view.View, android.widget.TextView
  - iOS: UIView, UITextView
```

**Component Translation:**

| Web Component | React Native | Native Android | Native iOS |
|--------------|--------------|----------------|-----------|
| `<div>` | `<View>` | ViewGroup | UIView |
| `<span>` or `<p>` | `<Text>` | TextView | UITextView |
| `<input>` | `<TextInput>` | EditText | UITextField |
| `<button>` | `<Button>` | Button | UIButton |
| `<img>` | `<Image>` | ImageView | UIImageView |
| `<a>` | `<Pressable>` + Linking | N/A | N/A |

**Important Rule:**

```tsx
// ❌ This will ERROR in React Native:
<View>
  Hello World
</View>

// ✅ Must wrap text in <Text>:
<View>
  <Text>Hello World</Text>
</View>
```

**Why?**
- Text rendering is expensive on mobile
- Native platforms require explicit text components
- Allows for text-specific optimizations
- Prevents accidental text rendering

### No Direct DOM Access

**Q: It seems strange that UI elements don't have some kind of ID that I can use to do something like `textbox.text`... Can you explain how it works?**

**A: React Native Uses Declarative, State-Driven UI**

**The Old Way (DOM Manipulation):**
```javascript
// Web (jQuery era)
const textbox = document.getElementById('myTextbox');
const display = document.getElementById('display');

button.addEventListener('click', () => {
  display.innerText = textbox.value; // Directly manipulate DOM
});
```

**The React Native Way (Declarative):**
```tsx
const [inputValue, setInputValue] = useState('');
const [displayText, setDisplayText] = useState('');

return (
  <View>
    <TextInput
      value={inputValue}
      onChangeText={setInputValue}
    />
    <Button onPress={() => setDisplayText(inputValue)} />
    <Text>{displayText}</Text>
  </View>
);
```

**Key Concept: "State as Source of Truth"**

```
Traditional Web (Imperative):
User types → DOM changes → Read DOM when needed

React Native (Declarative):
User types → State updates → UI re-renders automatically

Flow:
1. User types "hello"
2. onChangeText fires
3. setInputValue('hello') called
4. React updates state
5. Component re-renders
6. TextInput shows 'hello'
```

**Why This Approach?**

**Benefits:**
1. **Predictable**: UI is always derived from state
2. **Debuggable**: Just check state to know UI state
3. **Testable**: Test state changes, UI follows automatically
4. **No sync issues**: No "state vs UI" mismatch

**Example of the Problem It Solves:**
```javascript
// Old way - easy to get out of sync:
textbox.value = 'hello';
// Later, somewhere else:
if (someCondition) {
  textbox.value = 'world';
}
// What's the value? Have to check DOM!

// React way - always clear:
const [value, setValue] = useState('hello');
if (someCondition) {
  setValue('world');
}
// Value is ALWAYS what state says it is
```

---

## React State Management

### useState Hook

**Q: Where is the `setInputValue` function?**

**A: React Creates It For You**

**What `useState` Returns:**
```tsx
const [inputValue, setInputValue] = useState('');
//     ↑              ↑                        ↑
//   current        setter                initial
//   value         function                value
```

**Behind the Scenes (Simplified):**
```tsx
// Inside React's code (not yours):
function useState(initialValue) {
  let state = initialValue;

  function setState(newValue) {
    state = newValue;
    // Magic happens here:
    // React marks component as "needs re-render"
    // Schedules re-render
    // Component re-runs with new state value
  }

  return [state, setState];
}
```

**Array Destructuring:**
```tsx
// useState returns an array: [value, setter]
const result = useState('');
const inputValue = result[0];
const setInputValue = result[1];

// Same as (using destructuring):
const [inputValue, setInputValue] = useState('');

// You can name them anything:
const [text, setText] = useState('');
const [foo, setFoo] = useState('');
```

**How State Updates Trigger Re-renders:**
```tsx
1. User types in input
2. onChangeText(newText) fires
3. setInputValue(newText) called
4. React:
   a. Updates state internally
   b. Marks component as dirty
   c. Schedules re-render
5. Component function runs again
6. This time, inputValue has new value
7. React updates UI to match new JSX
```

**Important: State is Isolated Per Component Instance**
```tsx
function Counter() {
  const [count, setCount] = useState(0);
  return <Button onPress={() => setCount(count + 1)} />;
}

// Each instance has its own state:
<Counter /> // count starts at 0
<Counter /> // count starts at 0 (independent!)
```

### Controlled Components

**Concept: Controlled vs Uncontrolled Inputs**

**Uncontrolled (Like Traditional Web):**
```tsx
// Input manages its own state internally
<TextInput placeholder="Type here..." />
// You'd have to query the input to get its value
```

**Controlled (React Way):**
```tsx
const [value, setValue] = useState('');

<TextInput
  value={value}              // Input's value comes from state
  onChangeText={setValue}    // Input updates state when changed
/>
// State is single source of truth
```

**Why Controlled is Better:**
```tsx
const [inputValue, setInputValue] = useState('');

// Can validate input:
const handleChange = (text) => {
  if (text.length <= 10) {  // Max 10 characters
    setInputValue(text);
  }
};

// Can transform input:
const handleChange = (text) => {
  setInputValue(text.toUpperCase());  // Always uppercase
};

// Can clear input programmatically:
const clearInput = () => {
  setInputValue('');  // Input will clear automatically
};
```

**The Data Flow:**
```
User types "h"
      ↓
onChangeText("h") fires
      ↓
setInputValue("h") called
      ↓
State updates: inputValue = "h"
      ↓
Component re-renders
      ↓
<TextInput value="h" /> renders
      ↓
User sees "h" in input
```

---

## Component Fundamentals

### Core Components

**Components You Used:**

#### View
```tsx
<View style={styles.container}>
  {/* Children here */}
</View>
```

**Purpose:** Container for other components
**Web Equivalent:** `<div>`
**Key Features:**
- Layout (flexbox)
- Styling
- Touch handling
- Accessibility

#### Text
```tsx
<Text style={styles.text}>Hello World!</Text>
```

**Purpose:** Display text
**Web Equivalent:** `<span>`, `<p>`
**Important Rules:**
- ALL text must be inside `<Text>`
- Can nest Text components
- Inherits styles from parent Text
- Supports press handlers

#### TextInput
```tsx
<TextInput
  value={inputValue}
  onChangeText={setInputValue}
  placeholder="Type here..."
  style={styles.input}
/>
```

**Purpose:** Text entry field
**Web Equivalent:** `<input type="text">`
**Key Props:**
- `value`: Current text value
- `onChangeText`: Called on every change
- `placeholder`: Hint text
- `secureTextEntry`: For passwords
- `keyboardType`: 'numeric', 'email-address', etc.
- `multiline`: For multi-line input

#### Button
```tsx
<Button
  title="Press me"
  onPress={() => setDisplayText(inputValue)}
/>
```

**Purpose:** Standard button
**Web Equivalent:** `<button>`
**Limitations:**
- Limited styling options
- Platform-specific appearance
- Better alternative: `<Pressable>` with custom styling

---

## Styling in React Native

### StyleSheet API

**Creating Styles:**
```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    color: 'white',
  },
});
```

**Why Use StyleSheet.create()?**
1. **Validation**: Catches typos and invalid properties
2. **Performance**: Styles are sent to native side once
3. **Optimization**: React Native can optimize rendering
4. **Type Safety**: TypeScript autocomplete works

**Alternative (Inline Styles):**
```tsx
// Works, but less efficient:
<View style={{ flex: 1, backgroundColor: 'blue' }}>
```

### CSS vs React Native Styles

**Key Differences:**

| CSS | React Native | Notes |
|-----|--------------|-------|
| `background-color` | `backgroundColor` | camelCase! |
| `margin-top` | `marginTop` | camelCase! |
| `20px` | `20` | No units! |
| `display: flex` | (default) | Always flex |
| `flex-direction: row` | `flexDirection: 'column'` | Default is column! |

**No Units Needed:**
```tsx
// ❌ Wrong:
fontSize: '20px'
margin: '10px'

// ✅ Correct:
fontSize: 20      // Density-independent pixels (DP)
margin: 10        // Scales with screen density
```

**What Are Density-Independent Pixels (DP)?**
```
Same `fontSize: 20` looks same physical size on:
- Low density screen (720p phone)
- High density screen (1440p phone)
- Tablet
- Different pixel densities

React Native handles the conversion automatically!
```

### Flexbox Layout

**Default Behavior:**
```tsx
<View>  {/* flex container by default */}
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</View>

// Items stack VERTICALLY (column)
// This is OPPOSITE of web (where default is row)!
```

**Your Layout:**
```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,              // Take all available space
    justifyContent: 'center',  // Center vertically (main axis)
    alignItems: 'center',      // Center horizontally (cross axis)
  },
});
```

**Understanding flex: 1:**
```tsx
<View style={{ flex: 1 }}>
  {/* This View will expand to fill parent */}
</View>

// Think of it as:
// "Take up 1 share of available space"

<View style={{ flexDirection: 'row' }}>
  <View style={{ flex: 1 }}>  {/* 1/3 of width */}
  <View style={{ flex: 2 }}>  {/* 2/3 of width */}
</View>
```

**Main Axis vs Cross Axis:**
```
flexDirection: 'column' (default):
- Main axis = vertical (justifyContent)
- Cross axis = horizontal (alignItems)

flexDirection: 'row':
- Main axis = horizontal (justifyContent)
- Cross axis = vertical (alignItems)
```

---

## Development Workflow

### Metro Bundler

**What is Metro?**
- JavaScript bundler for React Native
- Similar to Webpack, but optimized for React Native
- Transforms and bundles your code
- Sends it to the device

**Ports Used:**
- **8081**: Metro bundler server
- **8082**: Expo DevTools

**Important: Firewall Configuration**

> "Don't forget to open port 8081 in firewall"

**Why This Matters:**
```
Without open port:
Computer (Metro on :8081) ╳ Phone (trying to connect)
Can't communicate

With open port:
Computer (Metro on :8081) ✓ Phone (successfully connected)
Can communicate
```

**How to Open Port (Windows):**
```powershell
# Windows Firewall
1. Open Windows Defender Firewall
2. Advanced settings
3. Inbound Rules → New Rule
4. Port → TCP → 8081
5. Allow the connection
6. Name it "Metro Bundler"
```

### Hot Reload

**What Happens When You Save:**
```
1. Save file in VS Code
      ↓
2. Metro detects change
      ↓
3. Re-bundles changed module
      ↓
4. Sends update to device over network
      ↓
5. App updates WITHOUT full restart
      ↓
6. State is preserved!
```

**Fast Refresh:**
- Preserves component state during edits
- Updates UI in ~1-2 seconds
- Errors show as overlay on device

### Testing on Physical Device

**Development Setup:**
```
Developer Computer
  ↓ (WiFi)
  ↓ Port 8081
  ↓
Mobile Device (Expo Go)
```

**Workflow:**
1. Run `npx expo start`
2. Metro bundler starts on :8081
3. QR code displayed in terminal
4. Scan with Expo Go app
5. App loads on device
6. Connected for hot reload

**Advantages of Physical Device:**
- Real performance
- Actual touch interactions
- True network conditions
- Camera, sensors work
- Battery usage testing

---

## Building & Distribution

### EAS CLI Setup

**Commands Used:**
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login

# Configure project for EAS Build
eas build:configure

# Build preview APK
eas build --platform android --profile preview
```

### Where Are Credentials Stored?

**Q: When I do `eas login`, where is the login information stored? I don't want it to leak into a public repo.**

**A: Credentials Are Stored Locally, Not in Project**

**Storage Locations:**
- **Windows**: `%USERPROFILE%\.expo`
- **macOS/Linux**: `~/.expo`

**What's Safe to Commit:**
```
✅ eas.json - Build configuration
✅ app.json - App metadata
✅ .expo/settings.json - Project settings

❌ .env files - Environment variables
❌ .expo/ directory (in .gitignore)
❌ Signing keys (.key, .jks)
```

**Your .gitignore Already Protects You:**
```gitignore
# Expo already includes:
.expo/
*.key
*.jks
*.p12
.env*.local
```

### Build Profiles

**In eas.json:**
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"  // Creates APK for easy testing
      }
    },
    "production": {
      "autoIncrement": true  // Auto-increment version codes
    }
  }
}
```

**Build Types:**

| Profile | Output | Purpose | Sign | Size |
|---------|--------|---------|------|------|
| development | APK | Debugging | Debug | Large |
| preview | APK | Testing | Release | Medium |
| production | AAB | Play Store | Release | Optimized |

**APK vs AAB:**
```
APK (Android Package):
✅ Directly installable
✅ Can share file directly
❌ Larger file size
❌ Not optimized for all devices

AAB (Android App Bundle):
❌ Not directly installable
❌ Must go through Play Store
✅ Smaller downloads (optimized per device)
✅ Required for Play Store
```

### Cloud Build Process

**What Happens During `eas build`:**
```
1. Code is uploaded to Expo servers
      ↓
2. EAS Build creates build environment
      ↓
3. Installs dependencies (npm install)
      ↓
4. Runs Android build process
      ↓
5. Compiles native code
      ↓
6. Signs the APK/AAB
      ↓
7. Uploads to CDN
      ↓
8. Provides download link (valid 30 days)
```

**Build Time: 10-20 minutes**
- Installing dependencies: 2-5 min
- Native code compilation: 5-10 min
- Signing and uploading: 2-3 min

**Free Tier Limits:**
- Build minutes vary by plan
- Plenty for learning and small projects
- Check: https://expo.dev/accounts/[user]/settings/billing

### Installing APK on Device

**The Process:**
1. Download APK from EAS link
2. Transfer to device (or download directly)
3. Tap to install
4. Android prompts "Unknown source" warning
5. Allow installation
6. App installs independently (no Expo Go needed!)

### Play Protect Warning

**Q: Play Protect blocks my app, how do I install it?**

**A: Bypass Play Protect for Development**

**Option 1: Install Anyway**
```
1. Tap "Install anyway" (Instalar mesmo assim)
2. Confirm installation
```

**Option 2: Disable Play Protect Temporarily**
```
1. Open Google Play Store
2. Menu → Play Protect
3. Settings (gear icon)
4. Toggle off "Scan apps with Play Protect"
5. Install your APK
⚠️ Important: Re-enable after installation!
```

**Why This Happens:**
- Your app isn't from Play Store
- Not signed by recognized developer
- Play Protect doesn't recognize it
- Normal for development apps

**In Production:**
- Apps from Play Store don't show this warning
- Google has verified the developer
- App has been scanned
- Users trust it more

---

## Key Takeaways

### React Native Fundamentals

**1. Components Replace HTML Elements**
```
<div>      → <View>
<span>/<p> → <Text>
<input>    → <TextInput>
<button>   → <Button>
```

**2. State-Driven UI**
- No direct DOM manipulation
- State is single source of truth
- UI automatically updates when state changes
- Use `useState` hook

**3. Styling is Different**
- JavaScript objects, not CSS
- camelCase properties
- No units (density-independent pixels)
- Flexbox by default
- Default flex direction is 'column'

**4. Expo Simplifies Development**
- No native toolchain needed
- Cloud builds available
- Hot reload out of the box
- Easy device testing

### Development Workflow

**1. Rapid Development**
```
Edit code → Save → See changes in ~1 second
(State preserved, fast refresh)
```

**2. Physical Device Testing**
- Expo Go for development
- Standalone APK for production testing
- Real device behavior

**3. Build and Distribution**
- EAS Build for cloud building
- APK for direct distribution
- AAB for Play Store
- Build time: 10-20 minutes

### What You Built

**Current App Features:**
- ✅ Text input with state management
- ✅ Button to trigger action
- ✅ Display area that updates
- ✅ Styled with flexbox layout
- ✅ Runs on physical device
- ✅ Standalone APK (no Expo Go needed)
- ✅ Custom icon and splash screen
- ✅ Proper package name

**What's Missing (For Phase 2):**
- ❌ Data doesn't persist between sessions
- ❌ No local storage
- ❌ Limited functionality

---

## Final Thoughts from Phase 1

### Initial Impressions

> "It didn't feel very complicated to do this but it still seems a lot of work to just get a compiled piece of software I built running on what effectively is a computer but happens to be a mobile phone."

**This is Actually Insightful!**

**What You Learned:**
1. Mobile development has more steps than web
2. Cross-compilation is necessary (x86 → ARM)
3. Security requirements add complexity
4. Distribution is non-trivial

**But Also:**
1. Expo made it WAY easier than bare React Native
2. Cloud builds mean no local toolchain needed
3. One codebase works on iOS and Android
4. Hot reload makes development fast

### On Using Expo

> "Using expo feels a bit like cheating but I'll live with it for now"

**Reframing This:**

**Not Cheating:**
- Professional developers use Expo
- Published apps use Expo
- It's a tool that solves real problems
- Focus on learning concepts, not toolchain setup

**What You're Actually Learning:**
- React fundamentals (state, components, props)
- React Native components and APIs
- Mobile UI/UX principles
- Mobile app architecture

**The Native Toolchain Would Teach You:**
- Gradle configuration (not very useful)
- Android SDK management (maintenance burden)
- Xcode project settings (iOS-specific)
- Native build troubleshooting (time sink)

**Better Learning Path:**
```
1. Learn React Native concepts (Phase 1) ✅
2. Build functional apps (Phase 2+) ⏳
3. Learn native code when NEEDED
4. Eject to bare workflow if necessary
```

### Next Steps

**Before Adding More Features:**

> "Before adding more (any) functionalities I think I want to see a bit more of the distribution / deployment process, simple things like setting as icon, adding to the initial screen and so on."

**You've Already Done This!** ✅
- Custom icon configured
- Splash screen set up
- APK built and distributed
- App runs independently

**Ready for Phase 2:**
- Add data persistence (AsyncStorage)
- Make app more useful
- Polish the UI
- Learn more React Native features

---

## What's Next?

**Phase 2: State Persistence & Data Storage**

Now that you understand the basics, we'll make your app remember data between sessions:
- Install and use AsyncStorage
- Save data when button is pressed
- Load data when app starts
- Add clear functionality

**You've learned:**
- ✅ React Native component model
- ✅ State management with useState
- ✅ Styling with StyleSheet
- ✅ Development workflow with Expo
- ✅ Building and distributing APKs
- ✅ The difference between development and production

**Ready to add persistence!** 📱

---

*Document created: Phase 1 completion*
*Last updated: 2025-10-17*

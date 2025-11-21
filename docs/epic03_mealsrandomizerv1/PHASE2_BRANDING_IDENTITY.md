# Phase 2: Branding & Identity

[← Back to Overview](./OVERVIEW.md) | [Previous: Phase 1](./PHASE1_USER_CUSTOMIZATION.md)

---

## 🎯 Goal

Transform "demo-react-native-app" into a professional product with a memorable name, cohesive visual identity, and marketing presence.

**Current State:** App is named "demo-react-native-app" with default Expo icons and no web presence.

**After Phase 2:** App has a unique name, professional icon, splash screen, and landing page that explains its value.

**⚠️ IMPORTANT:** This phase includes testing that branding changes don't break functionality, and deploying a newly branded APK.

**Estimated Time:** 5-7 hours (including testing, landing page deployment, and APK build)

---

## 📋 What You'll Build

### 1. App Name & Identity
- Brainstorm and select final app name
- Define brand personality
- Choose color palette
- Create tagline/value proposition

### 2. Visual Assets
- Design app icon (1024x1024)
- Create adaptive icon for Android
- Design splash screen
- Choose app colors

### 3. Code Updates
- Remove all "demo-react-native-app" references
- Update package.json, app.json
- Update display names
- Update bundle identifiers

### 4. Landing Page
- Simple, professional landing page
- Explain app value
- Show screenshots
- Download links (future)
- Deploy to web

---

## 🛠️ Implementation Steps

### Step 2.1: Name Brainstorming (1 hour)

**What you'll learn:** Product naming, brand strategy

**Brainstorming Session:**

**Naming Criteria:**
- Memorable and easy to pronounce
- Reflects app purpose (meals, variety, randomization)
- Available as domain (.com or .app)
- Not trademarked
- Works internationally (not just Portuguese)

**Name Ideas to Explore:**
- **Direct/Descriptive:**
  - MealMix
  - VarietyBite
  - DishDice
  - FoodSpin
  - PlateRotate

- **Playful:**
  - MunchRoulette
  - SnapSnack
  - WhatsNext (for meals)
  - FlipMeal
  - ShakePlate

- **Clever:**
  - NoRepeat
  - FreshChoice
  - MealWheel
  - DailyDish
  - NextBite

- **Current Favorite:** "Meals Randomizer" (functional but not exciting)

**Exercise:**
1. List 10-20 name ideas
2. Check domain availability (namechk.com)
3. Check app store availability
4. Narrow to top 3
5. Sleep on it
6. Pick one!

**For this guide, let's use:** `MealMix` (you can replace with your choice)

---

### Step 2.2: Brand Identity Definition (30 min)

**What you'll learn:** Creating brand guidelines

**Define:**

**Brand Personality:**
- Fun but not childish
- Helpful, not pushy
- Simple, not oversimplified
- Personal, not corporate

**Value Proposition:**
"Eliminate breakfast and snack decision fatigue with variety-enforced meal suggestions."

**Tagline:**
- "Never eat the same thing twice"
- "Variety made simple"
- "Your meal decision assistant"
- "Break the breakfast routine"

**Color Palette:**
Choose 3-5 colors that work together:
- Primary: (e.g., #FF6B35 - warm orange)
- Secondary: (e.g., #004E89 - deep blue)
- Accent: (e.g., #F7C548 - golden yellow)
- Background: (e.g., #F8F9FA - light gray)
- Text: (e.g., #1A1A1A - near black)

**Tools:**
- [Coolors.co](https://coolors.co) - Generate palettes
- [Adobe Color](https://color.adobe.com) - Explore harmonies

---

### Step 2.3: App Icon Design (2 hours)

**What you'll learn:** Mobile icon design principles, adaptive icons

**Icon Design Principles:**
- Simple and recognizable at small sizes
- No text (too small to read)
- Unique silhouette
- Works on light and dark backgrounds
- Represents app purpose

**Design Approaches:**

**Concept 1: Abstract Shuffle**
- Three overlapping circles (ingredients)
- Shuffle/rotation arrows
- Bold, geometric

**Concept 2: Plate with Dice**
- Simple plate outline
- Dice in center (randomization)
- Minimalist style

**Concept 3: Letter Badge**
- Large "M" (MealMix)
- Food element incorporated
- Modern, clean

**Design Tools:**
- **Figma** (free, web-based) - Best for precise design
- **Canva** (free, easier) - Good templates
- **Sketch** (Mac only, paid) - Professional tool

**Icon Requirements:**
- 1024x1024 pixels (iOS requirement)
- PNG format with transparency
- Consistent padding (about 10% margin)

**Android Adaptive Icons:**
- Foreground layer: 1024x1024 (66% safe zone)
- Background layer: 1024x1024 (solid color or pattern)
- Allows Android to apply different shapes

**Process:**
1. Sketch 3-5 concepts on paper
2. Pick favorite concept
3. Create in Figma/Canva
4. Export at 1024x1024
5. Create adaptive icon layers for Android
6. Test at different sizes (64px, 128px, 256px)

---

### Step 2.4: Splash Screen Design (30 min)

**What you'll learn:** Launch screen best practices

**Splash Screen Guidelines:**
- Simple and fast-loading
- Brand colors
- App logo/icon
- No animations (iOS doesn't support)
- Matches first screen of app

**Design:**
- Center: App icon (512px)
- Background: Brand primary color
- Optional: App name below icon
- Keep it minimal

**Export:**
- 1284x2778 pixels (iPhone 14 Pro Max size)
- PNG format
- Expo will automatically resize for other devices

---

### Step 2.5: Update App Configuration (1 hour)

**What you'll learn:** App identity in configuration files

**Tasks:**

1. **Update app.json:**
```json
{
  "expo": {
    "name": "MealMix",
    "slug": "mealmix",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "mealmix",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#FF6B35"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourname.mealmix"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon-foreground.png",
        "backgroundImage": "./assets/images/adaptive-icon-background.png",
        "backgroundColor": "#FF6B35"
      },
      "package": "com.yourname.mealmix"
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    }
  }
}
```

2. **Update package.json:**
```json
{
  "name": "mealmix",
  "version": "1.0.0",
  "description": "Eliminate meal decision fatigue with variety-enforced suggestions",
  "main": "expo-router/entry",
  ...
}
```

3. **Add icon assets:**
   - Place `icon.png` in `assets/images/`
   - Place `adaptive-icon-foreground.png` in `assets/images/`
   - Place `adaptive-icon-background.png` in `assets/images/`
   - Place `splash.png` in `assets/images/`
   - Place `favicon.png` (32x32) in `assets/images/`

---

### Step 2.6: Remove Demo References (30 min)

**What you'll learn:** Systematic codebase cleanup

**Search and Replace:**
1. Search for "demo-react-native-app" (case-insensitive)
2. Replace with "mealmix" or "MealMix"
3. Check these files:
   - All markdown files (README, docs)
   - Code comments
   - Test descriptions
   - Package.json
   - app.json
   - eas.json
   - .gitignore (if has demo-specific entries)

**Grep command:**
```bash
# Find all occurrences
grep -r "demo-react-native-app" . --exclude-dir=node_modules --exclude-dir=.expo

# Or use case-insensitive
grep -ri "demo" . --exclude-dir=node_modules --exclude-dir=.expo | grep -i "react-native-app"
```

---

### Step 2.7: Update Theme Colors (30 min)

**What you'll learn:** Theming across the app

**Tasks:**
1. Update `constants/Colors.ts`
2. Apply brand colors
3. Ensure contrast ratios (accessibility)
4. Update both light and dark themes

**Example Colors.ts:**
```typescript
export const Colors = {
  light: {
    text: '#1A1A1A',
    background: '#F8F9FA',
    tint: '#FF6B35',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#FF6B35',
    primary: '#FF6B35',
    secondary: '#004E89',
    accent: '#F7C548',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#FF6B35',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#FF6B35',
    primary: '#FF6B35',
    secondary: '#0077B6',
    accent: '#FFD60A',
  },
};
```

---

### Step 2.8: Landing Page (2 hours)

**What you'll learn:** Simple web development, deployment

**Landing Page Structure:**

```
/website
├── index.html
├── styles.css
├── script.js (optional)
└── assets/
    ├── screenshots/
    │   ├── home-screen.png
    │   ├── suggestions-screen.png
    │   └── history-screen.png
    └── icon.png
```

**Sections:**
1. **Hero:**
   - App name and tagline
   - Primary call-to-action (Download - future)
   - Screenshot or phone mockup

2. **Value Proposition:**
   - "Why MealMix?" section
   - 3-4 key benefits
   - Icons or illustrations

3. **How It Works:**
   - 3-step process
   - Screenshots

4. **Features:**
   - Variety enforcement
   - Customizable ingredients
   - Meal tracking
   - Visual cards

5. **Call-to-Action:**
   - Coming soon to App Store / Play Store
   - Email signup (optional)

6. **Footer:**
   - Privacy policy link (future)
   - Contact
   - Social links (future)

**Simple HTML Template:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MealMix - Variety Made Simple</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <nav>
      <img src="assets/icon.png" alt="MealMix" class="logo">
      <h1>MealMix</h1>
    </nav>
  </header>

  <section class="hero">
    <h2>Never eat the same thing twice</h2>
    <p>Eliminate meal decision fatigue with variety-enforced suggestions.</p>
    <button class="cta">Coming Soon</button>
  </section>

  <section class="features">
    <h3>Why MealMix?</h3>
    <div class="feature-grid">
      <div class="feature">
        <h4>🎲 Variety Enforced</h4>
        <p>Algorithm ensures you don't repeat meals within your cooldown period.</p>
      </div>
      <div class="feature">
        <h4>⚡ Decision in 20 Seconds</h4>
        <p>See 4 suggestions instantly. Pick one and get on with your day.</p>
      </div>
      <div class="feature">
        <h4>🎨 Fully Customizable</h4>
        <p>Add your own ingredients, categories, and meal types.</p>
      </div>
    </div>
  </section>

  <section class="screenshots">
    <h3>How It Works</h3>
    <div class="screenshot-grid">
      <img src="assets/screenshots/home-screen.png" alt="Home">
      <img src="assets/screenshots/suggestions-screen.png" alt="Suggestions">
      <img src="assets/screenshots/history-screen.png" alt="History">
    </div>
  </section>

  <footer>
    <p>&copy; 2025 MealMix. All rights reserved.</p>
  </footer>
</body>
</html>
```

**Deploy Options:**
1. **GitHub Pages** (free, easy)
   - Create `/website` folder
   - Enable GitHub Pages in repo settings
   - Set source to `/website` folder

2. **Vercel** (free, fast)
   - Connect GitHub repo
   - Deploy with one click
   - Auto-deploy on push

3. **Netlify** (free, drag-and-drop)
   - Drag folder to Netlify
   - Get instant URL

---

### Step 2.9: Take Screenshots (1 hour)

**What you'll learn:** App marketing materials

**Screenshot Guidelines:**
- Clean device mockups (iPhone or Pixel)
- Light mode (better for marketing)
- Real data (not lorem ipsum)
- Highlight key features
- Consistent status bar (time at 9:41)

**Tools:**
- **Expo Go:** Take screenshots directly on device
- **Simulator:** iOS simulator has screenshot feature
- **Mockup Tools:**
  - [Previewed](https://previewed.app) - Free device mockups
  - [Shots](https://shots.so) - Create marketing images
  - [Figma plugins](https://www.figma.com/community/tag/mockup) - Device frames

**Screenshots to Capture:**
1. Home screen (with meal type buttons)
2. Suggestions screen (4 meal cards)
3. Confirmation modal
4. History screen
5. Settings screen
6. Manage ingredients screen

**Process:**
1. Ensure app has good sample data
2. Take screenshots on device/simulator
3. Add to mockup frames
4. Export as PNG
5. Optimize file size (TinyPNG.com)
6. Add to landing page

---

### Step 2.10: Update README.md (30 min)

**What you'll learn:** Project presentation

**New README Structure:**
```markdown
# MealMix

> Eliminate meal decision fatigue with variety-enforced suggestions.

[App Icon]

## What is MealMix?

MealMix helps you decide what to eat for breakfast and snacks without repeating meals too often. Get 4 personalized suggestions in seconds based on your preferences and eating history.

## Features

- 🎲 **Variety Enforced** - Algorithm prevents repetition
- ⚡ **Fast Decisions** - Pick a meal in under 20 seconds
- 🎨 **Fully Customizable** - Add your own ingredients and categories
- 📊 **Meal Tracking** - See your eating history
- 🌙 **Dark Mode** - Easy on the eyes

## Download

- 📱 iOS: Coming soon
- 🤖 Android: Coming soon

## Built With

- React Native + Expo
- SQLite (local-first)
- Zustand (state management)
- OpenTelemetry (observability)

## Development

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup and development guidelines.

## License

MIT - See [LICENSE](./LICENSE)
```

---

### Step 2.11: Testing & Validation (1-1.5 hours)

**What you'll learn:** Ensuring branding changes don't break functionality

**Regression Testing:**
```bash
# 1. Run all unit tests
npm test

# 2. Run E2E tests
npm run test:e2e

# 3. TypeScript check
npx tsc --noEmit

# 4. Linting
npm run lint
```

**Manual Testing:**
1. **Verify all features still work:**
   - [ ] Add ingredient
   - [ ] Add category
   - [ ] Add meal type
   - [ ] Generate suggestions
   - [ ] Log meal
   - [ ] View history

2. **Verify branding appears correctly:**
   - [ ] App icon on device home screen
   - [ ] Splash screen on launch
   - [ ] App name in settings
   - [ ] Theme colors throughout app
   - [ ] No "demo" text anywhere

3. **Cross-platform check:**
   - [ ] Web mode works
   - [ ] Android device works
   - [ ] iOS device works (if available)

**Landing Page Testing:**
1. **Functionality:**
   - [ ] Page loads on all browsers (Chrome, Firefox, Safari)
   - [ ] Responsive on mobile
   - [ ] Responsive on tablet
   - [ ] Responsive on desktop
   - [ ] Images load correctly
   - [ ] Links work

2. **Content:**
   - [ ] No typos
   - [ ] Screenshots are current
   - [ ] Value proposition is clear
   - [ ] Contact info is correct

---

### Step 2.12: Deployment (1-2 hours)

**What you'll learn:** Deploying branded app and landing page

**1. Deploy Landing Page:**

**Option A: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to website folder
cd website

# Deploy
vercel

# Follow prompts
# Set project name
# Deploy to production

# Get URL: https://your-app-name.vercel.app
```

**Option B: Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to website folder
cd website

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod

# Get URL: https://your-app-name.netlify.app
```

**Option C: GitHub Pages**
```bash
# 1. Create gh-pages branch
git checkout -b gh-pages

# 2. Copy website files to root
cp -r website/* .

# 3. Commit and push
git add .
git commit -m "docs: deploy landing page"
git push origin gh-pages

# 4. Enable GitHub Pages in repo settings
# Settings → Pages → Source: gh-pages branch

# Get URL: https://your-username.github.io/repo-name
```

**Landing Page Checklist:**
- [ ] Page is live and accessible
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled
- [ ] Screenshots are latest version
- [ ] Download links updated (when APK ready)

**2. Build Branded APK:**
```bash
# Return to app directory
cd demo-react-native-app  # or new name

# Build preview APK with new branding
eas build --platform android --profile preview

# Wait for build (10-20 minutes)
# Download APK when complete
```

**APK Testing:**
- [ ] Install on device
- [ ] Verify new icon appears
- [ ] Verify new splash screen
- [ ] Verify app name in launcher
- [ ] Verify app name in settings
- [ ] Test all features work
- [ ] No crashes
- [ ] Performance is good

**3. Update Documentation:**
- [ ] Update README.md with new name
- [ ] Update landing page URL
- [ ] Add screenshot showing new branding
- [ ] Document brand guidelines

**Git Commit:**
```bash
git add .

git commit -m "feat: rebrand to [YourAppName] (Epic 3 Phase 2)

- Finalize app name and branding
- Design professional icon and splash screen
- Update theme colors
- Remove all 'demo' references
- Create and deploy landing page
- Build branded APK

Landing page: https://your-app.vercel.app
All tests passing ✅

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

---

## ✅ Success Criteria

### Brand Identity
- [ ] App has a unique, memorable name
- [ ] Brand colors defined and documented
- [ ] Tagline communicates value clearly
- [ ] Name is not trademarked
- [ ] Domain available (optional)

### Visual Assets
- [ ] Professional app icon (1024x1024)
- [ ] Adaptive icon for Android
- [ ] Splash screen designed
- [ ] Favicon created
- [ ] All assets optimized and crisp
- [ ] Assets look good at all sizes

### Code Updates
- [ ] All "demo" references removed
- [ ] Package name updated
- [ ] Bundle identifiers updated
- [ ] Theme colors updated
- [ ] No broken references
- [ ] All imports still work

### Web Presence
- [ ] Landing page created
- [ ] Screenshots captured (6+ screenshots)
- [ ] Landing page deployed and live
- [ ] URL is accessible
- [ ] Mobile-responsive design
- [ ] Fast loading (<3 seconds)

### Testing
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] No TypeScript errors
- [ ] Linter passes
- [ ] Manual testing complete

### Deployment
- [ ] Landing page deployed successfully
- [ ] Branded APK built successfully
- [ ] APK tested on device
- [ ] App installs correctly
- [ ] New icon appears on device
- [ ] New splash screen shows
- [ ] All features work in branded build

### Documentation
- [ ] README.md updated with new name
- [ ] Brand guidelines documented
- [ ] Assets have source files
- [ ] Session status updated
- [ ] Git commit pushed

---

## 🎓 Learning Outcomes

After completing Phase 2, you'll understand:
- Product naming and branding
- Mobile icon design principles
- App configuration and identity
- Simple web development and deployment
- Marketing materials creation
- Professional project presentation

---

## 🚀 Next Steps

After completing Phase 2:
1. Share landing page with friends/family
2. Get feedback on name and branding
3. Build new APK with updated branding
4. Move to [Phase 3: Project Structure & Documentation →](./PHASE3_PROJECT_STRUCTURE.md)

---

[← Back to Overview](./OVERVIEW.md) | [Previous: Phase 1](./PHASE1_USER_CUSTOMIZATION.md) | [Next: Phase 3 →](./PHASE3_PROJECT_STRUCTURE.md)

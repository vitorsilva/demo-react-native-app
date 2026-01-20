# Phase 2: Branding & Identity - Session Notes

**Epic:** 3 - Meals Randomizer V1
**Phase:** 2 - Branding & Identity
**Status:** In Progress
**Started:** 2026-01-20

---

## Session 1: Name Brainstorming & Brand Identity

### What We Did

1. **Reviewed Saberloop Branding Process**
   - Checked `demo-pwa-app/docs/learning/epic03_quizmaster_v2/PHASE3.5_LEARNING_NOTES.md`
   - Learned: Made-up/hybrid words more likely available
   - Learned: Always check USPTO trademark (Class 041 for apps)
   - Learned: Domain available ≠ legally available

2. **Defined Naming Criteria**
   - Vibe: Fun/Playful (not corporate, not childish)
   - Portuguese connection (like Saberloop)
   - International appeal

3. **Name Brainstorming Journey**
   - Started with **PlateRoulette** (fun, but no Portuguese)
   - Explored Portuguese words: Rodízio, Mistura, Sabor, Roda, Girar
   - Rejected Rodízio (too Brazilian-specific)
   - Focused on **Sabor** (flavor/taste)
   - Candidates: SaborSpin, SaborLoop, SaborShuffle, SaborFlip

4. **International Analysis: SaborSpin**
   | Language | "Sabor" | "Spin" | Combined |
   |----------|---------|--------|----------|
   | Portuguese/Spanish | "Flavor" ✅ | Understood | "Flavor Spin" |
   | English | Sounds like "savor" ✅ | Native word | "Savor Spin" |
   | Arabic/Hindi | "Sabr" = patience ✅ | Understood | Positive |
   | Others | Neutral | Common loanword | Neutral |

5. **Availability Checks - ALL CLEAR**
   - USPTO Trademark: ✅ No exact match, no conflicts in Class 041
   - Domain: ✅ saborspin.com available (6€)
   - Google Play: ✅ "Não existem resultados" (no apps)

### Final Name Decision

**Product Name: SaborSpin**
**Domain: saborspin.com** (to be purchased)
**Meaning:** "Flavor Spin" - spin the wheel of flavors for your next meal!

---

### Brand Identity Decisions

**Brand Personality:**
- Playful - like a game, not a chore
- Friendly - approachable, not intimidating
- Quick - fast decisions, no overthinking
- Colorful - vibrant, appetizing
- Personal - your ingredients, your meals

**NOT:**
- Corporate/sterile
- Complicated/overwhelming
- Preachy about nutrition
- Childish

**Color Palette (Warm & Appetizing):**

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary | Orange | #FF6B35 | Buttons, highlights, brand accent |
| Secondary | Green | #4CAF50 | Success states, fresh/healthy feel |
| Accent | Yellow | #FFC107 | Warnings, stars, playful touches |
| Background (Light) | Light Gray | #F8F9FA | Light mode background |
| Background (Dark) | Dark Blue | #1A1A2E | Dark mode background |
| Text (Light mode) | Near Black | #1A1A1A | Primary text |
| Text (Dark mode) | Off White | #ECEDEE | Primary text |

**Note:** Orange (#FF6B35) shared with Saberloop - subtle brand family connection!

**Tagline:** "Shake up your plate"

---

### Future Feature: Shake to Generate

User idea: Add shake functionality to generate new meal suggestions.
- Ties branding ("Shake up your plate") directly to UX
- Use device accelerometer to detect shake
- Trigger `generateMealSuggestions()` on shake
- Add to backlog for Phase 4 or future epic

---

## Session 1 (continued): Icon, Splash, Configuration

### What We Did

1. **Step 2.3: App Icon Design** ✅
   - Generated icon using Gemini AI (Prompt 2: Circular Food Arrangement)
   - Icon features: spinning plate with food items, brand colors, dark background
   - Created `scripts/generate-icons.js` using Sharp library
   - Generated all required sizes:
     - `icon.png` (1024x1024) - iOS
     - `adaptive-icon.png` (1024x1024) - Android
     - `favicon.png` (48x48) - Web
     - `splash-icon.png` (512x512) - Splash screen

2. **Step 2.4: Splash Screen** ✅
   - Updated `app.json` splash configuration
   - Background color: `#1A1A2E` (brand dark blue)
   - Icon size: 280px (larger for visibility)

3. **Step 2.5: Update App Configuration** ✅
   - `app.json` updates:
     - name: "SaborSpin"
     - slug: "saborspin"
     - scheme: "saborspin"
     - android.package: "com.vitorsilvavmrs.saborspin"
     - android.adaptiveIcon.backgroundColor: "#1A1A2E"
   - `package.json` updates:
     - name: "saborspin"
     - description: "Shake up your plate - Variety-enforced meal suggestions"

4. **Step 2.6: Remove Demo References** ✅
   - Updated `lib/telemetry/telemetry.ts`: service name → "saborspin"
   - Note: Folder path references kept (actual folder structure, not app name)

5. **Step 2.7: Update Theme Colors** ✅
   - Updated `constants/theme.ts` with brand colors
   - Primary: #FF6B35 (Orange), Secondary: #4CAF50 (Green), Accent: #FFC107 (Yellow)
   - Background dark: #1A1A2E

6. **Step 2.8: Landing Page** ✅
   - Created `landing/index.html` following Saberloop methodology
   - Single HTML file with inline CSS
   - Sections: Header, Hero, Features, How It Works, Variety, CTA, Footer
   - Mobile responsive design
   - Brand colors and SaborSpin messaging
   - Copied icon.png and favicon.png to `landing/images/`
   - Created `scripts/deploy-landing.cjs` for FTP deployment
   - Created root `package.json` with deploy scripts

7. **Step 2.9: Take Screenshots** ✅
   - Updated app header from "Meals Randomizer" to "SaborSpin"
   - Updated E2E test to match new header
   - Captured branded screenshots: home, suggestions, ingredients, settings
   - Added screenshots to landing page (phone mockup)

8. **Step 2.10: Update README.md** ✅
   - Rebranded from "Demo React Native App" to "SaborSpin"
   - Added app screenshot
   - Updated feature list, tech stack, project structure
   - Documented landing page deployment
   - Added brand section

9. **Step 2.11: Testing & Validation** ✅
   - 101 unit tests passing
   - TypeScript type check passing
   - ESLint passing

10. **Step 2.12: Deployment** ⚠️
    - EAS project needs re-linking due to slug change
    - Removed old projectId from app.json
    - Manual step required: Run `npx eas init` and select "Create new project"
    - Then run: `npx eas build --platform android --profile preview`

---

## Current Progress

**Step 2.1: Name Brainstorming** ✅ COMPLETE
**Step 2.2: Brand Identity** ✅ COMPLETE
**Step 2.3: App Icon Design** ✅ COMPLETE
**Step 2.4: Splash Screen Design** ✅ COMPLETE
**Step 2.5: Update App Configuration** ✅ COMPLETE
**Step 2.6: Remove Demo References** ✅ COMPLETE
**Step 2.7: Update Theme Colors** ✅ COMPLETE
**Step 2.8: Landing Page** ✅ COMPLETE
**Step 2.9: Take Screenshots** ✅ COMPLETE
**Step 2.10: Update README.md** ✅ COMPLETE
**Step 2.11: Testing & Validation** ✅ COMPLETE
**Step 2.12: Deployment** ⚠️ MANUAL STEP REQUIRED (see notes above)

## Phase 2 ~99% COMPLETE!

**Note:** One manual step remains - re-link EAS project and trigger build.

---

## Key Learnings

1. **Portuguese hybrid names work well** - "Sabor" adds personality and uniqueness
2. **International appeal matters** - SaborSpin works in PT, ES, EN, and sounds positive in AR/HI
3. **Branding can inform features** - "Shake up your plate" led to shake-to-generate idea
4. **Brand family consistency** - Sharing orange with Saberloop creates subtle connection
5. **Check everything before committing** - USPTO, domain, app stores
6. **Sharp for icon generation** - Node.js library for image processing, installed as dev dependency
7. **AI icon generation** - Gemini produces good results with detailed prompts (colors, style, format)
8. **Adaptive icons** - Android uses foreground + background layers, safe zone is center 66%

---

## Files Modified

| File | Changes |
|------|---------|
| `app.json` | name, slug, scheme, android package, splash config, adaptive icon |
| `package.json` | name, description, added sharp dependency |
| `lib/telemetry/telemetry.ts` | Service name → saborspin |
| `assets/images/icon.png` | New SaborSpin icon (1024x1024) |
| `assets/images/adaptive-icon.png` | Android foreground (1024x1024) |
| `assets/images/favicon.png` | Web favicon (48x48) |
| `assets/images/splash-icon.png` | Splash screen icon (512x512) |
| `scripts/generate-icons.js` | NEW - Icon generation script |
| `constants/theme.ts` | Updated with brand colors |
| `landing/index.html` | NEW - Landing page |
| `landing/images/icon.png` | Landing page logo |
| `landing/images/favicon.png` | Landing page favicon |

---

## Next Steps

**Resume from:** Step 2.9 - Take Screenshots

**Remaining Tasks:**
1. Take screenshots for marketing
2. Update README.md
3. Run tests to validate branding changes
4. Build and deploy branded APK

---

**Last Updated:** 2026-01-20

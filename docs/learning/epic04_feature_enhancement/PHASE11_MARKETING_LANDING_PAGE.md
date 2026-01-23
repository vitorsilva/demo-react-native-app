# Phase 11: Marketing & Landing Page Update

**Status:** 📋 PLANNED

**Goal:** Create marketing materials and update landing page to showcase Epic 04 features

**Dependencies:**
- Phase 10 (Quality Validation) - Quality must be validated before marketing

---

## Overview

This phase combines marketing documentation with landing page updates:
1. Create marketing materials (feature highlights, app store descriptions, social media)
2. Capture screenshots of new features
3. Update landing page HTML with new sections
4. Deploy landing page to saborspin.com

---

## Branching Strategy

**Branch Name:** `PHASE_11_MARKETING_LANDING_PAGE`

**Approach:**
- Create branch from `main`
- Small commits per document/feature type
- Commit format: `docs(marketing): <description>` or `feat(landing): <description>`

---

## Tool Instructions

### Image Processing
```bash
# If using sharp for image optimization
npm install -g sharp-cli

# Resize/optimize screenshots
sharp -i input.png -o output.png resize 1280 720
```

### Screenshot Capture
```bash
cd demo-react-native-app

# Use Playwright for consistent screenshots
npx playwright test e2e/capture-landing-screenshots.spec.ts --headed

# Or update existing snapshots
npm run test:e2e -- --update-snapshots
```

### Local Preview
```bash
# Preview landing page locally
npm run preview:landing

# Opens http://localhost:3333
```

### Deployment
```bash
# Deploy to production
npm run deploy:landing
```

---

## Implementation Order

| Order | Task | Type | Effort | Status |
|-------|------|------|--------|--------|
| 1 | Write feature highlights document | Documentation | ~1 hour | not started |
| 2 | Update App Store description | Documentation | ~30 min | not started |
| 3 | Update Play Store description | Documentation | ~30 min | not started |
| 4 | Create "What's New" changelog | Documentation | ~30 min | not started |
| 5 | Create social media posts | Documentation | ~1 hour | not started |
| 6 | Update press kit | Documentation | ~30 min | not started |
| 7 | Create screenshot capture script | Development | ~1 hour | not started |
| 8 | Capture feature screenshots | Assets | ~30 min | not started |
| 9 | Process images for web | Assets | ~30 min | not started |
| 10 | Update landing page hero | Development | ~30 min | not started |
| 11 | Add Family Sharing section | Development | ~1 hour | not started |
| 12 | Update feature cards | Development | ~30 min | not started |
| 13 | Update screenshot gallery | Development | ~30 min | not started |
| 14 | Update meta tags | Development | ~15 min | not started |
| 15 | Test responsive layout | Testing | ~30 min | not started |
| 16 | Deploy landing page | Deployment | ~15 min | not started |
| 17 | Verify landing page live | Verification | ~15 min | not started |
| 18 | Commit all marketing docs | Git | ~10 min | not started |

**Total Estimated Effort:** ~10 hours

---

## Part 1: Marketing Documentation

### Marketing Documents to Create

#### 1. Feature Highlights Document

**File:** `docs/marketing/EPIC04_FEATURES.md`

```markdown
# SaborSpin Epic 04: Family Kitchen Edition

## New Features

### Favorites & Polish
- **Favorite Combinations** - Mark your go-to meals with a star
- **"New!" Badges** - Discover combinations you haven't tried
- **Variety Indicators** - Color-coded freshness at a glance
- **Variety Stats** - Track your meal diversity over time
- **Haptic Feedback** - Satisfying tactile responses

### Smarter Suggestions
- **Preparation Methods** - Fried, grilled, roasted and more
- **Named Meals** - Save "Mom's Chicken" for quick access
- **Ingredient Variety** - Smarter rotation at ingredient level
- **Pairing Rules** - Set what goes well together

### Family Sharing
- **Family Groups** - Create or join a family kitchen
- **Shared Meal History** - See what everyone's eating
- **Meal Proposals** - Suggest meals for family voting
- **Cross-Device Sync** - Your data everywhere

### Full Day Meals
- **Lunch & Dinner Support** - Beyond breakfast and snacks
- **Main + Sides Structure** - Complete meal suggestions
- **Protein Rotation** - Balanced variety across the week
```

#### 2. App Store Description Updates

**File:** `docs/marketing/APP_STORE_DESCRIPTION.md`

Include:
- Short description (80 chars)
- Full description (4000 chars)
- Keywords
- What's New text

#### 3. Play Store Description Updates

**File:** `docs/marketing/PLAY_STORE_DESCRIPTION.md`

Include:
- Short description (80 chars)
- Full description (4000 chars)
- Feature graphic specifications
- What's New text

**What's New Example:**
```
Version 1.2.0 - Family Kitchen Edition

🆕 New Features:
• Family Sharing - Create families and share meal ideas
• Meal Proposals - Vote on what to eat together
• Cross-Device Sync - Your data everywhere
• Lunch & Dinner - Full day meal planning
• Favorites - Mark your go-to combinations
• Variety Stats - Track your meal diversity

🐛 Bug Fixes:
• Various performance improvements
```

#### 4. Social Media Posts

**File:** `docs/marketing/SOCIAL_MEDIA.md`

Include posts for:
- Launch announcement
- Feature highlights (one per major feature)
- Family sharing focus
- Tips and tricks

#### 5. Press Kit

**File:** `docs/marketing/PRESS_KIT.md`

Include:
- App overview
- Key features list
- Screenshots (high-res)
- Logo assets
- Contact information

---

## Part 2: Landing Page Update

### Features to Showcase

| Feature | Phase | Marketing Impact |
|---------|-------|------------------|
| Favorites | Phase 1 | Medium - User convenience |
| Family creation | Phase 4 | **High** - Key differentiator |
| Join via QR/code/link | Phase 4 | **High** - Easy onboarding |
| Shared meal logs | Phase 5 | **High** - Core value prop |
| Cross-device sync | Phase 6 | **High** - Technical differentiator |
| Meal proposals & voting | Phase 7 | **High** - Collaboration feature |
| Lunch/dinner support | Phase 9 | Medium - Expanded use case |

### Screenshot Capture Script

**File:** `e2e/capture-landing-screenshots.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

const MOBILE_VIEWPORT = { width: 375, height: 667 };
const SCREENSHOT_DIR = 'landing/images';

test.use({ viewport: MOBILE_VIEWPORT });

test.describe('Capture Landing Page Screenshots', () => {

  test('Home with favorites', async ({ page }) => {
    await page.goto('http://localhost:8081');
    // Navigate to home, show favorites
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/screenshot-home-favorites.png`,
      fullPage: false
    });
    console.log('✓ Captured: Home with favorites');
  });

  test('Family creation screen', async ({ page }) => {
    await page.goto('http://localhost:8081');
    // Navigate to family creation
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/screenshot-family-create.png`,
      fullPage: false
    });
    console.log('✓ Captured: Family creation');
  });

  test('Family invite QR code', async ({ page }) => {
    await page.goto('http://localhost:8081');
    // Navigate to invite screen
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/screenshot-family-invite.png`,
      fullPage: false
    });
    console.log('✓ Captured: Family invite');
  });

  test('Family meal history', async ({ page }) => {
    await page.goto('http://localhost:8081');
    // Navigate to family history
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/screenshot-family-history.png`,
      fullPage: false
    });
    console.log('✓ Captured: Family meal history');
  });

  test('Meal proposal voting', async ({ page }) => {
    await page.goto('http://localhost:8081');
    // Navigate to proposals
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/screenshot-proposal.png`,
      fullPage: false
    });
    console.log('✓ Captured: Meal proposal');
  });

  test('Sync status indicator', async ({ page }) => {
    await page.goto('http://localhost:8081');
    // Show sync indicator
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/screenshot-sync.png`,
      fullPage: false
    });
    console.log('✓ Captured: Sync status');
  });

});
```

### Image Processing

```bash
# Resize to landing page dimensions (304x584)
npx sharp-cli landing/images/screenshot-*.png -o landing/images/ resize 304 584

# Verify file sizes (should be <50KB each)
ls -la landing/images/screenshot-*.png
```

### Screenshot Requirements

| Screen | Description | Filename |
|--------|-------------|----------|
| Home | With favorite and variety indicators | `marketing_home.png` |
| Suggestions | Showing New! badge and colors | `marketing_suggestions.png` |
| History | With favorites filter active | `marketing_history.png` |
| Family | Family member list | `marketing_family.png` |
| Proposals | Voting on a meal | `marketing_proposals.png` |
| Lunch/Dinner | Main + sides suggestion | `marketing_dinner.png` |
| Stats | Variety statistics card | `marketing_stats.png` |

**Save to:** `docs/marketing/screenshots/`

### HTML Updates

#### 1. Hero Section Update

**Current tagline:** "Shake up your plate"

**Proposed tagline:** "Shake up your plate - together"

Or expand subtitle:
> "Meal suggestions for the whole family. Sync across devices, vote on what to eat."

#### 2. New Family Sharing Section

```html
<!-- Family Sharing Section -->
<section class="family-section">
  <h2>Share with Your Family</h2>
  <div class="family-content">
    <div class="family-screenshot">
      <img src="images/screenshot-family-history.png"
           alt="Family meal history"
           width="304" height="584"
           loading="lazy">
    </div>
    <div class="family-text">
      <h3>Cook Together, Eat Together</h3>
      <p>Connect your household and coordinate meals.</p>
      <ul>
        <li>Create a family and invite members via QR code</li>
        <li>See what everyone ate today</li>
        <li>Propose meals and vote together</li>
        <li>Sync across all your devices</li>
      </ul>
      <a href="#download" class="btn btn-primary">Get Started</a>
    </div>
  </div>
</section>
```

#### 3. Feature Cards Update

```html
<!-- Family Feature Card -->
<div class="feature-card">
    <div class="feature-icon">👨‍👩‍👧‍👦</div>
    <h3>Family Sharing</h3>
    <p>Create a family, invite members, and coordinate meals together.</p>
</div>

<!-- Sync Feature Card -->
<div class="feature-card">
    <div class="feature-icon">☁️</div>
    <h3>Sync Everywhere</h3>
    <p>Your meal data syncs across all your devices automatically.</p>
</div>

<!-- Voting Feature Card -->
<div class="feature-card">
    <div class="feature-icon">🗳️</div>
    <h3>Meal Voting</h3>
    <p>Propose meals and let the family vote on what to eat.</p>
</div>
```

#### 4. Meta Tags Update

```html
<meta name="description" content="SaborSpin - Meal suggestions for the whole family. Generate variety-enforced ideas, share with family, and vote on what to eat. Works offline.">

<meta property="og:description" content="Meal suggestions for the whole family. Generate ideas, share with family, sync across devices.">

<meta name="twitter:description" content="Meal suggestions for the whole family. Generate ideas, share with family, sync across devices.">
```

### CSS Additions

```css
/* Family Section */
.family-section {
  padding: 80px 20px;
  background: var(--background-light);
}

.family-content {
  display: flex;
  gap: 40px;
  max-width: 1000px;
  margin: 0 auto;
  align-items: center;
}

.family-screenshot img {
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.family-text h3 {
  font-size: 2rem;
  margin-bottom: 16px;
}

.family-text ul {
  list-style: none;
  padding: 0;
}

.family-text li {
  padding: 8px 0;
  padding-left: 24px;
  position: relative;
}

.family-text li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: var(--primary);
}

/* Responsive */
@media (max-width: 768px) {
  .family-content {
    flex-direction: column;
    text-align: center;
  }
}
```

### Responsive Testing

Test at these breakpoints:
- Mobile: 375px (primary target)
- Tablet: 768px
- Desktop: 1200px+

---

## I18N Considerations

Marketing materials should be available in:
- English (primary)
- Portuguese (PT-PT)

For app store listings, create locale-specific versions.

---

## Image Specifications

| Type | Dimensions | Format | Max Size | Location |
|------|------------|--------|----------|----------|
| App Screenshot | 304x584 | PNG | 50KB | `landing/images/` |
| Marketing Screenshot | 1280x720 | PNG | 100KB | `docs/marketing/screenshots/` |
| Icon | 512x512 | PNG | 100KB | `landing/images/` |
| Favicon | 32x32 | PNG | 5KB | `landing/images/` |

---

## Files to Create/Modify

### New Files

```
docs/marketing/
├── EPIC04_FEATURES.md           # Feature highlights
├── APP_STORE_DESCRIPTION.md     # App Store listing
├── PLAY_STORE_DESCRIPTION.md    # Play Store listing
├── SOCIAL_MEDIA.md              # Social posts
├── PRESS_KIT.md                 # Press kit
└── screenshots/                 # Marketing screenshots
    ├── marketing_home.png
    ├── marketing_suggestions.png
    ├── marketing_history.png
    ├── marketing_family.png
    ├── marketing_proposals.png
    ├── marketing_dinner.png
    └── marketing_stats.png

e2e/
└── capture-landing-screenshots.spec.ts

landing/images/
├── screenshot-home-favorites.png
├── screenshot-family-create.png
├── screenshot-family-invite.png
├── screenshot-family-history.png
├── screenshot-proposal.png
└── screenshot-sync.png
```

### Modified Files

| File | Changes |
|------|---------|
| `landing/index.html` | Hero, family section, feature cards, screenshots, meta tags |
| `package.json` | Add sharp-cli if not present |

---

## Success Criteria

Phase 11 is complete when:

**Marketing Documentation:**
- [ ] Feature highlights document created
- [ ] App Store description updated
- [ ] Play Store description updated
- [ ] What's New changelog created
- [ ] Social media posts drafted
- [ ] Press kit updated

**Landing Page:**
- [ ] All feature screenshots captured (7+ new images)
- [ ] Images optimized (<50KB each)
- [ ] Landing page updated with family section
- [ ] Feature cards include family sharing
- [ ] Screenshot gallery shows family features
- [ ] Meta tags updated for SEO
- [ ] Responsive layout works on all devices
- [ ] Deployed to saborspin.com
- [ ] Live site verified

**Git:**
- [ ] All documents committed to repository

---

## Learning Notes

Document unexpected errors, workarounds, and fixes encountered:

**[Phase 11 Learning Notes →](./PHASE11_LEARNING_NOTES.md)**

---

## Reference

### Related Documents
- [Quality Final Report](./EPIC04_QUALITY_FINAL.md)
- [Phase 12: Staging & Production Deployment](./PHASE12_STAGING_PRODUCTION_DEPLOYMENT.md)
- [Brand Guidelines](../../architecture/BRAND.md)
- [Landing Page Templates (archived)](./PHASE10_LANDING_PAGE_UPDATE_ARCHIVED.md) - Detailed HTML/CSS templates

### Developer Guides
- [Testing Guide](../../developer-guide/TESTING.md) - For screenshot capture
- [Troubleshooting](../../developer-guide/TROUBLESHOOTING.md)

### Existing Landing Page
- `landing/index.html` - Current landing page
- `scripts/deploy-landing.cjs` - Deployment script

---

## Marketing Copy Suggestions

### Taglines
- "Shake up your plate - together"
- "Meal ideas for the whole family"
- "What should WE eat?"

### Feature Highlights
- "Connect your household"
- "Sync across all devices"
- "Vote on tonight's dinner"
- "See what everyone ate"

### CTAs
- "Start Cooking Together"
- "Create Your Family"
- "Get the App"

---

*Phase 11: Marketing & Landing Page Update*

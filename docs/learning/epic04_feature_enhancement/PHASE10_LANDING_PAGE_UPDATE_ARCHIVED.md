# Phase 10: Landing Page Update

**Status:** 📋 PLANNED

**Goal:** Update landing page to showcase family sharing features from Epic 04

**Dependencies:**
- Phase 9 (Lunch/Dinner Expansion) - All features complete
- All Epic 04 features deployed and working

---

## Overview

After completing all Epic 04 features, update the landing page (saborspin.com) to showcase the new family sharing capabilities:

1. Capture screenshots of new features
2. Process images for web optimization
3. Update landing page HTML with new sections
4. Deploy to production

---

## Development Prerequisites

### Tools Required

```bash
# Image processing
npm install --save-dev sharp-cli

# Screenshot capture (already have Playwright)
npx playwright install chromium

# Local preview
npm install --save-dev serve
```

### Existing Scripts

| Script | Purpose |
|--------|---------|
| `npm run preview:landing` | Preview landing page locally (port 3333) |
| `npm run deploy:landing` | Deploy landing page to saborspin.com |

---

## Features to Showcase

### New Features from Epic 04

| Feature | Phase | Marketing Impact |
|---------|-------|------------------|
| Family creation | Phase 4 | **High** - Key differentiator |
| Join via QR/code/link | Phase 4 | **High** - Easy onboarding |
| Shared meal logs | Phase 5 | **High** - Core value prop |
| Family meal history | Phase 5 | Medium - Visual appeal |
| Cross-device sync | Phase 6 | **High** - Technical differentiator |
| Meal proposals & voting | Phase 7 | **High** - Collaboration feature |
| P2P sync (if implemented) | Phase 8 | Low - Technical detail |
| Lunch/dinner support | Phase 9 | Medium - Expanded use case |

---

## Landing Page Architecture

```
saborspin.com/
├── index.html          # Landing page
├── images/             # Landing page images
│   ├── icon.png
│   ├── favicon.png
│   ├── screenshot-*.png
│   └── [new screenshots]
└── [deployed from ./landing/]

./landing/
├── index.html          # Main landing page HTML
└── images/             # Screenshots and assets
```

---

## Implementation Order

| # | Task | Effort | Notes |
|---|------|--------|-------|
| 1 | Run existing test suites | ~15 min | Baseline validation |
| 2 | Run quality baseline | ~30 min | Compare before/after |
| 3 | Create screenshot capture script | ~1 hour | Playwright E2E |
| 4 | Capture feature screenshots | ~30 min | Run capture script |
| 5 | Process images for web | ~30 min | Resize to 304x584 |
| 6 | Update landing page hero | ~30 min | New tagline |
| 7 | Add Family Sharing section | ~1 hour | New HTML section |
| 8 | Update feature cards | ~30 min | Add family features |
| 9 | Update screenshot gallery | ~30 min | Add new screenshots |
| 10 | Update meta tags | ~15 min | SEO descriptions |
| 11 | Test responsive layout | ~30 min | Mobile, tablet, desktop |
| 12 | Deploy to staging | ~15 min | Verify before production |
| 13 | Deploy to production | ~15 min | Final deployment |
| 14 | Update documentation | ~30 min | Developer guide |
| 15 | Run quality checks and compare | ~30 min | Compare to baseline |
| 16 | Document learning notes | ~30 min | Capture issues/fixes |

**Total Estimated Effort:** ~8 hours

---

## Screenshot Capture

### Step 1: Create Capture Script

**File:** `e2e/capture-landing-screenshots.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

const MOBILE_VIEWPORT = { width: 375, height: 667 };
const SCREENSHOT_DIR = 'landing/images';

test.use({ viewport: MOBILE_VIEWPORT });

test.describe('Capture Landing Page Screenshots', () => {

  test('Family creation screen', async ({ page }) => {
    await page.goto('http://localhost:8081');
    // Navigate to family creation
    // ... setup UI state
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/screenshot-family-create.png`,
      fullPage: false
    });
    console.log('✓ Captured: Family creation');
  });

  test('Family invite QR code', async ({ page }) => {
    await page.goto('http://localhost:8081');
    // Navigate to invite screen
    // ... setup UI state
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/screenshot-family-invite.png`,
      fullPage: false
    });
    console.log('✓ Captured: Family invite');
  });

  test('Family meal history', async ({ page }) => {
    await page.goto('http://localhost:8081');
    // Navigate to family history
    // ... setup UI state
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/screenshot-family-history.png`,
      fullPage: false
    });
    console.log('✓ Captured: Family meal history');
  });

  test('Meal proposal voting', async ({ page }) => {
    await page.goto('http://localhost:8081');
    // Navigate to proposals
    // ... setup UI state
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/screenshot-proposal.png`,
      fullPage: false
    });
    console.log('✓ Captured: Meal proposal');
  });

  test('Sync status indicator', async ({ page }) => {
    await page.goto('http://localhost:8081');
    // Show sync indicator
    // ... setup UI state
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/screenshot-sync.png`,
      fullPage: false
    });
    console.log('✓ Captured: Sync status');
  });

});
```

### Step 2: Run Capture Script

```bash
# Start the app first
npm start

# In another terminal, run capture
npx playwright test e2e/capture-landing-screenshots.spec.ts --headed
```

### Step 3: Process Images

```bash
# Resize to landing page dimensions (304x584)
# Using Sharp CLI
npx sharp-cli landing/images/screenshot-family-create.png -o landing/images/screenshot-family-create.png resize 304 584
npx sharp-cli landing/images/screenshot-family-invite.png -o landing/images/screenshot-family-invite.png resize 304 584
npx sharp-cli landing/images/screenshot-family-history.png -o landing/images/screenshot-family-history.png resize 304 584
npx sharp-cli landing/images/screenshot-proposal.png -o landing/images/screenshot-proposal.png resize 304 584
npx sharp-cli landing/images/screenshot-sync.png -o landing/images/screenshot-sync.png resize 304 584

# Or using ImageMagick
convert landing/images/screenshot-*.png -resize 304x584 landing/images/screenshot-*.png

# Verify file sizes (should be <50KB each for fast loading)
ls -la landing/images/screenshot-*.png
```

---

## HTML Updates

### 1. Hero Section Update

**Current tagline:**
> "Shake up your plate"

**Proposed tagline:**
> "Shake up your plate - together"

Or expand subtitle to mention family:
> "Meal suggestions for the whole family. Sync across devices, vote on what to eat."

### 2. New Family Sharing Section

Add after existing features section:

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

### 3. Feature Cards Update

Add new feature cards:

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

### 4. Screenshot Gallery Update

Add family screenshots to gallery:

```html
<div class="screenshot-gallery">
  <!-- NEW: Family screenshots first -->
  <img src="images/screenshot-family-history.png"
       alt="Family meal history"
       width="304" height="584"
       loading="lazy">
  <img src="images/screenshot-family-invite.png"
       alt="Invite family members"
       width="304" height="584"
       loading="lazy">
  <img src="images/screenshot-proposal.png"
       alt="Meal proposal voting"
       width="304" height="584"
       loading="lazy">

  <!-- Existing screenshots -->
  <img src="images/screenshot-home.png" ...>
  <img src="images/screenshot-suggestions.png" ...>
</div>
```

### 5. Meta Tags Update

```html
<meta name="description" content="SaborSpin - Meal suggestions for the whole family. Generate variety-enforced ideas, share with family, and vote on what to eat. Works offline.">

<meta property="og:description" content="Meal suggestions for the whole family. Generate ideas, share with family, sync across devices.">

<meta name="twitter:description" content="Meal suggestions for the whole family. Generate ideas, share with family, sync across devices.">
```

---

## CSS Additions

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

---

## Testing Strategy

### Local Preview

```bash
# Preview landing page locally
npm run preview:landing

# Opens http://localhost:3333
```

### Responsive Testing

Test at these breakpoints:
- Mobile: 375px (primary target)
- Tablet: 768px
- Desktop: 1200px+

### Checklist

- [ ] All images load correctly
- [ ] Family section displays properly
- [ ] Feature cards align correctly
- [ ] Screenshot gallery scrolls smoothly
- [ ] CTA buttons work
- [ ] Mobile layout is correct
- [ ] No console errors

---

## Deployment Strategy

### Release Type
**Marketing Update** - Landing page only, no app release needed

### Pre-Deployment Checklist
- [ ] All screenshots captured and optimized
- [ ] HTML updates complete
- [ ] CSS additions tested
- [ ] Responsive layout verified
- [ ] Meta tags updated
- [ ] Local preview tested

### Deploy to Staging (Optional)

If staging is configured:
```bash
npm run deploy:landing -- --staging
```

### Deploy to Production

```bash
# Deploy landing page to saborspin.com
npm run deploy:landing

# This runs: node scripts/deploy-landing.cjs
# Uses FTP to upload ./landing/ to VPS
```

### Post-Deployment Verification

```bash
# Clear browser cache and verify
# Test in incognito/private browsing
# Test on actual mobile device
curl -I https://saborspin.com  # Check response headers
```

### Rollback Plan
- Keep backup of previous `landing/` folder
- FTP allows quick file replacement
- No database changes to rollback

---

## Image Specifications

| Type | Dimensions | Format | Max Size | Location |
|------|------------|--------|----------|----------|
| App Screenshot | 304x584 | PNG | 50KB | `landing/images/` |
| Icon | 512x512 | PNG | 100KB | `landing/images/` |
| Favicon | 32x32 | PNG | 5KB | `landing/images/` |

---

## Files to Create/Modify

### New Files

```
e2e/
└── capture-landing-screenshots.spec.ts    # Screenshot capture script

landing/images/
├── screenshot-family-create.png           # Family creation screen
├── screenshot-family-invite.png           # QR code invite
├── screenshot-family-history.png          # Family meal history
├── screenshot-proposal.png                # Voting interface
└── screenshot-sync.png                    # Sync status
```

### Modified Files

| File | Changes |
|------|---------|
| `landing/index.html` | Hero, family section, feature cards, screenshots, meta tags |
| `package.json` | Add sharp-cli if not present |

---

## Success Criteria

Phase 10 is complete when:

- [ ] All feature screenshots captured (5+ new images)
- [ ] Images optimized (<50KB each)
- [ ] Landing page updated with family section
- [ ] Feature cards include family sharing
- [ ] Screenshot gallery shows family features
- [ ] Meta tags updated for SEO
- [ ] Responsive layout works on all devices
- [ ] Deployed to saborspin.com
- [ ] Live site verified

---

## Learning Notes

Document unexpected errors, workarounds, and fixes encountered during implementation:

**[Phase 10 Learning Notes →](./PHASE10_LEARNING_NOTES.md)**

---

## Reference

### Saberloop Patterns
- [Landing Page Marketing Skill](C:\Users\omeue\source\repos\demo-pwa-app\.claude\skills\landing-page-marketing\SKILL.md)
- [Epic 12 Marketing Task](C:\Users\omeue\source\repos\demo-pwa-app\docs\learning\epic12_marketing\TASK1_LANDING_PLAYSTORE_UPDATE.md)

### Developer Guides
- [Testing Guide](../../developer-guide/TESTING.md) - E2E patterns
- [Telemetry Guide](../../developer-guide/TELEMETRY.md) - Tracking events

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

*Phase 10: Share the Story of Family Meals*

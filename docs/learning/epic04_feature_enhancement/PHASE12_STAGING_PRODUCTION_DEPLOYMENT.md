# Phase 12: Staging & Production Deployment

**Status:** 📋 PLANNED

**Goal:** Deploy Epic 04 app to staging, test, and release to production

**Dependencies:**
- Phase 10 (Quality Validation) - Quality must be validated
- Phase 11 (Marketing & Landing Page) - Marketing docs and landing page ready

---

## Overview

Final deployment phase for the app:
1. Version bump in app.json
2. Build staging APK and run smoke tests
3. Build production AAB
4. Submit to Play Store
5. Verify production deployment
6. Tag release in git

---

## Branching Strategy

**Branch Name:** `PHASE_12_DEPLOYMENT`

**Approach:**
- Create branch from `main`
- Version bump commit
- Deployment commits
- Tag release after production deployment
- Commit format: `release(epic04): <description>`

---

## Tool Instructions

### EAS Build & Submit
```bash
cd demo-react-native-app

# Build preview APK (staging)
eas build --platform android --profile preview

# Build production AAB
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### Verification
```bash
# Check app version on device
adb shell dumpsys package com.saborspin.app | grep versionName

# Check build status
eas build:list --platform android --limit 5
```

---

## Implementation Order

| Order | Task | Type | Effort | Status |
|-------|------|------|--------|--------|
| 1 | Version bump in app.json | Preparation | ~5 min | not started |
| 2 | Update CHANGELOG.md | Documentation | ~15 min | not started |
| 3 | Build staging APK | Build | ~15 min | not started |
| 4 | Install staging APK on device | Testing | ~10 min | not started |
| 5 | Run smoke tests on staging | Testing | ~30 min | not started |
| 6 | Fix any staging issues | Development | ~1 hour | not started |
| 7 | Build production AAB | Build | ~15 min | not started |
| 8 | Submit to Play Store | Deployment | ~15 min | not started |
| 9 | Update Play Store listing | Deployment | ~30 min | not started |
| 10 | Wait for Play Store review | Waiting | variable | not started |
| 11 | Verify Play Store listing | Verification | ~15 min | not started |
| 12 | Tag release in git | Git | ~5 min | not started |
| 13 | Announce release | Communication | ~15 min | not started |

**Total Estimated Effort:** ~4 hours (excluding Play Store review time)

---

## Staging Deployment

### 1. Version Bump

**app.json changes:**
```json
{
  "expo": {
    "version": "1.2.0",
    "android": {
      "versionCode": 5
    }
  }
}
```

Version guidelines:
- Major version for breaking changes (1.x.x → 2.x.x)
- Minor version for new features (1.1.x → 1.2.x) - Epic 04
- Patch version for bug fixes (1.2.0 → 1.2.1)

### 2. Build Staging APK

```bash
# Build preview APK
eas build --platform android --profile preview

# Wait for build to complete (~10-15 min)
# Download APK from EAS dashboard or use:
eas build:list --platform android --limit 1
```

### 3. Install on Device

```bash
# Download the APK
# Install via adb
adb install -r saborspin-preview.apk

# Or install directly from EAS build URL
```

### 4. Staging Smoke Tests

Test these scenarios on staging device:

**Core Features:**
- [ ] App launches without crash
- [ ] Can generate meal suggestions
- [ ] Can log a meal
- [ ] Meal history displays correctly
- [ ] Settings screen works

**Epic 04 Quick Wins (Phase 1):**
- [ ] Can mark meal as favorite
- [ ] Favorites filter works
- [ ] New! badge appears on untried combinations
- [ ] Variety color coding displays
- [ ] Variety stats show correct data
- [ ] Haptic feedback on actions

**Epic 04 Data Model (Phase 2-3):**
- [ ] Preparation methods work
- [ ] Named meals save correctly
- [ ] Ingredient variety tracking works

**Epic 04 Family Features (Phase 4-7):**
- [ ] Can create family
- [ ] Can invite to family (QR/code)
- [ ] Can join family
- [ ] Family history shows shared meals
- [ ] Sync indicator shows status
- [ ] Can create meal proposal
- [ ] Can vote on proposal

**Epic 04 Lunch/Dinner (Phase 9):**
- [ ] Lunch/dinner suggestions work
- [ ] Main + sides structure displays

**Regression Check:**
- [ ] Ingredient management works
- [ ] Category management works
- [ ] Meal type configuration works

---

## Production Deployment

### 1. Build Production AAB

```bash
# Build production Android App Bundle
eas build --platform android --profile production

# Wait for build to complete
```

### 2. Submit to Play Store

```bash
# Submit to Play Store (requires eas.json config)
eas submit --platform android

# Or upload manually via Play Console
# https://play.google.com/console
```

### 3. Play Store Listing Updates

Update in Play Console:
- [ ] What's New text (from Phase 11 marketing docs)
- [ ] Screenshots (from Phase 11)
- [ ] Description updates (from Phase 11)

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

---

## Post-Deployment Verification

### App Verification
- [ ] Play Store listing shows correct version (1.2.0)
- [ ] Download and install from Play Store
- [ ] App version displays correctly in settings
- [ ] Core features work
- [ ] Epic 04 features work
- [ ] No crash reports in Play Console

### Monitoring
- [ ] Check OTel dashboard for errors
- [ ] Monitor crash reports in Play Console
- [ ] Check Play Store reviews/ratings

---

## Release Tag

After successful deployment:

```bash
git tag -a v1.2.0 -m "Epic 04: Family Kitchen Edition"
git push origin v1.2.0
```

---

## Rollback Plan

### App Rollback
1. In Play Console, halt rollout if critical issues found
2. Build previous version: `git checkout v1.1.0`
3. Submit hotfix or rollback to previous version
4. Use staged rollout (10% → 50% → 100%) for safer releases

### Hotfix Process
If critical issues found post-release:
1. Create hotfix branch from release tag
2. Fix issue
3. Increment patch version (1.2.0 → 1.2.1)
4. Build and submit hotfix
5. Tag hotfix release

---

## Success Criteria

Phase 12 is complete when:
- [ ] App version bumped to 1.2.0
- [ ] CHANGELOG.md updated
- [ ] Staging APK built and tested
- [ ] All smoke tests pass on staging
- [ ] Production AAB built
- [ ] App submitted to Play Store
- [ ] Play Store listing updated with What's New
- [ ] Production app verified working
- [ ] Release tagged as v1.2.0
- [ ] Release announced

---

## Learning Notes

Document unexpected errors, workarounds, and fixes encountered:

**[Phase 12 Learning Notes →](./PHASE12_LEARNING_NOTES.md)**

---

## Reference

### Related Documents
- [Marketing & Landing Page](./PHASE11_MARKETING_LANDING_PAGE.md)
- [Quality Final Report](./EPIC04_QUALITY_FINAL.md)

### Developer Guides
- [Testing Guide](../../developer-guide/TESTING.md)
- [Troubleshooting](../../developer-guide/TROUBLESHOOTING.md)

### External Resources
- [Play Console](https://play.google.com/console)
- [EAS Build Dashboard](https://expo.dev/accounts/[account]/projects/[project]/builds)

---

*Phase 12: Ship It!*

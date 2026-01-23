# Epic 4: Feature Enhancement & Family Sharing

**Status:** 🔄 PLANNING

## What This Epic Is About

**Expanding SaborSpin from Individual Tool to Family Kitchen Platform**

Epic 3 established the production-ready foundation. Epic 4 enhances the app with:
1. Polish features (favorites, badges, stats)
2. Data model evolution (preparation methods, named meals)
3. Family sharing capabilities (Approach 2 from exploration)
4. Lunch/dinner expansion

---

## Prerequisites Completed

### Epic 1: Infrastructure & Foundation ✅
- Professional dev workflow
- Testing infrastructure (Jest, Playwright)
- CI/CD pipeline
- Full observability stack

### Epic 2: Meals Randomizer ✅
- SQLite database with cross-platform adapters
- Zustand state management
- Combination generator algorithm
- Variety enforcement engine
- Complete UI (Home, Suggestions, History)

### Epic 3: Production Readiness ✅
- User customization (ingredients, categories, meal types)
- Branding & identity (SaborSpin)
- Project structure & documentation

---

## Phase Overview

### Phase 0: Landing Page Deployment ✅
**Goal:** Deploy saborspin.com landing page to production

**Status:** Ready to implement

- DNS configuration
- SSL certificate setup
- Landing page deployment
- APK hosting setup

**[Phase 0 Details →](./PHASE0_LANDING_DEPLOYMENT.md)**

---

### Phase 1: Quick Wins (Polish)
**Goal:** Low-effort, high-impact improvements with no architectural changes

**Features:**
- ⭐ Favorite combinations
- 🆕 "New!" badge on suggestions
- 🎨 Variety color coding (green/yellow/red)
- 📊 Variety stats ("15 combos this month!")
- 📳 Haptic feedback

**Dependencies:** None - can start immediately

**[Phase 1 Details →](./PHASE1_QUICK_WINS.md)**

---

### Phase 2: Data Model Evolution
**Goal:** Evolve data model to support preparation methods and named meals

**Features:**
- Add preparation method to ingredients (fried, grilled, roasted, etc.)
- Support optional meal naming ("Mom's chicken")
- Migrate to Approach C: Flexible Meals
- Hybrid prep method list (predefined + custom)

**Dependencies:** None

**[Phase 2 Details →](./PHASE2_DATA_MODEL_EVOLUTION.md)**

---

### Phase 3: Enhanced Variety
**Goal:** Smarter variety enforcement at ingredient level

**Features:**
- Ingredient frequency tracking (not just combination-level)
- Pairing rules (what goes well together / should be avoided)
- Enhanced variety scoring algorithm

**Dependencies:** Phase 2 helps but not required

**[Phase 3 Details →](./PHASE3_ENHANCED_VARIETY.md)**

---

### Phase 4: User Identity & Families
**Goal:** Foundation for family sharing - local identity and family management

**Features:**
- Local user identity (display name, key pair)
- Family creation with invite code/QR/link
- Family joining flow
- Basic family UI (family selector, member list)
- Role management (admin vs member)

**Dependencies:** None

**[Phase 4 Details →](./PHASE4_USER_IDENTITY_FAMILIES.md)**

---

### Phase 5: Shared Meal Logs
**Goal:** Enable meal sharing within families

**Features:**
- Extend meal_logs with user_id, family_id, visibility
- Privacy toggle on meal logging ("Share with family?")
- Family meal history view
- "Who ate what today" dashboard

**Dependencies:** Phase 4

**[Phase 5 Details →](./PHASE5_SHARED_MEAL_LOGS.md)**

---

### Phase 6: HTTP Sync
**Goal:** Sync family data across devices via server

**Features:**
- VPS endpoints for family sync
- Encrypted blob storage (server can't read data)
- Sync on app open
- Conflict resolution (last-write-wins)
- Sync status indicator

**Dependencies:** Phase 5

**[Phase 6 Details →](./PHASE6_HTTP_SYNC.md)**

---

### Phase 7: Proposals & Voting
**Goal:** Collaborative meal planning within families

**Features:**
- Propose meal to family ("Let's have tacos tomorrow")
- Voting mechanism (yes/no)
- Push notifications for new proposals
- Proposal status tracking (open/accepted/rejected)

**Dependencies:** Phase 6

**[Phase 7 Details →](./PHASE7_PROPOSALS_VOTING.md)**

---

### Phase 8: P2P Sync (Optional)
**Goal:** Direct device-to-device sync when on same network

**Features:**
- WebRTC integration
- Local network discovery
- P2P-first, HTTP-fallback logic
- Reduced server dependency

**Dependencies:** Phase 6

**Note:** This phase is optional. HTTP sync covers most use cases.

**[Phase 8 Details →](./PHASE8_P2P_SYNC.md)**

---

### Phase 9: Lunch/Dinner Expansion
**Goal:** Expand beyond breakfast/snacks to full meal planning

**Features:**
- Different variety rules per meal type
- More complex meal structures (main + sides)
- Building-block rotation (pasta → rice → potato)
- Meal type-specific ingredient filtering

**Dependencies:** Phase 2 (data model), Phase 3 (enhanced variety)

**[Phase 9 Details →](./PHASE9_LUNCH_DINNER_EXPANSION.md)**

---

## Phase Dependency Graph

```
Phase 0 (Landing)
    ↓
Phase 1 (Quick Wins) ──────────────────────────────┐
    ↓                                              │
Phase 2 (Data Model) ─────────────────────────┐    │
    ↓                                         │    │
Phase 3 (Enhanced Variety) ───────────────────┼────┤
                                              │    │
Phase 4 (User Identity) ──────────────────────┼────┤
    ↓                                         │    │
Phase 5 (Shared Meals) ───────────────────────┼────┤
    ↓                                         │    │
Phase 6 (HTTP Sync) ──────────────────────────┼────┤
    ↓                    ↓                    │    │
Phase 7 (Proposals)   Phase 8 (P2P) [Optional]│    │
                                              ↓    ↓
                              Phase 9 (Lunch/Dinner Expansion)
```

---

## Effort Summary

| Phase | Description | Effort (with tests) |
|-------|-------------|---------------------|
| 0 | Landing Page Deployment | ~4 hours |
| 1 | Quick Wins (Polish) | ~20 hours |
| 2 | Data Model Evolution | ~24 hours |
| 3 | Enhanced Variety | ~23 hours |
| 4 | User Identity & Families | ~41 hours |
| 5 | Shared Meal Logs | ~27 hours |
| 6 | HTTP Sync | ~48 hours |
| 7 | Proposals & Voting | ~37 hours |
| 8 | P2P Sync (Optional) | ~40 hours |
| 9 | Lunch/Dinner Expansion | ~48 hours |
| | **Total** | **~312 hours** |

**Note:** Each phase includes:
- Running existing test suites at the start (unit tests + E2E tests for baseline validation)
- Writing unit tests for new business logic and utilities
- Writing E2E tests for new user flows and UI interactions
- Running full test suites at the end (all unit + E2E tests for regression testing)

---

## Success Criteria

### Epic 4 Complete When:

**Phase Completion:**
- [ ] Phase 0: Landing page live at saborspin.com
- [ ] Phase 1: All quick wins implemented
- [ ] Phase 2: Data model supports prep methods and naming
- [ ] Phase 3: Ingredient-level variety tracking works
- [ ] Phase 4: Users can create/join families
- [ ] Phase 5: Meals can be shared within families
- [ ] Phase 6: Family data syncs across devices
- [ ] Phase 7: Families can propose and vote on meals
- [ ] Phase 8: (Optional) P2P sync works on local network
- [ ] Phase 9: Lunch/dinner meals fully supported

**Quality:**
- [ ] All tests pass (unit + E2E)
- [ ] TypeScript and ESLint pass
- [ ] No regressions in existing features
- [ ] Telemetry captures new feature usage

---

## Reference Documents

- [Meals Randomizer Exploration](../../product_info/meals-randomizer-exploration.md) - Full exploration with Approach 2 details
- [Data Model Evolution](../../product_info/meals-randomizer-exploration.md#data-model-evolution-from-ingredients-to-meals) - Approach C design
- [Potential Enhancements](../../product_info/meals-randomizer-exploration.md#potential-enhancements-post-v1) - Feature details

---

## Ready to Start?

**Begin with [Phase 0: Landing Page Deployment](./PHASE0_LANDING_DEPLOYMENT.md)** if not done.

Then proceed to **[Phase 1: Quick Wins](./PHASE1_QUICK_WINS.md)** for immediate user value.

---

*Epic 4: From Individual Tool to Family Kitchen Platform*

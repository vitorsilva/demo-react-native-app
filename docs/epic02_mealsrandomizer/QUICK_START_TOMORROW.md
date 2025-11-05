# Quick Start Guide - Phase 2 Ready!

**Date:** 2025-01-05
**Session:** Phase 1 COMPLETE ✅ - Starting Phase 2

---

## 🎉 Phase 1: COMPLETE!

**What you built:**
- ✅ Full SQLite database layer with TypeScript
- ✅ 14/14 comprehensive unit tests passing
- ✅ Professional testing setup (better-sqlite3 + mocks)
- ✅ 22 Portuguese breakfast/snack ingredients seeded
- ✅ Production-ready error tracking (Sentry migration complete)
- ✅ All dependency conflicts resolved

---

## 🚀 Next: Phase 2 - State Management & Core Logic

**Estimated Time:** 4-5 hours

**What you'll build:**
1. **Zustand store** - Lightweight global state management
2. **Combination generator** - Algorithm to create meal combinations
3. **Variety engine** - Cooldown tracking to prevent ingredient repetition
4. **Business logic layer** - Core randomizer intelligence

---

## 📚 Before Starting Phase 2

### Review Phase 1 Learnings

Read [SESSION_STATUS.md](./SESSION_STATUS.md) to review:
- Dependency management (version pinning, peer dependencies)
- Package migration (sentry-expo → @sentry/react-native)
- Platform differences (React Native vs Node.js APIs)
- Testing patterns (environment-specific mocks)
- Observability setup (Sentry error tracking)

These concepts will be useful as we add more complexity!

---

## 🎯 Phase 2 Overview

### What You'll Learn

**1. Zustand (State Management)**
- Why global state? (Props drilling problem)
- Zustand vs Redux vs Context API
- Store creation and actions
- React hooks integration (`useStore`)

**2. Algorithm Design**
- Combination generation (n-choose-k problem)
- Filtering by meal type
- Random selection with constraints

**3. Business Logic Separation**
- Layer architecture (UI → Store → Business Logic → Database)
- Pure functions for testability
- Domain-driven design principles

**4. Cooldown System**
- Tracking recent ingredient usage
- Filtering out recently used items
- Balancing variety vs availability

---

## 🗺️ Phase 2 Roadmap

### Part 1: Zustand Setup (1 hour)
- Install Zustand
- Create initial store structure
- Add ingredients state
- Connect to UI (read-only first)

### Part 2: Core Algorithms (1.5 hours)
- Combination generator function
- Meal type filtering
- Random selection with shuffling
- Unit tests for algorithms

### Part 3: Variety Engine (1.5 hours)
- Cooldown tracking logic
- Filter recent ingredients
- Preferences integration
- Business logic tests

### Part 4: Integration (1 hour)
- Connect store actions to database
- Add meal logging with cooldown update
- E2E testing
- Manual testing in app

---

## 📖 Phase 2 Guide

**Start here:** [PHASE2_STATE_MANAGEMENT.md](./PHASE2_STATE_MANAGEMENT.md)

The guide will walk you through:
- Conceptual explanations (what and why)
- Step-by-step implementation
- Code examples to type
- Questions to reinforce learning
- Testing at each stage

**Teaching approach:**
- Claude explains concepts
- Claude provides code snippets
- **You write all the code yourself**
- Claude asks questions to check understanding
- Test as you go (TDD approach)

---

## 🛠️ Tools You'll Use

**New packages:**
- `zustand` - State management library

**Existing tools:**
- TypeScript (with inference and union types)
- Jest (for unit testing algorithms)
- SQLite database (already built!)

---

## 💡 Tips for Phase 2

### Start Fresh
```bash
cd demo-react-native-app
npm start
```

Make sure everything still works from Phase 1 before starting!

### Work in Small Steps
- Implement one function at a time
- Test after each change
- Commit frequently (optional but recommended)

### Ask Questions
- If a concept is unclear, ask for clarification
- Connect new concepts to what you learned in Phase 1
- Think about "why" not just "how"

### Take Breaks
Phase 2 is more algorithmically complex than Phase 1. If you get stuck:
- Take a 10-minute break
- Re-read the explanation
- Ask Claude to explain differently

---

## 🐛 If Something Breaks

### App won't start
```bash
npx expo start -c  # Clear cache
```

### Tests fail
```bash
npm test  # Should show 14/14 passing
```

If tests fail, something changed in Phase 1 files. Check git status.

### Database not working
Check console logs for:
```
✅ Database ready
✅ Seeded XX ingredients
```

---

## 📁 Files You'll Create in Phase 2

```
lib/
├── store/
│   ├── index.ts                    # Zustand store
│   └── __tests__/
│       └── store.test.ts           # Store tests
├── business-logic/
│   ├── combinationGenerator.ts     # Algorithm
│   ├── varietyEngine.ts            # Cooldown logic
│   └── __tests__/
│       ├── combinationGenerator.test.ts
│       └── varietyEngine.test.ts
```

**Files you'll modify:**
- `app/(tabs)/index.tsx` - Connect to Zustand store (later)
- `package.json` - Add zustand dependency

---

## 🎓 Key Concepts Preview

### State Management
**Problem:** How do multiple screens share data without prop drilling?
**Solution:** Global store that any component can access

### Combination Generation
**Problem:** Given 6 proteins, 7 carbs, 3 sweets - generate valid breakfast combos
**Solution:** Cartesian product with filtering

### Variety Enforcement
**Problem:** Don't want same ingredient every day
**Solution:** Track last N days, filter out recent items before generating combos

---

## 📊 Progress Tracker

```
Epic 2: Meals Randomizer

Phase 1: Data Foundation       ✅ 100% ████████████████████
Phase 2: State Management      ⏳ 0%   ░░░░░░░░░░░░░░░░░░░░
Phase 3: Building UI           ⏳ 0%   ░░░░░░░░░░░░░░░░░░░░
Phase 4: Navigation            ⏳ 0%   ░░░░░░░░░░░░░░░░░░░░
Phase 5: Polish & Testing      ⏳ 0%   ░░░░░░░░░░░░░░░░░░░░

Overall: ~20% complete (1 of 5 phases)
```

---

## 🎯 Your Goal for Phase 2

**By the end of Phase 2, you'll have:**
- Working Zustand store with ingredients data
- Algorithm that generates meal combinations
- Variety engine that prevents repetitive meals
- Comprehensive unit tests for business logic
- Foundation ready for UI in Phase 3

**No UI yet!** Phase 2 is pure logic - we'll build the UI in Phase 3.

---

## 🚀 Ready to Start?

1. **Make sure app runs:** `npm start`
2. **Verify tests pass:** `npm test` (14/14)
3. **Open the guide:** [PHASE2_STATE_MANAGEMENT.md](./PHASE2_STATE_MANAGEMENT.md)
4. **Let's build!** 🎉

---

**Remember:** Claude guides, you code! This is a learning project - take your time and understand each concept.

**Good luck!** 🚀

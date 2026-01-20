# Epic 2: Meals Randomizer - Overview

## 🎯 What You're Building

**Meals Randomizer V1** - A mobile app that helps eliminate decision fatigue for breakfast and snack choices by:
- Generating variety-enforced meal suggestions
- Tracking what you've eaten to prevent repetition
- Respecting Portuguese food culture and preferences
- Making daily meal decisions quick and easy (10-20 seconds)

---

## 📚 Learning Journey

### Building on Epic 1 Foundation

You've already completed **Epic 1: Infrastructure & Foundation**, which means you have:
- ✅ A working React Native app with Expo
- ✅ Understanding of components, state, and styling
- ✅ Testing infrastructure (Jest, React Native Testing Library)
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Full observability stack (OpenTelemetry, Jaeger, Prometheus, Sentry)
- ✅ Professional development workflow

**Now in Epic 2, you'll build on this foundation to create a real product: the Meals Randomizer app.**

### Teaching Methodology

**📝 You Write the Code**
- I provide step-by-step guidance
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

---

## 🗺️ Phase Overview

### Phase 1: Data Foundation & SQLite (3-4 hours)
Set up the database layer and understand SQLite fundamentals by implementing the data models for ingredients and meal logs.

**You'll learn:** Database design, SQLite operations, CRUD operations, data seeding

**[Start Phase 1 →](./PHASE1_DATA_FOUNDATION.md)**

---

### Phase 2: State Management & Core Logic (4-5 hours)
Implement Zustand for global state management and build the core algorithms: combination generator and variety enforcement engine.

**You'll learn:** Zustand state management, combination algorithms, variety scoring

**[Start Phase 2 →](./PHASE2_STATE_MANAGEMENT.md)**

---

### Phase 3: Building the UI (5-6 hours)
Build the user interface screens and components based on the mockups, focusing on clean, performant, and accessible mobile UI. Includes fixing web mode SQLite compatibility for easier development.

**You'll learn:** Component composition, FlatList, styling patterns, screen layouts, web platform compatibility

**[Start Phase 3 →](./PHASE3_BUILDING_UI.md)**

---

### Phase 4: Navigation & User Flow (2-3 hours)
Complete the tab navigation structure, build History and Settings screens, and ensure smooth user flow throughout the app.

**You'll learn:** Tab navigation, SectionList, form inputs, user flow testing

**[Start Phase 4 →](./PHASE4_NAVIGATION.md)**

---

### Phase 5: Polish & Testing (3-4 hours)
Add final polish, write comprehensive tests, ensure observability coverage, and prepare for real-world usage.

**You'll learn:** Loading states, error handling, testing strategies, accessibility

**[Start Phase 5 →](./PHASE5_POLISH_TESTING.md)**

---

### Phase 6: Future Enhancements (Optional) - PARKED
Ideas for V2 and beyond: AI suggestions, favorites, photos, nutrition tracking, cloud sync, Android Studio emulator setup, and more.

**Status:** Not implemented - moved to Epic 3 Phase 4

**You'll learn:** Advanced features, cloud integration, development environment improvements

**[View Enhancement Ideas →](../parking-lot/EPIC02_PHASE6_FUTURE_ENHANCEMENTS.md)** (Parked)

---

## 📦 Final Project Structure

```
demo-react-native-app/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Home Screen
│   │   ├── history.tsx            # History Screen
│   │   ├── settings.tsx           # Settings Screen
│   │   └── _layout.tsx            # Tab Navigator
│   ├── suggestions.tsx            # Suggestions Screen
│   ├── confirmation.tsx           # Confirmation Modal
│   ├── manage-ingredients.tsx     # Ingredient Management
│   └── _layout.tsx                # Root Layout
│
├── components/
│   ├── CombinationCard.tsx        # Combination display card
│   ├── IngredientBadge.tsx        # Ingredient pill
│   ├── MealHistoryItem.tsx        # History list item
│   ├── EmptyState.tsx             # Empty list message
│   └── ErrorBoundary.tsx          # Error handling (Epic 1)
│
├── lib/
│   ├── database/
│   │   ├── index.ts               # Database init
│   │   ├── schema.ts              # Table schemas
│   │   ├── ingredients.ts         # Ingredient CRUD
│   │   ├── mealLogs.ts            # Meal log CRUD
│   │   ├── preferences.ts         # Preferences CRUD
│   │   ├── seed.ts                # Initial data
│   │   └── __tests__/             # Database tests
│   │
│   ├── services/
│   │   ├── combinationGenerator.ts  # Core algorithm
│   │   ├── varietyEngine.ts         # Variety scoring
│   │   └── __tests__/               # Algorithm tests
│   │
│   ├── store/
│   │   └── index.ts               # Zustand store
│   │
│   ├── analytics.ts               # Analytics helpers
│   ├── telemetry.ts               # OpenTelemetry setup (Epic 1)
│   └── tracing-helpers.ts         # Tracing utilities (Epic 1)
│
├── types/
│   └── database.ts                # TypeScript types
│
└── docs/
    ├── epic01_infrastructure/     # Epic 1 docs
    └── epic02_mealsrandomizer/    # Epic 2 docs (you are here)
        ├── OVERVIEW.md            # This document
        ├── PHASE1_DATA_FOUNDATION.md
        ├── PHASE2_STATE_MANAGEMENT.md
        ├── PHASE3_BUILDING_UI.md
        ├── PHASE4_NAVIGATION.md
        ├── PHASE5_POLISH_TESTING.md
        ├── PHASE6_FUTURE_ENHANCEMENTS.md
        └── PHASE*_LEARNING_NOTES.md
```

---

## ✅ Success Criteria

### V1 Complete When:

**Functional Requirements:**
- [ ] Database stores ingredients, meals, preferences
- [ ] Combination generator creates varied suggestions
- [ ] Variety enforcement prevents repetition
- [ ] Home screen navigates to suggestions
- [ ] Suggestions screen shows 4 combinations
- [ ] User can select and log meals
- [ ] History screen shows past meals grouped by date
- [ ] Settings screen allows preference adjustment
- [ ] App persists data between restarts

**Quality Requirements:**
- [ ] All tests pass
- [ ] Code coverage > 60%
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] App doesn't crash on device
- [ ] Performance is smooth (no lag)
- [ ] Observability traces appear in Jaeger
- [ ] Metrics appear in Prometheus

**User Experience:**
- [ ] Decision time < 20 seconds (open → selection → confirmation)
- [ ] Suggestions feel varied
- [ ] UI is intuitive (no confusion)
- [ ] Loading states provide feedback
- [ ] Errors are handled gracefully

**Personal Validation:**
- [ ] You use it daily for breakfast/snack decisions
- [ ] It saves you time vs manual decision-making
- [ ] Variety feels better than before
- [ ] You'd recommend it to friends/family

---

## ⏱️ Timeline & Effort

### Total Estimated Time: 15-20 hours

- **Phase 1:** Data Foundation (3-4 hours)
- **Phase 2:** State Management (4-5 hours)
- **Phase 3:** Building UI (5-6 hours)
- **Phase 4:** Navigation (2-3 hours)
- **Phase 5:** Polish & Testing (3-4 hours)
- **Phase 6:** Future Enhancements (Optional, ongoing)

### Recommended Schedule

**Week 1: Foundation**
- Days 1-2: Phase 1 (Database)
- Days 3-4: Phase 2 (State & Logic)
- Days 5-7: Phase 3 (UI)

**Week 2: Completion**
- Days 8-9: Phase 4 (Navigation)
- Days 10-11: Phase 5 (Polish & Testing)
- Days 12-14: Testing, refinement, daily usage

**Week 3+: Real-World Usage**
- Use the app daily
- Collect feedback
- Identify improvements
- Decide on V2 features

---

## 🎓 Skills You'll Master

### Mobile Development
- SQLite database design and operations
- State management with Zustand
- Navigation patterns
- List rendering optimization
- Mobile UI/UX patterns

### Software Engineering
- Algorithm design and implementation
- Testing strategies
- Error handling
- Performance optimization
- Observability integration

### Product Development
- User flow design
- Feature prioritization
- MVP scoping
- Real-world testing
- Iterative improvement

---

## 📚 Resources

### Documentation
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Zustand](https://zustand.pmnd.rs)
- [React Navigation](https://reactnavigation.org)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)

### Learning
- [SQLite Tutorial](https://www.sqlitetutorial.net/)
- [State Management Guide](https://react.dev/learn/managing-state)
- [Algorithm Design Patterns](https://refactoring.guru/design-patterns)

### Tools
- [Jaeger UI](http://localhost:16686) - View traces
- [Prometheus](http://localhost:9090) - View metrics
- [React DevTools](https://react-devtools-tutorial.vercel.app/) - Debug React

---

## 🚀 Ready to Start?

**Begin with [Phase 1: Data Foundation & SQLite](./PHASE1_DATA_FOUNDATION.md)**

Remember: small steps, write the code yourself, and ask questions along the way!

---

*Epic 2: Meals Randomizer - Building on Epic 1's infrastructure to create a real, useful mobile app*

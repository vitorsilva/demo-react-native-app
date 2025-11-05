# Demo React Native App

A learning-focused React Native mobile application built with Expo, progressing through structured epics from fundamentals to real-world features.

## 📚 Learning Journey

This project follows a guided, incremental learning approach where concepts are broken into digestible pieces and you write all the code yourself.

### ✅ Epic 1: Infrastructure & Foundation (COMPLETED)

**Status:** 100% Complete ✅ | **Completed:** 2025-10-28

Built professional development infrastructure and learned React Native fundamentals.

**What was accomplished:**
- ✅ React Native basics (components, state, styling)
- ✅ Testing infrastructure (Jest, React Native Testing Library)
- ✅ Code quality automation (ESLint, Prettier, Husky)
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Full observability stack (OpenTelemetry, Jaeger, Prometheus)
- ✅ Structured logging with trace correlation
- ✅ Error tracking (Sentry)
- ✅ Professional development workflow

**Documentation:** [docs/epic01_infrastructure/](./docs/epic01_infrastructure/)

---

### 🔄 Epic 2: Meals Randomizer (IN PROGRESS)

**Status:** ~20% Complete | **Started:** 2025-01-04 | **Last Updated:** 2025-01-05

Building a real mobile app that generates variety-enforced meal suggestions to eliminate decision fatigue.

**Current Progress:**
- ✅ Phase 1: Data Foundation & SQLite (100% COMPLETE)
  - Database layer with TypeScript types
  - Ingredient and meal log CRUD operations
  - 14 unit tests (all passing)
  - Seed data with 22 Portuguese ingredients
  - Production-ready error tracking (Sentry migration)
  - Zero dependency conflicts
- ⏳ Phase 2: State Management & Core Logic (Starting next)
- ⏳ Phase 3: Building the UI (Not started)
- ⏳ Phase 4: Navigation & User Flow (Not started)
- ⏳ Phase 5: Polish & Testing (Not started)

**Documentation:** [docs/epic02_mealsrandomizer/](./docs/epic02_mealsrandomizer/)

**Quick Resume:** [docs/epic02_mealsrandomizer/QUICK_START_TOMORROW.md](./docs/epic02_mealsrandomizer/QUICK_START_TOMORROW.md)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- Expo Go app (for mobile testing)
- Android emulator or iOS simulator (optional)

### Setup
```bash
cd demo-react-native-app
npm install
npm start
```

### Running Tests
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

### Building
```bash
# Preview build (APK for testing)
eas build --platform android --profile preview

# Production build (AAB for Play Store)
eas build --platform android --profile production
```

---

## 📁 Project Structure

```
demo-react-native-app/
├── app/                    # Expo Router app directory (file-based routing)
│   ├── (tabs)/            # Tab navigation group
│   │   ├── index.tsx      # Home screen
│   │   ├── history.tsx    # History screen (Epic 2)
│   │   └── settings.tsx   # Settings screen (Epic 2)
│   └── _layout.tsx        # Root layout
│
├── lib/                   # Business logic and utilities
│   ├── database/          # SQLite database layer (Epic 2)
│   ├── services/          # Core algorithms (Epic 2, upcoming)
│   ├── store/             # State management (Epic 2, upcoming)
│   ├── telemetry.ts       # OpenTelemetry setup (Epic 1)
│   ├── logger.ts          # Structured logging (Epic 1)
│   └── analytics.ts       # Analytics tracking (Epic 1)
│
├── components/            # Reusable UI components
├── types/                 # TypeScript type definitions
├── docs/                  # Learning documentation
│   ├── epic01_infrastructure/    # Epic 1 docs (completed)
│   └── epic02_mealsrandomizer/   # Epic 2 docs (current)
└── __tests__/            # Test files

```

---

## 🛠️ Tech Stack

**Core:**
- React Native 0.81.4
- Expo SDK 54
- TypeScript
- Expo Router (file-based routing)

**Database:**
- expo-sqlite (production)
- better-sqlite3 (testing)

**State Management:**
- Zustand (Epic 2, upcoming)

**Testing:**
- Jest 29.7.0
- React Native Testing Library
- better-sqlite3 adapter for SQLite tests

**Observability (Epic 1):**
- OpenTelemetry (traces, metrics, logs)
- Jaeger (trace visualization)
- Prometheus (metrics)
- Pino (structured logging)
- Sentry (@sentry/react-native - error tracking & performance)

**Development:**
- ESLint + Prettier
- Husky + lint-staged (pre-commit hooks)
- GitHub Actions (CI/CD)

---

## 📊 Learning Progress

| Epic | Status | Duration | Completion |
|------|--------|----------|------------|
| Epic 1: Infrastructure | ✅ Complete | ~20 hours | 100% |
| Epic 2: Meals Randomizer | 🔄 In Progress | ~4 hours / ~20 hours | 20% |
| └─ Phase 1: Data Foundation | ✅ Complete | ~4 hours | 100% |
| └─ Phase 2: State Management | ⏳ Next | Est. 4-5 hours | 0% |

**Total learning time invested:** ~24 hours

---

## 📖 Documentation

### For Developers
- [Epic 1 Learning Plan](./docs/epic01_infrastructure/LEARNING_PLAN.md) ✅ COMPLETED
- [Epic 2 Overview](./docs/epic02_mealsrandomizer/OVERVIEW.md) 🔄 CURRENT
- [Epic 2 Session Status](./docs/epic02_mealsrandomizer/SESSION_STATUS.md) - Last session details
- [Epic 2 Quick Start](./docs/epic02_mealsrandomizer/QUICK_START_TOMORROW.md) - Resume here

### For Claude Code
- [CLAUDE.md](./CLAUDE.md) - Instructions for Claude Code AI assistant

---

## 🎯 Current Focus (Epic 2, Phase 2)

**Phase 1: COMPLETE** ✅

**Next: Phase 2 - State Management & Core Logic**
- Zustand global state management
- Combination generator algorithm
- Variety engine with cooldown tracking
- Business logic layer

**Start here:** [docs/epic02_mealsrandomizer/QUICK_START_TOMORROW.md](./docs/epic02_mealsrandomizer/QUICK_START_TOMORROW.md)

---

## 🧪 Observability

**Tracing (Jaeger):**
- UI: http://localhost:16686
- Service: demo-react-native-app

**Metrics (Prometheus):**
- UI: http://localhost:9090

**Start observability stack:**
```bash
docker-compose up -d
```

---

## 📝 License

This is a learning project for educational purposes.

---

## 🙏 Acknowledgments

Built with guidance from Claude Code, following a structured learning methodology that emphasizes understanding over copying.

---

**Last Updated:** 2025-01-05
**Current Epic:** Epic 2 - Meals Randomizer (Phase 1 COMPLETE ✅)
**Next Session:** Phase 2 - State Management & Core Logic

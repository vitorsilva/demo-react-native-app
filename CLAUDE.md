# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SaborSpin** is a React Native mobile application built with Expo that generates variety-enforced meal suggestions. Originally a learning project, it has evolved into a production-ready app.

**Current Status:**
- ✅ **Epic 1: Infrastructure & Foundation** - COMPLETE (2025-10-28)
- ✅ **Epic 2: Meals Randomizer** - COMPLETE (2025-11-21)
- ✅ **Epic 3: Production Readiness** - COMPLETE (2026-01-20)
  - ✅ Phase 1: User Customization - COMPLETE
  - ✅ Phase 2: Branding & Identity - COMPLETE
  - ✅ Phase 3: Project Structure & Documentation - COMPLETE

**Key Characteristics:**
- Production-ready app (SaborSpin)
- Expo-managed workflow with React Native 0.81.4
- TypeScript-based
- File-based routing with Expo Router
- OpenTelemetry observability (custom backend export)
- Zustand for global state management
- SQLite for local data persistence (with cross-platform adapters)
- 220 unit tests, 23 E2E tests

## Finding Current Session Information

**Documentation is organized in `docs/`:**
- `docs/README.md` - Documentation navigation hub
- `docs/architecture/` - System architecture docs
- `docs/developer-guide/` - Developer setup and guides
- `docs/user-guide/` - End-user documentation
- `docs/learning/` - Archived learning materials from epics

**For learning materials (archived):**
- `docs/learning/epic01_infrastructure/` - Epic 1 notes
- `docs/learning/epic02_mealsrandomizer/` - Epic 2 notes
- `docs/learning/epic03_mealsrandomizerv1/` - Epic 3 notes
- `docs/learning/epic03_mealsrandomizerv1/SESSION_STATUS.md` - Progress tracking

## Claude's Role

This project has transitioned from learning to production. Claude can now:
- Execute commands and write code when appropriate
- Make commits when requested
- Run tests and builds
- Still explain concepts when asked

For documentation updates or learning-focused sessions, Claude should still guide the user through concepts.

## Project Structure

```
saborspin/                        # Repository root
├── demo-react-native-app/        # React Native app
│   ├── app/                      # Expo Router screens
│   │   ├── (tabs)/               # Tab navigation
│   │   │   ├── index.tsx         # Home screen
│   │   │   ├── history.tsx       # Meal history
│   │   │   ├── manage-ingredients.tsx
│   │   │   ├── manage-categories.tsx
│   │   │   └── settings.tsx      # Meal type config
│   │   └── suggestions/
│   │       └── [mealType].tsx    # Dynamic suggestions
│   ├── components/               # Reusable UI components
│   ├── lib/
│   │   ├── database/             # SQLite with migrations
│   │   ├── business-logic/       # Algorithms
│   │   ├── store/                # Zustand state
│   │   └── telemetry/            # Observability
│   ├── e2e/                      # Playwright E2E tests
│   └── types/                    # TypeScript definitions
├── landing/                      # Landing page (saborspin.com)
├── docs/                         # Documentation
│   ├── README.md                 # Navigation hub
│   ├── architecture/             # System docs
│   ├── developer-guide/          # Setup guides
│   ├── user-guide/               # End-user docs
│   └── learning/                 # Archived learning materials
├── .github/                      # GitHub templates
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── CHANGELOG.md
├── LICENSE
└── README.md
```

## Development Commands

All commands from `demo-react-native-app/` directory:

```bash
cd demo-react-native-app

# Development
npm start              # Start Expo dev server
npm run web            # Web version (sql.js)

# Testing
npm test               # Unit tests (220)
npm run test:e2e       # E2E tests (23)

# Code Quality
npm run lint           # ESLint
npx tsc --noEmit       # TypeScript check

# Building
eas build --platform android --profile preview
```

## Architecture

### Database (Cross-Platform SQLite)
- **Native:** expo-sqlite
- **Web:** sql.js (in-memory)
- **Tests:** better-sqlite3
- Migrations in `lib/database/migrations.ts`

### State Management (Zustand)
Store in `lib/store/index.ts` with:
- `ingredients`, `categories`, `mealTypes`, `mealLogs`
- CRUD actions for all entities
- `generateMealSuggestions()` for algorithm

### Key Features
- Dynamic meal types (user-configurable)
- Variety engine with cooldown periods
- Category-based ingredient organization
- Full CRUD for ingredients, categories, meal types

## Brand

- **Name:** SaborSpin (sabor = flavor in Portuguese)
- **Tagline:** "Shake up your plate"
- **Colors:** Orange #FF6B35 | Green #4CAF50 | Yellow #FFC107
- **Website:** saborspin.com

## Testing

- **Unit tests:** 220 tests (Jest)
- **E2E tests:** 23 tests (Playwright)
- Coverage: Database, business logic, store, UI flows

## Session End Protocol

When user signals session end:
1. Update `docs/learning/epic03_mealsrandomizerv1/SESSION_STATUS.md`
2. Create/update session notes if needed
3. Summarize what was accomplished

## Troubleshooting

See `docs/developer-guide/TROUBLESHOOTING.md` for common issues.

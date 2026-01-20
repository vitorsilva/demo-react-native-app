# SaborSpin

**Shake up your plate** - Variety-enforced meal suggestions for people who love food but hate deciding what to eat.

![SaborSpin Screenshot](landing/images/screenshot-suggestions.png)

## What is SaborSpin?

SaborSpin is a React Native mobile app that helps you break the monotony of everyday eating. Add your favorite ingredients, and the app generates varied meal combinations while ensuring you don't repeat the same meals too often.

**Key Features:**
- **Random Suggestions** - Get fresh meal combinations with a single tap
- **Variety Engine** - Smart algorithm prevents meal repetition within a configurable cooldown
- **Your Ingredients** - Customize your ingredient list by categories
- **Meal Types** - Configure breakfast, lunch, dinner, snacks with individual settings
- **Meal History** - Track what you've eaten over time

## Quick Start

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
npm test              # Run all unit tests (100+ tests)
npm run test:e2e      # Run Playwright E2E tests (12 tests)
```

### Building
```bash
# Preview build (APK for testing)
eas build --platform android --profile preview

# Production build (AAB for Play Store)
eas build --platform android --profile production
```

## Tech Stack

**Core:**
- React Native 0.81.4 with New Architecture
- Expo SDK 54
- TypeScript
- Expo Router (file-based routing)

**Database:**
- expo-sqlite (native)
- sql.js (web)
- better-sqlite3 (testing)

**State Management:**
- Zustand

**Testing:**
- Jest (100+ unit tests)
- Playwright (12 E2E tests)
- React Native Testing Library

**Observability:**
- OpenTelemetry (traces & metrics)
- Jaeger (trace visualization)
- Prometheus (metrics)
- Sentry (error tracking)

## Project Structure

```
demo-react-native-app/           # Root repo
├── landing/                     # Landing page (saborspin.com)
│   ├── index.html
│   └── images/
├── scripts/                     # Deployment scripts
│   └── deploy-landing.cjs
├── demo-react-native-app/       # React Native app
│   ├── app/                     # Expo Router (file-based routing)
│   │   ├── (tabs)/             # Tab navigation
│   │   │   ├── index.tsx       # Home - meal type buttons
│   │   │   ├── history.tsx     # Meal history
│   │   │   ├── manage-ingredients.tsx
│   │   │   ├── manage-categories.tsx
│   │   │   └── settings.tsx    # Global & meal type settings
│   │   └── suggestions/
│   │       └── [mealType].tsx  # Dynamic suggestions screen
│   ├── lib/
│   │   ├── database/           # SQLite with migrations
│   │   ├── business-logic/     # Combination generator, variety engine
│   │   ├── store/              # Zustand global state
│   │   └── telemetry/          # OpenTelemetry setup
│   ├── components/             # Reusable UI components
│   ├── e2e/                    # Playwright E2E tests
│   └── types/                  # TypeScript definitions
└── docs/                        # Documentation
    ├── epic01_infrastructure/   # Completed
    ├── epic02_mealsrandomizer/  # Completed
    └── epic03_mealsrandomizerv1/ # Current
```

## Development Progress

This project follows a structured learning approach organized into epics.

### Completed Epics

| Epic | Description | Status |
|------|-------------|--------|
| Epic 1 | Infrastructure & Foundation | ✅ Complete |
| Epic 2 | Meals Randomizer Core | ✅ Complete |

### Current: Epic 3 - Production Readiness

**Goal:** Transform from learning project to production-ready app

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | User Customization (CRUD for categories, meal types, ingredients) | ✅ Complete |
| Phase 2 | Branding & Identity (SaborSpin name, icons, landing page) | 🔄 ~85% |
| Phase 3 | Project Structure & Documentation | ⏳ Pending |
| Phase 4 | Polish Feature (Optional) | ⏳ Pending |
| Phase 5 | Telemetry Expansion | ⏳ Pending |
| Phase 6 | Validation & Iteration | ⏳ Pending |

**Current Progress:** [docs/epic03_mealsrandomizerv1/SESSION_STATUS.md](./docs/epic03_mealsrandomizerv1/SESSION_STATUS.md)

## Landing Page

The SaborSpin landing page is in the `landing/` directory.

**Preview locally:**
```bash
npm run preview:landing  # Serves at http://localhost:3333
```

**Deploy:**
```bash
cp .env.example .env     # Fill in FTP credentials
npm install              # Install dependencies
npm run deploy:landing   # Deploy to saborspin.com
```

## Observability

**Start observability stack:**
```bash
docker-compose up -d
```

- **Jaeger (Traces):** http://localhost:16686
- **Prometheus (Metrics):** http://localhost:9090

## Brand

- **Name:** SaborSpin (sabor = flavor in Portuguese)
- **Tagline:** "Shake up your plate"
- **Colors:** Orange #FF6B35 | Green #4CAF50 | Yellow #FFC107
- **Domain:** saborspin.com

## License

This is a learning project for educational purposes.

---

**Made with love in Portugal**


# Phase 3: Project Structure & Documentation

[← Back to Overview](./OVERVIEW.md) | [Previous: Phase 2](./PHASE2_BRANDING_IDENTITY.md)

---

## 🎯 Goal

Transform the repository from a learning-focused project to a professional, production-ready codebase with clear documentation and proper structure.

**Current State:** Documentation mixes learning notes with product information. Code comments reference learning concepts.

**After Phase 3:** Clear separation between learning materials and product documentation. Professional README and contribution guidelines. Codebase ready for open source.

**⚠️ IMPORTANT:** This phase includes verifying all documentation is accurate, links work, and the codebase is professionally organized. Final APK validation included.

**Estimated Time:** 4-6 hours (including documentation review, testing, and final deployment)

---

## 📚 Lessons from Saberloop

Before starting, we reviewed the Saberloop project (demo-pwa-app) to identify patterns worth adopting:

### Key Patterns to Apply

| Pattern | Saberloop Example | SaborSpin Application |
|---------|-------------------|----------------------|
| **Navigation README** | `docs/README.md` with quick links table | Create similar for SaborSpin |
| **Folder Structure** | `learning/`, `architecture/`, `developer-guide/` | Adopt same structure |
| **Status Indicators** | ✅ 📝 ⚠️ 🚧 consistently used | Standardize across docs |
| **CONTRIBUTING.md** | Project structure + areas to contribute | Include same sections |
| **Architecture Docs** | ASCII diagrams + component tables | Create for mobile architecture |
| **Developer Guide** | Prerequisites table + troubleshooting | Create installation guide |
| **Repository Rename** | Renamed `demo-pwa-app` → `saberloop` | Rename `demo-react-native-app` → `saborspin` |

### Why These Patterns Work

1. **Clear separation** - Learning materials preserved but separate from product docs
2. **Easy navigation** - docs/README.md acts as documentation hub
3. **Consistency** - Same status indicators across all documents
4. **Developer-friendly** - Clear setup instructions with troubleshooting
5. **Professional branding** - Repository name matches product name

---

## 📋 What You'll Build

### 0. Repository Rename (First!)
- Rename GitHub repository from `demo-react-native-app` to `saborspin`
- Update local git remotes
- Update all documentation references

### 1. Documentation Navigation Hub
- Create `docs/README.md` with quick navigation
- Add completion status table
- Include epic relationship overview

### 2. Documentation Reorganization
- Move all learning docs to `/docs/learning/`
- Create architecture documentation in `/docs/architecture/`
- Create developer guides in `/docs/developer-guide/`
- Archive completed learning phases

### 3. Professional Documentation
- Rewrite README.md (user-focused)
- Create CONTRIBUTING.md (developer-focused)
- Add CODE_OF_CONDUCT.md
- Create CHANGELOG.md
- Add LICENSE file

### 4. Repository Organization
- Add .github/ folder with templates
- Create issue templates
- Create pull request template

---

## 🛠️ Implementation Steps

### Step 3.0: Rename GitHub Repository (15 min)

**What you'll learn:** Repository management, git remote configuration

**Why do this first?**
- All documentation will reference the new repository URL
- Doing this first prevents having to update URLs twice
- GitHub automatically redirects old URLs (but we should use the new one)

**Current:** `github.com/YOUR_USERNAME/demo-react-native-app`
**After:** `github.com/YOUR_USERNAME/saborspin`

#### Step 3.0.1: Rename on GitHub

1. Go to your repository on GitHub
2. Click **Settings** (gear icon)
3. Under "Repository name", change `demo-react-native-app` to `saborspin`
4. Click **Rename**

**Note:** GitHub will automatically redirect the old URL to the new one, so existing links won't break immediately.

#### Step 3.0.2: Update Local Git Remote

After renaming on GitHub, update your local repository:

```bash
# Check current remote URL
git remote -v

# Update to new URL
git remote set-url origin https://github.com/YOUR_USERNAME/saborspin.git

# Verify the change
git remote -v
```

#### Step 3.0.3: Rename Local Folder (Optional)

You may want to rename your local folder to match:

```bash
# From the parent directory
cd ..
mv demo-react-native-app saborspin
cd saborspin
```

**Note:** This is optional but recommended for consistency. If you do this:
- Update any IDE workspace settings
- Update any terminal aliases or shortcuts
- Update CLAUDE.md working directory references

#### Step 3.0.4: Update CLAUDE.md

Update the working directory and any repo references in CLAUDE.md:

**Find and replace:**
- `demo-react-native-app` → `saborspin`
- Update any GitHub URLs

#### Step 3.0.5: Update package.json (if needed)

Check if `package.json` has repository field:

```json
{
  "name": "saborspin",
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/saborspin.git"
  }
}
```

#### Step 3.0.6: Update EAS Configuration (if needed)

Check `eas.json` and `app.json` for any GitHub references that need updating.

#### Step 3.0.7: Verify Everything Works

```bash
# Test git operations
git fetch origin
git status

# Run tests to make sure nothing broke
npm test
```

**Checklist:**
- [ ] Repository renamed on GitHub
- [ ] Local git remote updated
- [ ] Local folder renamed (optional)
- [ ] CLAUDE.md updated
- [ ] package.json updated (if applicable)
- [ ] Git operations work
- [ ] Tests pass

---

### Step 3.1: Create Documentation Navigation Hub (30 min)

**What you'll learn:** Documentation architecture, information hierarchy

**File: docs/README.md**

This is the key pattern from Saberloop - a central navigation document that helps users find what they need.

```markdown
# SaborSpin Documentation

This directory contains all documentation for the SaborSpin project.

**Live App:** [Coming soon]
**Landing Page:** [saborspin.com](https://saborspin.com)

---

## Documentation Structure

```
docs/
├── README.md (this file)
├── learning/                    # Learning journey (archived)
│   ├── epic01_infrastructure/
│   ├── epic02_mealsrandomizer/
│   └── epic03_mealsrandomizerv1/
├── architecture/                # System architecture
│   ├── SYSTEM_OVERVIEW.md
│   ├── DATABASE_SCHEMA.md
│   └── STATE_MANAGEMENT.md
├── developer-guide/             # Developer how-to guides
│   ├── INSTALLATION.md
│   ├── TESTING.md
│   └── TROUBLESHOOTING.md
└── user-guide/                  # End-user documentation
    ├── getting-started.md
    ├── customization.md
    └── faq.md
```

---

## Quick Navigation

### By Purpose

**👤 I want to use the app**
- [User Guide: Getting Started](./user-guide/getting-started.md)
- [User Guide: Customization](./user-guide/customization.md)
- [FAQ](./user-guide/faq.md)

**💻 I want to contribute**
- [Contributing Guide](../CONTRIBUTING.md)
- [Installation](./developer-guide/INSTALLATION.md)
- [Architecture Overview](./architecture/SYSTEM_OVERVIEW.md)

**📚 I want to learn from this project**
- [Epic 1: Infrastructure](./learning/epic01_infrastructure/LEARNING_PLAN.md)
- [Epic 2: Meals Randomizer](./learning/epic02_mealsrandomizer/OVERVIEW.md)
- [Epic 3: Production Readiness](./learning/epic03_mealsrandomizerv1/OVERVIEW.md)

---

## Epic Overview

| Epic | Focus | Status | Completion |
|------|-------|--------|------------|
| Epic 1 | Infrastructure & Foundation | ✅ Complete | 100% |
| Epic 2 | Meals Randomizer Features | ✅ Complete | 100% |
| Epic 3 | Production Readiness | 🚧 In Progress | 66% |

### Epic Progression

```
Epic 1: Learn the tools
├─ Testing, CI/CD, Observability
└─ Infrastructure ready

Epic 2: Build the features
├─ SQLite, Zustand, UI
└─ Functional prototype

Epic 3: Ship the product
├─ User customization, branding
└─ Production-ready app
```

---

## Document Conventions

### Status Indicators

| Symbol | Meaning |
|--------|---------|
| ✅ | Complete - Phase/feature finished |
| 📝 | Planned - Documented but not executed |
| ⚠️ | Deferred - Moved to different epic/phase |
| 🚧 | In Progress - Currently working |
| ♻️ | Ongoing - Continuous activity |

### File Naming

| Pattern | Purpose |
|---------|---------|
| `LEARNING_PLAN.md` | Epic overview and structure |
| `OVERVIEW.md` | Epic summary |
| `PHASE#_*.md` | Phase planning documents |
| `PHASE#_SESSION_NOTES.md` | Session notes after completion |
| `SESSION_STATUS.md` | Current progress tracking |
| `*_SUMMARY.md` | Summary documents |

---

## Questions?

- **Using the app:** See [User Guide](./user-guide/)
- **Contributing:** See [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Technical questions:** See [Architecture](./architecture/)
- **Learning journey:** See [Learning Materials](./learning/)

---

**Last Updated:** [DATE]
```

---

### Step 3.2: Reorganize Documentation Folders (45 min)

**What you'll learn:** Information architecture, documentation organization

**New Documentation Structure:**

```
docs/
├── README.md                         # Navigation hub (Step 3.1)
├── learning/                         # Learning materials (archived)
│   ├── README.md                     # "This is learning material"
│   ├── epic01_infrastructure/
│   │   ├── LEARNING_PLAN.md
│   │   └── PHASE*_LEARNING_NOTES.md
│   ├── epic02_mealsrandomizer/
│   │   ├── OVERVIEW.md
│   │   ├── PHASE*_*.md
│   │   └── PHASE*_SESSION_NOTES.md
│   └── epic03_mealsrandomizerv1/
│       ├── OVERVIEW.md
│       ├── PHASE*_*.md
│       └── PHASE*_SESSION_NOTES.md
│
├── architecture/                     # System architecture
│   ├── SYSTEM_OVERVIEW.md            # High-level architecture
│   ├── DATABASE_SCHEMA.md            # Database structure
│   └── STATE_MANAGEMENT.md           # Zustand store guide
│
├── developer-guide/                  # Developer documentation
│   ├── INSTALLATION.md               # Setup instructions
│   ├── TESTING.md                    # Testing guide
│   ├── CONFIGURATION.md              # Environment setup
│   └── TROUBLESHOOTING.md            # Common issues
│
└── user-guide/                       # End-user documentation
    ├── getting-started.md            # First-time user guide
    ├── customization.md              # Managing ingredients/categories
    └── faq.md                        # Frequently asked questions
```

**Tasks:**

1. Create new folder structure:
```bash
mkdir -p docs/learning
mkdir -p docs/architecture
mkdir -p docs/developer-guide
mkdir -p docs/user-guide
```

2. Move existing epic folders to `docs/learning/`:
```bash
mv docs/epic01_infrastructure docs/learning/
mv docs/epic02_mealsrandomizer docs/learning/
mv docs/epic03_mealsrandomizerv1 docs/learning/
```

3. Create `docs/learning/README.md`:

```markdown
# Learning Materials (Archived)

This folder contains learning materials from the development of SaborSpin. These documents were created during the learning process and are kept for reference.

**If you're looking to:**
- **Use the app** → See [User Guide](../user-guide/)
- **Contribute** → See [CONTRIBUTING.md](../../CONTRIBUTING.md)
- **Understand the code** → See [Architecture](../architecture/)

---

## Learning Journey

SaborSpin was built as a learning project, evolving from a demo app to a production product.

### Epic 1: Infrastructure & Foundation
**Status:** ✅ Complete

Built the professional development workflow:
- Testing infrastructure (Jest, Playwright)
- CI/CD pipeline (GitHub Actions)
- Observability stack (OpenTelemetry, Sentry)

[View Epic 1 →](./epic01_infrastructure/LEARNING_PLAN.md)

### Epic 2: Meals Randomizer
**Status:** ✅ Complete

Built the core application:
- SQLite database with cross-platform adapters
- Zustand state management
- Complete UI with navigation

[View Epic 2 →](./epic02_mealsrandomizer/OVERVIEW.md)

### Epic 3: Production Readiness
**Status:** 🚧 In Progress

Transforming to production product:
- User customization (ingredients, categories, meal types)
- Professional branding (SaborSpin)
- Documentation reorganization

[View Epic 3 →](./epic03_mealsrandomizerv1/OVERVIEW.md)

---

**Note:** These learning materials may reference outdated code or approaches. For current implementation details, see the [Architecture documentation](../architecture/).
```

4. Update internal links in moved files (search and replace paths)

---

### Step 3.3: Create Architecture Documentation (1 hour)

**What you'll learn:** Technical documentation, system design communication

**File: docs/architecture/SYSTEM_OVERVIEW.md**

```markdown
# System Architecture Overview

## High-Level Architecture

SaborSpin is a **local-first mobile app** built with React Native and Expo. All data is stored locally using SQLite - no cloud sync, no accounts required.

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native App                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Expo Router  │  │   Zustand    │  │  Telemetry   │       │
│  │ (Navigation) │  │   (State)    │  │  (Metrics)   │       │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘       │
│         │                 │                                  │
│  ┌──────▼─────────────────▼─────────────────────────┐       │
│  │                    Screens                        │       │
│  │  Home │ Suggestions │ Settings │ Manage │ History │       │
│  └──────────────────────┬────────────────────────────┘       │
│                         │                                    │
│  ┌──────────────────────▼────────────────────────────┐      │
│  │              Business Logic                        │      │
│  │  combinationGenerator │ varietyEngine │ validation │      │
│  └──────────────────────┬────────────────────────────┘      │
│                         │                                    │
│  ┌──────────────────────▼────────────────────────────┐      │
│  │              Database Layer                        │      │
│  │  ingredients │ categories │ mealTypes │ mealLogs  │      │
│  └──────────────────────┬────────────────────────────┘      │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          ▼
               ┌──────────────────┐
               │     SQLite       │
               │  (Local Storage) │
               └──────────────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | React Native 0.81 + Expo 54 | Cross-platform mobile |
| Navigation | Expo Router | File-based routing |
| State | Zustand | Global state management |
| Database | SQLite (expo-sqlite) | Local data persistence |
| Testing | Jest + Playwright | Unit + E2E tests |
| Observability | OpenTelemetry + Sentry | Metrics + error tracking |

## Application Layers

| Layer | Directory | Purpose |
|-------|-----------|---------|
| Screens | `app/` | UI presentation, user interaction |
| Components | `components/` | Reusable UI components |
| Business Logic | `lib/business-logic/` | Algorithms (combinations, variety) |
| Database | `lib/database/` | CRUD operations, migrations |
| State | `lib/store/` | Zustand store, actions |
| Telemetry | `lib/telemetry/` | Logging, metrics, analytics |
| Types | `types/` | TypeScript definitions |

## Key Design Decisions

### Local-First Architecture
- All data stored locally in SQLite
- No cloud sync or user accounts
- Privacy-focused: your data stays on your device

### Cross-Platform Database
- Native: expo-sqlite
- Web: sql.js (WebAssembly)
- Tests: better-sqlite3
- Adapter pattern for platform abstraction

### Variety Enforcement
- Cooldown period prevents ingredient repetition
- Configurable per meal type
- Based on meal log history

## Related Documentation

- [Database Schema](./DATABASE_SCHEMA.md)
- [State Management](./STATE_MANAGEMENT.md)
- [Installation Guide](../developer-guide/INSTALLATION.md)
```

**File: docs/architecture/DATABASE_SCHEMA.md**

```markdown
# Database Schema

## Tables

### ingredients
Stores all ingredients (seeded and user-added).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| name | TEXT | NOT NULL, UNIQUE | Ingredient name |
| meal_type | TEXT | NOT NULL | breakfast, snack, or both |
| category_id | TEXT | FOREIGN KEY | References categories(id) |
| is_active | INTEGER | DEFAULT 1 | 0=disabled, 1=enabled |
| is_user_added | INTEGER | DEFAULT 0 | 0=seeded, 1=user-added |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

### categories
Groups ingredients by category.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | UUID |
| name | TEXT | NOT NULL, UNIQUE | Category name |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

### meal_types
Configurable meal types with generation settings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | UUID |
| name | TEXT | NOT NULL, UNIQUE | Meal type name |
| display_name | TEXT | NOT NULL | User-facing name |
| min_ingredients | INTEGER | DEFAULT 2 | Minimum ingredients per suggestion |
| max_ingredients | INTEGER | DEFAULT 4 | Maximum ingredients per suggestion |
| cooldown_days | INTEGER | DEFAULT 3 | Days before ingredient can repeat |
| is_active | INTEGER | DEFAULT 1 | 0=disabled, 1=enabled |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

### meal_logs
Records of meals the user has logged.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| ingredients | TEXT | NOT NULL | JSON array of ingredient names |
| meal_type | TEXT | NOT NULL | Meal type name |
| logged_at | TEXT | DEFAULT CURRENT_TIMESTAMP | When meal was logged |

### migrations
Tracks which database migrations have been applied.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Migration version number |
| name | TEXT | NOT NULL | Migration description |
| applied_at | TEXT | DEFAULT CURRENT_TIMESTAMP | When applied |

## Relationships

```
categories (1) ──────< (many) ingredients
meal_types (1) ──────< (many) ingredients (via meal_type name)
meal_types (1) ──────< (many) meal_logs (via meal_type name)
```

## Indexes

- `idx_ingredients_category` on `ingredients.category_id`
- `idx_ingredients_meal_type` on `ingredients.meal_type`
- `idx_meal_logs_logged_at` on `meal_logs.logged_at`

## Migration History

| Version | Description |
|---------|-------------|
| 1 | Initial schema (categories, meal_types, ingredient columns) |
| 2 | Fix ingredients.category_id type (INTEGER → TEXT) |
| 3 | Rebuild categories table with correct schema |
```

---

### Step 3.4: Create Developer Guide (45 min)

**What you'll learn:** Technical writing for developers

**File: docs/developer-guide/INSTALLATION.md**

```markdown
# Installation Guide

## Prerequisites

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | Any | `git --version` |
| Expo CLI | Latest | `npx expo --version` |

### Optional (for device testing)
- Android Studio (for Android emulator)
- Xcode (for iOS simulator, macOS only)
- Expo Go app (for physical device testing)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/saborspin.git
cd saborspin
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages including:
- Expo SDK and React Native
- expo-sqlite (native database)
- sql.js (web database)
- Zustand (state management)
- Jest and Playwright (testing)

### 3. Start Development Server

```bash
npm start
```

This opens the Expo DevTools. From here you can:
- Press `w` for web
- Press `a` for Android
- Press `i` for iOS
- Scan QR code with Expo Go app

## Running Tests

### Unit Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# With coverage
npm test -- --coverage
```

### E2E Tests

```bash
# Headless
npm run test:e2e

# With visible browser
npm run test:e2e:headed

# Interactive UI
npm run test:e2e:ui
```

## Verifying Installation

After installation, verify everything works:

```bash
# 1. Run unit tests
npm test

# 2. TypeScript check
npx tsc --noEmit

# 3. Lint check
npm run lint

# 4. Start dev server
npm start
# Press 'w' for web mode
```

You should be able to:
- See the home screen with meal type buttons
- Navigate to suggestions screen
- Add/edit ingredients and categories
- Generate meal suggestions

## Troubleshooting

### Metro Bundler Won't Start

```bash
# Clear cache and restart
npx expo start -c
```

### Database Not Working

Check console for:
```
✅ Database ready
✅ Migrations complete
✅ Seeded XX ingredients
```

If not appearing, check `app/_layout.tsx` initialization.

### Can't Connect to Dev Server

- Ensure phone and computer on same WiFi
- Check firewall allows ports 8081/8082
- Try tunnel mode: `npx expo start --tunnel`

## Next Steps

- [Testing Guide](./TESTING.md) - Running and writing tests
- [Architecture Overview](../architecture/SYSTEM_OVERVIEW.md) - Understanding the codebase
- [Contributing](../../CONTRIBUTING.md) - Making contributions
```

---

### Step 3.5: Create CONTRIBUTING.md (30 min)

**What you'll learn:** Open source contribution guidelines

**File: CONTRIBUTING.md** (root directory)

```markdown
# Contributing to SaborSpin

Thank you for your interest in contributing to SaborSpin! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, collaborative, and constructive. We're all here to learn and build something useful together.

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/saborspin.git
cd saborspin

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/saborspin.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

## Development Workflow

### Running Locally

```bash
# Start development server
npm start

# Press 'w' for web mode (fastest iteration)
# Press 'a' for Android
# Press 'i' for iOS
```

### Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# TypeScript check
npx tsc --noEmit

# Lint
npm run lint
```

### Code Style

- Use TypeScript with strict mode
- Follow existing code formatting
- Add comments for complex logic
- Use meaningful variable/function names

**Example:**
```typescript
// Good
async function generateMealSuggestions(
  mealType: string,
  count: number
): Promise<MealSuggestion[]> {
  // Implementation
}

// Avoid
async function gen(t: string, n: number) {
  // Implementation
}
```

### Commit Messages

Follow conventional commit format:

```
type(scope): subject

body (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(ingredients): add bulk import functionality

fix(suggestions): correct variety calculation for short cooldowns

docs(readme): update installation instructions
```

### Pull Request Process

1. **Update your fork:**
```bash
git fetch upstream
git rebase upstream/main
```

2. **Run all checks:**
```bash
npm test && npx tsc --noEmit && npm run lint
```

3. **Push to your fork:**
```bash
git push origin feature/your-feature-name
```

4. **Create Pull Request:**
   - Go to GitHub and create a PR from your fork
   - Fill out the PR template
   - Link any related issues

5. **Review process:**
   - Address review comments
   - Update PR as needed
   - Maintain a clean commit history

## Project Structure

```
app/                    # Expo Router screens
├── (tabs)/             # Tab navigation screens
├── suggestions/        # Dynamic suggestion routes
└── _layout.tsx         # Root layout

components/             # Reusable UI components
├── modals/             # Modal components
├── ui/                 # Base UI components
└── themed-*.tsx        # Theme-aware components

lib/                    # Business logic
├── database/           # SQLite operations
├── business-logic/     # Algorithms
├── store/              # Zustand state
└── telemetry/          # Observability

types/                  # TypeScript definitions

e2e/                    # Playwright E2E tests

docs/                   # Documentation
├── architecture/       # System architecture
├── developer-guide/    # Developer how-to
├── user-guide/         # End-user docs
└── learning/           # Learning materials
```

## Areas to Contribute

### Bug Fixes

Found a bug?

1. Check if already reported in [Issues](https://github.com/OWNER/saborspin/issues)
2. If not, create a new issue with:
   - Description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
3. Create a PR with the fix

### New Features

Have an idea?

1. Open an issue first to discuss
2. Get feedback before starting work
3. Follow the PR process above

### Documentation

Documentation improvements are always welcome:
- Fix typos
- Clarify confusing sections
- Add missing documentation
- Improve examples

### Testing

- Add tests for uncovered code
- Improve existing tests
- Add E2E test scenarios

## Questions?

- Open an issue with the `question` label
- Check the [FAQ](./docs/user-guide/faq.md)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
```

---

### Step 3.6: Add CODE_OF_CONDUCT.md (10 min)

**What you'll learn:** Community standards

**File: CODE_OF_CONDUCT.md** (root directory)

Use the Contributor Covenant template (standard for open source projects):

```markdown
# Contributor Covenant Code of Conduct

## Our Pledge

We as members, contributors, and leaders pledge to make participation in our
community a harassment-free experience for everyone, regardless of age, body
size, visible or invisible disability, ethnicity, sex characteristics, gender
identity and expression, level of experience, education, socio-economic status,
nationality, personal appearance, race, religion, or sexual identity
and orientation.

## Our Standards

Examples of behavior that contributes to a positive environment:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior:
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

## Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported to the project maintainers. All complaints will be reviewed and
investigated promptly and fairly.

## Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage],
version 2.0, available at
https://www.contributor-covenant.org/version/2/0/code_of_conduct.html

[homepage]: https://www.contributor-covenant.org
```

---

### Step 3.7: Create CHANGELOG.md (20 min)

**What you'll learn:** Version documentation

**File: CHANGELOG.md** (root directory)

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Professional branding (SaborSpin)
- Documentation reorganization
- Contributing guidelines

## [1.0.0] - 2026-01-XX (Epic 3 Phase 2 Complete)

### Added
- User customization features
  - Manage ingredients (add, edit, delete, toggle active)
  - Manage categories (add, edit, delete)
  - Configure meal types (min/max ingredients, cooldown)
- Dynamic meal type buttons on home screen
- Data validation and safety checks
- Professional app branding (SaborSpin)
- App icon and splash screen
- Landing page

### Changed
- Updated theme colors to brand palette
- Meal type configuration now per-type instead of global
- Algorithm respects meal type settings

## [0.2.0] - 2025-11-21 (Epic 2 Complete)

### Added
- SQLite database with cross-platform adapters
- Zustand state management
- Combination generator algorithm
- Variety enforcement engine
- Home screen with meal type navigation
- Suggestions screen with image cards
- Confirmation modal for meal logging
- Recent meals history display
- E2E tests with Playwright (7 tests)
- 40 unit tests

### Fixed
- Database timing issues with useRef pattern
- Sentry web compatibility with Platform checks

## [0.1.0] - 2025-10-28 (Epic 1 Complete)

### Added
- Jest testing infrastructure
- ESLint and Prettier configuration
- GitHub Actions CI/CD pipeline
- OpenTelemetry observability stack
- Sentry for error tracking
- Docker Compose for local observability
- Pre-commit hooks with Husky

### Changed
- Migrated to Expo SDK 54
- Updated to React 19.1.0
- Enabled React Native new architecture

## [0.0.1] - Initial Setup

### Added
- Basic Expo React Native project
- EAS Build configuration
- APK generation capability

[Unreleased]: https://github.com/OWNER/saborspin/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/OWNER/saborspin/compare/v0.2.0...v1.0.0
[0.2.0]: https://github.com/OWNER/saborspin/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/OWNER/saborspin/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/OWNER/saborspin/releases/tag/v0.0.1
```

---

### Step 3.8: Add LICENSE (5 min)

**What you'll learn:** Open source licensing

**File: LICENSE** (root directory)

```
MIT License

Copyright (c) 2025-2026 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

### Step 3.9: Rewrite README.md (45 min)

**What you'll learn:** Project presentation, professional documentation

**File: README.md** (root directory)

```markdown
<div align="center">
  <img src="./assets/images/icon.png" alt="SaborSpin Logo" width="120" />
  <h1>SaborSpin</h1>
  <p><strong>Shake up your plate - Variety-enforced meal suggestions</strong></p>

  [![Tests](https://github.com/OWNER/saborspin/workflows/CI/badge.svg)](https://github.com/OWNER/saborspin/actions)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
</div>

---

## What is SaborSpin?

SaborSpin helps you decide what to eat without repeating meals too often. Get personalized meal suggestions based on your ingredients and eating history.

**Problem:** Decision fatigue around daily meals. Eating the same things repeatedly.

**Solution:** Variety-enforced meal suggestions that prevent repetition while respecting your preferences.

[See it in action →](https://saborspin.com)

---

## Features

- **Variety Enforced** - Algorithm prevents repeating ingredients within your cooldown period
- **Fast Decisions** - Pick a meal in under 20 seconds
- **Fully Customizable** - Add your own ingredients, categories, and meal types
- **Meal Tracking** - See your eating history and patterns
- **Dark Mode** - Easy on the eyes, day or night
- **Privacy First** - All data stored locally, no cloud sync
- **Cross-Platform** - iOS, Android, and Web

---

## Screenshots

[Add screenshots here]

---

## Download

### Android
- **[Download APK](link)** (v1.0.0)
- Coming soon to Google Play Store

### iOS
Coming soon to the App Store

### Web
Try the web version at [saborspin.com/app](https://saborspin.com/app)

---

## Built With

- **[React Native](https://reactnative.dev)** + **[Expo](https://expo.dev)** - Mobile framework
- **[SQLite](https://www.sqlite.org)** - Local-first database
- **[Zustand](https://zustand.pmnd.rs)** - State management
- **[TypeScript](https://www.typescriptlang.org)** - Type safety
- **[Playwright](https://playwright.dev)** - E2E testing

---

## Documentation

- **[User Guide](./docs/user-guide/)** - How to use SaborSpin
- **[Architecture](./docs/architecture/)** - Technical documentation
- **[Contributing](./CONTRIBUTING.md)** - How to contribute
- **[Changelog](./CHANGELOG.md)** - Version history

---

## Quick Start for Developers

```bash
# Clone the repo
git clone https://github.com/OWNER/saborspin.git
cd saborspin

# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Run E2E tests
npm run test:e2e
```

See [Installation Guide](./docs/developer-guide/INSTALLATION.md) for detailed setup.

---

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) and [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## Project Status

- ✅ **Epic 1:** Infrastructure & Foundation - Complete
- ✅ **Epic 2:** Meals Randomizer Features - Complete
- 🚧 **Epic 3:** Production Readiness - In Progress
  - ✅ Phase 1: User Customization - Complete
  - ✅ Phase 2: Branding & Identity - Complete
  - 🚧 Phase 3: Documentation - In Progress

---

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file.

---

## Acknowledgments

- Built as a learning project, evolved into a product
- Inspired by decision fatigue research
- Thanks to the React Native and Expo communities

---

<div align="center">
  Made with care and lots of meal decisions
</div>
```

---

### Step 3.10: Create GitHub Templates (20 min)

**What you'll learn:** GitHub repository organization

**Create `.github/` folder with templates:**

**File: .github/ISSUE_TEMPLATE/bug_report.md**

```markdown
---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. iOS 17.1, Android 14]
- App Version: [e.g. 1.0.0]
- Device: [e.g. iPhone 14, Pixel 7]

**Additional context**
Any other context about the problem.
```

**File: .github/ISSUE_TEMPLATE/feature_request.md**

```markdown
---
name: Feature request
about: Suggest an idea
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context or screenshots.
```

**File: .github/PULL_REQUEST_TEMPLATE.md**

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Tests added/updated
- [ ] TypeScript check passes
- [ ] Linter passes
- [ ] Documentation updated
- [ ] Screenshots attached (for UI changes)

## Screenshots (if applicable)

## Related Issues
Closes #(issue number)
```

---

### Step 3.11: Create User Guide (30 min)

**What you'll learn:** Writing for end users

**File: docs/user-guide/getting-started.md**

```markdown
# Getting Started with SaborSpin

Welcome to SaborSpin! This guide will help you get started with the app.

## First Launch

When you first open SaborSpin, you'll see the home screen with:
- Meal type buttons (Breakfast, Snack)
- Your recent meals (empty at first)

## Your First Meal Suggestion

1. **Tap a meal type** - Choose "Breakfast" or "Snack"
2. **View suggestions** - You'll see 4 meal combinations
3. **Pick one** - Tap the meal you want
4. **Confirm** - The meal is logged to your history

That's it! SaborSpin will remember what you ate and avoid suggesting similar ingredients for a few days.

## Understanding Variety Enforcement

SaborSpin uses a "cooldown" system:
- Each meal type has a cooldown period (default: 3 days)
- Ingredients you ate recently won't appear in suggestions
- This ensures variety in your meals

## Next Steps

- [Customizing your ingredients](./customization.md)
- [Frequently Asked Questions](./faq.md)
```

**File: docs/user-guide/customization.md**

```markdown
# Customizing SaborSpin

SaborSpin comes with default ingredients, but you can fully customize everything.

## Managing Ingredients

**To add an ingredient:**
1. Go to the Ingredients tab
2. Tap the + button
3. Enter the name, category, and meal types
4. Tap Save

**To edit an ingredient:**
1. Tap the ingredient in the list
2. Make your changes
3. Tap Save

**To disable an ingredient:**
- Toggle the switch next to the ingredient
- Disabled ingredients won't appear in suggestions

## Managing Categories

Categories help organize your ingredients (e.g., Fruits, Proteins, Grains).

**To add a category:**
1. Go to the Categories tab
2. Tap the + button
3. Enter the category name
4. Tap Save

**Note:** You can't delete a category that has ingredients assigned to it.

## Configuring Meal Types

Each meal type can be customized:
- **Min/Max ingredients** - How many ingredients per suggestion
- **Cooldown days** - How long before ingredients can repeat
- **Active/Inactive** - Whether the meal type appears on home screen

**To configure a meal type:**
1. Go to Settings
2. Find the meal type
3. Adjust the sliders
4. Changes save automatically
```

---

### Step 3.12: Documentation Validation (30 min)

**What you'll learn:** Quality assurance for documentation

**Validation Checklist:**

1. **Link Validation:**
   - [ ] All internal links work (click through each link)
   - [ ] No 404 errors
   - [ ] All cross-references correct

2. **Content Accuracy:**
   - [ ] README.md reflects current state
   - [ ] CONTRIBUTING.md has correct setup steps
   - [ ] User guide matches actual features
   - [ ] Screenshots are current (if any)

3. **Completeness:**
   - [ ] All required docs exist (README, CONTRIBUTING, LICENSE, etc.)
   - [ ] User guide covers main features
   - [ ] FAQ answers common questions

4. **Consistency:**
   - [ ] Status indicators used consistently
   - [ ] File naming follows conventions
   - [ ] Commands work as documented

---

### Step 3.13: Final Testing & Deployment (1 hour)

**What you'll learn:** End-to-end validation

**1. Run All Tests:**

```bash
cd demo-react-native-app

# Unit tests
npm test

# TypeScript
npx tsc --noEmit

# Lint
npm run lint

# E2E tests
npm run test:e2e
```

**Expected Results:**
- All unit tests pass (100+)
- No TypeScript errors
- No linting errors
- All E2E tests pass

**2. Manual Testing:**

```bash
npm start
# Press 'w' for web mode
```

Test all features:
- [ ] Add/edit/delete ingredients
- [ ] Add/edit/delete categories
- [ ] Configure meal types
- [ ] Generate suggestions
- [ ] Log meals
- [ ] View history

**3. Build Production APK:**

```bash
eas build --platform android --profile preview
```

**4. Final Commit:**

```bash
git add .

git commit -m "docs: restructure for production (Epic 3 Phase 3)

- Create docs/README.md navigation hub
- Reorganize docs (learning/, architecture/, developer-guide/, user-guide/)
- Add CONTRIBUTING.md with contribution guidelines
- Add CODE_OF_CONDUCT.md
- Create CHANGELOG.md
- Add LICENSE (MIT)
- Rewrite README.md (professional)
- Add GitHub templates (.github/)
- Create architecture documentation
- Create developer installation guide
- Create user guide

Repository is now production-ready

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

**5. Optional: Create Release Tag**

```bash
git tag -a v1.0.0 -m "Version 1.0.0 - Production Ready"
git push origin v1.0.0
```

---

## ✅ Success Criteria

### Repository Rename
- [ ] GitHub repository renamed to `saborspin`
- [ ] Local git remote updated
- [ ] Local folder renamed (optional)
- [ ] CLAUDE.md references updated
- [ ] All documentation uses new repo name

### Documentation
- [ ] `docs/README.md` navigation hub created
- [ ] Learning materials moved to `docs/learning/`
- [ ] Architecture docs in `docs/architecture/`
- [ ] Developer guide in `docs/developer-guide/`
- [ ] User guide in `docs/user-guide/`
- [ ] CONTRIBUTING.md complete
- [ ] CODE_OF_CONDUCT.md in place
- [ ] CHANGELOG.md tracks versions
- [ ] LICENSE file added
- [ ] README.md is professional

### Repository Structure
- [ ] `.github/` folder with templates
- [ ] Issue templates work
- [ ] PR template works
- [ ] All links work
- [ ] No references to old "demo-react-native-app" name

### Quality
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Documentation is accurate

---

## 🎓 Learning Outcomes

After completing Phase 3, you'll understand:
- Repository renaming and git remote management
- Documentation architecture and organization
- Technical writing for different audiences
- Open source best practices
- GitHub repository organization
- Professional project presentation

---

## 🚀 Next Steps

After completing Phase 3:
1. Review all documentation for clarity
2. Get feedback from someone (pretend they're new)
3. Move to [Phase 4: Polish Feature →](./PHASE4_POLISH_FEATURE.md) (optional)
4. Or skip to [Phase 5: Telemetry Expansion →](./PHASE5_TELEMETRY_EXPANSION.md)
5. Or declare Epic 3 complete and start validation!

---

[← Back to Overview](./OVERVIEW.md) | [Previous: Phase 2](./PHASE2_BRANDING_IDENTITY.md) | [Next: Phase 4 →](./PHASE4_POLISH_FEATURE.md)

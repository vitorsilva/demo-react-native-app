# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Documentation reorganization (architecture, developer-guide, user-guide)
- Contributing guidelines
- Code of Conduct

## [1.0.0] - 2026-01-20

### Added
- User customization features
  - Manage ingredients (add, edit, delete, toggle active)
  - Manage categories (add, edit, delete)
  - Configure meal types (min/max ingredients, cooldown)
- Dynamic meal type buttons on home screen
- Data validation and safety checks
- Professional app branding (SaborSpin)
- App icon and splash screen
- Landing page at saborspin.com

### Changed
- Updated theme colors to brand palette (Orange, Green, Yellow)
- Meal type configuration now per-type instead of global
- Algorithm respects meal type settings

## [0.2.0] - 2025-11-21

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

## [0.1.0] - 2025-10-28

### Added
- Jest testing infrastructure
- ESLint and Prettier configuration
- GitHub Actions CI/CD pipeline
- OpenTelemetry observability stack
- Sentry for error tracking
- Docker Compose for local observability
- Pre-commit hooks

### Changed
- Migrated to Expo SDK 54
- Updated to React 19.1.0
- Enabled React Native new architecture

## [0.0.1] - Initial Setup

### Added
- Basic Expo React Native project
- EAS Build configuration
- APK generation capability

[Unreleased]: https://github.com/vitorsilva/saborspin/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/vitorsilva/saborspin/compare/v0.2.0...v1.0.0
[0.2.0]: https://github.com/vitorsilva/saborspin/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/vitorsilva/saborspin/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/vitorsilva/saborspin/releases/tag/v0.0.1

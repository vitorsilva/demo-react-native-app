# System Architecture Overview

## High-Level Architecture

SaborSpin is a **local-first mobile app** built with React Native and Expo. All data is stored locally using SQLite - no cloud sync, no accounts required.

```
+-------------------------------------------------------------+
|                    React Native App                          |
+-------------------------------------------------------------+
|                                                              |
|  +------------+  +------------+  +------------+              |
|  | Expo Router|  |   Zustand  |  |  Telemetry |              |
|  | (Navigation)|  |   (State)  |  |  (Metrics) |              |
|  +------+-----+  +------+-----+  +------------+              |
|         |               |                                    |
|  +------v---------------v------------------------------+     |
|  |                    Screens                          |     |
|  |  Home | Suggestions | Settings | Manage | History   |     |
|  +-------------------------+---------------------------+     |
|                            |                                 |
|  +-------------------------v---------------------------+     |
|  |              Business Logic                         |     |
|  |  combinationGenerator | varietyEngine | validation  |     |
|  +-------------------------+---------------------------+     |
|                            |                                 |
|  +-------------------------v---------------------------+     |
|  |              Database Layer                         |     |
|  |  ingredients | categories | mealTypes | mealLogs    |     |
|  +-------------------------+---------------------------+     |
|                            |                                 |
+----------------------------+--------------------------------+
                             |
                             v
                  +------------------+
                  |     SQLite       |
                  |  (Local Storage) |
                  +------------------+
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
- **Native (iOS/Android):** expo-sqlite
- **Web:** sql.js (WebAssembly)
- **Tests:** better-sqlite3
- Adapter pattern for platform abstraction

### Variety Enforcement
- Cooldown period prevents ingredient repetition
- Configurable per meal type
- Based on meal log history

## Data Flow

```
User Action (tap meal type button)
         |
         v
+------------------+
|   Expo Router    |  Navigate to /suggestions/[mealType]
+--------+---------+
         |
         v
+------------------+
|  Zustand Store   |  Call generateMealSuggestions()
+--------+---------+
         |
         v
+------------------+
| Business Logic   |  combinationGenerator + varietyEngine
+--------+---------+
         |
         v
+------------------+
|    Database      |  Query ingredients, check meal logs
+--------+---------+
         |
         v
+------------------+
|     SQLite       |  Return data
+------------------+
```

## Related Documentation

- [Database Schema](./DATABASE_SCHEMA.md)
- [State Management](./STATE_MANAGEMENT.md)
- [Installation Guide](../developer-guide/INSTALLATION.md)

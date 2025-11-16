# Database Adapters

Platform-specific SQLite implementations that conform to `DatabaseAdapter` interface.

## Current Adapters

- **native.ts** - Uses expo-sqlite for iOS/Android
- **inMemory.ts** - Uses sql.js for in-memory storage (web development)

## Future Adapters (Planned)

- **indexedDb.ts** - Persistent web storage using IndexedDB + sql.js
- Would save database to IndexedDB for persistence
- Use `db.export()` to get binary, store in IndexedDB
- Load on startup with `new SQL.Database(data)`

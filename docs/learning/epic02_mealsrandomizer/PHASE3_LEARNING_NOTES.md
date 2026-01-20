# Phase 3 Learning Notes: Building UI & Cross-Platform Support

## Overview
This document captures all the concepts, questions, and explanations from Phase 3 of Epic 2 - building the UI layer and establishing cross-platform database support.

**Phase Duration:** Started 2025-01-16
**Status:** 🔄 IN PROGRESS

---

## Table of Contents
1. [Adapter Pattern](#adapter-pattern)
2. [Dynamic Imports](#dynamic-imports)
3. [Platform-Specific Code](#platform-specific-code)
4. [Metro Bundler Configuration](#metro-bundler-configuration)
5. [sql.js and WebAssembly](#sqljs-and-webassembly)
6. [Jest Mocking Strategies](#jest-mocking-strategies)
7. [Defensive Programming](#defensive-programming)
8. [TypeScript Structural Typing](#typescript-structural-typing)

---

## Adapter Pattern

### What is the Adapter Pattern?

**Q: Why is this called the "Adapter Pattern"?**

**A: Think About Physical Adapters**

Real-world example: Phone chargers
- Different countries have different outlets (US, EU, UK)
- Your phone needs the same power regardless
- An **adapter** translates between the outlet and your phone

**Software equivalent:**
```typescript
// Your code expects this interface
interface DatabaseAdapter {
  runAsync(sql: string, args: unknown[]): Promise<RunResult>;
  getAllAsync<T>(sql: string, args: unknown[]): Promise<T[]>;
}

// expo-sqlite has one API
const expoSqlite = {
  runAsync: (sql, params) => { /* native implementation */ }
};

// sql.js has a different API
const sqlJs = {
  run: (sql, bindObject) => { /* web implementation */ },
  exec: (sql) => { /* different signature! */ }
};

// Adapters make both conform to the same interface
```

**C#/.NET Parallel:**
```csharp
// Like IDbConnection in ADO.NET
public interface IDatabaseAdapter
{
    Task<T> ExecuteAsync<T>(string sql, object[] args);
}

// SqlConnection implements it one way
// NpgsqlConnection implements it another way
// Your code depends on the interface, not the implementation
```

---

### Benefits of Adapter Pattern

1. **Swap Implementations Without Changing Code**
```typescript
// Your business logic doesn't care which adapter
const db = getDatabase(); // Returns DatabaseAdapter
await db.runAsync('INSERT INTO items VALUES (?)', [item]);
// Same code works for expo-sqlite, sql.js, or better-sqlite3!
```

2. **Testability**
```typescript
// Test adapter uses in-memory database
const testAdapter = createTestAdapter();
// Runs same queries, isolated environment
```

3. **Future-Proofing**
```typescript
// Want to add IndexedDB later?
// Just create a new adapter that implements DatabaseAdapter
// No changes to business logic!
```

---

## Dynamic Imports

### Static vs Dynamic Imports

**Q: What's the difference between static and dynamic imports?**

**Static Import (Bundled at Build Time):**
```typescript
import * as SQLite from 'expo-sqlite';
// ❌ Metro includes expo-sqlite in ALL platform bundles
// Even if you never use it on web
```

**Dynamic Import (Loaded at Runtime):**
```typescript
const SQLite = await import('expo-sqlite');
// ✅ Only loaded when this code path executes
// Web bundle doesn't include it (theoretically)
```

---

### The Metro Bundler Caveat

**Problem:** Metro does static analysis

Even with dynamic imports:
```typescript
export async function createNativeAdapter() {
  const SQLite = await import('expo-sqlite'); // Dynamic!
}
```

Metro STILL tries to bundle expo-sqlite because it sees the import string.

**Solution:** Combine dynamic imports + Metro configuration:
```javascript
// metro.config.js
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'expo-sqlite') {
    return { type: 'empty' }; // Don't bundle for web
  }
  return context.resolveRequest(context, moduleName, platform);
};
```

---

### Jest and Dynamic Imports

**Problem:** Jest doesn't support `await import()` by default

```
TypeError: A dynamic import callback was invoked without --experimental-vm-modules
```

**Solution:** Mock the entire module
```typescript
// __mocks__/index.ts
jest.mock('../index'); // Use mock instead of real implementation
```

This bypasses the dynamic import entirely in tests.

---

## Platform-Specific Code

### Platform Detection

**How React Native Knows the Platform:**
```typescript
import { Platform } from 'react-native';

Platform.OS // Returns: 'ios', 'android', or 'web'
```

**Using It for Conditional Logic:**
```typescript
if (Platform.OS === 'web') {
  // Load sql.js (WebAssembly)
  database = await createInMemoryAdapter();
} else {
  // Load expo-sqlite (native binaries)
  database = await createNativeAdapter('meals.db');
}
```

---

### Platform-Specific File Extensions

React Native/Metro supports automatic file selection:
```
Button.tsx        // Default (fallback)
Button.ios.tsx    // iOS-specific
Button.android.tsx // Android-specific
Button.web.tsx    // Web-specific
```

When you `import Button from './Button'`, Metro picks the right file.

**We didn't use this because:**
- Need runtime detection, not build-time
- Want to share most code, only differ in database creation
- More control with explicit `Platform.OS` check

---

## Metro Bundler Configuration

### What is Metro?

Metro is React Native's JavaScript bundler (like Webpack for web). It:
- Transforms JSX/TypeScript to plain JavaScript
- Bundles all modules into one file
- Handles platform-specific code

---

### Custom Resolver

**Problem:** expo-sqlite has web implementation that requires WASM files that don't exist:
```
Metro error: Unable to resolve module ./wa-sqlite/wa-sqlite.wasm
```

**Solution:** Tell Metro "don't include expo-sqlite for web"

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'expo-sqlite') {
    return { type: 'empty' }; // Return empty module
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
```

**What this does:**
- When bundling for web platform
- If someone imports 'expo-sqlite'
- Return an empty module instead
- Prevents the WASM file resolution error

---

## sql.js and WebAssembly

### What is sql.js?

**sql.js = SQLite compiled to WebAssembly**

- SQLite is written in C
- Emscripten compiles C to WebAssembly
- WebAssembly runs in JavaScript environments
- Result: SQLite in your browser!

---

### API Differences

**expo-sqlite (native):**
```typescript
db.runAsync('INSERT INTO t VALUES (?)', ['value']);
// Uses ? placeholders
// Returns Promise with lastInsertRowId
```

**sql.js (WebAssembly):**
```typescript
db.run('INSERT INTO t VALUES ($1)', { $1: 'value' });
// Uses $1, $2, $3 placeholders (named parameters)
// Synchronous API
// No direct lastInsertRowId return
```

**Our Adapter Bridges This:**
```typescript
function convertPlaceholders(sql: string, args: unknown[]) {
  // 'SELECT * FROM t WHERE id = ?' becomes 'SELECT * FROM t WHERE id = $1'
  // ['value'] becomes { $1: 'value' }
}
```

---

### In-Memory vs Persistent

**Current:** In-memory database
```typescript
const db = new SQL.Database(); // Data in RAM only
// Data lost on page refresh
// Fine for development/UI testing
```

**Future (IndexedDB):**
```typescript
// Save database to browser storage
const data = db.export(); // Get as Uint8Array
await indexedDB.put('meals-db', data);

// Load on startup
const savedData = await indexedDB.get('meals-db');
const db = new SQL.Database(savedData);
```

We named the adapter "inMemory" (not "web") to leave room for "indexedDb" adapter later.

---

## Jest Mocking Strategies

### The `__mocks__` Folder Pattern

Jest automatically looks for mocks in `__mocks__` folders:

```
lib/
├── database/
│   ├── index.ts              // Real implementation
│   ├── __mocks__/
│   │   └── index.ts          // Mock implementation
```

When you call `jest.mock('../index')`, Jest uses the mock.

---

### Mock Levels

**Level 1: Mock External Package**
```
lib/database/__tests__/__mocks__/
└── expo-sqlite.ts  // Mocks the npm package
```

**Level 2: Mock Your Own Module**
```
lib/database/__mocks__/
└── index.ts  // Mocks your database/index.ts
```

We use Level 2 to bypass all the dynamic import logic entirely.

---

### Test Adapter Pattern

```typescript
// Real code path (production):
initDatabase() → Platform detection → Dynamic import → Native/Web adapter

// Test code path:
jest.mock('../index') → Mock initDatabase() → Test adapter (better-sqlite3)
```

Benefits:
- Tests run fast (in-memory database)
- No dynamic import issues
- Isolated from platform concerns
- Same behavior as production adapters

---

## Defensive Programming

### Input Validation

**Bad:** Trust all inputs
```typescript
function convertPlaceholders(sql: string, args: unknown[]) {
  // Just convert, don't check
  return sql.replace(/\?/g, ...);
}
// What if sql has 3 placeholders but args has 2 values? 😱
```

**Good:** Validate before processing
```typescript
function convertPlaceholders(sql: string, args: unknown[]) {
  const placeholderCount = (sql.match(/\?/g) || []).length;

  if (placeholderCount !== args.length) {
    throw new Error(
      `Placeholder count mismatch: SQL has ${placeholderCount} but ${args.length} args provided`
    );
  }
  // Now safe to proceed
}
```

---

### Fail Fast Principle

**Q: Why throw an error instead of handling it silently?**

**A: Find Bugs Where They Occur**

**Silent failure:**
```typescript
// Query runs with wrong parameters
// Data corruption occurs
// Hours later: "Why is my data wrong?"
// Hard to debug!
```

**Fail fast:**
```typescript
// Immediate error: "Placeholder count mismatch"
// Stack trace shows exact location
// Fix before damage is done
// Easy to debug!
```

**C# Parallel:** Like `ArgumentException` or `ArgumentNullException`
```csharp
public void Process(string value)
{
    if (value == null)
        throw new ArgumentNullException(nameof(value));
    // Continue safely
}
```

---

### Edge Case Testing

Tested scenarios:
- Single placeholder ✅
- Multiple placeholders ✅
- No placeholders ✅
- Different data types (string, number, boolean, null) ✅
- Strings with commas ✅
- Special characters (newlines, carriage returns) ✅
- Too few arguments → Error ✅
- Too many arguments → Error ✅

Comprehensive testing prevents production surprises.

---

## TypeScript Structural Typing

### What is Structural Typing?

**TypeScript:** "If it looks like a duck and quacks like a duck..."

```typescript
interface DatabaseAdapter {
  runAsync(sql: string, args: unknown[]): Promise<RunResult>;
  getAllAsync<T>(sql: string, args: unknown[]): Promise<T[]>;
}

// This object is compatible:
const myDb = {
  runAsync: async (sql, args) => { /* ... */ },
  getAllAsync: async (sql, args) => { /* ... */ },
  // Extra properties allowed!
  extraMethod: () => { /* ... */ }
};

// TypeScript says: "It has the right shape, so it's compatible"
const adapter: DatabaseAdapter = myDb; // ✅ Works!
```

---

### Why No Errors When Switching Adapters?

**Your code:**
```typescript
// ingredients.ts
const db = getDatabase(); // Returns DatabaseAdapter
await db.runAsync(...);
await db.getAllAsync(...);
```

**Old getDatabase():** Returned `SQLite.SQLiteDatabase`
**New getDatabase():** Returns `DatabaseAdapter`

No errors because:
- Both have `runAsync` with same signature
- Both have `getAllAsync` with same signature
- Shape matches → TypeScript is happy

**C# Contrast:** C# uses nominal typing (name matters)
```csharp
// Even if signatures match, this wouldn't work:
IDatabase db = new SqliteDatabase(); // Must explicitly implement
```

---

### Type Assertions

When crossing type boundaries:
```typescript
const result = await this.db.runAsync(sql, args);
// result type from expo-sqlite

return {
  lastInsertRowId: result.lastInsertRowId,
  changes: result.changes,
}; // Cast to our RunResult type
```

Type assertions (`as`) are like C# casts - telling the compiler "trust me, I know what this is."

---

## Architecture Achieved

### Database Layer Architecture

```
Application Code (ingredients.ts, mealLogs.ts)
           ↓
    DatabaseAdapter Interface (types.ts)
           ↓
    Platform Detection (index.ts)
        ↙     ↘
Native Adapter    In-Memory Adapter
(expo-sqlite)       (sql.js)
     ↓                  ↓
   iOS/Android        Browser
```

### Test Architecture

```
Test Code (ingredients.test.ts)
           ↓
    jest.mock('../index')
           ↓
    Mock Database Module (__mocks__/index.ts)
           ↓
    Test Adapter (testDb.ts)
           ↓
    better-sqlite3 (in-memory)
```

### Benefits Realized

1. **Platform Independence** - Same business logic everywhere
2. **Testability** - Fast, isolated tests
3. **Maintainability** - Change one adapter, others unaffected
4. **Extensibility** - Add IndexedDB adapter without touching existing code
5. **Separation of Concerns** - Database concerns isolated from business logic

---

## Key Takeaways

1. **Adapter Pattern** is powerful for cross-platform code
2. **Dynamic imports** help, but Metro bundling needs configuration too
3. **Platform.OS** enables runtime platform detection
4. **Metro config** can exclude packages per platform
5. **Jest mocking** at module level bypasses complex initialization
6. **Fail fast** with clear errors beats silent failures
7. **Structural typing** makes refactoring smoother
8. **Test the edge cases** - commas, special chars, mismatched args

---

## What's Next?

**Step 3.1: Building UI Components**
- FlatList for performant rendering
- Meal suggestion cards
- Interactive buttons (accept/reject)
- Meal logging UI

Now that web mode works, UI development will be much faster with browser DevTools!

---

*Phase 3 Learning Notes - Updated 2025-01-16*

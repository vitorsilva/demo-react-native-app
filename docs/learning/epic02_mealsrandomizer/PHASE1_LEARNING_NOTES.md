# Phase 1 Learning Notes: Data Foundation & SQLite

## Overview
This document captures all the concepts, questions, and explanations from Phase 1 of Epic 2 - building a production-ready SQLite database layer with comprehensive testing.

**Phase Duration:** 2 sessions (2025-01-04 to 2025-01-05)
**Status:** ✅ COMPLETE

---

## Table of Contents
1. [SQLite in React Native](#sqlite-in-react-native)
2. [Testing SQLite Apps](#testing-sqlite-apps)
3. [TypeScript & Type Safety](#typescript--type-safety)
4. [Database Design Decisions](#database-design-decisions)
5. [Dependency Management](#dependency-management)
6. [Platform API Differences](#platform-api-differences)
7. [Package Migration](#package-migration)
8. [Error Tracking & Observability](#error-tracking--observability)

---

## SQLite in React Native

### Why SQLite?

**Q: Why use SQLite instead of AsyncStorage or other storage options?**

**A: SQLite for Structured, Relational Data**

**Storage Options Comparison:**

```
AsyncStorage:
✅ Simple key-value storage
✅ Built into React Native
✅ Good for app settings/preferences
❌ No querying capabilities
❌ No relationships between data
❌ Not suitable for complex data

SQLite:
✅ Full relational database
✅ SQL queries for complex filtering
✅ Relationships (foreign keys)
✅ Transactions and data integrity
✅ Excellent performance
✅ Works offline
❌ Requires native module

Realm/WatermelonDB:
✅ Object-oriented database
✅ Reactive queries
✅ Good for complex apps
❌ Steeper learning curve
❌ Additional layer of abstraction
```

**Our Choice: SQLite (via expo-sqlite)**
- Standard SQL (transferable knowledge)
- Excellent React Native support
- Perfect for our use case (ingredients, meal logs)
- Industry standard for mobile apps

---

### expo-sqlite vs better-sqlite3

**Q: Why do we use two different SQLite packages?**

**A: Different Packages for Different Environments**

**expo-sqlite (Production):**
```typescript
import * as SQLite from 'expo-sqlite';

// Opens database in React Native (iOS/Android)
const db = await SQLite.openDatabaseAsync('meals.db');
```

**What it does:**
- Bridges JavaScript to native SQLite on iOS/Android
- Persistent storage (survives app restarts)
- Async API (all operations return Promises)
- Works ONLY in React Native environment

**better-sqlite3 (Testing):**
```typescript
import Database from 'better-sqlite3';

// Opens database in Node.js (Jest tests)
const db = new Database(':memory:');
```

**What it does:**
- Native Node.js addon for SQLite
- In-memory database (`:memory:`) for fast tests
- Synchronous API (blocking calls)
- Works ONLY in Node.js environment

**Why Two Packages?**
```
React Native ≠ Node.js

React Native (app):
- Native iOS/Android environment
- Hermes JavaScript engine
- No Node.js modules available
- Uses expo-sqlite

Node.js (tests):
- Standard V8 JavaScript engine
- Full Node.js API available
- No native iOS/Android available
- Uses better-sqlite3
```

**The Solution: Adapter Pattern**
We create an adapter that translates between the two APIs:

```typescript
// Adapter in testDb.ts
const mockOpenDatabaseAsync = () => ({
  runAsync: (sql, params) => {
    const db = getTestDatabase(); // better-sqlite3
    const stmt = db.prepare(sql);
    return { changes: stmt.run(...params).changes };
  },
  getFirstAsync: (sql, params) => {
    const db = getTestDatabase();
    return db.prepare(sql).get(...params);
  },
  getAllAsync: (sql, params) => {
    const db = getTestDatabase();
    return db.prepare(sql).all(...params);
  }
});
```

**Key Insight:**
> Tests shouldn't know about better-sqlite3. They import from `expo-sqlite`, and Jest redirects to our mock via `moduleNameMapper`.

---

## Testing SQLite Apps

### The Adapter Pattern

**Q: What is the adapter pattern and why do we need it?**

**A: Bridging Incompatible APIs**

**The Problem:**
```
expo-sqlite API:
- Async methods (.runAsync, .getAllAsync)
- Returns Promises
- Works in React Native

better-sqlite3 API:
- Sync methods (.run, .all)
- Returns values directly
- Works in Node.js

These are incompatible!
```

**The Solution: Adapter**
An adapter is a translation layer between two incompatible interfaces.

```typescript
// Real expo-sqlite (production)
const result = await db.runAsync('INSERT INTO ...', [params]);

// Our adapter (tests)
const mockRunAsync = (sql, params) => {
  const syncDb = getTestDatabase();      // better-sqlite3
  const stmt = syncDb.prepare(sql);      // Prepare statement
  const result = stmt.run(...params);    // Execute (sync)
  return Promise.resolve({               // Wrap in Promise
    changes: result.changes
  });
};
```

**Visual Representation:**
```
Your Tests
    ↓
expo-sqlite mock (adapter)
    ↓
better-sqlite3 (real SQLite in Node.js)
```

**Why This Works:**
1. Tests think they're using expo-sqlite (same API)
2. Adapter translates calls to better-sqlite3
3. Both packages use real SQLite under the hood
4. Same SQL, same results, different runtime

---

### Test Isolation

**Q: Why do we reset the database before each test?**

**A: Tests Must Be Independent**

**The Problem Without Isolation:**
```javascript
test('add ingredient', () => {
  await addIngredient({ name: 'Milk' });
  const all = await getAllIngredients();
  expect(all).toHaveLength(1); // ✅ Passes
});

test('count ingredients', () => {
  const all = await getAllIngredients();
  expect(all).toHaveLength(0); // ❌ FAILS! Milk still there
});
```

**The Solution: beforeEach Hook**
```javascript
beforeEach(() => {
  resetTestDatabase();  // Fresh database for each test
  jest.resetModules();   // Clear module cache
});

test('test 1', () => {
  // Starts with empty database
});

test('test 2', () => {
  // Also starts with empty database (independent!)
});
```

**What resetTestDatabase() Does:**
```typescript
export function resetTestDatabase() {
  // Close existing connection
  if (testDb) {
    testDb.close();
  }

  // Create NEW in-memory database
  testDb = new Database(':memory:');

  // Recreate all tables
  testDb.exec(schema.createIngredientsTable);
  testDb.exec(schema.createMealLogsTable);
  testDb.exec(schema.createPreferencesTable);
}
```

**Why `:memory:`?**
- Creates a new database in RAM (not on disk)
- Super fast (no I/O)
- Automatically destroyed when test ends
- Each test gets a pristine database

---

### Module State Management

**Q: Why do we need `jest.resetModules()` in addition to resetting the database?**

**A: Singleton Pattern + Module Caching**

**The Problem:**
```typescript
// lib/database/index.ts
let db: SQLite.SQLiteDatabase | null = null;  // Module-level variable

export async function getDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('meals.db');
  }
  return db;  // Returns cached instance
}
```

**What Happens in Tests:**
```javascript
test('test 1', () => {
  const db = await getDatabase();  // Opens database, caches it
  // ... test code
});

test('test 2', () => {
  resetTestDatabase();             // Resets DB connection
  const db = await getDatabase();  // Returns OLD cached instance!
});
```

**The Solution:**
```javascript
beforeEach(() => {
  resetTestDatabase();  // Reset database connection
  jest.resetModules();   // Clear Node.js module cache

  // Now require() will re-execute the module
  // Getting a fresh `db` variable
});
```

**What `jest.resetModules()` Does:**
- Clears Node.js's `require()` cache
- Next `import` re-executes the module code
- Module-level variables are re-initialized
- Singleton pattern starts fresh

**Key Insight:**
> Module caching is great for performance, but breaks test isolation. Reset modules when testing singletons.

---

## TypeScript & Type Safety

### Union Types for Restricted Values

**Q: Why use `'breakfast' | 'snack'` instead of just `string`?**

**A: Compile-Time Safety & Autocomplete**

**Option 1: string (Bad)**
```typescript
type MealType = string;

// Accepts ANYTHING
const mealType: MealType = 'breakfast';  // ✅ OK
const mealType: MealType = 'breakfats';  // ✅ OK (typo not caught!)
const mealType: MealType = 'pizza';      // ✅ OK (invalid value!)
```

**Option 2: Union Type (Good)**
```typescript
type MealType = 'breakfast' | 'snack';

const mealType: MealType = 'breakfast';  // ✅ OK
const mealType: MealType = 'breakfats';  // ❌ Type error!
const mealType: MealType = 'pizza';      // ❌ Type error!
```

**Benefits:**
```
✅ TypeScript catches typos at compile time
✅ IDE autocomplete shows valid values
✅ Refactoring is safe (rename propagates)
✅ Documentation (type = valid values)
```

**Real Example from Our Code:**
```typescript
export type Category = 'protein' | 'carb' | 'sweet' | 'fruit';
export type MealType = 'breakfast' | 'snack';

// TypeScript enforces these everywhere:
const ingredient: Ingredient = {
  category: 'protien',  // ❌ Error: Did you mean 'protein'?
  mealTypes: ['launch'] // ❌ Error: Did you mean 'lunch'?
};
```

---

### as const for Literal Types

**Q: What does `as const` do?**

**A: Preserves Literal Types**

**Without `as const`:**
```typescript
const mealTypes = ['breakfast', 'snack'];
// TypeScript infers: string[]

const ingredient = {
  mealTypes: mealTypes  // Type: string[]
};
```

**With `as const`:**
```typescript
const mealTypes = ['breakfast', 'snack'] as const;
// TypeScript infers: readonly ['breakfast', 'snack']

const ingredient = {
  mealTypes: mealTypes  // Type: ['breakfast', 'snack']
};
```

**Why This Matters:**
```typescript
// Without as const
const types: string[] = ['breakfast'];
types.push('invalid');  // ✅ Compiles (but wrong!)

// With as const
const types = ['breakfast'] as const;
types.push('invalid');  // ❌ Type error: readonly array
```

**In Our Seed Data:**
```typescript
{
  name: 'Milk',
  category: 'protein' as const,  // Not just string
  mealTypes: ['breakfast'] as const  // Not just string[]
}
```

**Benefits:**
- Prevents accidental mutations
- Preserves exact literal types
- Better type inference
- More specific type checking

---

### Omit<T, K> Utility Type

**Q: What does `Omit<Ingredient, 'id' | 'createdAt'>` mean?**

**A: Creating Types by Exclusion**

**The Problem:**
```typescript
type Ingredient = {
  id: string;
  name: string;
  category: Category;
  mealTypes: MealType[];
  createdAt: string;
};

// When adding ingredient, user shouldn't provide id or createdAt
// But copying all other fields is tedious:
type AddIngredientInput = {
  name: string;
  category: Category;
  mealTypes: MealType[];
};
```

**The Solution: Omit**
```typescript
type AddIngredientInput = Omit<Ingredient, 'id' | 'createdAt'>;
// "Take Ingredient type, but exclude id and createdAt"
```

**What This Generates:**
```typescript
// Equivalent to:
type AddIngredientInput = {
  name: string;
  category: Category;
  mealTypes: MealType[];
};
```

**Why Use Omit?**
```
✅ DRY (Don't Repeat Yourself)
✅ Changes to Ingredient propagate automatically
✅ Less chance of mismatch
✅ Self-documenting ("all fields except...")
```

**Other Useful Utility Types:**
```typescript
// Pick (opposite of Omit)
type IdOnly = Pick<Ingredient, 'id'>;
// { id: string }

// Partial (all fields optional)
type PartialIngredient = Partial<Ingredient>;
// { id?: string; name?: string; ... }

// Required (all fields required)
type RequiredIngredient = Required<PartialIngredient>;
// { id: string; name: string; ... }
```

---

## Database Design Decisions

### UUIDs vs Auto-Increment IDs

**Q: Why use UUIDs instead of auto-increment integers?**

**A: Client-Side ID Generation**

**Auto-Increment IDs:**
```sql
CREATE TABLE ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT
);
```

**Pros:**
✅ Simple
✅ Sequential
✅ Small (4 bytes)

**Cons:**
❌ Database assigns ID
❌ Can't know ID before insert
❌ Collision in distributed systems
❌ Requires server for coordination

**UUIDs:**
```sql
CREATE TABLE ingredients (
  id TEXT PRIMARY KEY,
  name TEXT
);
```

**Pros:**
✅ Client can generate ID
✅ Know ID before insert
✅ No collision (globally unique)
✅ Works offline
✅ No server needed

**Cons:**
❌ Larger (36 bytes)
❌ Not sequential
❌ Slightly slower lookups

**Why UUIDs for Our App:**
```typescript
// Can generate ID immediately
const id = Crypto.randomUUID();

// Use ID before inserting
console.log('Will create ingredient:', id);

// Insert with known ID
await db.runAsync(
  'INSERT INTO ingredients (id, ...) VALUES (?, ...)',
  [id, ...]
);

// Can reference ID immediately
await logMeal({ ingredients: [id] });
```

**Offline-First:**
- App works without internet
- Generate IDs locally
- Sync to server later (if you add backend)
- No ID conflicts even with multiple devices

---

### JSON Arrays vs Junction Tables

**Q: Why store `mealTypes` as JSON instead of a separate table?**

**A: Simplicity vs Normalization**

**Option 1: Junction Table (Normalized)**
```sql
CREATE TABLE ingredients (
  id TEXT PRIMARY KEY,
  name TEXT
);

CREATE TABLE meal_types (
  id TEXT PRIMARY KEY,
  name TEXT  -- 'breakfast', 'snack'
);

CREATE TABLE ingredient_meal_types (
  ingredient_id TEXT,
  meal_type_id TEXT,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
  FOREIGN KEY (meal_type_id) REFERENCES meal_types(id)
);
```

**Querying:**
```sql
-- Get ingredient with meal types (complex JOIN)
SELECT i.*, GROUP_CONCAT(mt.name) as meal_types
FROM ingredients i
LEFT JOIN ingredient_meal_types imt ON i.id = imt.ingredient_id
LEFT JOIN meal_types mt ON imt.meal_type_id = mt.id
WHERE i.id = ?
GROUP BY i.id;
```

**Option 2: JSON Array (Denormalized)**
```sql
CREATE TABLE ingredients (
  id TEXT PRIMARY KEY,
  name TEXT,
  meal_types TEXT  -- JSON: '["breakfast","snack"]'
);
```

**Querying:**
```sql
-- Get ingredient (simple)
SELECT * FROM ingredients WHERE id = ?;

-- Parse JSON in application code
const ingredient = result.row;
ingredient.mealTypes = JSON.parse(ingredient.meal_types);
```

**Trade-Offs:**

| Aspect | Junction Table | JSON Array |
|--------|---------------|------------|
| Schema | 3 tables | 1 table |
| Queries | Complex (JOINs) | Simple |
| Filtering | SQL (fast) | JavaScript (slower) |
| Storage | Normalized | Denormalized |
| Changes | Easy to add values | Must update JSON |

**Our Choice: JSON Array**
```
Why it works for us:
✅ Small arrays (2-3 items max)
✅ Filtering in JavaScript is fine (not many ingredients)
✅ Simpler schema (easier to understand)
✅ Native JSON support in JavaScript
✅ Mobile SQLite is very fast
```

**When to Use Junction Table:**
- Large arrays (10+ items)
- Need to query/filter in SQL
- Relationships change frequently
- Need to track additional data on relationship

---

### ISO 8601 Date Strings

**Q: Why store dates as strings instead of timestamps?**

**A: Readability + Sortability**

**Option 1: Unix Timestamp (Number)**
```typescript
const date = Date.now();  // 1735738000000
```

**Pros:**
✅ Small (8 bytes)
✅ Fast comparisons

**Cons:**
❌ Not human-readable
❌ No timezone info
❌ Requires conversion

**Option 2: ISO 8601 String**
```typescript
const date = new Date().toISOString();
// "2025-01-05T14:30:00.000Z"
```

**Pros:**
✅ Human-readable in database
✅ Sortable as strings
✅ Includes timezone (Z = UTC)
✅ JavaScript native support
✅ International standard

**Cons:**
❌ Larger (24 bytes)
❌ String comparisons (slightly slower)

**Why ISO 8601 Works:**
```sql
-- String comparison works for chronological order!
SELECT * FROM meal_logs
WHERE date >= '2025-01-01T00:00:00.000Z'
  AND date <= '2025-01-07T23:59:59.999Z'
ORDER BY date DESC;

-- '2025-01-05' comes after '2025-01-04' lexicographically
```

**JavaScript Integration:**
```typescript
// Creating
const now = new Date().toISOString();
await db.runAsync('INSERT ... VALUES (?)', [now]);

// Parsing
const row = await db.getFirstAsync('SELECT date FROM ...');
const date = new Date(row.date);  // Automatic parsing

// Formatting
console.log(date.toLocaleDateString());  // "1/5/2025"
```

**Our Choice:**
- Dates are readable in SQLite browser
- No conversion needed between DB and JS
- Standard format (ISO 8601)
- Mobile storage is cheap

---

## Dependency Management

### Version Prefixes: ^ vs ~ vs exact

**Q: What do `^`, `~`, and no prefix mean in package.json?**

**A: Semantic Version Ranges**

**Semantic Versioning: MAJOR.MINOR.PATCH**
```
Version: 19.1.5
         ↓  ↓ ↓
         │  │ └── Patch: Bug fixes (backwards compatible)
         │  └──── Minor: New features (backwards compatible)
         └─────── Major: Breaking changes
```

**Caret (^): Allow Minor & Patch**
```json
"react": "^19.1.0"
```

Allows:
- ✅ 19.1.0 (exact)
- ✅ 19.1.5 (patch update)
- ✅ 19.2.0 (minor update)
- ❌ 20.0.0 (major update)

Range: `>=19.1.0 <20.0.0`

**Tilde (~): Allow Patch Only**
```json
"react": "~19.1.0"
```

Allows:
- ✅ 19.1.0 (exact)
- ✅ 19.1.5 (patch update)
- ❌ 19.2.0 (minor update)
- ❌ 20.0.0 (major update)

Range: `>=19.1.0 <19.2.0`

**Exact: No Updates**
```json
"react": "19.1.0"
```

Allows:
- ✅ 19.1.0 (only this version)
- ❌ Everything else

**When to Use Each:**

```json
{
  // Use ^ for most dependencies (default)
  "expo": "^54.0.13",

  // Use exact when versions must match precisely
  "react": "19.1.0",
  "react-test-renderer": "19.1.0",

  // Use ~ for conservative updates
  "@types/react": "~19.1.0"
}
```

**Why react-test-renderer Needs Exact Match:**
```
react-test-renderer is React's internal renderer
It MUST match React's exact version

react: 19.1.0
react-test-renderer: 19.2.0
❌ ERROR: Version mismatch!

Both must be exactly the same version
```

---

### Peer Dependencies

**Q: What are peer dependencies and why do they cause conflicts?**

**A: Shared Dependencies Between Packages**

**Regular Dependencies:**
```
Your App
  ├── package-a
  │   └── lodash@4.0.0
  └── package-b
      └── lodash@3.0.0

Result: Both versions installed (no conflict)
```

**Peer Dependencies:**
```
Your App
  ├── react@19.1.0
  ├── package-a (needs react@>=18.0.0)
  └── package-b (needs react@>=19.2.0)

Result: CONFLICT! Can't satisfy both
```

**Why Peer Dependencies Exist:**
```
Plugins/extensions should use the host app's version
of a shared dependency, not bundle their own

Example:
Your App has react@19.1.0
Testing Library should use YOUR React, not its own
Otherwise you'd have TWO copies of React!
```

**Our Conflict:**
```json
{
  "react": "19.1.0",  // Installed (from Expo SDK 54)

  "devDependencies": {
    "@testing-library/react-native": "^13.3.3"
    // Has peer dependency: react-test-renderer@>=18.2.0
  }
}
```

**What npm Did:**
```
npm saw react-test-renderer@>=18.2.0
npm installed latest: react-test-renderer@19.2.0
But react@19.1.0 requires react-test-renderer@19.1.0
ERROR: Version mismatch!
```

**The Fix:**
```json
{
  "react": "19.1.0",
  "react-test-renderer": "19.1.0",  // Exact version pinned

  "devDependencies": {
    "@testing-library/react-native": "^13.3.3"
  }
}
```

**Lesson:**
> When peer dependency ranges are too broad, explicitly pin the version you need.

---

### Clean Dependency Reinstall

**Q: When should I delete package-lock.json and node_modules?**

**A: When Lock File Has Wrong Versions Cached**

**What package-lock.json Does:**
```json
{
  "name": "demo-app",
  "lockfileVersion": 3,
  "packages": {
    "node_modules/react": {
      "version": "19.2.0",  // Cached resolution
      "resolved": "https://registry.npmjs.org/react/-/react-19.2.0.tgz"
    }
  }
}
```

Purpose:
- Locks exact versions of all dependencies
- Ensures consistent installs across machines
- Records the entire dependency tree

**When Lock Files Go Wrong:**
```bash
# Symptom: npm install keeps using wrong version
npm install
# Still installs react@19.2.0 even after changing package.json

# Why: Lock file overrides package.json
# Lock file says "use 19.2.0"
# Your package.json says "use 19.1.0"
# Lock file wins!
```

**The Nuclear Option (Windows):**
```bash
# 1. Delete lock file
del package-lock.json

# 2. Delete all installed packages
rmdir /s /q node_modules

# 3. Fresh install from package.json
npm install

# Now npm recalculates ALL versions from scratch
```

**When to Use:**
- After changing multiple dependency versions
- When peer dependency errors persist
- After failed dependency resolution
- When lock file is corrupted
- As a last resort

**When NOT to Use:**
- Normal dependency updates (just `npm install`)
- Adding new packages
- In production (lock file ensures consistency)

**Alternative: Update Lock File**
```bash
# Just update the lock file, keep node_modules
npm install --package-lock-only
```

---

## Platform API Differences

### React Native vs Node.js APIs

**Q: Why doesn't crypto.randomUUID() work in React Native?**

**A: Different JavaScript Runtimes**

**JavaScript Environments:**

```
┌─────────────────────────────────────────────┐
│           JavaScript Language               │
│  (syntax, types, operators, etc.)          │
└─────────────────────────────────────────────┘
                    ↓
        ┌───────────┼───────────┐
        ↓           ↓           ↓
  ┌─────────┐ ┌─────────┐ ┌─────────────┐
  │ Node.js │ │ Browser │ │ React Native│
  │   V8    │ │ V8/etc  │ │  Hermes/JSC │
  └─────────┘ └─────────┘ └─────────────┘
```

**Global APIs by Environment:**

| API | Node.js | Browser | React Native |
|-----|---------|---------|--------------|
| crypto | ✅ | ✅ | ❌ |
| fs | ✅ | ❌ | ❌ |
| window | ❌ | ✅ | ❌ |
| document | ❌ | ✅ | ❌ |
| fetch | ✅ (18+) | ✅ | ✅ |
| setTimeout | ✅ | ✅ | ✅ |

**Why crypto Doesn't Exist in React Native:**
```
Node.js:
- Has full crypto module (OpenSSL bindings)
- Global crypto object available
- crypto.randomUUID() works

Browser:
- Has Web Crypto API
- Global crypto object available
- crypto.randomUUID() works

React Native:
- No Node.js modules
- No Web APIs
- Only JavaScript language + native bridges
- Must use expo-crypto or custom native module
```

**Our Error:**
```typescript
// In lib/database/ingredients.ts
const id = crypto.randomUUID();  // ❌ ReferenceError

// Why?
// 'crypto' is not defined in React Native global scope
// No automatic polyfill or shimming
```

**The Fix:**
```typescript
// Install cross-platform crypto
npm install expo-crypto

// Use Expo's crypto module
import * as Crypto from 'expo-crypto';
const id = Crypto.randomUUID();  // ✅ Works!

// What expo-crypto does:
// - iOS: Uses native Security framework
// - Android: Uses native SecureRandom
// - Web: Uses browser's crypto API
```

**Key Lesson:**
```
Always use Expo modules for platform-specific features:

❌ Don't use Node.js APIs directly
❌ Don't assume browser APIs exist
✅ Use expo-* packages for cross-platform features

Examples:
- expo-crypto (not crypto)
- expo-file-system (not fs)
- expo-secure-store (not localStorage)
- expo-camera (not navigator.mediaDevices)
```

---

### Mocking Platform-Specific Modules

**Q: How do we use expo-crypto in tests if tests run in Node.js?**

**A: Environment-Specific Mocks**

**The Problem:**
```typescript
// App code (React Native)
import * as Crypto from 'expo-crypto';
const id = Crypto.randomUUID();  // Uses native iOS/Android crypto

// Test code (Node.js)
import * as Crypto from 'expo-crypto';  // ❌ Module not found!
```

**Why Tests Can't Import expo-crypto:**
```
Tests run in Node.js via Jest
expo-crypto requires React Native environment
Node.js has no access to native iOS/Android modules
```

**The Solution: Mock with Node.js crypto**

**Step 1: Create Mock File**
```typescript
// lib/database/__tests__/__mocks__/expo-crypto.ts

// Use Node.js crypto (available in tests)
export const randomUUID = (): string => {
  return crypto.randomUUID();  // Global crypto works in Node.js
};
```

**Step 2: Configure Jest**
```javascript
// jest.config.js
module.exports = {
  moduleNameMapper: {
    '^expo-crypto$': '<rootDir>/lib/database/__tests__/__mocks__/expo-crypto.ts'
  }
};
```

**Step 3: Tests Work Automatically**
```typescript
// In test file
import * as Crypto from 'expo-crypto';  // Jest redirects to mock

test('generates UUIDs', () => {
  const id = Crypto.randomUUID();
  expect(id).toMatch(/^[0-9a-f-]{36}$/);
});
```

**What Happens:**
```
In Production (React Native):
  import 'expo-crypto' → Real expo-crypto → Native crypto

In Tests (Node.js):
  import 'expo-crypto' → Mock → Node.js crypto.randomUUID()
```

**Why This Works:**
```
Both implementations:
✅ Generate RFC 4122 compliant UUIDs
✅ Return same format string
✅ Globally unique
✅ Same behavior in tests as production
```

**Pattern for Other Expo Modules:**
```javascript
// jest.config.js
moduleNameMapper: {
  '^expo-sqlite$': '<rootDir>/__mocks__/expo-sqlite.ts',
  '^expo-crypto$': '<rootDir>/__mocks__/expo-crypto.ts',
  '^expo-file-system$': '<rootDir>/__mocks__/expo-file-system.ts',
  // Mock any Expo module that won't work in Node.js
}
```

---

## Package Migration

### Identifying Deprecated Packages

**Q: How do you know when a package is deprecated?**

**A: Multiple Warning Signs**

**1. npm Warnings During Install:**
```bash
npm install

npm WARN deprecated @testing-library/jest-native@5.4.3
npm WARN deprecated This package is no longer maintained.
npm WARN deprecated Use built-in matchers in @testing-library/react-native v12.4+
```

**2. Package README:**
```markdown
# ⚠️ DEPRECATED

This package is no longer maintained.
Please migrate to @sentry/react-native.
```

**3. Last Publish Date:**
```bash
npm view sentry-expo time

# Shows:
2023-11-15T10:23:45.678Z  (Last published)
# If > 1 year old for active project = red flag
```

**4. GitHub Activity:**
- No recent commits
- Issues piling up without responses
- "Archived" repository status
- Maintainer comments about deprecation

**5. Documentation Notices:**
```
From Sentry docs:
"As of Expo SDK 50, sentry-expo is deprecated.
Use @sentry/react-native instead."
```

**What to Do When You Find Deprecation:**

1. **Check Replacement:**
   - Is there an official replacement?
   - What's the migration path?

2. **Read Migration Guide:**
   - API changes
   - Breaking changes
   - Config updates

3. **Search for Issues:**
   - Has anyone else migrated?
   - Common problems?
   - Workarounds?

4. **Test Thoroughly:**
   - All features still work
   - New APIs understood
   - No regressions

---

### Migrating sentry-expo to @sentry/react-native

**Q: What changed in the Sentry migration?**

**A: Ownership, API, and Features**

**Old: sentry-expo**
```typescript
import * as Sentry from 'sentry-expo';

// Platform-specific APIs
Sentry.Native.captureException(error);  // Mobile
Sentry.Browser.captureException(error); // Web

// Expo-specific config
Sentry.init({
  dsn: '...',
  enableInExpoDevelopment: true,  // Expo-only option
  debug: true
});
```

**New: @sentry/react-native**
```typescript
import * as Sentry from '@sentry/react-native';

// Unified API (works everywhere)
Sentry.captureException(error);  // Mobile + Web

// Standard config
Sentry.init({
  dsn: '...',
  debug: true,
  tracesSampleRate: 1.0,  // Performance monitoring
});
```

**Migration Checklist:**

✅ **1. Uninstall old package**
```bash
npm uninstall sentry-expo
```

✅ **2. Install new package**
```bash
npx expo install @sentry/react-native
```

✅ **3. Update app.json plugin**
```json
{
  "plugins": [
    "sentry-expo"  // ❌ OLD
    "@sentry/react-native/expo"  // ✅ NEW
  ]
}
```

✅ **4. Update imports**
```typescript
// All files
import * as Sentry from 'sentry-expo';  // ❌ OLD
import * as Sentry from '@sentry/react-native';  // ✅ NEW
```

✅ **5. Update ErrorBoundary**
```typescript
// Remove platform checks
if (Sentry.Native) {  // ❌ OLD
  Sentry.Native.captureException(error);
} else if (Sentry.Browser) {
  Sentry.Browser.captureException(error);
}

// Use unified API
Sentry.captureException(error);  // ✅ NEW (works everywhere)
```

✅ **6. Update Sentry.init()**
```typescript
Sentry.init({
  dsn: '...',
  enableInExpoDevelopment: true,  // ❌ Remove (doesn't exist)
  debug: true,  // ✅ Keep
  tracesSampleRate: 1.0,  // ✅ Add (performance monitoring)
});
```

**Why This Migration Matters:**
```
Old (sentry-expo):
❌ Last maintained: Expo SDK 49 (2023)
❌ No longer receives updates
❌ Incompatible with new Expo SDKs
❌ Missing modern features

New (@sentry/react-native):
✅ Actively maintained by Sentry team
✅ Latest features (session replay, profiling)
✅ Better performance
✅ Full Expo SDK 50+ support
✅ Unified API (simpler code)
```

---

## Error Tracking & Observability

### ErrorBoundary Pattern

**Q: What is an ErrorBoundary and why do we need it?**

**A: Catching React Errors Gracefully**

**The Problem Without ErrorBoundary:**
```typescript
function MyComponent() {
  throw new Error('Something broke!');
  return <Text>Hello</Text>;
}

// Result: App crashes!
// White screen of death
// No error reported to Sentry
// User sees nothing
```

**With ErrorBoundary:**
```typescript
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>

// Result: Graceful fallback
// Error caught and logged
// User sees friendly error message
// Error reported to Sentry
// App doesn't crash
```

**How ErrorBoundary Works:**
```typescript
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  // Catch errors in render phase
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Log errors and send to Sentry
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error);
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      }
    });
  }

  render() {
    if (this.state.hasError) {
      // Show fallback UI
      return (
        <View>
          <Text>Oops! Something went wrong</Text>
          <Button title="Try again" onPress={this.handleReset} />
        </View>
      );
    }

    return this.props.children;  // Normal render
  }
}
```

**What Gets Caught:**
```
✅ Errors in component render
✅ Errors in lifecycle methods
✅ Errors in constructors
✅ Errors in event handlers (with extra work)

❌ Async errors (use try-catch)
❌ Errors in ErrorBoundary itself
❌ Server-side errors
❌ Errors outside React tree
```

**Best Practices:**
```typescript
// ✅ Wrap entire app
<ErrorBoundary>
  <App />
</ErrorBoundary>

// ✅ Wrap critical sections
<ErrorBoundary>
  <CriticalFeature />
</ErrorBoundary>

// ✅ Multiple boundaries for isolation
<ErrorBoundary>
  <Header />
</ErrorBoundary>
<ErrorBoundary>
  <MainContent />
</ErrorBoundary>
<ErrorBoundary>
  <Footer />
</ErrorBoundary>
```

---

### Real-Time Error Tracking

**Q: What does Sentry give us that console.log doesn't?**

**A: Production Error Monitoring & Context**

**console.log (Development Only):**
```typescript
try {
  await loadData();
} catch (error) {
  console.error('Failed:', error);
  // ❌ Only in dev console
  // ❌ Lost when app closed
  // ❌ No user context
  // ❌ No device info
  // ❌ Can't aggregate across users
}
```

**Sentry (Production-Ready):**
```typescript
try {
  await loadData();
} catch (error) {
  Sentry.captureException(error);
  // ✅ Sent to cloud
  // ✅ Persists after app closes
  // ✅ Includes user context
  // ✅ Includes device info
  // ✅ Aggregates across all users
  // ✅ Shows trends over time
  // ✅ Alerts team automatically
}
```

**What Sentry Captures:**

**1. Error Details:**
```
- Error message
- Stack trace
- File and line number
- Function names
```

**2. Breadcrumbs (User Actions):**
```
[14:30:01] User tapped "Generate Meal" button
[14:30:02] Fetched ingredients from database
[14:30:03] Called randomizer algorithm
[14:30:04] ERROR: Cannot read property 'name' of undefined
```

**3. Device Context:**
```
- OS: Android 14
- Device: Samsung Galaxy S23
- Screen: 1080x2400
- Memory: 8GB (3.2GB free)
- Network: WiFi
```

**4. User Context:**
```typescript
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name
});

// Now errors tagged with user info
```

**5. Custom Context:**
```typescript
Sentry.setContext('meal_generation', {
  ingredientCount: 22,
  mealType: 'breakfast',
  cooldownDays: 3
});

// Errors include this context
```

**6. Performance Traces:**
```typescript
const span = Sentry.startSpan({ name: 'generate_meal' });
// ... do work
span.end();

// Track how long operations take
```

**Sentry Dashboard Shows:**
```
- Number of errors (trending up/down?)
- Which users affected
- Which devices/OS versions
- Geographic distribution
- Time of day patterns
- Error frequency over time
- Most common errors
- New vs recurring errors
```

**Why This Matters:**
```
Production errors are invisible without monitoring

Your users experience:
❌ App crashes
❌ Features don't work
❌ Data doesn't load

Without Sentry, you don't know:
- How many users affected
- How frequently it happens
- What caused it
- Which devices/OS
- User actions leading to error

With Sentry, you know:
✅ Exactly what broke
✅ How many users affected
✅ How to reproduce
✅ Priority (affecting 1% or 90%?)
✅ When it started
✅ Full context to fix quickly
```

---

## Summary: Key Takeaways

### Database
- ✅ SQLite for structured, relational data
- ✅ expo-sqlite for production, better-sqlite3 for tests
- ✅ Adapter pattern bridges incompatible APIs
- ✅ UUIDs for client-side ID generation
- ✅ JSON arrays for simple relationships
- ✅ ISO 8601 for dates (readable + sortable)

### Testing
- ✅ In-memory `:memory:` databases for fast tests
- ✅ Reset database + modules before each test
- ✅ Environment-specific mocks (expo-crypto → Node.js crypto)
- ✅ Test business logic, not implementation details

### TypeScript
- ✅ Union types for restricted values
- ✅ `as const` preserves literal types
- ✅ `Omit<T, K>` creates types by exclusion
- ✅ Compile-time safety prevents runtime errors

### Dependencies
- ✅ `^` allows minor + patch, `~` allows patch only, exact allows nothing
- ✅ Peer dependencies must be satisfied carefully
- ✅ Clean reinstall when lock file conflicts persist
- ✅ `npx expo install` for SDK-compatible versions

### Platform APIs
- ✅ React Native ≠ Node.js ≠ Browser
- ✅ Use Expo modules for cross-platform features
- ✅ Mock differently per environment
- ✅ Check API availability before using

### Package Migration
- ✅ Watch for deprecation warnings (they matter!)
- ✅ Migrate to official maintainer packages
- ✅ Read migration guides carefully
- ✅ Test thoroughly after migration

### Observability
- ✅ ErrorBoundary catches React errors gracefully
- ✅ Sentry provides production error monitoring
- ✅ Capture context (user, device, breadcrumbs)
- ✅ Real-time insights into production issues

---

## Next: Phase 2

**Phase 2: State Management & Core Logic**

You'll learn:
- Zustand for global state management
- Algorithm design (combination generation)
- Business logic separation
- Cooldown system for variety enforcement

**Estimated time:** 4-5 hours

**Start guide:** [PHASE2_STATE_MANAGEMENT.md](./PHASE2_STATE_MANAGEMENT.md)

---

*Phase 1 complete - excellent foundation! 🎉*

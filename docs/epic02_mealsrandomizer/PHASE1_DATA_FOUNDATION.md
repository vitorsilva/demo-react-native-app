# Phase 1: Data Foundation & SQLite (3-4 hours)

[← Back to Overview](./OVERVIEW.md) | [Next: Phase 2 →](./PHASE2_STATE_MANAGEMENT.md)

---

## Goal

Set up the database layer and understand SQLite fundamentals by implementing the data models for ingredients and meal logs.

## Prerequisites

- Epic 1 completed (basic React Native understanding)
- App structure from Epic 1 (tabs, navigation)
- Observability infrastructure running

---

## Step 1.1: Understanding SQLite & Data Modeling

**What you'll learn**: Database design, table relationships, data types

**Discussion Questions:**
- What data needs to be stored permanently?
- How is this different from temporary state (useState)?
- What relationships exist between different pieces of data?

**Data Model for Meals Randomizer:**

**Entities:**
1. **Ingredients**: Individual food items (milk, bread, cheese, etc.)
2. **Meal Logs**: Record of what was eaten and when
3. **Preferences**: User settings (cooldown days, suggestion count)

**Relationships:**
- One meal log contains multiple ingredients
- Ingredients belong to categories
- Ingredients are used for specific meal types

**Schema Design:**
```sql
-- Ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,  -- 'protein', 'carb', 'sweet', 'fruit'
  meal_types TEXT NOT NULL, -- JSON array: '["breakfast","snack"]'
  created_at TEXT NOT NULL
);

-- Meal logs table
CREATE TABLE IF NOT EXISTS meal_logs (
  id TEXT PRIMARY KEY NOT NULL,
  date TEXT NOT NULL,  -- ISO 8601 format
  meal_type TEXT NOT NULL,  -- 'breakfast' or 'snack'
  ingredients TEXT NOT NULL,  -- JSON array of ingredient IDs
  created_at TEXT NOT NULL
);

-- Preferences table (key-value store)
CREATE TABLE IF NOT EXISTS preferences (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
```

**Discussion:**
- Why TEXT for IDs instead of INTEGER?
- Why store JSON arrays as TEXT?
- Why ISO 8601 for dates?
- What indexes might improve performance?

---

## Step 1.2: Installing and Initializing SQLite

**What you'll learn**: Expo SQLite setup, database initialization

**Installation:**
```bash
npx expo install expo-sqlite
```

**Q: What does expo-sqlite provide?**
**A**: A SQLite database that:
- Runs on the device (no internet needed)
- Persists between app restarts
- Uses standard SQL syntax
- Async API (uses Promises)

**Create Database Service:**

**File structure:**
```
app/
lib/
  ├── database/
  │   ├── index.ts          # Database instance and init
  │   ├── schema.ts         # Table creation SQL
  │   ├── ingredients.ts    # Ingredient queries
  │   ├── mealLogs.ts       # Meal log queries
  │   └── preferences.ts    # Preferences queries
  types/
    └── database.ts         # TypeScript types
```

**Step-by-step:**

1. **Create types** (`types/database.ts`):
```typescript
export interface Ingredient {
  id: string;
  name: string;
  category: 'protein' | 'carb' | 'sweet' | 'fruit';
  mealTypes: ('breakfast' | 'snack')[];
  createdAt: string;
}

export interface MealLog {
  id: string;
  date: string;
  mealType: 'breakfast' | 'snack';
  ingredients: string[];  // Array of ingredient IDs
  createdAt: string;
}

export interface Preferences {
  cooldownDays: number;
  suggestionsCount: number;
}
```

2. **Create schema** (`lib/database/schema.ts`):
```typescript
export const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS ingredients (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    meal_types TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS meal_logs (
    id TEXT PRIMARY KEY NOT NULL,
    date TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS preferences (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
`;

export const DEFAULT_PREFERENCES = {
  cooldownDays: 3,
  suggestionsCount: 4,
};
```

3. **Initialize database** (`lib/database/index.ts`):
```typescript
import * as SQLite from 'expo-sqlite';
import { SCHEMA_SQL, DEFAULT_PREFERENCES } from './schema';

let database: SQLite.SQLiteDatabase | null = null;

export async function initDatabase() {
  if (database) return database;

  database = await SQLite.openDatabaseAsync('meals.db');

  // Create tables
  await database.execAsync(SCHEMA_SQL);

  // Initialize default preferences
  await database.runAsync(
    `INSERT OR IGNORE INTO preferences (key, value) VALUES (?, ?)`,
    ['cooldownDays', String(DEFAULT_PREFERENCES.cooldownDays)]
  );
  await database.runAsync(
    `INSERT OR IGNORE INTO preferences (key, value) VALUES (?, ?)`,
    ['suggestionsCount', String(DEFAULT_PREFERENCES.suggestionsCount)]
  );

  return database;
}

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!database) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return database;
}
```

**Testing:**
- Database file is created
- Tables exist
- Default preferences are set
- No errors in console

**Discussion:**
- When should initDatabase() be called?
- What happens if database is already initialized?
- How do we handle database errors?

---

## Step 1.3: Ingredient Database Operations

**What you'll learn**: CRUD operations, parameterized queries, JSON handling

**Create Ingredient Service** (`lib/database/ingredients.ts`):

**Operations needed:**
1. **Create** - Add new ingredient
2. **Read** - Get all ingredients, get by ID, get by category
3. **Update** - Edit ingredient name/category
4. **Delete** - Remove ingredient

**Implementation:**

```typescript
import { getDatabase } from './index';
import { Ingredient } from '../../types/database';

export async function addIngredient(
  ingredient: Omit<Ingredient, 'id' | 'createdAt'>
): Promise<string> {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO ingredients (id, name, category, meal_types, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [
      id,
      ingredient.name,
      ingredient.category,
      JSON.stringify(ingredient.mealTypes),
      createdAt,
    ]
  );

  return id;
}

export async function getAllIngredients(): Promise<Ingredient[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    category: string;
    meal_types: string;
    created_at: string;
  }>('SELECT * FROM ingredients ORDER BY name ASC');

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    category: row.category as Ingredient['category'],
    mealTypes: JSON.parse(row.meal_types),
    createdAt: row.created_at,
  }));
}

export async function getIngredientsByMealType(
  mealType: 'breakfast' | 'snack'
): Promise<Ingredient[]> {
  const allIngredients = await getAllIngredients();
  return allIngredients.filter(ing =>
    ing.mealTypes.includes(mealType)
  );
}

export async function deleteIngredient(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM ingredients WHERE id = ?', [id]);
}
```

**Key Concepts:**
- **Parameterized queries**: `?` placeholders prevent SQL injection
- **JSON serialization**: Store arrays as JSON strings
- **UUID**: Unique IDs using `crypto.randomUUID()`
- **ISO dates**: Standard date format `new Date().toISOString()`

**Discussion Questions:**
- Why use parameterized queries instead of string concatenation?
- What's the benefit of TypeScript generics in `getAllAsync<T>()`?
- How do we ensure data integrity when parsing JSON?

**Testing:**
Add temporary test code in your main screen:
```typescript
import { addIngredient, getAllIngredients } from '../lib/database/ingredients';

// In a useEffect:
useEffect(() => {
  async function testDatabase() {
    await initDatabase();

    // Add test ingredient
    const id = await addIngredient({
      name: 'Greek Yogurt',
      category: 'protein',
      mealTypes: ['breakfast'],
    });
    console.log('Added ingredient:', id);

    // Get all ingredients
    const ingredients = await getAllIngredients();
    console.log('All ingredients:', ingredients);
  }

  testDatabase();
}, []);
```

**Verify:**
- Ingredient is added successfully
- getAllIngredients returns the ingredient
- Data persists after app restart

---

## Step 1.4: Meal Log Database Operations

**What you'll learn**: Date handling, complex queries, filtering

**Create Meal Log Service** (`lib/database/mealLogs.ts`):

**Operations needed:**
1. **Log meal** - Record what was eaten
2. **Get recent meals** - Retrieve last N days
3. **Get by date range** - Filter by specific dates
4. **Delete log** - Remove a meal record

**Implementation:**

```typescript
import { getDatabase } from './index';
import { MealLog } from '../../types/database';

export async function logMeal(
  mealLog: Omit<MealLog, 'id' | 'createdAt'>
): Promise<string> {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO meal_logs (id, date, meal_type, ingredients, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [
      id,
      mealLog.date,
      mealLog.mealType,
      JSON.stringify(mealLog.ingredients),
      createdAt,
    ]
  );

  return id;
}

export async function getRecentMealLogs(days: number = 7): Promise<MealLog[]> {
  const db = getDatabase();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const rows = await db.getAllAsync<{
    id: string;
    date: string;
    meal_type: string;
    ingredients: string;
    created_at: string;
  }>(
    'SELECT * FROM meal_logs WHERE date >= ? ORDER BY date DESC',
    [startDate.toISOString()]
  );

  return rows.map(row => ({
    id: row.id,
    date: row.date,
    mealType: row.meal_type as MealLog['mealType'],
    ingredients: JSON.parse(row.ingredients),
    createdAt: row.created_at,
  }));
}

export async function getMealLogsByDateRange(
  startDate: string,
  endDate: string
): Promise<MealLog[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    date: string;
    meal_type: string;
    ingredients: string;
    created_at: string;
  }>(
    'SELECT * FROM meal_logs WHERE date >= ? AND date <= ? ORDER BY date DESC',
    [startDate, endDate]
  );

  return rows.map(row => ({
    id: row.id,
    date: row.date,
    mealType: row.meal_type as MealLog['mealType'],
    ingredients: JSON.parse(row.ingredients),
    createdAt: row.created_at,
  }));
}
```

**Date Handling:**
```typescript
// Helper functions for dates
export function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function isToday(isoString: string): boolean {
  const date = new Date(isoString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}
```

**Testing:**
```typescript
// Test meal logging
const mealId = await logMeal({
  date: new Date().toISOString(),
  mealType: 'breakfast',
  ingredients: ['yogurt-id', 'bread-id', 'jam-id'],
});

// Get recent meals
const recentMeals = await getRecentMealLogs(3);
console.log('Recent meals:', recentMeals);
```

**Discussion:**
- How do we handle timezones?
- Should dates be stored as full timestamps or just dates?
- How do we efficiently query by date range?

---

## Step 1.5: Seeding Initial Data

**What you'll learn**: Database seeding, batch operations

**Create Seed Script** (`lib/database/seed.ts`):

This populates the database with Portuguese breakfast/snack ingredients to get started quickly.

```typescript
import { addIngredient } from './ingredients';

export const DEFAULT_INGREDIENTS = {
  proteins: [
    { name: 'Milk', category: 'protein' as const, mealTypes: ['breakfast' as const] },
    { name: 'Greek Yogurt', category: 'protein' as const, mealTypes: ['breakfast' as const] },
    { name: 'Normal Yogurt', category: 'protein' as const, mealTypes: ['breakfast' as const] },
    { name: 'Butter', category: 'protein' as const, mealTypes: ['breakfast' as const, 'snack' as const] },
    { name: 'Cheese', category: 'protein' as const, mealTypes: ['breakfast' as const, 'snack' as const] },
    { name: 'Eggs', category: 'protein' as const, mealTypes: ['breakfast' as const] },
  ],
  carbs: [
    { name: 'Cereals', category: 'carb' as const, mealTypes: ['breakfast' as const] },
    { name: 'Pão Branco', category: 'carb' as const, mealTypes: ['breakfast' as const, 'snack' as const] },
    { name: 'Pão Mistura', category: 'carb' as const, mealTypes: ['breakfast' as const, 'snack' as const] },
    { name: 'Pão de Água', category: 'carb' as const, mealTypes: ['breakfast' as const, 'snack' as const] },
    { name: 'Pão de Forma', category: 'carb' as const, mealTypes: ['breakfast' as const, 'snack' as const] },
    { name: 'Italiana', category: 'carb' as const, mealTypes: ['breakfast' as const, 'snack' as const] },
    { name: 'Regueifa', category: 'carb' as const, mealTypes: ['breakfast' as const, 'snack' as const] },
  ],
  sweets: [
    { name: 'Jam', category: 'sweet' as const, mealTypes: ['breakfast' as const, 'snack' as const] },
    { name: 'Marmelada', category: 'sweet' as const, mealTypes: ['breakfast' as const, 'snack' as const] },
    { name: 'Cookies', category: 'sweet' as const, mealTypes: ['breakfast' as const, 'snack' as const] },
  ],
  fruits: [
    { name: 'Apple', category: 'fruit' as const, mealTypes: ['snack' as const] },
    { name: 'Banana', category: 'fruit' as const, mealTypes: ['snack' as const] },
    { name: 'Pear', category: 'fruit' as const, mealTypes: ['snack' as const] },
  ],
};

export async function seedDatabase(): Promise<void> {
  const allIngredients = [
    ...DEFAULT_INGREDIENTS.proteins,
    ...DEFAULT_INGREDIENTS.carbs,
    ...DEFAULT_INGREDIENTS.sweets,
    ...DEFAULT_INGREDIENTS.fruits,
  ];

  // Check if already seeded
  const existing = await getAllIngredients();
  if (existing.length > 0) {
    console.log('Database already seeded');
    return;
  }

  // Add all ingredients
  for (const ingredient of allIngredients) {
    await addIngredient(ingredient);
  }

  console.log(`Seeded ${allIngredients.length} ingredients`);
}
```

**Initialize on App Start:**

Update `app/_layout.tsx`:
```typescript
import { initDatabase } from '../lib/database';
import { seedDatabase } from '../lib/database/seed';

export default function RootLayout() {
  useEffect(() => {
    async function setup() {
      await initDatabase();
      await seedDatabase();
    }
    setup();
  }, []);

  // ... rest of layout
}
```

**Testing:**
- App starts successfully
- Database contains Portuguese ingredients
- Only seeds once (doesn't duplicate on restart)

---

## Step 1.6: Adding OpenTelemetry Tracing for Database Operations

**What you'll learn**: Instrumenting async operations, performance tracking

**Wrap Database Operations with Tracing:**

Update `lib/database/ingredients.ts`:
```typescript
import { traceAsync } from '../tracing-helpers';

export async function addIngredient(
  ingredient: Omit<Ingredient, 'id' | 'createdAt'>
): Promise<string> {
  return traceAsync(
    'database.ingredient.add',
    async () => {
      const db = getDatabase();
      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();

      await db.runAsync(
        `INSERT INTO ingredients (id, name, category, meal_types, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [id, ingredient.name, ingredient.category, JSON.stringify(ingredient.mealTypes), createdAt]
      );

      return id;
    },
    {
      'ingredient.name': ingredient.name,
      'ingredient.category': ingredient.category,
    }
  );
}

export async function getAllIngredients(): Promise<Ingredient[]> {
  return traceAsync('database.ingredient.getAll', async () => {
    const db = getDatabase();
    const rows = await db.getAllAsync</* ... */>(
      'SELECT * FROM ingredients ORDER BY name ASC'
    );
    return rows.map(/* ... */);
  });
}
```

**Testing:**
- Database operations appear in Jaeger traces
- Can see timing for each operation
- Attributes show ingredient details

**Discussion:**
- What operations should be traced?
- How does tracing affect performance?
- What metrics would be useful to track?

---

## Phase 1 Summary

**What You've Accomplished:**
- ✅ Designed data model for Meals Randomizer
- ✅ Set up SQLite database with Expo
- ✅ Created database schema (ingredients, meal_logs, preferences)
- ✅ Implemented CRUD operations for ingredients
- ✅ Implemented meal logging operations
- ✅ Seeded database with Portuguese ingredients
- ✅ Added OpenTelemetry tracing for database operations

**Key Skills Learned:**
- SQL database design
- Async database operations
- JSON serialization/deserialization
- Date handling in JavaScript
- TypeScript type safety for database models
- Performance instrumentation

**Next:** [Phase 2 - State Management & Core Logic](./PHASE2_STATE_MANAGEMENT.md)

---

[← Back to Overview](./OVERVIEW.md) | [Next: Phase 2 →](./PHASE2_STATE_MANAGEMENT.md)

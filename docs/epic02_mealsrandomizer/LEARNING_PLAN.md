# Epic 2: Meals Randomizer - Learning Plan

## Product Vision: Build While Learning

---

## Table of Contents
1. [How This Epic Works](#how-this-epic-works)
2. [Product Overview](#product-overview)
3. [What You'll Learn](#what-youll-learn)
4. [Key Concepts & Technologies](#key-concepts--technologies)
5. [Phase 1: Data Foundation & SQLite](#phase-1-data-foundation--sqlite)
6. [Phase 2: State Management & Core Logic](#phase-2-state-management--core-logic)
7. [Phase 3: Building the UI](#phase-3-building-the-ui)
8. [Phase 4: Navigation & User Flow](#phase-4-navigation--user-flow)
9. [Phase 5: Polish & Testing](#phase-5-polish--testing)
10. [Phase 6: Future Enhancements](#phase-6-future-enhancements-optional)
11. [Project Structure](#project-structure)
12. [Success Criteria](#success-criteria)

---

## How This Epic Works

### Building on Epic 1 Foundation

You've already completed Epic 1, which means you have:
- ✅ A working React Native app with Expo
- ✅ Understanding of components, state, and styling
- ✅ Testing infrastructure (Jest, React Native Testing Library)
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Full observability stack (OpenTelemetry, Jaeger, Prometheus, Sentry)
- ✅ Professional development workflow

**Now in Epic 2, you'll build on this foundation to create a real product: the Meals Randomizer app.**

### Learning Methodology (Same as Epic 1)

**📝 You Write the Code**
- I provide step-by-step guidance
- You write all the code yourself
- No copy-pasting of large code blocks

**🔍 Very Small Steps**
- Each concept broken into digestible pieces
- One small change at a time
- Verify each step works before moving on

**💬 Questions Encouraged**
- Ask "why" at any point
- Request more detail when needed
- Explore tangential topics that interest you

**📚 Documentation of Learning**
- All questions and explanations captured in `PHASE*_LEARNING_NOTES.md` files
- Creates a personalized reference guide
- Review notes anytime to refresh concepts

### Important: Keep Epic 1 Infrastructure Running

Throughout Epic 2, your observability infrastructure from Epic 1 will continue to help you:
- **Tests**: Write tests for new features as you build them
- **Observability**: Track how your app performs with real data
- **CI/CD**: Ensure code quality as you develop

We'll integrate OpenTelemetry tracking for:
- Database operations (SQLite queries)
- Combination generation algorithm performance
- User interactions (button clicks, meal logging)
- Navigation events

---

## Product Overview

### What You're Building

**Meals Randomizer V1** - A mobile app that helps eliminate decision fatigue for breakfast and snack choices by:
- Generating variety-enforced meal suggestions
- Tracking what you've eaten to prevent repetition
- Respecting Portuguese food culture and preferences
- Making daily meal decisions quick and easy (10-20 seconds)

### Core Problem Solving

**Primary Pain Points:**
- Decision fatigue from choosing meals every day
- Falling into repetitive eating patterns
- Forgetting what was eaten recently
- Wanting variety within familiar food preferences

**Solution:**
- Quick meal suggestions (3-4 options)
- Automatic variety enforcement (no repeats within 3 days)
- Personal ingredient repository (your foods, your combinations)
- Simple tracking (tap to log what you're having)

### V1 Scope (What You're Building Now)

**Included:**
1. Ingredient repository (proteins, carbs, sweets, fruits)
2. Combination generation (random 1-3 ingredient combos)
3. Meal type selection (Breakfast vs Snack)
4. Meal logging and history
5. Variety enforcement (cooldown period)
6. Simple settings (adjust cooldown, manage ingredients)

**Not Included (Future Versions):**
- ❌ AI-generated suggestions
- ❌ Complex pairing rules
- ❌ Nutrition tracking
- ❌ Multi-user profiles
- ❌ Cloud sync
- ❌ Favorite combinations

---

## What You'll Learn

### New React Native Concepts

1. **SQLite Database**
   - Local database on device
   - Creating tables and schemas
   - CRUD operations (Create, Read, Update, Delete)
   - Database migrations
   - Async database operations

2. **State Management (Zustand)**
   - Global state across screens
   - Actions and selectors
   - Persisting state
   - Middleware and devtools

3. **Navigation (React Navigation)**
   - Tab navigation (already in place from Epic 1)
   - Stack navigation for modal screens
   - Passing data between screens
   - Navigation hooks (useNavigation, useRoute)

4. **List Rendering**
   - FlatList for efficient rendering
   - Key extraction
   - Item separators
   - Empty states
   - Pull-to-refresh

5. **Advanced UI Patterns**
   - Modal dialogs
   - Form inputs
   - Sliders and controls
   - Confirmation flows
   - Card-based layouts

6. **Algorithm Implementation**
   - Combination generation
   - Variety scoring
   - Date calculations
   - Filtering and sorting

### Skills You'll Develop

- **Data Modeling**: Designing database schemas for real-world apps
- **Business Logic**: Implementing algorithms (combination generator, variety enforcer)
- **User Experience**: Building intuitive flows for quick decision-making
- **Performance**: Optimizing database queries and list rendering
- **Testing**: Writing tests for database operations and algorithms
- **Observability**: Tracking database performance and user behavior

---

## Key Concepts & Technologies

### 1. SQLite

**What is it?**
SQLite is a lightweight, self-contained SQL database that runs directly on the device. Perfect for mobile apps that need local data storage without a server.

**Why SQLite instead of AsyncStorage?**
- **Structure**: Tables with relationships vs simple key-value pairs
- **Queries**: Can filter, sort, join data efficiently
- **Performance**: Fast for complex data operations
- **Standards**: SQL is a universal language

**When to use each:**
- **AsyncStorage**: Simple preferences, settings, single values
- **SQLite**: Structured data, relationships, complex queries

**Expo SQLite:**
Expo provides a simple API for SQLite:
```typescript
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('meals.db');
```

### 2. Zustand

**What is it?**
Zustand is a lightweight state management library for React. Simpler than Redux, more powerful than Context API.

**Why Zustand?**
- **Simple API**: Create stores with minimal boilerplate
- **TypeScript-friendly**: Excellent type inference
- **Performance**: Only re-renders components that use changed state
- **DevTools**: Inspect state changes during development
- **Small**: Only ~1KB gzipped

**Basic Example:**
```typescript
import { create } from 'zustand';

interface AppState {
  ingredients: Ingredient[];
  addIngredient: (ingredient: Ingredient) => void;
}

const useStore = create<AppState>((set) => ({
  ingredients: [],
  addIngredient: (ingredient) =>
    set((state) => ({
      ingredients: [...state.ingredients, ingredient]
    })),
}));
```

### 3. React Navigation

**What is it?**
The standard navigation library for React Native. You already have tab navigation from Epic 1; now you'll add stack navigation for modal flows.

**Navigation Types:**
- **Tab Navigator**: Bottom tabs (Home, Suggestions, History, Settings)
- **Stack Navigator**: Screen stack (push/pop, like browser history)
- **Modal**: Overlay screens (confirmations, forms)

**You already know:**
- Tab navigation basics (from Epic 1)
- File-based routing with Expo Router

**You'll learn:**
- Creating modal screens
- Passing data between screens
- Navigation hooks for programmatic navigation

### 4. FlatList

**What is it?**
A high-performance component for rendering long lists in React Native. Only renders visible items (virtualization).

**Why not .map()?**
```tsx
// ❌ Bad for long lists (renders everything)
{items.map(item => <ItemCard key={item.id} item={item} />)}

// ✅ Good for long lists (renders only visible)
<FlatList
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
  keyExtractor={item => item.id}
/>
```

**Key Props:**
- `data`: Array of items
- `renderItem`: Function that renders each item
- `keyExtractor`: Function that returns unique key
- `ListEmptyComponent`: What to show when list is empty
- `onRefresh`: Pull-to-refresh handler

### 5. Algorithms in React Native

**Combination Generator**
You'll implement an algorithm that:
1. Takes available ingredients
2. Generates random 1-3 ingredient combinations
3. Filters out recently used combinations
4. Scores each combination for variety
5. Returns top N suggestions

**Variety Enforcement**
You'll implement logic that:
1. Checks meal history (last N days)
2. Identifies recently used combinations
3. Calculates variety scores
4. Prioritizes unused ingredients

**This is computer science in action!**
- Data structures (arrays, objects, sets)
- Algorithms (filtering, sorting, scoring)
- Time complexity considerations
- Randomization with constraints

---

## Phase 1: Data Foundation & SQLite (3-4 hours)

### Goal
Set up the database layer and understand SQLite fundamentals by implementing the data models for ingredients and meal logs.

### Prerequisites
- Epic 1 completed (basic React Native understanding)
- App structure from Epic 1 (tabs, navigation)
- Observability infrastructure running

---

### Step 1.1: Understanding SQLite & Data Modeling

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

### Step 1.2: Installing and Initializing SQLite

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

### Step 1.3: Ingredient Database Operations

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

### Step 1.4: Meal Log Database Operations

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

### Step 1.5: Seeding Initial Data

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

### Step 1.6: Adding OpenTelemetry Tracing for Database Operations

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

### Phase 1 Summary

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

**Next:** Phase 2 - State Management & Core Logic (Combination Generator)

---

## Phase 2: State Management & Core Logic (4-5 hours)

### Goal
Implement Zustand for global state management and build the core algorithms: combination generator and variety enforcement engine.

### Prerequisites
- Phase 1 completed (database layer working)
- Understanding of React hooks (useState, useEffect)

---

### Step 2.1: Understanding State Management

**What you'll learn**: When to use local vs global state, state management patterns

**Discussion: Types of State in Your App**

**1. Local Component State (useState)**
- Lives in a single component
- Doesn't need to be shared
- Examples: form input values, modal open/close, loading states

**2. Global Application State (Zustand)**
- Shared across multiple components
- Persists during navigation
- Examples: ingredients list, user preferences, current suggestions

**3. Persistent State (SQLite)**
- Survives app restarts
- Long-term storage
- Examples: meal history, ingredient repository

**When to use which?**
```
User types in input → Local state (useState)
User submits form → Write to database (SQLite)
Components need data → Read from global state (Zustand)
App starts → Load from database → Populate global state
```

**State Flow:**
```
App Start
  ↓
Load from SQLite
  ↓
Initialize Zustand store
  ↓
Components read from store
  ↓
User interacts
  ↓
Update Zustand store
  ↓
Write to SQLite
```

---

### Step 2.2: Installing and Setting Up Zustand

**What you'll learn**: Creating a Zustand store, actions, selectors

**Installation:**
```bash
npm install zustand
```

**Create Store Structure:**

**File:** `lib/store/index.ts`

```typescript
import { create } from 'zustand';
import { Ingredient, MealLog, Preferences } from '../../types/database';
import { getAllIngredients } from '../database/ingredients';
import { getRecentMealLogs } from '../database/mealLogs';
import { getPreferences } from '../database/preferences';

interface AppState {
  // Data
  ingredients: Ingredient[];
  recentMealLogs: MealLog[];
  preferences: Preferences;
  currentSuggestions: Ingredient[][];

  // Loading states
  isLoading: boolean;

  // Actions
  loadData: () => Promise<void>;
  setIngredients: (ingredients: Ingredient[]) => void;
  setRecentMealLogs: (logs: MealLog[]) => void;
  setPreferences: (prefs: Preferences) => void;
  setCurrentSuggestions: (suggestions: Ingredient[][]) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  ingredients: [],
  recentMealLogs: [],
  preferences: {
    cooldownDays: 3,
    suggestionsCount: 4,
  },
  currentSuggestions: [],
  isLoading: false,

  // Actions
  loadData: async () => {
    set({ isLoading: true });

    try {
      const [ingredients, mealLogs, prefs] = await Promise.all([
        getAllIngredients(),
        getRecentMealLogs(7),
        getPreferences(),
      ]);

      set({
        ingredients,
        recentMealLogs: mealLogs,
        preferences: prefs,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      set({ isLoading: false });
    }
  },

  setIngredients: (ingredients) => set({ ingredients }),
  setRecentMealLogs: (logs) => set({ recentMealLogs: logs }),
  setPreferences: (prefs) => set({ preferences: prefs }),
  setCurrentSuggestions: (suggestions) => set({ currentSuggestions: suggestions }),
}));
```

**Key Concepts:**
- **`create<State>`**: Creates the store with TypeScript types
- **`set`**: Updates state (immutable)
- **`get`**: Reads current state (useful in actions)
- **Actions**: Functions that encapsulate state updates

**Discussion:**
- Why separate actions from direct state updates?
- How does Zustand compare to Redux?
- When should we load data from the database?

---

### Step 2.3: Using Zustand Store in Components

**What you'll learn**: Reading state, calling actions, selector optimization

**Basic Usage:**

```typescript
import { useStore } from '../lib/store';

export default function HomeScreen() {
  // Read state
  const ingredients = useStore((state) => state.ingredients);
  const loadData = useStore((state) => state.loadData);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <View>
      <Text>Ingredients: {ingredients.length}</Text>
    </View>
  );
}
```

**Selector Optimization:**

```typescript
// ❌ Bad: Component re-renders on ANY state change
const state = useStore();

// ✅ Good: Component only re-renders when ingredients change
const ingredients = useStore((state) => state.ingredients);

// ✅ Good: Select only what you need
const ingredientCount = useStore((state) => state.ingredients.length);
```

**Multiple Selectors:**
```typescript
const ingredients = useStore((state) => state.ingredients);
const isLoading = useStore((state) => state.isLoading);
const loadData = useStore((state) => state.loadData);
```

**Testing:**
- Store loads data on app start
- Components receive data from store
- Updating store triggers component re-render

---

### Step 2.4: Implementing Combination Generator Algorithm

**What you'll learn**: Algorithm design, randomization, filtering

**Create Combination Service** (`lib/services/combinationGenerator.ts`):

**Algorithm Steps:**
1. Get available ingredients for meal type
2. Get recent meal history
3. Generate random combinations (1-3 ingredients)
4. Filter out recently used combinations
5. Return N suggestions

**Implementation:**

```typescript
import { Ingredient, MealLog } from '../../types/database';

export interface Combination {
  id: string;
  ingredients: Ingredient[];
}

export function generateCombinations(
  availableIngredients: Ingredient[],
  recentMealLogs: MealLog[],
  count: number = 4,
  cooldownDays: number = 3
): Combination[] {
  // Filter out recent combinations
  const recentCombos = getRecentCombinations(recentMealLogs, cooldownDays);

  // Generate candidates
  const candidates: Combination[] = [];
  const maxAttempts = count * 10; // Try 10x to find enough unique combos

  for (let i = 0; i < maxAttempts && candidates.length < count; i++) {
    const combo = generateRandomCombination(availableIngredients);
    const comboKey = getCombinationKey(combo.ingredients);

    // Skip if recently used
    if (recentCombos.has(comboKey)) continue;

    // Skip if already in candidates
    if (candidates.some(c => getCombinationKey(c.ingredients) === comboKey)) {
      continue;
    }

    candidates.push(combo);
  }

  return candidates;
}

function generateRandomCombination(
  ingredients: Ingredient[]
): Combination {
  // Random number of ingredients (1-3)
  const count = Math.floor(Math.random() * 3) + 1;

  // Shuffle and take first N
  const shuffled = [...ingredients].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return {
    id: crypto.randomUUID(),
    ingredients: selected,
  };
}

function getCombinationKey(ingredients: Ingredient[]): string {
  // Sort IDs to ensure "milk+bread" = "bread+milk"
  return ingredients
    .map(i => i.id)
    .sort()
    .join(',');
}

function getRecentCombinations(
  mealLogs: MealLog[],
  cooldownDays: number
): Set<string> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - cooldownDays);

  const recent = mealLogs
    .filter(log => new Date(log.date) >= cutoffDate)
    .map(log => log.ingredients.sort().join(','));

  return new Set(recent);
}
```

**Discussion:**
- Why sort ingredient IDs in the combination key?
- What happens if we can't generate enough unique combinations?
- How do we ensure randomness while avoiding repetition?

**Testing:**
```typescript
// Test in a component
const ingredients = useStore((state) => state.ingredients);
const recentLogs = useStore((state) => state.recentMealLogs);

const breakfastIngredients = ingredients.filter(i =>
  i.mealTypes.includes('breakfast')
);

const suggestions = generateCombinations(
  breakfastIngredients,
  recentLogs,
  4,
  3
);

console.log('Suggestions:', suggestions);
```

---

### Step 2.5: Implementing Variety Scoring Engine

**What you'll learn**: Scoring algorithms, weighting, optimization

**Create Variety Engine** (`lib/services/varietyEngine.ts`):

**Scoring Logic:**
- Never used ingredient: +20 points
- Used 3+ days ago: +10 points
- Used 2 days ago: +5 points
- Used 1 day ago: -10 points
- Used today: -50 points

**Implementation:**

```typescript
import { Ingredient, MealLog } from '../../types/database';
import { Combination } from './combinationGenerator';

export interface ScoredCombination extends Combination {
  varietyScore: number;
}

export function scoreVariety(
  combinations: Combination[],
  recentMealLogs: MealLog[],
  allIngredients: Ingredient[]
): ScoredCombination[] {
  return combinations.map(combo => ({
    ...combo,
    varietyScore: calculateVarietyScore(combo, recentMealLogs),
  }));
}

function calculateVarietyScore(
  combination: Combination,
  recentMealLogs: MealLog[]
): number {
  let score = 100; // Start with perfect score

  for (const ingredient of combination.ingredients) {
    const lastUsed = findLastUsedDate(ingredient.id, recentMealLogs);

    if (!lastUsed) {
      // Never used - bonus!
      score += 20;
    } else {
      const daysAgo = daysSince(lastUsed);

      if (daysAgo === 0) {
        score -= 50; // Used today - big penalty
      } else if (daysAgo === 1) {
        score -= 10; // Yesterday - medium penalty
      } else if (daysAgo === 2) {
        score += 5; // 2 days ago - small bonus
      } else {
        score += 10; // 3+ days ago - good bonus
      }
    }
  }

  return Math.max(0, score); // Don't go negative
}

function findLastUsedDate(
  ingredientId: string,
  mealLogs: MealLog[]
): string | null {
  for (const log of mealLogs) {
    if (log.ingredients.includes(ingredientId)) {
      return log.date;
    }
  }
  return null;
}

function daysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function sortByVarietyScore(
  scored: ScoredCombination[]
): ScoredCombination[] {
  return [...scored].sort((a, b) => b.varietyScore - a.varietyScore);
}
```

**Enhanced Suggestion Generation:**

Update `combinationGenerator.ts`:
```typescript
import { scoreVariety, sortByVarietyScore } from './varietyEngine';

export function generateCombinations(
  availableIngredients: Ingredient[],
  recentMealLogs: MealLog[],
  count: number = 4,
  cooldownDays: number = 3
): Combination[] {
  // ... existing generation logic ...

  // Score and sort by variety
  const scored = scoreVariety(candidates, recentMealLogs, availableIngredients);
  const sorted = sortByVarietyScore(scored);

  // Return top N
  return sorted.slice(0, count);
}
```

**Testing:**
- Generate suggestions multiple times
- Verify higher variety scores appear first
- Log meals and verify suggestions change

**Discussion:**
- How sensitive is the scoring to recent usage?
- Should different ingredients have different weights?
- How do we balance variety with user preferences?

---

### Step 2.6: Adding OpenTelemetry Metrics for Algorithm Performance

**What you'll learn**: Custom metrics, performance monitoring

**Track Algorithm Performance:**

```typescript
import { meter } from '../telemetry';
import { traceSync } from '../tracing-helpers';

const suggestionGenerationTime = meter.createHistogram('suggestion.generation.duration', {
  description: 'Time to generate meal suggestions',
  unit: 'ms',
});

const suggestionVarietyScore = meter.createHistogram('suggestion.variety.score', {
  description: 'Variety scores of generated suggestions',
});

export function generateCombinations(
  availableIngredients: Ingredient[],
  recentMealLogs: MealLog[],
  count: number = 4,
  cooldownDays: number = 3
): Combination[] {
  return traceSync('combination.generate', () => {
    const startTime = Date.now();

    // ... generation logic ...

    const duration = Date.now() - startTime;
    suggestionGenerationTime.record(duration, {
      ingredientCount: String(availableIngredients.length),
      requested: String(count),
    });

    // Record variety scores
    scored.forEach(combo => {
      suggestionVarietyScore.record(combo.varietyScore);
    });

    return sorted.slice(0, count);
  }, {
    'ingredients.available': availableIngredients.length,
    'suggestions.requested': count,
    'cooldown.days': cooldownDays,
  });
}
```

**View in Prometheus:**
- Visit http://localhost:9090
- Query: `suggestion_generation_duration`
- See how performance changes with more ingredients

---

### Phase 2 Summary

**What You've Accomplished:**
- ✅ Set up Zustand for global state management
- ✅ Created store with ingredients, logs, preferences
- ✅ Implemented combination generator algorithm
- ✅ Built variety scoring engine
- ✅ Added performance metrics for algorithms
- ✅ Integrated state management with database layer

**Key Skills Learned:**
- Global state management patterns
- Algorithm design and implementation
- Scoring and ranking systems
- Performance optimization
- Custom metrics tracking

**Next:** Phase 3 - Building the UI (Screens and Components)

---

## Phase 3: Building the UI (5-6 hours)

### Goal
Build the user interface screens and components based on the mockups, focusing on clean, performant, and accessible mobile UI.

### Prerequisites
- Phase 2 completed (state management and core logic working)
- Mockups reviewed

---

### Step 3.1: Screen Architecture Planning

**What you'll learn**: Navigation structure, screen hierarchy

**Screens Needed:**
1. **Home Screen** (already exists from Epic 1)
   - "Breakfast Ideas" button
   - "Snack Ideas" button
   - Recent meals list

2. **Suggestions Screen** (new)
   - Display 4 combination cards
   - "Select" button on each card
   - "Generate New Ideas" button

3. **Confirmation Modal** (new)
   - Show selected combination
   - Confirm logging
   - "Enjoy your meal!" message

4. **History Screen** (new tab)
   - List of past meals
   - Grouped by date
   - Filter by meal type

5. **Settings Screen** (new tab)
   - Cooldown days slider
   - Suggestions count slider
   - Manage ingredients button

**Navigation Structure:**
```
Tab Navigator (bottom tabs)
├── Home (/)
├── Suggestions (stack navigator)
│   ├── Suggestions Screen
│   └── Confirmation Modal (modal)
├── History
└── Settings
    ├── Settings Screen
    └── Manage Ingredients (stack)
```

---

### Step 3.2: Creating Reusable Components

**What you'll learn**: Component composition, props, styling patterns

**Components Needed:**
1. **CombinationCard**: Display ingredient combination
2. **IngredientBadge**: Small pill showing ingredient name
3. **MealHistoryItem**: Row in history list
4. **EmptyState**: Message when no data available

**Component:** `components/CombinationCard.tsx`

```typescript
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Combination } from '../lib/services/combinationGenerator';
import IngredientBadge from './IngredientBadge';

interface CombinationCardProps {
  combination: Combination;
  onSelect: (combination: Combination) => void;
}

export default function CombinationCard({ combination, onSelect }: CombinationCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.ingredientsContainer}>
        {combination.ingredients.map((ingredient, index) => (
          <View key={ingredient.id}>
            <IngredientBadge ingredient={ingredient} />
            {index < combination.ingredients.length - 1 && (
              <Text style={styles.separator}>+</Text>
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => onSelect(combination)}
      >
        <Text style={styles.selectButtonText}>Select</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  ingredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 12,
  },
  separator: {
    marginHorizontal: 8,
    fontSize: 18,
    color: '#666',
  },
  selectButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

**Component:** `components/IngredientBadge.tsx`

```typescript
import { View, Text, StyleSheet } from 'react-native';
import { Ingredient } from '../types/database';

interface IngredientBadgeProps {
  ingredient: Ingredient;
}

const CATEGORY_COLORS = {
  protein: '#3b82f6',  // blue
  carb: '#f59e0b',     // amber
  sweet: '#ec4899',    // pink
  fruit: '#10b981',    // green
};

export default function IngredientBadge({ ingredient }: IngredientBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: CATEGORY_COLORS[ingredient.category] + '20' }
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: CATEGORY_COLORS[ingredient.category] }
        ]}
      >
        {ingredient.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});
```

**Testing:**
- Components render correctly
- Touch interactions work
- Colors match mockups

---

### Step 3.3: Building the Home Screen

**What you'll learn**: Layout composition, list rendering, navigation

**Update:** `app/(tabs)/index.tsx`

```typescript
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useStore } from '../../lib/store';
import MealHistoryItem from '../../components/MealHistoryItem';

export default function HomeScreen() {
  const router = useRouter();
  const loadData = useStore((state) => state.loadData);
  const recentMealLogs = useStore((state) => state.recentMealLogs);
  const isLoading = useStore((state) => state.isLoading);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBreakfastIdeas = () => {
    router.push('/suggestions?type=breakfast');
  };

  const handleSnackIdeas = () => {
    router.push('/suggestions?type=snack');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meals Randomizer</Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleBreakfastIdeas}
      >
        <Text style={styles.primaryButtonText}>Breakfast Ideas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleSnackIdeas}
      >
        <Text style={styles.primaryButtonText}>Snack Ideas</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Meals</Text>

      {isLoading ? (
        <Text>Loading...</Text>
      ) : recentMealLogs.length === 0 ? (
        <Text style={styles.emptyText}>No meals logged yet</Text>
      ) : (
        <FlatList
          data={recentMealLogs}
          renderItem={({ item }) => <MealHistoryItem log={item} />}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
```

---

### Step 3.4: Building the Suggestions Screen

**What you'll learn**: Query parameters, state updates, modal navigation

**Create:** `app/suggestions.tsx`

```typescript
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { generateCombinations } from '../lib/services/combinationGenerator';
import { Combination } from '../lib/services/combinationGenerator';
import CombinationCard from '../components/CombinationCard';

export default function SuggestionsScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: 'breakfast' | 'snack' }>();

  const ingredients = useStore((state) => state.ingredients);
  const recentMealLogs = useStore((state) => state.recentMealLogs);
  const preferences = useStore((state) => state.preferences);

  const [suggestions, setSuggestions] = useState<Combination[]>([]);

  const generateSuggestions = () => {
    const filtered = ingredients.filter(i =>
      i.mealTypes.includes(type)
    );

    const combos = generateCombinations(
      filtered,
      recentMealLogs,
      preferences.suggestionsCount,
      preferences.cooldownDays
    );

    setSuggestions(combos);
  };

  useEffect(() => {
    generateSuggestions();
  }, []);

  const handleSelect = (combination: Combination) => {
    // Navigate to confirmation modal
    router.push({
      pathname: '/confirmation',
      params: {
        mealType: type,
        ingredients: JSON.stringify(combination.ingredients),
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {type === 'breakfast' ? 'Breakfast' : 'Snack'} Ideas
      </Text>
      <Text style={styles.subtitle}>Pick one:</Text>

      <FlatList
        data={suggestions}
        renderItem={({ item }) => (
          <CombinationCard
            combination={item}
            onSelect={handleSelect}
          />
        )}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No suggestions available. Try adding more ingredients.
          </Text>
        }
      />

      <TouchableOpacity
        style={styles.regenerateButton}
        onPress={generateSuggestions}
      >
        <Text style={styles.regenerateButtonText}>
          Generate New Ideas
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  regenerateButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  regenerateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
```

---

### Step 3.5: Building the Confirmation Modal

**What you'll learn**: Modal screens, async operations, navigation back

**Create:** `app/confirmation.tsx`

```typescript
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { logMeal } from '../lib/database/mealLogs';
import { useStore } from '../lib/store';
import IngredientBadge from '../components/IngredientBadge';

export default function ConfirmationScreen() {
  const router = useRouter();
  const { mealType, ingredients } = useLocalSearchParams();
  const loadData = useStore((state) => state.loadData);

  const ingredientObjects = JSON.parse(ingredients as string);

  const handleConfirm = async () => {
    await logMeal({
      date: new Date().toISOString(),
      mealType: mealType as 'breakfast' | 'snack',
      ingredients: ingredientObjects.map((i: any) => i.id),
    });

    // Reload data to reflect new meal log
    await loadData();

    // Navigate back to home
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {mealType === 'breakfast' ? 'Breakfast' : 'Snack'} Logged
      </Text>

      <View style={styles.ingredientsContainer}>
        {ingredientObjects.map((ingredient: any) => (
          <IngredientBadge key={ingredient.id} ingredient={ingredient} />
        ))}
      </View>

      <Text style={styles.message}>Enjoy your meal!</Text>

      <TouchableOpacity
        style={styles.doneButton}
        onPress={handleConfirm}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  ingredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  message: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 32,
  },
  doneButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
```

---

### Phase 3 Summary

**What You've Accomplished:**
- ✅ Built reusable UI components (CombinationCard, IngredientBadge)
- ✅ Updated Home Screen with meal type buttons
- ✅ Created Suggestions Screen with combination cards
- ✅ Built Confirmation Modal for meal logging
- ✅ Implemented FlatList for efficient rendering
- ✅ Added proper navigation between screens

**Key Skills Learned:**
- Component composition and props
- Styling patterns for mobile
- List rendering with FlatList
- Navigation with Expo Router
- Query parameters for screen communication
- Async operations in UI

**Next:** Phase 4 - Complete Navigation & User Flow

---

## Phase 4: Navigation & User Flow (2-3 hours)

### Goal
Complete the tab navigation structure, build History and Settings screens, and ensure smooth user flow throughout the app.

### Prerequisites
- Phase 3 completed (Home, Suggestions, Confirmation screens working)

---

### Step 4.1: Setting Up Tab Navigation

**What you'll learn**: Tab navigator configuration, icons, screen options

You already have tab navigation from Epic 1. Now we'll add the new tabs for History and Settings.

**Update:** `app/(tabs)/_layout.tsx`

```typescript
import { Tabs } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'time' : 'time-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'settings' : 'settings-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

---

### Step 4.2: Building the History Screen

**What you'll learn**: Grouped lists, date formatting, filtering

**Create:** `app/(tabs)/history.tsx`

```typescript
import { View, Text, StyleSheet, FlatList, SectionList } from 'react-native';
import { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { MealLog } from '../../types/database';
import MealHistoryItem from '../../components/MealHistoryItem';
import { formatDate, isToday } from '../../lib/database/mealLogs';

interface MealSection {
  title: string;
  data: MealLog[];
}

export default function HistoryScreen() {
  const recentMealLogs = useStore((state) => state.recentMealLogs);
  const [sections, setSections] = useState<MealSection[]>([]);

  useEffect(() => {
    // Group meals by date
    const grouped = new Map<string, MealLog[]>();

    recentMealLogs.forEach(log => {
      const dateKey = log.date.split('T')[0]; // YYYY-MM-DD
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(log);
    });

    // Convert to sections array
    const sectionsArray: MealSection[] = [];
    grouped.forEach((logs, dateKey) => {
      const displayTitle = isToday(dateKey) ? 'Today' : formatDate(dateKey);
      sectionsArray.push({
        title: displayTitle,
        data: logs,
      });
    });

    // Sort by date (most recent first)
    sectionsArray.sort((a, b) =>
      b.data[0].date.localeCompare(a.data[0].date)
    );

    setSections(sectionsArray);
  }, [recentMealLogs]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meal History</Text>

      {sections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No meals logged yet</Text>
          <Text style={styles.emptySubtext}>
            Start by generating breakfast or snack ideas!
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MealHistoryItem log={item} />}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          stickySectionHeadersEnabled
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    padding: 20,
  },
  sectionHeader: {
    backgroundColor: '#f9fafb',
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
```

**Component:** `components/MealHistoryItem.tsx`

```typescript
import { View, Text, StyleSheet } from 'react-native';
import { MealLog, Ingredient } from '../types/database';
import { useStore } from '../lib/store';
import IngredientBadge from './IngredientBadge';

interface MealHistoryItemProps {
  log: MealLog;
}

export default function MealHistoryItem({ log }: MealHistoryItemProps) {
  const ingredients = useStore((state) => state.ingredients);

  const logIngredients = log.ingredients
    .map(id => ingredients.find(ing => ing.id === id))
    .filter(Boolean) as Ingredient[];

  const time = new Date(log.date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <View style={styles.item}>
      <View style={styles.header}>
        <Text style={styles.mealType}>
          {log.mealType === 'breakfast' ? '🌅 Breakfast' : '🍎 Snack'}
        </Text>
        <Text style={styles.time}>{time}</Text>
      </View>

      <View style={styles.ingredientsContainer}>
        {logIngredients.map(ingredient => (
          <IngredientBadge key={ingredient.id} ingredient={ingredient} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  time: {
    fontSize: 14,
    color: '#6b7280',
  },
  ingredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
```

---

### Step 4.3: Building the Settings Screen

**What you'll learn**: Form inputs, sliders, preference management

**Create:** `app/(tabs)/settings.tsx`

```typescript
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { updatePreference } from '../../lib/database/preferences';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const preferences = useStore((state) => state.preferences);
  const loadData = useStore((state) => state.loadData);

  const [cooldownDays, setCooldownDays] = useState(preferences.cooldownDays);
  const [suggestionsCount, setSuggestionsCount] = useState(preferences.suggestionsCount);

  const handleCooldownChange = async (value: number) => {
    const rounded = Math.round(value);
    setCooldownDays(rounded);
    await updatePreference('cooldownDays', String(rounded));
    await loadData();
  };

  const handleSuggestionsCountChange = async (value: number) => {
    const rounded = Math.round(value);
    setSuggestionsCount(rounded);
    await updatePreference('suggestionsCount', String(rounded));
    await loadData();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingHeader}>
            <Text style={styles.settingLabel}>Cooldown days</Text>
            <Text style={styles.settingValue}>{cooldownDays}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={7}
            step={1}
            value={cooldownDays}
            onSlidingComplete={handleCooldownChange}
            minimumTrackTintColor="#3b82f6"
            maximumTrackTintColor="#d1d5db"
          />
          <Text style={styles.settingDescription}>
            Don't suggest the same combination for {cooldownDays} day{cooldownDays !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingHeader}>
            <Text style={styles.settingLabel}>Number of suggestions</Text>
            <Text style={styles.settingValue}>{suggestionsCount}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={2}
            maximumValue={6}
            step={1}
            value={suggestionsCount}
            onSlidingComplete={handleSuggestionsCountChange}
            minimumTrackTintColor="#3b82f6"
            maximumTrackTintColor="#d1d5db"
          />
          <Text style={styles.settingDescription}>
            Show {suggestionsCount} meal combinations per request
          </Text>
        </View>
      </View>

      {/* Manage Ingredients Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manage Ingredients</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/manage-ingredients')}
        >
          <Text style={styles.buttonText}>➕ Add Ingredients</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => router.push('/manage-ingredients?mode=remove')}
        >
          <Text style={styles.buttonTextSecondary}>➖ Remove Ingredients</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  settingItem: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  settingValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3b82f6',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#3b82f6',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  buttonTextSecondary: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

**Install Slider:**
```bash
npx expo install @react-native-community/slider
```

---

### Step 4.4: User Flow Testing

**What you'll learn**: End-to-end testing, user experience evaluation

**Complete User Flow to Test:**

1. **Home Screen → Breakfast Ideas**
   - Tap "Breakfast Ideas"
   - Should navigate to Suggestions screen with breakfast filter

2. **Suggestions Screen → Select Combination**
   - See 4 breakfast suggestions
   - Tap "Select" on one
   - Should navigate to Confirmation modal

3. **Confirmation → Log Meal**
   - See selected combination
   - Tap "Done"
   - Should log meal and return to Home

4. **Home Screen → View History**
   - Logged meal should appear in Recent Meals
   - Switch to History tab
   - Should see meal in history list

5. **Settings → Adjust Preferences**
   - Navigate to Settings tab
   - Adjust cooldown days slider
   - Generate new suggestions
   - Verify variety enforcement respects new setting

**Discussion:**
- Does the flow feel natural?
- Are there too many taps?
- Is feedback clear at each step?
- What could be smoother?

---

### Phase 4 Summary

**What You've Accomplished:**
- ✅ Completed tab navigation structure
- ✅ Built History screen with grouped lists
- ✅ Created Settings screen with sliders
- ✅ Added preference management
- ✅ Implemented ingredient management navigation
- ✅ Tested complete user flow

**Key Skills Learned:**
- Tab navigation configuration
- SectionList for grouped data
- Form inputs and sliders
- Preference persistence
- End-to-end user flow testing

**Next:** Phase 5 - Polish, Testing & Observability Integration

---

## Phase 5: Polish & Testing (3-4 hours)

### Goal
Add final polish, write comprehensive tests, ensure observability coverage, and prepare for real-world usage.

### Prerequisites
- Phases 1-4 completed (app functionally complete)

---

### Step 5.1: Adding Loading States and Error Handling

**What you'll learn**: User feedback, error boundaries, loading indicators

**Loading States:**

Update `app/(tabs)/index.tsx`:
```typescript
import { ActivityIndicator } from 'react-native';

export default function HomeScreen() {
  const isLoading = useStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading your meals...</Text>
      </View>
    );
  }

  // ... rest of component
}

const styles = StyleSheet.create({
  // ... existing styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
});
```

**Error Handling:**

Create `lib/database/errorHandler.ts`:
```typescript
export class DatabaseError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`Database error: ${errorMessage}`, error);
    throw new DatabaseError(errorMessage, error as Error);
  }
}
```

Update database operations:
```typescript
export async function getAllIngredients(): Promise<Ingredient[]> {
  return safeDbOperation(
    async () => {
      const db = getDatabase();
      // ... query logic
    },
    'Failed to fetch ingredients'
  );
}
```

---

### Step 5.2: Writing Tests for Core Functionality

**What you'll learn**: Testing database operations, algorithm tests, component tests

**Test Database Operations:**

Create `lib/database/__tests__/ingredients.test.ts`:
```typescript
import { addIngredient, getAllIngredients, deleteIngredient } from '../ingredients';
import { initDatabase } from '../index';

describe('Ingredients Database', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  it('should add a new ingredient', async () => {
    const id = await addIngredient({
      name: 'Test Yogurt',
      category: 'protein',
      mealTypes: ['breakfast'],
    });

    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
  });

  it('should retrieve all ingredients', async () => {
    const ingredients = await getAllIngredients();

    expect(Array.isArray(ingredients)).toBe(true);
    expect(ingredients.length).toBeGreaterThan(0);
  });

  it('should delete an ingredient', async () => {
    const id = await addIngredient({
      name: 'To Delete',
      category: 'protein',
      mealTypes: ['breakfast'],
    });

    await deleteIngredient(id);

    const ingredients = await getAllIngredients();
    expect(ingredients.find(i => i.id === id)).toBeUndefined();
  });
});
```

**Test Combination Generator:**

Create `lib/services/__tests__/combinationGenerator.test.ts`:
```typescript
import { generateCombinations } from '../combinationGenerator';
import { Ingredient, MealLog } from '../../../types/database';

describe('Combination Generator', () => {
  const mockIngredients: Ingredient[] = [
    {
      id: '1',
      name: 'Milk',
      category: 'protein',
      mealTypes: ['breakfast'],
      createdAt: '2025-01-01',
    },
    {
      id: '2',
      name: 'Cereals',
      category: 'carb',
      mealTypes: ['breakfast'],
      createdAt: '2025-01-01',
    },
    {
      id: '3',
      name: 'Bread',
      category: 'carb',
      mealTypes: ['breakfast'],
      createdAt: '2025-01-01',
    },
  ];

  it('should generate requested number of combinations', () => {
    const combinations = generateCombinations(mockIngredients, [], 3, 3);

    expect(combinations.length).toBeLessThanOrEqual(3);
  });

  it('should not repeat recent combinations', () => {
    const recentLog: MealLog = {
      id: 'log1',
      date: new Date().toISOString(),
      mealType: 'breakfast',
      ingredients: ['1', '2'], // milk + cereals
      createdAt: '2025-01-01',
    };

    const combinations = generateCombinations(
      mockIngredients,
      [recentLog],
      5,
      3
    );

    // None of the suggestions should be exactly milk + cereals
    const hasMilkCereals = combinations.some(combo => {
      const ids = combo.ingredients.map(i => i.id).sort().join(',');
      return ids === '1,2';
    });

    expect(hasMilkCereals).toBe(false);
  });
});
```

**Test Components:**

Create `components/__tests__/CombinationCard.test.tsx`:
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CombinationCard from '../CombinationCard';

describe('CombinationCard', () => {
  const mockCombination = {
    id: '1',
    ingredients: [
      { id: '1', name: 'Milk', category: 'protein', mealTypes: ['breakfast'], createdAt: '2025-01-01' },
      { id: '2', name: 'Cereals', category: 'carb', mealTypes: ['breakfast'], createdAt: '2025-01-01' },
    ],
  };

  const mockOnSelect = jest.fn();

  it('renders ingredient names', () => {
    const { getByText } = render(
      <CombinationCard combination={mockCombination} onSelect={mockOnSelect} />
    );

    expect(getByText('Milk')).toBeTruthy();
    expect(getByText('Cereals')).toBeTruthy();
  });

  it('calls onSelect when Select button is pressed', () => {
    const { getByText } = render(
      <CombinationCard combination={mockCombination} onSelect={mockOnSelect} />
    );

    fireEvent.press(getByText('Select'));

    expect(mockOnSelect).toHaveBeenCalledWith(mockCombination);
  });
});
```

**Run Tests:**
```bash
npm test
npm run test:coverage
```

---

### Step 5.3: Adding Observability Throughout the App

**What you'll learn**: Complete instrumentation, metrics collection, user analytics

**Add Tracking to Key User Actions:**

Update `lib/analytics.ts`:
```typescript
import { meter } from './telemetry';
import { tracer } from './telemetry';

// Counters
const mealLogCounter = meter.createCounter('meal.logged', {
  description: 'Number of meals logged by type',
});

const suggestionGenerationCounter = meter.createCounter('suggestion.generated', {
  description: 'Number of times suggestions were generated',
});

const suggestionSelectionCounter = meter.createCounter('suggestion.selected', {
  description: 'Number of times suggestions were selected',
});

// Histograms
const appUsageDuration = meter.createHistogram('app.usage.duration', {
  description: 'Time spent in app per session',
  unit: 'seconds',
});

export const analytics = {
  trackMealLogged: (mealType: 'breakfast' | 'snack', ingredientCount: number) => {
    const span = tracer.startSpan('analytics.meal_logged');
    span.setAttribute('meal.type', mealType);
    span.setAttribute('meal.ingredient_count', ingredientCount);

    mealLogCounter.add(1, {
      meal_type: mealType,
      ingredient_count: String(ingredientCount),
    });

    span.end();
  },

  trackSuggestionGenerated: (mealType: 'breakfast' | 'snack', count: number) => {
    suggestionGenerationCounter.add(1, {
      meal_type: mealType,
      suggestion_count: String(count),
    });
  },

  trackSuggestionSelected: (ingredientCount: number, varietyScore: number) => {
    suggestionSelectionCounter.add(1, {
      ingredient_count: String(ingredientCount),
    });
  },
};
```

**Instrument Key Screens:**

Update `app/suggestions.tsx`:
```typescript
import { analytics } from '../lib/analytics';

const generateSuggestions = () => {
  const filtered = ingredients.filter(i => i.mealTypes.includes(type));

  const combos = generateCombinations(
    filtered,
    recentMealLogs,
    preferences.suggestionsCount,
    preferences.cooldownDays
  );

  setSuggestions(combos);

  // Track suggestion generation
  analytics.trackSuggestionGenerated(type, combos.length);
};
```

Update `app/confirmation.tsx`:
```typescript
const handleConfirm = async () => {
  await logMeal({
    date: new Date().toISOString(),
    mealType: mealType as 'breakfast' | 'snack',
    ingredients: ingredientObjects.map((i: any) => i.id),
  });

  // Track meal logged
  analytics.trackMealLogged(
    mealType as 'breakfast' | 'snack',
    ingredientObjects.length
  );

  await loadData();
  router.push('/');
};
```

**View Metrics:**
- Start your observability stack: `docker-compose up -d`
- Use the app (generate suggestions, log meals)
- View traces in Jaeger: http://localhost:16686
- View metrics in Prometheus: http://localhost:9090

---

### Step 5.4: UI Polish and Accessibility

**What you'll learn**: Accessibility, haptic feedback, animations

**Accessibility:**

```typescript
import { AccessibilityInfo } from 'react-native';

<TouchableOpacity
  style={styles.button}
  onPress={handlePress}
  accessible={true}
  accessibilityLabel="Generate breakfast ideas"
  accessibilityHint="Tap to see breakfast suggestions"
  accessibilityRole="button"
>
  <Text style={styles.buttonText}>Breakfast Ideas</Text>
</TouchableOpacity>
```

**Haptic Feedback:**

```bash
npx expo install expo-haptics
```

```typescript
import * as Haptics from 'expo-haptics';

const handleSelect = async (combination: Combination) => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

  router.push({
    pathname: '/confirmation',
    params: { /* ... */ },
  });
};
```

**Simple Animations:**

```typescript
import { Animated } from 'react-native';

const fadeAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true,
  }).start();
}, []);

<Animated.View style={{ opacity: fadeAnim }}>
  {/* content */}
</Animated.View>
```

---

### Step 5.5: Building APK and Testing on Device

**What you'll learn**: Production builds, device testing

**Build APK:**
```bash
eas build --platform android --profile preview
```

**Testing Checklist:**
- [ ] All screens navigate correctly
- [ ] Database operations work (add, read, delete)
- [ ] Suggestions generation works
- [ ] Meal logging persists
- [ ] Settings changes take effect
- [ ] App doesn't crash on real device
- [ ] Performance is smooth
- [ ] No memory leaks

---

### Phase 5 Summary

**What You've Accomplished:**
- ✅ Added loading states and error handling
- ✅ Wrote comprehensive tests (database, algorithms, components)
- ✅ Integrated full observability coverage
- ✅ Added accessibility improvements
- ✅ Implemented haptic feedback
- ✅ Built and tested APK on device

**Key Skills Learned:**
- Error handling patterns
- Testing React Native apps
- Complete instrumentation
- Accessibility best practices
- Production build process

**Next:** Phase 6 - Future Enhancements (Optional)

---

## Phase 6: Future Enhancements (Optional)

### Ideas for V2 and Beyond

Once you've completed V1 and used the app for a while, consider these enhancements:

---

### 1. AI-Generated Suggestions

**What you'll add**: Integration with Claude API for creative meal variations

**Implementation:**
```typescript
import Anthropic from '@anthropic-ai/sdk';

export async function generateAISuggestion(
  availableIngredients: string[],
  recentMeals: string[],
  culturalContext: string = 'Portuguese'
): Promise<string> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `You're a ${culturalContext} breakfast expert. Given these available ingredients: ${availableIngredients.join(', ')}, suggest ONE creative breakfast combination. The user recently had: ${recentMeals.join(', ')}. Suggest something different. Format: "Ingredient1 + Ingredient2 + Ingredient3"`,
    }],
  });

  return message.content[0].text;
}
```

**Learning**: API integration, async operations, prompt engineering

---

### 2. Favorite Combinations

**What you'll add**: Save favorite combinations for quick access

**Database:**
```sql
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT,
  ingredients TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

**UI:** Star icon on combination cards to save as favorite

**Learning**: Additional database tables, user preferences

---

### 3. Ingredient Photos

**What you'll add**: Visual representation of meals

**Implementation:**
```bash
npx expo install expo-image-picker
```

```typescript
import * as ImagePicker from 'expo-image-picker';

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled) {
    // Save image URI to ingredient
  }
};
```

**Learning**: Media handling, file system operations, image optimization

---

### 4. Nutrition Tracking (Basic)

**What you'll add**: Rough calorie and macro estimates

**Database:**
```sql
ALTER TABLE ingredients ADD COLUMN calories INTEGER;
ALTER TABLE ingredients ADD COLUMN protein INTEGER;
ALTER TABLE ingredients ADD COLUMN carbs INTEGER;
```

**UI:** Show estimated nutrition for each combination

**Learning**: Data aggregation, calculations, data visualization

---

### 5. Weekly Variety Report

**What you'll add**: Analytics on eating patterns

**Implementation:**
```typescript
interface VarietyReport {
  totalMeals: number;
  uniqueCombinations: number;
  varietyScore: number; // 0-100
  mostUsedIngredients: Array<{ name: string; count: number }>;
  leastUsedIngredients: Array<{ name: string; count: number }>;
}

export function generateWeeklyReport(mealLogs: MealLog[]): VarietyReport {
  // Calculate variety metrics
  const uniqueCombos = new Set(
    mealLogs.map(log => log.ingredients.sort().join(','))
  ).size;

  const varietyScore = (uniqueCombos / mealLogs.length) * 100;

  // Count ingredient usage
  const ingredientCounts = new Map<string, number>();
  mealLogs.forEach(log => {
    log.ingredients.forEach(id => {
      ingredientCounts.set(id, (ingredientCounts.get(id) || 0) + 1);
    });
  });

  // ... more calculations

  return {
    totalMeals: mealLogs.length,
    uniqueCombinations: uniqueCombos,
    varietyScore,
    mostUsedIngredients,
    leastUsedIngredients,
  };
}
```

**Learning**: Data analysis, visualization, reporting

---

### 6. Cloud Sync (Multi-Device)

**What you'll add**: Sync data across devices

**Tech Stack:**
- Backend: Supabase or Firebase
- Auth: User accounts
- Sync: Bidirectional data synchronization

**Learning**: Backend integration, authentication, conflict resolution

---

### 7. Lunch and Dinner

**What you'll add**: Expand beyond breakfast/snacks

**Challenges:**
- More complex meal structures (main + side + soup)
- Building block rotation logic
- Recipe vs ingredient combinations
- Preparation time considerations

**Learning**: Complex data models, advanced algorithms

---

## Project Structure

### Final Directory Structure

```
demo-react-native-app/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Home Screen
│   │   ├── history.tsx            # History Screen
│   │   ├── settings.tsx           # Settings Screen
│   │   └── _layout.tsx            # Tab Navigator
│   ├── suggestions.tsx            # Suggestions Screen
│   ├── confirmation.tsx           # Confirmation Modal
│   ├── manage-ingredients.tsx     # Ingredient Management
│   └── _layout.tsx                # Root Layout
│
├── components/
│   ├── CombinationCard.tsx        # Combination display card
│   ├── IngredientBadge.tsx        # Ingredient pill
│   ├── MealHistoryItem.tsx        # History list item
│   ├── EmptyState.tsx             # Empty list message
│   └── ErrorBoundary.tsx          # Error handling (Epic 1)
│
├── lib/
│   ├── database/
│   │   ├── index.ts               # Database init
│   │   ├── schema.ts              # Table schemas
│   │   ├── ingredients.ts         # Ingredient CRUD
│   │   ├── mealLogs.ts            # Meal log CRUD
│   │   ├── preferences.ts         # Preferences CRUD
│   │   ├── seed.ts                # Initial data
│   │   ├── errorHandler.ts        # Error handling
│   │   └── __tests__/             # Database tests
│   │
│   ├── services/
│   │   ├── combinationGenerator.ts  # Core algorithm
│   │   ├── varietyEngine.ts         # Variety scoring
│   │   └── __tests__/               # Algorithm tests
│   │
│   ├── store/
│   │   └── index.ts               # Zustand store
│   │
│   ├── analytics.ts               # Analytics helpers
│   ├── telemetry.ts               # OpenTelemetry setup (Epic 1)
│   └── tracing-helpers.ts         # Tracing utilities (Epic 1)
│
├── types/
│   └── database.ts                # TypeScript types
│
├── docs/
│   ├── epic01_infrastructure/     # Epic 1 docs
│   └── epic02_mealsrandomizer/    # Epic 2 docs
│       ├── LEARNING_PLAN.md       # This document
│       └── PHASE*_LEARNING_NOTES.md
│
├── assets/                        # Images, icons
├── .github/workflows/             # CI/CD (Epic 1)
├── docker-compose.yml             # Observability stack (Epic 1)
├── package.json
└── app.json
```

---

## Success Criteria

### V1 Complete When:

**Functional Requirements:**
- [ ] Database stores ingredients, meals, preferences
- [ ] Combination generator creates varied suggestions
- [ ] Variety enforcement prevents repetition
- [ ] Home screen navigates to suggestions
- [ ] Suggestions screen shows 4 combinations
- [ ] User can select and log meals
- [ ] History screen shows past meals grouped by date
- [ ] Settings screen allows preference adjustment
- [ ] App persists data between restarts

**Quality Requirements:**
- [ ] All tests pass
- [ ] Code coverage > 60%
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] App doesn't crash on device
- [ ] Performance is smooth (no lag)
- [ ] Observability traces appear in Jaeger
- [ ] Metrics appear in Prometheus

**User Experience:**
- [ ] Decision time < 20 seconds (open → selection → confirmation)
- [ ] Suggestions feel varied
- [ ] UI is intuitive (no confusion)
- [ ] Loading states provide feedback
- [ ] Errors are handled gracefully

**Personal Validation:**
- [ ] You use it daily for breakfast/snack decisions
- [ ] It saves you time vs manual decision-making
- [ ] Variety feels better than before
- [ ] You'd recommend it to friends/family

---

## Timeline & Effort

### Total Estimated Time: 15-20 hours

**Phase 1: Data Foundation & SQLite** (3-4 hours)
- Understanding database design
- Setting up SQLite
- Implementing CRUD operations
- Seeding data
- Adding tracing

**Phase 2: State Management & Core Logic** (4-5 hours)
- Setting up Zustand
- Building combination generator
- Implementing variety scoring
- Adding metrics

**Phase 3: Building the UI** (5-6 hours)
- Creating reusable components
- Building screens (Home, Suggestions, Confirmation)
- Styling and layout

**Phase 4: Navigation & User Flow** (2-3 hours)
- Completing tab navigation
- Building History and Settings screens
- Testing complete flow

**Phase 5: Polish & Testing** (3-4 hours)
- Adding loading/error states
- Writing tests
- Full observability integration
- Building APK

**Phase 6: Future Enhancements** (Optional, ongoing)
- AI suggestions
- Favorites
- Photos
- And more!

### Recommended Schedule

**Week 1: Foundation**
- Days 1-2: Phase 1 (Database)
- Days 3-4: Phase 2 (State & Logic)
- Days 5-7: Phase 3 (UI)

**Week 2: Completion**
- Days 8-9: Phase 4 (Navigation)
- Days 10-11: Phase 5 (Polish & Testing)
- Days 12-14: Testing, refinement, daily usage

**Week 3+: Real-World Usage**
- Use the app daily
- Collect feedback
- Identify improvements
- Decide on V2 features

---

## Comparing to Epic 1

### What's Different from Epic 1?

**Epic 1: Infrastructure Foundation**
- Focus: Professional development setup
- Built: Testing, CI/CD, observability
- Skills: Automation, instrumentation, workflow
- Product: Simple text input/display app

**Epic 2: Real Product Development**
- Focus: Building a useful app
- Built: Meals Randomizer with real functionality
- Skills: Databases, algorithms, mobile UI, state management
- Product: App you'll actually use daily

### What's the Same?

- ✅ Learning-focused methodology
- ✅ Small, incremental steps
- ✅ You write all the code
- ✅ Documentation of learnings
- ✅ Testing as you build
- ✅ Observability throughout

### Building on Epic 1

Epic 2 **uses** what you built in Epic 1:
- Tests verify new functionality
- CI/CD runs on every commit
- OpenTelemetry tracks database performance
- Observability stack monitors real usage
- Professional workflow continues

---

## Key Takeaways

### What Makes This a Good Learning Project

1. **Real Problem**: You'll actually use this app
2. **Complete Stack**: Database → Logic → UI
3. **Algorithms**: Combination generation, variety scoring
4. **Best Practices**: Testing, observability, TypeScript
5. **Scalable**: Clear path to V2, V3, beyond
6. **Cultural**: Respects Portuguese food preferences
7. **Portfolio Piece**: Demonstrates full-stack mobile dev

### Skills You'll Master

**Mobile Development:**
- SQLite database design and operations
- State management with Zustand
- Navigation patterns
- List rendering optimization
- Mobile UI/UX patterns

**Software Engineering:**
- Algorithm design and implementation
- Testing strategies
- Error handling
- Performance optimization
- Observability integration

**Product Development:**
- User flow design
- Feature prioritization
- MVP scoping
- Real-world testing
- Iterative improvement

---

## Resources

### Documentation
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Zustand](https://zustand.pmnd.rs)
- [React Navigation](https://reactnavigation.org)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)

### Learning
- [SQLite Tutorial](https://www.sqlitetutorial.net/)
- [State Management Guide](https://react.dev/learn/managing-state)
- [Algorithm Design Patterns](https://refactoring.guru/design-patterns)

### Tools
- [Jaeger UI](http://localhost:16686) - View traces
- [Prometheus](http://localhost:9090) - View metrics
- [React DevTools](https://react-devtools-tutorial.vercel.app/) - Debug React

---

## Final Thoughts

This Epic 2 project takes you from "I know React Native basics" to "I can build real, useful mobile apps."

You're not just learning syntax—you're learning how to:
- Design data models
- Implement algorithms
- Build intuitive UIs
- Test thoroughly
- Monitor production
- Iterate based on usage

**Most importantly:** You're building something you'll use every day. That's the best learning motivator.

When you complete this, you'll have:
- ✅ A working app that solves a real problem
- ✅ Deep understanding of mobile app architecture
- ✅ Portfolio project demonstrating full-stack skills
- ✅ Foundation for many more app ideas

**Now let's build this! 🚀**

---

**Ready to start?** Begin with Phase 1: Data Foundation & SQLite. Remember: small steps, write the code yourself, and ask questions along the way!

**Questions?** Just ask! I'm here to guide you through every step of this journey.

---

*Generated for Epic 2: Meals Randomizer - A learning-focused React Native project*
*Based on product exploration document and mockups*
*Building on Epic 1: Infrastructure & Foundation*

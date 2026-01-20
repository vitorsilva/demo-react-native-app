# Phase 2: State Management & Core Logic (4-5 hours)

[← Back to Overview](./OVERVIEW.md) | [Previous: Phase 1](./PHASE1_DATA_FOUNDATION.md) | [Next: Phase 3 →](./PHASE3_BUILDING_UI.md)

---

## Goal

Implement Zustand for global state management and build the core algorithms: combination generator and variety enforcement engine.

## Prerequisites

- Phase 1 completed (database layer working)
- Understanding of React hooks (useState, useEffect)

---

## Step 2.1: Understanding State Management

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

## Step 2.2: Installing and Setting Up Zustand

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

## Step 2.3: Using Zustand Store in Components

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

## Step 2.4: Implementing Combination Generator Algorithm

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

## Step 2.5: Implementing Variety Scoring Engine

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

## Step 2.6: Adding OpenTelemetry Metrics for Algorithm Performance

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

## Phase 2 Summary

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

**Next:** [Phase 3 - Building the UI](./PHASE3_BUILDING_UI.md)

---

[← Back to Overview](./OVERVIEW.md) | [Previous: Phase 1](./PHASE1_DATA_FOUNDATION.md) | [Next: Phase 3 →](./PHASE3_BUILDING_UI.md)

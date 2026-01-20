# State Management

## Overview

SaborSpin uses [Zustand](https://zustand.pmnd.rs/) for global state management. Zustand was chosen for its simplicity, small bundle size, and TypeScript support.

## Store Structure

The main store is in `lib/store/index.ts`:

```typescript
interface AppState {
  // Data
  ingredients: Ingredient[];
  categories: Category[];
  mealTypes: MealType[];
  mealLogs: MealLog[];
  suggestedCombinations: Ingredient[][];

  // UI State
  isDatabaseReady: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  // ... (see below)
}
```

## State Properties

### Data State

| Property | Type | Description |
|----------|------|-------------|
| `ingredients` | `Ingredient[]` | All ingredients from database |
| `categories` | `Category[]` | All categories |
| `mealTypes` | `MealType[]` | All meal types |
| `mealLogs` | `MealLog[]` | Recent meal history |
| `suggestedCombinations` | `Ingredient[][]` | Current meal suggestions |

### UI State

| Property | Type | Description |
|----------|------|-------------|
| `isDatabaseReady` | `boolean` | True when database initialized |
| `isLoading` | `boolean` | True during async operations |
| `error` | `string | null` | Error message if any |

## Actions

### Database Initialization

| Action | Description |
|--------|-------------|
| `setDatabaseReady(ready)` | Mark database as ready/not ready |

### Ingredient Actions

| Action | Description |
|--------|-------------|
| `loadIngredients()` | Fetch all ingredients from database |
| `addIngredient(data)` | Add new ingredient |
| `updateIngredient(id, data)` | Update existing ingredient |
| `toggleIngredientActive(id)` | Toggle active/inactive status |
| `deleteIngredient(id)` | Delete ingredient |

### Category Actions

| Action | Description |
|--------|-------------|
| `loadCategories()` | Fetch all categories from database |
| `addCategory(name)` | Add new category |
| `updateCategory(id, name)` | Rename category |
| `deleteCategory(id)` | Delete category (if no ingredients) |

### Meal Type Actions

| Action | Description |
|--------|-------------|
| `loadMealTypes()` | Fetch all meal types from database |
| `addMealType(data)` | Add new meal type |
| `updateMealType(id, data)` | Update meal type settings |
| `deleteMealType(id)` | Delete meal type (if no logs) |

### Meal Log Actions

| Action | Description |
|--------|-------------|
| `loadMealLogs(days)` | Fetch recent meal logs |
| `logMeal(meal)` | Log a new meal |

### Suggestion Actions

| Action | Description |
|--------|-------------|
| `generateMealSuggestions(mealType, count)` | Generate meal suggestions |

## Usage Examples

### Reading State in Components

```typescript
import { useAppStore } from '@/lib/store';

function HomeScreen() {
  const mealTypes = useAppStore((state) => state.mealTypes);
  const isLoading = useAppStore((state) => state.isLoading);

  // Render...
}
```

### Calling Actions

```typescript
import { useAppStore } from '@/lib/store';

function MealTypeSettings() {
  const updateMealType = useAppStore((state) => state.updateMealType);

  const handleSave = async () => {
    await updateMealType(mealTypeId, {
      min_ingredients: 3,
      max_ingredients: 5,
      cooldown_days: 2
    });
  };
}
```

### Subscribing to Multiple Values

```typescript
// Shallow comparison for object selections
import { useAppStore } from '@/lib/store';
import { useShallow } from 'zustand/shallow';

function Component() {
  const { ingredients, isLoading } = useAppStore(
    useShallow((state) => ({
      ingredients: state.ingredients,
      isLoading: state.isLoading
    }))
  );
}
```

## Data Flow

```
User Action (e.g., add ingredient)
         |
         v
+------------------+
|  Component calls |
|  store action    |
+--------+---------+
         |
         v
+------------------+
|  Action calls    |
|  database layer  |
+--------+---------+
         |
         v
+------------------+
|  Database update |
+--------+---------+
         |
         v
+------------------+
|  Action updates  |
|  store state     |
+--------+---------+
         |
         v
+------------------+
|  Components      |
|  re-render       |
+------------------+
```

## Best Practices

1. **Select only what you need** - Use selectors to avoid unnecessary re-renders
2. **Actions are async** - Most actions interact with the database
3. **Error handling** - Check `error` state and handle gracefully
4. **Loading states** - Show feedback during `isLoading`

## Related Documentation

- [System Overview](./SYSTEM_OVERVIEW.md)
- [Database Schema](./DATABASE_SCHEMA.md)

# Architecture Rules

This document describes the architecture rules enforced in SaborSpin to maintain clean code structure and prevent architectural drift.

## Overview

SaborSpin uses two complementary tools for architecture enforcement:

1. **dependency-cruiser** - CI validation and visualization
2. **eslint-plugin-boundaries** - Real-time IDE feedback

Both tools enforce the same layer boundaries, providing defense in depth.

## Architecture Layers

```
┌─────────────────────────────────────────────────┐
│  UI LAYER (app/, components/)                   │
│  - Screens, components, hooks                   │
│  ↓ imports from                                 │
├─────────────────────────────────────────────────┤
│  STATE LAYER (lib/store/)                       │
│  - Zustand store (central hub)                  │
│  ↓ imports from                                 │
├─────────────────────────────────────────────────┤
│  BUSINESS LOGIC (lib/business-logic/)           │
│  - Pure functions (combinationGenerator, etc.)  │
│  ↓ imports from                                 │
├─────────────────────────────────────────────────┤
│  DATA LAYER (lib/database/)                     │
│  - CRUD operations, adapters, validation        │
│  ↓ imports from                                 │
├─────────────────────────────────────────────────┤
│  TYPES (types/)                                 │
│  - Shared TypeScript definitions                │
└─────────────────────────────────────────────────┘
│  TELEMETRY (lib/telemetry/) - Cross-cutting     │
│  - Can be imported from any layer               │
└─────────────────────────────────────────────────┘
```

## Layer Boundaries

| From Layer | Can Import | Cannot Import |
|------------|------------|---------------|
| **app/** (screens) | store, telemetry, components, types, hooks, constants, i18n | database, business-logic |
| **components/** | telemetry, types, hooks, constants, i18n | store, database, business-logic |
| **lib/store/** | database, business-logic, telemetry, types | app, components |
| **lib/business-logic/** | types, telemetry | database, store, app, components |
| **lib/database/** | types, telemetry | store, business-logic, app, components |
| **lib/telemetry/** | external packages only | all app code |
| **types/** | nothing | all |

## Rules Explained

### 1. screens-through-store

**Rule:** Screens must access data through the store, not database directly.

**Why:** This ensures:
- Consistent state management
- Single source of truth
- Easier testing (mock store, not database)
- Clear data flow

**Bad:**
```typescript
// app/(tabs)/index.tsx
import { getAllIngredients } from '../lib/database/ingredients'; // ❌ ERROR
```

**Good:**
```typescript
// app/(tabs)/index.tsx
import { useStore } from '../lib/store'; // ✅ OK

const ingredients = useStore((state) => state.ingredients);
```

**Exception:** `app/_layout.tsx` is allowed to import database for one-time app initialization.

### 2. components-presentational

**Rule:** Components cannot import store, database, or business logic.

**Why:** Components should be:
- Reusable and portable
- Easy to test in isolation
- Receive all data via props
- Have no side effects

**Bad:**
```typescript
// components/IngredientCard.tsx
import { useStore } from '../lib/store'; // ❌ ERROR
```

**Good:**
```typescript
// components/IngredientCard.tsx
interface Props {
  ingredient: Ingredient;
  onPress: () => void;
}
export function IngredientCard({ ingredient, onPress }: Props) { // ✅ OK
  // ...
}
```

### 3. business-logic-pure

**Rule:** Business logic cannot access database or store.

**Why:** Business logic should be:
- Pure functions (same input = same output)
- Easy to unit test
- Independent of data source
- Reusable across platforms

**Bad:**
```typescript
// lib/business-logic/combinationGenerator.ts
import { getAllIngredients } from '../database/ingredients'; // ❌ ERROR
```

**Good:**
```typescript
// lib/business-logic/combinationGenerator.ts
export function generateCombinations(ingredients: Ingredient[]) { // ✅ OK
  // Pure function, receives data as parameter
}
```

### 4. database-independent

**Rule:** Database layer cannot depend on store or business logic.

**Why:** The database layer should:
- Handle only data persistence
- Be independent of business rules
- Be testable with mocks
- Work without the rest of the app

### 5. telemetry-independent

**Rule:** Telemetry cannot depend on app-specific code.

**Why:** Telemetry is cross-cutting:
- Must work without any specific feature
- Can be imported from anywhere
- Should never import app code

### 6. no-circular

**Rule:** No circular dependencies anywhere.

**Why:** Circular dependencies:
- Make code hard to understand
- Cause initialization order issues
- Indicate poor architecture

## Running Architecture Checks

### Check for violations

```bash
npm run arch:test
```

Output on success:
```
✔ no dependency violations found (120 modules, 274 dependencies cruised)
```

Output on failure:
```
error screens-through-store: app/some-screen.tsx → lib/database/ingredients.ts
```

### Generate architecture diagram

```bash
# Generate DOT file
npm run arch:graph

# Convert to SVG (requires Graphviz)
dot -Tsvg architecture.dot -o architecture.svg

# Or use online converter:
# https://dreampuf.github.io/GraphvizOnline/
```

### Generate HTML report

```bash
npm run arch:report
# Opens reports/architecture/index.html
```

## Fixing Violations

### Screen importing database directly

**Error:** `screens-through-store: app/foo.tsx → lib/database/bar.ts`

**Fix:**
1. Move the database call to the store
2. Add a store action that calls the database
3. Import from store instead

```typescript
// Before (violation)
import { getData } from '../lib/database/data';
const data = await getData();

// After (fixed)
import { useStore } from '../lib/store';
const { loadData, data } = useStore((s) => ({ loadData: s.loadData, data: s.data }));
useEffect(() => { loadData(); }, []);
```

### Component importing store

**Error:** `components-no-store: components/Foo.tsx → lib/store/index.ts`

**Fix:**
1. Add props for the data needed
2. Pass data from parent screen

```typescript
// Before (violation)
function MyComponent() {
  const data = useStore((s) => s.data);
  return <Text>{data}</Text>;
}

// After (fixed)
function MyComponent({ data }: { data: string }) {
  return <Text>{data}</Text>;
}
```

### Business logic importing database

**Error:** `business-logic-pure: lib/business-logic/foo.ts → lib/database/bar.ts`

**Fix:**
1. Accept data as a parameter instead of fetching it
2. Let the store coordinate database access

```typescript
// Before (violation)
export async function processData() {
  const data = await fetchFromDatabase();
  return transform(data);
}

// After (fixed)
export function processData(data: DataType[]) {
  return transform(data);
}
```

## Configuration Files

- **dependency-cruiser:** `.dependency-cruiser.cjs`
- **ESLint boundaries:** `eslint.config.js`

## CI Integration

Architecture checks run automatically on:
- Every push to `main` or `develop`
- Every pull request to `main`

PRs with architecture violations will fail CI.

## Adding New Rules

To add a new rule, update both:

1. `.dependency-cruiser.cjs` - Add to `forbidden` array
2. `eslint.config.js` - Add to `boundaries/element-types` rules

Example adding a new layer:

```javascript
// .dependency-cruiser.cjs
{
  name: 'new-layer-rule',
  severity: 'error',
  comment: 'Description of the rule',
  from: { path: '^new-layer/' },
  to: { path: '^forbidden-layer/' }
}
```

## References

- [dependency-cruiser documentation](https://github.com/sverweij/dependency-cruiser)
- [eslint-plugin-boundaries documentation](https://github.com/javierbrea/eslint-plugin-boundaries)
- [Clean Architecture principles](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

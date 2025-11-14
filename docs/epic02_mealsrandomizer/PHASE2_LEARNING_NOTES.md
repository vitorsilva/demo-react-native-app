# Phase 2 Learning Notes: State Management & Core Logic

## Overview
This document captures all the concepts, questions, and explanations from Phase 2 of Epic 2 - building intelligent meal suggestion algorithms with state management.

**Phase Duration:** 2 sessions (2025-01-13 to 2025-01-14)
**Status:** 🔄 IN PROGRESS (65% complete)

---

## Table of Contents
1. [State Management with Zustand](#state-management-with-zustand)
2. [Pure Functions](#pure-functions)
3. [Test-Driven Development (TDD)](#test-driven-development-tdd)
4. [Algorithm Design](#algorithm-design)
5. [Array Methods & Functional Programming](#array-methods--functional-programming)
6. [TypeScript Advanced Concepts](#typescript-advanced-concepts)
7. [Date Math & Time Calculations](#date-math--time-calculations)
8. [Architecture Patterns](#architecture-patterns)

---

## State Management with Zustand

### Why State Management?

**Q: Why do we need global state management like Zustand?**

**A: Sharing Data Between Components Without Prop Drilling**

**The Problem: Prop Drilling**
```typescript
// HomeScreen needs ingredient count
<HomeScreen ingredients={ingredients} />

// But ingredients come from database
// So every component in the tree must pass it down:

<App>
  <Layout ingredients={ingredients}>
    <TabNavigator ingredients={ingredients}>
      <HomeScreen ingredients={ingredients} />
    </TabNavigator>
  </Layout>
</App>

// Every intermediate component must know about ingredients!
// ❌ Tedious, error-prone, hard to maintain
```

**The Solution: Global State**
```typescript
// Store holds the data
const useStore = create(() => ({
  ingredients: []
}));

// Any component can access it directly
function HomeScreen() {
  const ingredients = useStore(state => state.ingredients);
  // ✅ No prop drilling!
}
```

**When to Use Global State:**
- ✅ Data needed by many components
- ✅ Data that changes over time
- ✅ User actions affect multiple parts of UI
- ✅ Avoid prop drilling

**When NOT to Use Global State:**
- ❌ Data only used in one component (use `useState`)
- ❌ Derived data (use `useMemo` instead)
- ❌ Temporary UI state (modal open/closed)

---

### Zustand vs Other Solutions

**Q: Why Zustand instead of Redux or Context API?**

**A: Simplicity + Performance**

**Redux:**
```typescript
// ❌ Lots of boilerplate
const INCREMENT = 'INCREMENT';

function counterReducer(state = 0, action) {
  switch (action.type) {
    case INCREMENT:
      return state + 1;
    default:
      return state;
  }
}

const store = createStore(counterReducer);
```

**Context API:**
```typescript
// ❌ Requires provider wrapper + custom hooks
const IngredientsContext = createContext();

function IngredientsProvider({ children }) {
  const [ingredients, setIngredients] = useState([]);
  return (
    <IngredientsContext.Provider value={{ ingredients, setIngredients }}>
      {children}
    </IngredientsContext.Provider>
  );
}

// ❌ Re-renders all consumers even if data they don't care about changes
```

**Zustand:**
```typescript
// ✅ Minimal boilerplate
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}));

// ✅ No provider needed
// ✅ Selective subscriptions (no unnecessary re-renders)
// ✅ Easy to understand
```

**Benefits:**
```
✅ No provider wrapper needed
✅ Minimal boilerplate
✅ Selective subscriptions (performance)
✅ DevTools support
✅ Middleware support
✅ TypeScript-first
```

---

### Selective Subscriptions

**Q: What are selective subscriptions and why do they matter?**

**A: Performance Optimization Through Granular Updates**

**Without Selective Subscriptions (Context API):**
```typescript
// Context holds multiple values
const AppContext = createContext({
  ingredients: [],
  mealLogs: [],
  settings: {}
});

// Component subscribes to EVERYTHING
function HomeScreen() {
  const { ingredients } = useContext(AppContext);
  // ❌ Re-renders when mealLogs change
  // ❌ Re-renders when settings change
  // Even though we only use ingredients!
}
```

**With Selective Subscriptions (Zustand):**
```typescript
const useStore = create((set) => ({
  ingredients: [],
  mealLogs: [],
  settings: {}
}));

// Component subscribes to ONLY ingredients
function HomeScreen() {
  const ingredients = useStore(state => state.ingredients);
  // ✅ Only re-renders when ingredients change
  // ✅ mealLogs change? No re-render
  // ✅ settings change? No re-render
}
```

**Selector Function:**
```typescript
// This is the selector
(state => state.ingredients)

// Zustand calls it like:
const selector = (state) => state.ingredients;
const currentValue = selector(storeState);

// On every state change, Zustand compares:
if (previousValue !== currentValue) {
  // Re-render component
}
```

**Multiple Selectors (Performance Pattern):**
```typescript
// ❌ Bad: Single selector for everything
function HomeScreen() {
  const state = useStore();  // Subscribes to ALL state
  const count = state.ingredients.length;
  // Re-renders on ANY state change
}

// ✅ Good: Specific selectors
function HomeScreen() {
  const ingredients = useStore(state => state.ingredients);
  const isLoading = useStore(state => state.isLoading);
  const error = useStore(state => state.error);

  // Only re-renders when ingredients, isLoading, or error change
}
```

**Mental Model:**
> "Tell Zustand: wake me up ONLY when THIS specific data changes"

---

### Actions in Zustand

**Q: What are actions and how do they work?**

**A: Functions That Modify State**

**Defining Actions:**
```typescript
const useStore = create((set, get) => ({
  // State
  ingredients: [],
  isLoading: false,

  // Actions
  loadIngredients: async () => {
    set({ isLoading: true });  // Update state

    const data = await getAllIngredients();

    set({
      ingredients: data,
      isLoading: false
    });
  },

  addIngredient: async (ingredient) => {
    const newIngredient = await addIngredient(ingredient);

    // Access current state with get()
    const current = get().ingredients;

    set({
      ingredients: [...current, newIngredient]
    });
  }
}));
```

**Using Actions:**
```typescript
function HomeScreen() {
  // Get action from store
  const loadIngredients = useStore(state => state.loadIngredients);

  useEffect(() => {
    loadIngredients();  // Call action
  }, []);
}
```

**set() Function:**
```typescript
// Merge update (shallow)
set({ isLoading: true });  // Only updates isLoading

// Replace update
set({ isLoading: true }, true);  // Replaces entire state

// Function update (access current state)
set((state) => ({
  count: state.count + 1
}));
```

**get() Function:**
```typescript
// Access current state inside actions
const currentIngredients = get().ingredients;
const isReady = get().isDatabaseReady;

// Useful when one action needs to read state
// without triggering component re-renders
```

---

### useEffect and Dependency Arrays

**Q: How does `useEffect` work and what's the dependency array for?**

**A: Running Side Effects at the Right Time**

**Basic Syntax:**
```typescript
useEffect(effectFunction, dependencyArray)
```

**The Effect Function:**
```typescript
useEffect(() => {
  // This code runs AFTER render
  console.log('Component rendered!');

  // Optional cleanup
  return () => {
    console.log('Component unmounting or effect re-running');
  };
}, []);
```

**The Dependency Array:**
```typescript
// Empty array: Run once on mount
useEffect(() => {
  console.log('Runs once when component mounts');
}, []);

// No array: Run on every render (usually bad!)
useEffect(() => {
  console.log('Runs after EVERY render');
});

// With dependencies: Run when dependencies change
useEffect(() => {
  console.log('Count changed:', count);
}, [count]);

// Multiple dependencies
useEffect(() => {
  loadData(userId, filterType);
}, [userId, filterType]);
```

**Common Misconception:**
```typescript
// ❌ Student thought this was "the data loaded by Zustand"
const loadIngredients = useStore(state => state.loadIngredients);
useEffect(() => {
  loadIngredients();
}, [loadIngredients]);

// ✅ Actually: It's the function reference itself
// React watches: "Did the function reference change?"
// In Zustand, function references are stable (don't change)
// So this effect runs once on mount
```

**Dependency Array is NOT the data itself:**
```typescript
// It's a list of VALUES TO WATCH
[count, userId, filterType]

// React compares:
// previousCount === currentCount ?
// previousUserId === currentUserId ?
// If any changed → re-run effect
```

**Real Example from Our Code:**
```typescript
const isDatabaseReady = useStore(state => state.isDatabaseReady);
const loadIngredients = useStore(state => state.loadIngredients);

useEffect(() => {
  if (isDatabaseReady) {
    loadIngredients();
  }
}, [isDatabaseReady, loadIngredients]);

// Watches: isDatabaseReady
// When it changes from false → true: re-run effect
// Then load ingredients
```

---

## Pure Functions

### What is a Pure Function?

**Q: What makes a function "pure"?**

**A: Same Input = Same Output, No Side Effects**

**Pure Function:**
```typescript
// ✅ Pure: Same input always gives same output
function add(a: number, b: number): number {
  return a + b;
}

add(2, 3);  // Always returns 5
add(2, 3);  // Always returns 5

// ✅ Pure: No side effects
function double(arr: number[]): number[] {
  return arr.map(x => x * 2);  // Returns new array
}
```

**Impure Function:**
```typescript
// ❌ Impure: Mutates external state
let total = 0;
function addToTotal(value: number) {
  total += value;  // Side effect: modifies external variable
}

// ❌ Impure: Same input, different output
function random() {
  return Math.random();  // Different result each time
}

// ❌ Impure: Side effects (database call)
async function getUser(id: string) {
  return await db.users.findOne({ id });  // I/O operation
}
```

**Characteristics of Pure Functions:**
```
✅ Deterministic (predictable)
✅ No side effects
✅ No mutations
✅ No I/O (network, database, files)
✅ No random values
✅ No Date.now() or similar
```

---

### Benefits of Pure Functions

**Q: Why should we prefer pure functions?**

**A: Easier to Test, Understand, and Debug**

**1. Easy to Test:**
```typescript
// ✅ Pure function: Easy to test
function calculateTotal(prices: number[]): number {
  return prices.reduce((sum, price) => sum + price, 0);
}

test('calculates total', () => {
  expect(calculateTotal([10, 20, 30])).toBe(60);
  // No setup needed, no mocking, just call and assert
});
```

**2. No Setup/Teardown:**
```typescript
// ❌ Impure function: Complex test setup
async function loadUserFromDB(id: string) {
  const db = getDatabase();
  return await db.users.findOne({ id });
}

test('loads user', async () => {
  // Need to setup database
  const db = await setupTestDatabase();
  await db.users.insert({ id: '1', name: 'Test' });

  // Run test
  const user = await loadUserFromDB('1');

  // Cleanup
  await teardownTestDatabase(db);
});
```

**3. Predictable:**
```typescript
// ✅ Always know what you'll get
const result1 = add(2, 3);  // 5
const result2 = add(2, 3);  // 5
// Same input = same output (always)

// ❌ Unpredictable
const result1 = Math.random();  // 0.234
const result2 = Math.random();  // 0.891
// Same input (none) = different output
```

**4. Cacheable:**
```typescript
// ✅ Can cache results (memoization)
function expensiveCalculation(data: Data): Result {
  // Pure function result can be cached
  // Same input = same output
}

const cache = new Map();
function memoized(data: Data): Result {
  if (cache.has(data)) {
    return cache.get(data);  // Return cached result
  }
  const result = expensiveCalculation(data);
  cache.set(data, result);
  return result;
}
```

**5. Easy to Reason About:**
```typescript
// ✅ Just look at function signature
function generateCombinations(
  ingredients: Ingredient[],
  count: number,
  blockedIds: string[]
): Ingredient[][] {
  // Input: ingredients, count, blockedIds
  // Output: array of combinations
  // No surprises, no hidden dependencies
}

// ❌ Hidden dependencies
function generateCombinations() {
  const ingredients = store.getIngredients();  // Where did this come from?
  const count = config.defaultCount;           // What's config?
  const blocked = fetchRecentMeals();          // Database call!
  // ...
}
```

---

### Avoiding Mutations

**Q: What are mutations and why are they bad?**

**A: Changing Existing Data Instead of Creating New Data**

**Mutation (Bad):**
```typescript
// ❌ Mutates original array
function addItem(arr: number[], item: number) {
  arr.push(item);  // Modifies arr
  return arr;
}

const original = [1, 2, 3];
const result = addItem(original, 4);

console.log(original);  // [1, 2, 3, 4] - Changed!
console.log(result);    // [1, 2, 3, 4] - Same array
```

**Immutability (Good):**
```typescript
// ✅ Creates new array
function addItem(arr: number[], item: number) {
  return [...arr, item];  // New array
}

const original = [1, 2, 3];
const result = addItem(original, 4);

console.log(original);  // [1, 2, 3] - Unchanged!
console.log(result);    // [1, 2, 3, 4] - New array
```

**Why Mutations Are Problematic:**
```typescript
// ❌ Unexpected behavior
const ingredients = ['Milk', 'Bread'];

function processIngredients(list) {
  list.sort();  // Mutates original!
  list.push('Cheese');
  return list;
}

const result = processIngredients(ingredients);

console.log(ingredients);  // ['Bread', 'Milk', 'Cheese']
// Original changed! This is a bug waiting to happen
```

**Immutable Patterns:**
```typescript
// Array operations
const original = [1, 2, 3];

// ✅ Add item
const added = [...original, 4];

// ✅ Remove item
const removed = original.filter(x => x !== 2);

// ✅ Update item
const updated = original.map(x => x === 2 ? 20 : x);

// ✅ Sort
const sorted = [...original].sort();

// Object operations
const person = { name: 'Alice', age: 30 };

// ✅ Add property
const withEmail = { ...person, email: 'alice@example.com' };

// ✅ Update property
const older = { ...person, age: 31 };

// ✅ Remove property
const { age, ...withoutAge } = person;
```

---

### Pure vs Impure in Our Code

**Q: Where do we use pure vs impure functions in the app?**

**A: Business Logic (Pure) vs Orchestration (Impure)**

**Pure Functions (Business Logic):**
```typescript
// ✅ lib/business-logic/combinationGenerator.ts
export function generateCombinations(
  ingredients: Ingredient[],
  count: number,
  recentlyUsedIds: string[]
): Ingredient[][] {
  // No database calls
  // No network requests
  // No mutations
  // Just: input → processing → output
  return combinations;
}

// ✅ lib/business-logic/varietyEngine.ts
export function getRecentlyUsedIngredients(
  mealLogs: MealLog[]
): string[] {
  // Takes data as parameter
  // No database queries
  // Pure transformation
  return uniqueIds;
}
```

**Impure Functions (Orchestration):**
```typescript
// ❌ lib/store/index.ts
generateMealSuggestions: async (count, cooldownDays) => {
  // Database call (I/O)
  const recentMealLogs = await mealLogsDb.getRecentMealLogs(cooldownDays);

  // Calls pure function
  const blockedIds = getRecentlyUsedIngredients(recentMealLogs);

  // Calls another pure function
  const combinations = generateCombinations(ingredients, count, blockedIds);

  // Modifies state (side effect)
  set({ suggestedCombinations: combinations });
}
```

**Architecture Pattern:**
```
UI (React Components)
    ↓
Store Actions (Impure - orchestration)
    ↓
Business Logic (Pure - algorithms)
    ↓
Database Layer (Impure - I/O)
```

**Why This Separation?**
```
✅ Business logic is easy to test (pure)
✅ Core algorithms work anywhere
✅ No coupling to database
✅ Can change database without changing algorithms
✅ Can change UI without changing algorithms
```

---

## Test-Driven Development (TDD)

### The Red-Green-Refactor Cycle

**Q: What is Test-Driven Development?**

**A: Write Tests Before Code**

**Traditional Development:**
```
1. Write code
2. Write tests
3. Fix bugs found by tests
4. Repeat
```

**Test-Driven Development:**
```
1. Write test (fails - RED)
2. Write minimal code to pass (GREEN)
3. Refactor for quality (REFACTOR)
4. Repeat
```

**Example from Our Code:**

**🔴 RED Phase:**
```typescript
// Step 1: Write test first
test('generates 3 combinations', () => {
  const result = generateCombinations(mockIngredients, 3, []);
  expect(result).toHaveLength(3);
});

// Step 2: Create stub
export function generateCombinations() {
  return [];  // Stub - does nothing
}

// Step 3: Run test → FAILS ❌
// Expected: 3, Received: 0
```

**🟢 GREEN Phase:**
```typescript
// Step 4: Write minimal code to pass
export function generateCombinations(
  ingredients: Ingredient[],
  count: number,
  recentlyUsedIds: string[]
): Ingredient[][] {
  const combinations = [];

  for (let i = 0; i < count; i++) {
    combinations.push([ingredients[0]]);  // Hacky but passes!
  }

  return combinations;
}

// Step 5: Run test → PASSES ✅
```

**🔧 REFACTOR Phase:**
```typescript
// Step 6: Improve code quality
export function generateCombinations(
  ingredients: Ingredient[],
  count: number,
  recentlyUsedIds: string[]
): Ingredient[][] {
  // Filter blocked ingredients
  const available = ingredients.filter(
    ing => !recentlyUsedIds.includes(ing.id)
  );

  // Generate proper combinations
  const combinations = [];
  for (let i = 0; i < count; i++) {
    const comboSize = Math.floor(Math.random() * 3) + 1;
    const shuffled = shuffleArray([...available]);
    combinations.push(shuffled.slice(0, comboSize));
  }

  return combinations;
}

// Step 7: Run test → Still PASSES ✅
```

---

### Benefits of TDD

**Q: Why write tests before code?**

**A: Better Design + Confidence**

**1. Forces Good Design:**
```typescript
// TDD makes you think about:
// - What inputs does this function need?
// - What should it return?
// - What are the edge cases?

// Before writing ANY code, you write:
test('filters out recently used ingredients', () => {
  const recentlyUsed = ['milk-id', 'bread-id'];
  const result = generateCombinations(ingredients, 3, recentlyUsed);

  // This test tells us what the function should do
  result.forEach(combo => {
    combo.forEach(ingredient => {
      expect(recentlyUsed).not.toContain(ingredient.id);
    });
  });
});

// Now we know: function must accept recentlyUsedIds parameter
// and exclude those from results
```

**2. Prevents Over-Engineering:**
```typescript
// Write minimal code to pass test
// No "what if" features
// No unused complexity
// Just what's needed

// Example: First test only checks length
// So first implementation only needs to return correct length
// Don't add filtering, shuffling, etc. until tests require it
```

**3. Built-In Safety Net:**
```typescript
// Every feature has tests from day 1
// Can refactor with confidence
// Change code → run tests → know if you broke something

// Without TDD:
// Write code → maybe write tests later → maybe not
// Refactor → hope nothing broke → find out in production
```

**4. Living Documentation:**
```typescript
// Tests show how to use the function
test('generates combinations', () => {
  const result = generateCombinations(
    mockIngredients,  // Pass ingredients
    5,                // Generate 5 combos
    ['milk-id']       // Block milk
  );

  // Anyone reading this knows how to call the function!
});
```

---

### Test Quality

**Q: How do we know our tests are actually testing something?**

**A: Watch Them Fail First**

**The Problem:**
```typescript
// ❌ Test that never fails (useless!)
test('has ingredients', () => {
  const result = generateCombinations(mockIngredients, 5, []);

  // forEach on empty array = no assertions run
  result.forEach(combo => {
    expect(combo.length).toBeGreaterThan(0);
  });

  // If result = [], this test passes!
  // But it's testing nothing!
});
```

**The Solution:**
```typescript
// ✅ Test prerequisites first
test('has ingredients', () => {
  const result = generateCombinations(mockIngredients, 5, []);

  expect(result).toHaveLength(5);  // Verify array has items

  result.forEach(combo => {
    expect(combo.length).toBeGreaterThan(0);
  });

  // Now if result = [], test FAILS (good!)
});
```

**Our Discovery:**
```typescript
// Initial test (bad)
test('each combination has 1-3 ingredients', () => {
  const result = generateCombinations(mockIngredients, 5, []);

  result.forEach((combo: Ingredient[]) => {
    expect(combo.length).toBeGreaterThanOrEqual(1);
    expect(combo.length).toBeLessThanOrEqual(3);
  });
});

// When we returned [], only 1 test failed
// This test passed! (forEach on [] = no iterations)

// Fixed test (good)
test('each combination has 1-3 ingredients', () => {
  const result = generateCombinations(mockIngredients, 5, []);

  expect(result).toHaveLength(5);  // Added this!

  result.forEach((combo: Ingredient[]) => {
    expect(combo.length).toBeGreaterThanOrEqual(1);
    expect(combo.length).toBeLessThanOrEqual(3);
  });
});

// Now returns [] → test FAILS (correct!)
```

**Lesson:**
> A test that never fails is worse than no test. It gives false confidence.

---

## Algorithm Design

### Fisher-Yates Shuffle

**Q: How do you randomly shuffle an array?**

**A: Fisher-Yates Algorithm (Unbiased Shuffling)**

**Naive Approach (Biased):**
```typescript
// ❌ Sort with random comparator (WRONG!)
function badShuffle<T>(array: T[]): T[] {
  return array.sort(() => Math.random() - 0.5);
}

// Why it's wrong:
// - Sort algorithms assume transitive comparisons
// - Random comparator violates this
// - Results in biased distribution
// - Some permutations more likely than others
```

**Fisher-Yates Algorithm (Correct):**
```typescript
// ✅ Unbiased, proven algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];  // Copy to avoid mutation

  // Start from end, swap with random earlier position
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
```

**How It Works:**

```
Initial: [A, B, C, D, E]

Step 1: i=4, pick random j from 0-4 (say 2)
        Swap positions 4 and 2
        [A, B, E, D, C]
                    ↑ locked

Step 2: i=3, pick random j from 0-3 (say 0)
        Swap positions 3 and 0
        [D, B, E, A, C]
                 ↑  ↑ locked

Step 3: i=2, pick random j from 0-2 (say 1)
        Swap positions 2 and 1
        [D, E, B, A, C]
            ↑  ↑  ↑ locked

Step 4: i=1, pick random j from 0-1 (say 0)
        Swap positions 1 and 0
        [E, D, B, A, C]
         ↑  ↑  ↑  ↑  ↑ all locked

Result: [E, D, B, A, C]
```

**Why Fisher-Yates?**
```
✅ Unbiased (all permutations equally likely)
✅ O(n) time complexity (efficient)
✅ In-place algorithm (can modify original)
✅ Industry standard
✅ Mathematically proven correct
```

**Proof of Unbiased:**
```
For array of length n:
- Total permutations: n!
- Probability of any permutation: 1/n!

Fisher-Yates:
- First position: choose from n items (1/n probability)
- Second position: choose from n-1 items (1/(n-1) probability)
- Third position: choose from n-2 items (1/(n-2) probability)
- ...

Total probability: (1/n) × (1/(n-1)) × ... × (1/1) = 1/n!
```

---

### Combination Generation Strategy

**Q: How do we generate random meal combinations?**

**A: Shuffle + Slice Pattern**

**Requirements:**
1. Each combination has 1-3 ingredients
2. No duplicates within a combination
3. Recently used ingredients excluded
4. Can reuse ingredients across different combinations

**Algorithm Design:**
```typescript
function generateCombinations(
  ingredients: Ingredient[],
  count: number,
  recentlyUsedIds: string[]
): Ingredient[][] {
  // Step 1: Filter out blocked ingredients
  const available = ingredients.filter(
    ing => !recentlyUsedIds.includes(ing.id)
  );

  const combinations = [];

  // Step 2: Generate N combinations
  for (let i = 0; i < count; i++) {
    // Step 3: Random size (1-3)
    const comboSize = Math.floor(Math.random() * 3) + 1;

    // Step 4: Shuffle available ingredients
    const shuffled = shuffleArray([...available]);

    // Step 5: Take first X items
    // This guarantees no duplicates within combo
    const combo = shuffled.slice(0, Math.min(comboSize, shuffled.length));

    combinations.push(combo);
  }

  return combinations;
}
```

**Why Shuffle + Slice?**
```typescript
// Problem: Need X unique items from array
// Solution: Shuffle, then take first X

const items = ['A', 'B', 'C', 'D', 'E'];
const shuffled = shuffle(items);  // ['C', 'A', 'E', 'B', 'D']
const combo = shuffled.slice(0, 3);  // ['C', 'A', 'E']

// ✅ Random selection
// ✅ No duplicates (first 3 items from shuffled array)
// ✅ Simple to understand
// ✅ Efficient (O(n) shuffle + O(k) slice)
```

**Alternative Approaches (Why We Didn't Use Them):**

**Random Sampling with Rejection:**
```typescript
// ❌ More complex, less efficient
const combo = [];
while (combo.length < comboSize) {
  const random = ingredients[Math.floor(Math.random() * ingredients.length)];
  if (!combo.includes(random)) {
    combo.push(random);
  }
  // Could loop many times if unlucky
}
```

**Random Index Set:**
```typescript
// ❌ Works but more complex
const indices = new Set<number>();
while (indices.size < comboSize) {
  indices.add(Math.floor(Math.random() * ingredients.length));
}
const combo = Array.from(indices).map(i => ingredients[i]);
```

**Our Approach is Simpler:**
- One shuffle operation
- One slice operation
- Guaranteed to terminate
- Guaranteed no duplicates
- Easy to understand

---

## Array Methods & Functional Programming

### Array.map()

**Q: What does `.map()` do?**

**A: Transform Each Element**

**Concept:**
```typescript
// map: Apply function to each element, return new array
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(x => x * 2);
// [2, 4, 6, 8, 10]
```

**Real Examples:**
```typescript
// Extract property from objects
const ingredients = [
  { id: '1', name: 'Milk' },
  { id: '2', name: 'Bread' }
];

const names = ingredients.map(ing => ing.name);
// ['Milk', 'Bread']

const ids = ingredients.map(ing => ing.id);
// ['1', '2']

// Transform objects
const mealLogs = [
  { ingredients: ['milk-id', 'bread-id'] },
  { ingredients: ['cheese-id'] }
];

const ingredientArrays = mealLogs.map(log => log.ingredients);
// [['milk-id', 'bread-id'], ['cheese-id']]
```

**Key Points:**
```
✅ Returns NEW array (doesn't mutate original)
✅ Same length as input
✅ Each element transformed by function
✅ Chainable with other methods
```

---

### Array.flat()

**Q: What does `.flat()` do?**

**A: Flatten Nested Arrays**

**Concept:**
```typescript
// flat: Convert nested array to single dimension
const nested = [[1, 2], [3, 4], [5]];
const flattened = nested.flat();
// [1, 2, 3, 4, 5]
```

**Depth Parameter:**
```typescript
const deeplyNested = [1, [2, [3, [4, 5]]]];

deeplyNested.flat();     // [1, 2, [3, [4, 5]]] (depth 1, default)
deeplyNested.flat(2);    // [1, 2, 3, [4, 5]] (depth 2)
deeplyNested.flat(Infinity);  // [1, 2, 3, 4, 5] (all depths)
```

**Real Example from Our Code:**
```typescript
// We have array of ingredient arrays
const mealLogs = [
  { ingredients: ['milk-id', 'bread-id'] },
  { ingredients: ['cheese-id', 'apple-id'] },
  { ingredients: ['jam-id'] }
];

// Step 1: Extract arrays
const arrays = mealLogs.map(log => log.ingredients);
// [['milk-id', 'bread-id'], ['cheese-id', 'apple-id'], ['jam-id']]

// Step 2: Flatten
const allIngredients = arrays.flat();
// ['milk-id', 'bread-id', 'cheese-id', 'apple-id', 'jam-id']
```

**Mental Model:**
```
2D Array (nested):
[[1, 2],
 [3, 4],
 [5]]

1D Array (flat):
[1, 2, 3, 4, 5]
```

---

### Array.filter()

**Q: What does `.filter()` do?**

**A: Select Elements That Match Condition**

**Concept:**
```typescript
// filter: Keep only elements where predicate returns true
const numbers = [1, 2, 3, 4, 5];
const evens = numbers.filter(x => x % 2 === 0);
// [2, 4]
```

**Real Examples:**
```typescript
// Filter by condition
const ingredients = [
  { id: '1', name: 'Milk', category: 'protein' },
  { id: '2', name: 'Bread', category: 'carb' },
  { id: '3', name: 'Cheese', category: 'protein' }
];

const proteins = ingredients.filter(ing => ing.category === 'protein');
// [{ id: '1', name: 'Milk', ... }, { id: '3', name: 'Cheese', ... }]

// Filter out blocked items
const recentlyUsed = ['1', '3'];
const available = ingredients.filter(
  ing => !recentlyUsed.includes(ing.id)
);
// [{ id: '2', name: 'Bread', ... }]
```

**Key Points:**
```
✅ Returns NEW array (doesn't mutate)
✅ Can be shorter than input
✅ Only includes elements where predicate is true
✅ Preserves original order
```

---

### Set Data Structure

**Q: What is a Set and when should I use it?**

**A: Collection of Unique Values**

**Creating Sets:**
```typescript
// From array
const set = new Set([1, 2, 3, 2, 1]);
console.log(set);  // Set { 1, 2, 3 } - duplicates removed!

// Empty set
const empty = new Set<string>();

// From another iterable
const set2 = new Set('hello');  // Set { 'h', 'e', 'l', 'o' }
```

**Set Operations:**
```typescript
const set = new Set<string>();

// Add items
set.add('apple');
set.add('banana');
set.add('apple');  // Duplicate ignored
console.log(set);  // Set { 'apple', 'banana' }

// Check membership
set.has('apple');   // true
set.has('cherry');  // false

// Remove items
set.delete('apple');  // true (was present)
set.delete('cherry'); // false (not present)

// Size
set.size;  // 1

// Clear all
set.clear();
```

**Converting Set to Array:**
```typescript
const set = new Set([1, 2, 3]);

// Method 1: Array.from()
const arr1 = Array.from(set);  // [1, 2, 3]

// Method 2: Spread operator
const arr2 = [...set];  // [1, 2, 3]
```

**Real Example - Removing Duplicates:**
```typescript
// We have ingredient IDs from multiple meals
const mealLogs = [
  { ingredients: ['milk-id', 'bread-id'] },
  { ingredients: ['milk-id', 'cheese-id'] },  // milk-id repeats!
  { ingredients: ['bread-id', 'jam-id'] }      // bread-id repeats!
];

// Extract all IDs (with duplicates)
const allIds = mealLogs
  .map(log => log.ingredients)
  .flat();
// ['milk-id', 'bread-id', 'milk-id', 'cheese-id', 'bread-id', 'jam-id']

// Remove duplicates with Set
const uniqueIds = Array.from(new Set(allIds));
// ['milk-id', 'bread-id', 'cheese-id', 'jam-id']
```

**When to Use Set:**
```
✅ Need unique values
✅ Fast membership testing (.has() is O(1))
✅ Remove duplicates from array
✅ Track seen items

❌ Need indexed access (use Array)
❌ Need specific order (use Array)
❌ Need duplicate values (use Array)
```

---

### Method Chaining

**Q: How does method chaining work?**

**A: Each Method Returns a New Value**

**Simple Chain:**
```typescript
const numbers = [1, 2, 3, 4, 5];

const result = numbers
  .filter(x => x % 2 === 0)  // [2, 4]
  .map(x => x * 2)           // [4, 8]
  .slice(0, 1);              // [4]
```

**Real Example from Our Code:**
```typescript
// Extract unique ingredient IDs from meal logs
const uniqueIds = Array.from(
  new Set(
    mealLogs
      .map(log => log.ingredients)  // Step 1: Extract arrays
      .flat()                       // Step 2: Flatten to 1D
  )
);

// Reading from inside out:
// 1. mealLogs.map(...) → array of arrays
// 2. .flat() → single array (with duplicates)
// 3. new Set(...) → Set (duplicates removed)
// 4. Array.from(...) → array (converted back)
```

**Step-by-Step Visualization:**
```typescript
const mealLogs = [
  { ingredients: ['milk', 'bread'] },
  { ingredients: ['milk', 'cheese'] }
];

// Step 1: map
mealLogs.map(log => log.ingredients)
// [['milk', 'bread'], ['milk', 'cheese']]

// Step 2: flat
[['milk', 'bread'], ['milk', 'cheese']].flat()
// ['milk', 'bread', 'milk', 'cheese']

// Step 3: Set
new Set(['milk', 'bread', 'milk', 'cheese'])
// Set { 'milk', 'bread', 'cheese' }

// Step 4: Array.from
Array.from(Set { 'milk', 'bread', 'cheese' })
// ['milk', 'bread', 'cheese']
```

---

## TypeScript Advanced Concepts

### Generic Functions

**Q: What does `<T>` mean in function signatures?**

**A: Type Parameters (Variables for Types)**

**Without Generics (Duplicate Code):**
```typescript
// ❌ Need separate function for each type
function shuffleNumbers(array: number[]): number[] {
  // ... shuffle logic
}

function shuffleStrings(array: string[]): string[] {
  // ... same shuffle logic
}

function shuffleIngredients(array: Ingredient[]): Ingredient[] {
  // ... same shuffle logic
}
```

**With Generics (Reusable):**
```typescript
// ✅ One function for all types
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

// Works with any type!
const numbers = shuffleArray<number>([1, 2, 3]);
const strings = shuffleArray<string>(['a', 'b', 'c']);
const ingredients = shuffleArray<Ingredient>(allIngredients);
```

**Type Inference:**
```typescript
// TypeScript can often infer the type
const numbers = shuffleArray([1, 2, 3]);
// TypeScript knows: T = number

const strings = shuffleArray(['a', 'b']);
// TypeScript knows: T = string

// Explicit when needed
const result = shuffleArray<Ingredient>(ingredients);
```

**How It Works:**
```typescript
// <T> is like a variable for types
function identity<T>(value: T): T {
  return value;
}

// When you call it:
identity<number>(42);
// T is replaced with number
// Becomes: function identity(value: number): number

identity<string>('hello');
// T is replaced with string
// Becomes: function identity(value: string): string
```

**Multiple Type Parameters:**
```typescript
function pair<A, B>(first: A, second: B): [A, B] {
  return [first, second];
}

const result = pair<number, string>(1, 'hello');
// [1, 'hello'] with type [number, string]
```

**Constraints:**
```typescript
// T must have a length property
function logLength<T extends { length: number }>(item: T): void {
  console.log(item.length);
}

logLength('hello');      // ✅ string has length
logLength([1, 2, 3]);    // ✅ array has length
logLength({ length: 5 }); // ✅ object has length
logLength(42);           // ❌ number doesn't have length
```

---

### Spread Operator (...)

**Q: What does `...` (spread operator) do?**

**A: Expands Arrays/Objects into Individual Elements**

**Array Spreading:**
```typescript
// Copy array
const original = [1, 2, 3];
const copy = [...original];

original[0] = 99;
console.log(original);  // [99, 2, 3]
console.log(copy);      // [1, 2, 3] - Not affected!

// Concatenate arrays
const arr1 = [1, 2];
const arr2 = [3, 4];
const combined = [...arr1, ...arr2];  // [1, 2, 3, 4]

// Add items
const withExtra = [...original, 4, 5];  // [1, 2, 3, 4, 5]
const withPrefix = [0, ...original];    // [0, 1, 2, 3]
```

**Object Spreading:**
```typescript
// Copy object
const person = { name: 'Alice', age: 30 };
const copy = { ...person };

// Add properties
const withEmail = { ...person, email: 'alice@example.com' };
// { name: 'Alice', age: 30, email: 'alice@example.com' }

// Override properties
const older = { ...person, age: 31 };
// { name: 'Alice', age: 31 }

// Merge objects
const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };
const merged = { ...obj1, ...obj2 };
// { a: 1, b: 2, c: 3, d: 4 }
```

**Function Arguments:**
```typescript
// Spread array as arguments
const numbers = [1, 2, 3];
Math.max(...numbers);  // Same as: Math.max(1, 2, 3)

// Rest parameters (opposite of spread)
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

sum(1, 2, 3, 4, 5);  // Collects all args into array
```

**Why Spread for Immutability:**
```typescript
// ❌ Mutation
function addItem(arr: number[], item: number) {
  arr.push(item);  // Modifies original
  return arr;
}

// ✅ Immutable
function addItem(arr: number[], item: number) {
  return [...arr, item];  // New array
}
```

---

### Array Destructuring

**Q: What is array destructuring?**

**A: Extract Values from Arrays Using Pattern Matching**

**Basic Destructuring:**
```typescript
// Traditional way
const arr = [1, 2, 3];
const first = arr[0];
const second = arr[1];

// Destructuring (concise!)
const [first, second] = [1, 2, 3];
console.log(first);   // 1
console.log(second);  // 2
```

**Swapping Values:**
```typescript
// Traditional swap (needs temporary variable)
let a = 1;
let b = 2;
const temp = a;
a = b;
b = temp;

// Destructuring swap (no temp variable!)
let a = 1;
let b = 2;
[a, b] = [b, a];
console.log(a);  // 2
console.log(b);  // 1
```

**How Swap Works:**
```typescript
// This line:
[a, b] = [b, a];

// Is equivalent to:
// 1. Create temporary array: [b, a]  // [2, 1]
// 2. Destructure into variables:
//    a = (temp array)[0]  // a = 2
//    b = (temp array)[1]  // b = 1
```

**Used in Fisher-Yates:**
```typescript
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    // Swap elements using destructuring
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
```

**Advanced Patterns:**
```typescript
// Skip elements
const [first, , third] = [1, 2, 3];
console.log(first);   // 1
console.log(third);   // 3

// Rest elements
const [first, ...rest] = [1, 2, 3, 4, 5];
console.log(first);   // 1
console.log(rest);    // [2, 3, 4, 5]

// Default values
const [a = 10, b = 20] = [1];
console.log(a);  // 1
console.log(b);  // 20 (default)

// Nested destructuring
const [[a, b], [c, d]] = [[1, 2], [3, 4]];
console.log(a, b, c, d);  // 1 2 3 4
```

---

## Date Math & Time Calculations

### ISO 8601 Date Format

**Q: What is ISO 8601 and why do we use it?**

**A: International Standard for Date/Time Strings**

**Format:**
```
YYYY-MM-DDTHH:mm:ss.sssZ

2025-01-14T15:30:45.123Z

Where:
- YYYY: 4-digit year (2025)
- MM: 2-digit month (01 = January)
- DD: 2-digit day (14)
- T: Separator between date and time
- HH: 2-digit hour (24-hour format)
- mm: 2-digit minute
- ss: 2-digit second
- sss: 3-digit milliseconds
- Z: UTC timezone (or +/-HH:mm for offset)
```

**Creating ISO Dates:**
```typescript
// Current date/time in UTC
const now = new Date().toISOString();
// "2025-01-14T15:30:45.123Z"

// Specific date
const date = new Date('2025-01-14').toISOString();
// "2025-01-14T00:00:00.000Z"

// From timestamp
const fromTs = new Date(1736872245123).toISOString();
```

**Parsing ISO Dates:**
```typescript
// String to Date object
const date = new Date('2025-01-14T15:30:45.123Z');

// Access components
date.getFullYear();   // 2025
date.getMonth();      // 0 (January is 0!)
date.getDate();       // 14
date.getHours();      // 15
date.getMinutes();    // 30
```

**Why ISO 8601?**
```
✅ Human readable: "2025-01-14" vs 1736872245123
✅ Sortable as strings: "2025-01-14" < "2025-01-15"
✅ Includes timezone: Z = UTC
✅ International standard
✅ JavaScript native support
✅ Database friendly
```

---

### Date Arithmetic

**Q: How do you calculate "N days ago"?**

**A: Manipulate Date Objects**

**Basic Date Math:**
```typescript
// Today
const today = new Date();

// Yesterday
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

// 3 days ago
const threeDaysAgo = new Date();
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

// Next week
const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);
```

**Calculating Cooldown Date:**
```typescript
// Get meal logs from last 3 days
function getRecentMealLogs(cooldownDays: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - cooldownDays);

  // Query: WHERE date >= cutoffDate
  return db.getAllAsync(
    'SELECT * FROM meal_logs WHERE date >= ?',
    [cutoffDate.toISOString()]
  );
}
```

**Example Walkthrough:**
```typescript
// Today: Jan 14, 2025
// cooldownDays: 3

const cutoffDate = new Date('2025-01-14');
cutoffDate.setDate(cutoffDate.getDate() - 3);
// cutoffDate = Jan 11, 2025

// Query meals from Jan 11, 12, 13 (3 days)
// Excludes Jan 14 (today)
```

**Date Comparison:**
```typescript
// ISO strings compare correctly
'2025-01-11' < '2025-01-14'  // true (earlier date)
'2025-01-15' > '2025-01-14'  // true (later date)

// Date objects compare by timestamp
const date1 = new Date('2025-01-11');
const date2 = new Date('2025-01-14');
date1 < date2;  // true
```

**Excluding Today:**
```typescript
// Query: date >= cutoffDate AND date < today
function getRecentMealLogs(cooldownDays: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);  // Start of today

  const cutoffDate = new Date(today);
  cutoffDate.setDate(cutoffDate.getDate() - cooldownDays);

  return db.getAllAsync(
    'SELECT * FROM meal_logs WHERE date >= ? AND date < ?',
    [cutoffDate.toISOString(), today.toISOString()]
  );
}
```

---

## Architecture Patterns

### Separation of Concerns

**Q: Why separate business logic from database code?**

**A: Modularity, Testability, Reusability**

**Monolithic Approach (Bad):**
```typescript
// ❌ Everything in one place
async function generateMealSuggestions(count: number, cooldownDays: number) {
  // Database query
  const db = getDatabase();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - cooldownDays);
  const mealLogs = await db.getAllAsync(
    'SELECT * FROM meal_logs WHERE date >= ?',
    [cutoffDate.toISOString()]
  );

  // Extract blocked IDs
  const blockedIds = new Set();
  for (const log of mealLogs) {
    const ingredients = JSON.parse(log.ingredients);
    for (const id of ingredients) {
      blockedIds.add(id);
    }
  }

  // Get ingredients
  const ingredients = await db.getAllAsync('SELECT * FROM ingredients');

  // Filter
  const available = ingredients.filter(
    ing => !blockedIds.has(ing.id)
  );

  // Generate combinations
  const combinations = [];
  for (let i = 0; i < count; i++) {
    // ... shuffle and slice logic
  }

  return combinations;
}

// Problems:
// ❌ Can't test algorithm without database
// ❌ Can't reuse algorithm elsewhere
// ❌ Hard to understand (too many responsibilities)
// ❌ Database, logic, and generation all mixed together
```

**Layered Approach (Good):**
```typescript
// ✅ Layer 1: Database (lib/database/mealLogs.ts)
export async function getRecentMealLogs(days: number): Promise<MealLog[]> {
  const db = getDatabase();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const rows = await db.getAllAsync(
    'SELECT * FROM meal_logs WHERE date >= ?',
    [cutoffDate.toISOString()]
  );

  return rows.map(row => ({
    id: row.id,
    date: row.date,
    mealType: row.meal_type,
    ingredients: JSON.parse(row.ingredients),
    createdAt: row.created_at
  }));
}

// ✅ Layer 2: Business Logic (lib/business-logic/varietyEngine.ts)
export function getRecentlyUsedIngredients(
  mealLogs: MealLog[]
): string[] {
  const ingredientArrays = mealLogs.map(log => log.ingredients);
  const allIngredients = ingredientArrays.flat();
  const uniqueIngredients = new Set(allIngredients);
  return Array.from(uniqueIngredients);
}

// ✅ Layer 3: Business Logic (lib/business-logic/combinationGenerator.ts)
export function generateCombinations(
  ingredients: Ingredient[],
  count: number,
  recentlyUsedIds: string[]
): Ingredient[][] {
  const available = ingredients.filter(
    ing => !recentlyUsedIds.includes(ing.id)
  );

  const combinations = [];
  for (let i = 0; i < count; i++) {
    const comboSize = Math.floor(Math.random() * 3) + 1;
    const shuffled = shuffleArray([...available]);
    combinations.push(shuffled.slice(0, comboSize));
  }

  return combinations;
}

// ✅ Layer 4: Orchestration (lib/store/index.ts)
generateMealSuggestions: async (count, cooldownDays) => {
  const { ingredients } = get();
  const recentMealLogs = await getRecentMealLogs(cooldownDays);
  const blockedIds = getRecentlyUsedIngredients(recentMealLogs);
  const combinations = generateCombinations(ingredients, count, blockedIds);
  set({ suggestedCombinations: combinations });
}
```

**Benefits:**
```
✅ Each layer has ONE responsibility
✅ Business logic is pure (easy to test)
✅ Can change database without changing algorithms
✅ Can reuse algorithms in different contexts
✅ Easy to understand (clear boundaries)
✅ Can test each layer independently
```

---

### The Three-Layer Architecture

**Q: What are the three layers in our app?**

**A: Database → Business Logic → Orchestration**

**Layer 1: Database (Data Access)**
```
Location: lib/database/

Purpose: CRUD operations on SQLite

Responsibilities:
✅ Opening database connections
✅ Executing SQL queries
✅ Transforming rows to TypeScript objects
✅ Error handling for database operations

Characteristics:
❌ Impure (I/O operations)
❌ Async (all operations return Promises)
✅ Focused (only database concerns)
```

**Layer 2: Business Logic (Pure Functions)**
```
Location: lib/business-logic/

Purpose: Core algorithms and rules

Responsibilities:
✅ Combination generation
✅ Variety enforcement
✅ Data transformation
✅ Business rules

Characteristics:
✅ Pure functions (no side effects)
✅ Synchronous (fast)
✅ Easy to test (no mocking needed)
✅ Reusable (works anywhere)
```

**Layer 3: Orchestration (State Management)**
```
Location: lib/store/

Purpose: Coordinate layers and manage state

Responsibilities:
✅ Call database layer
✅ Call business logic layer
✅ Manage application state
✅ Handle loading/error states
✅ Expose actions to UI

Characteristics:
❌ Impure (calls database)
❌ Async (coordinates async operations)
✅ Glue code (connects everything)
```

**Data Flow:**
```
User Action (UI)
    ↓
Store Action (orchestration)
    ↓
Database Query → Get Data
    ↓
Business Logic → Transform Data
    ↓
Store State Update
    ↓
UI Re-render
```

**Example Flow:**
```typescript
// User clicks "Generate Suggestions"
<Button onPress={() => generateMealSuggestions(5, 3)} />

// Store action (orchestration)
generateMealSuggestions: async (count, cooldownDays) => {
  // 1. Get current state
  const { ingredients } = get();

  // 2. Query database
  const mealLogs = await getRecentMealLogs(cooldownDays);

  // 3. Business logic (pure)
  const blockedIds = getRecentlyUsedIngredients(mealLogs);

  // 4. More business logic (pure)
  const combos = generateCombinations(ingredients, count, blockedIds);

  // 5. Update state
  set({ suggestedCombinations: combos });
}

// UI updates automatically (Zustand subscription)
```

---

## Summary: Key Takeaways

### State Management
- ✅ Zustand for simple, performant global state
- ✅ Selective subscriptions prevent unnecessary re-renders
- ✅ Actions encapsulate state updates
- ✅ `useEffect` for side effects, dependency array controls when

### Pure Functions
- ✅ Same input = same output, no side effects
- ✅ Easy to test, understand, and debug
- ✅ Avoid mutations (use spread operator, map, filter)
- ✅ Separate pure logic from I/O operations

### Test-Driven Development
- ✅ Red-Green-Refactor cycle
- ✅ Write tests before code
- ✅ Watch tests fail first (verify they work)
- ✅ Minimal code to pass, then refactor

### Algorithms
- ✅ Fisher-Yates for unbiased shuffling
- ✅ Shuffle + slice for unique random selection
- ✅ Set for removing duplicates
- ✅ O(n) time complexity preferred

### Array Methods
- ✅ `.map()` transforms each element
- ✅ `.flat()` flattens nested arrays
- ✅ `.filter()` selects matching elements
- ✅ Method chaining for clean code

### TypeScript
- ✅ Generics `<T>` for reusable functions
- ✅ Spread operator `...` for immutable operations
- ✅ Destructuring for concise variable assignment
- ✅ Type safety catches errors at compile time

### Architecture
- ✅ Three-layer architecture (Database → Logic → Orchestration)
- ✅ Separation of concerns
- ✅ Pure business logic is testable and reusable
- ✅ Store orchestrates and manages state

---

## Next: Phase 3

**Phase 3: Building the UI**

You'll learn:
- Creating beautiful React Native UI
- Connecting store to UI components
- Handling user interactions
- Displaying generated meal suggestions
- List rendering and performance

**Estimated time:** 4-5 hours

---

*Phase 2 in progress - excellent algorithm design! 🎉*

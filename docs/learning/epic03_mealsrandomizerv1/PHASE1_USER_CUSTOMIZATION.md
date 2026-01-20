# Phase 1: User Customization

[← Back to Overview](./OVERVIEW.md)

---

## 🎯 Goal

Give users complete control over their meal options by allowing them to add custom ingredients, categories, and meal types.

**Current Limitation:** The app is hardcoded with 19-22 Portuguese ingredients and only supports "breakfast" and "snack" meal types.

**After Phase 1:** Users can add their own ingredients, create categories (e.g., "Protein", "Fruit", "Dairy"), and define custom meal types (e.g., "Lunch", "Dessert").

**⚠️ IMPORTANT:** This phase includes comprehensive testing and deployment validation. Everything must work (unit tests, E2E tests, and production build) before moving to Phase 2.

**Estimated Time:** 6-8 hours (including testing and deployment validation)

---

## 📋 What You'll Build

### 1. Ingredient Management
- Add new ingredients
- Edit existing ingredients
- Delete ingredients (with safety checks)
- Enable/disable ingredients (keep in database but exclude from suggestions)
- Assign ingredients to categories

### 2. Category Management
- Create custom categories (e.g., "Protein", "Grains", "Vegetables")
- Edit category names
- Delete categories (with cascade handling)
- View ingredients per category

### 3. Meal Type Management
- Add custom meal types beyond breakfast/snack (e.g., "Lunch", "Dinner", "Dessert")
- Edit meal type names
- Delete meal types (with safety checks)
- Configure meal types (min/max ingredients, default cooldown)

---

## 🗂️ Database Schema Changes

### New Tables

#### `categories` table
```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### `meal_types` table
```sql
CREATE TABLE meal_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  min_ingredients INTEGER DEFAULT 2,
  max_ingredients INTEGER DEFAULT 4,
  default_cooldown_days INTEGER DEFAULT 3,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Modified Tables

#### Update `ingredients` table
```sql
ALTER TABLE ingredients ADD COLUMN category_id INTEGER REFERENCES categories(id);
ALTER TABLE ingredients ADD COLUMN is_active INTEGER DEFAULT 1;
ALTER TABLE ingredients ADD COLUMN is_user_added INTEGER DEFAULT 0;
```

#### Update `meal_logs` table
```sql
ALTER TABLE meal_logs ADD COLUMN meal_type_id INTEGER REFERENCES meal_types(id);
```

---

## 🛠️ Implementation Steps

### Step 1.1: Database Migrations System (1-2 hours)

**What you'll learn:** Schema versioning, safe database updates, data preservation

**Tasks:**
1. Create `lib/database/migrations.ts`
2. Implement migration runner
3. Add schema version tracking
4. Create migration for new tables
5. Handle backwards compatibility

**Key Concepts:**
- Database migrations vs direct schema changes
- Version tracking in SQLite
- Data preservation during migrations
- Rollback strategies

---

### Step 1.2: Category CRUD Operations (1 hour)

**What you'll learn:** Creating reusable database operations

**Tasks:**
1. Create `lib/database/categories.ts`
2. Implement:
   - `createCategory(name: string)`
   - `getCategories()`
   - `updateCategory(id: number, name: string)`
   - `deleteCategory(id: number)` (check for ingredients first!)
3. Add tests in `__tests__/categories.test.ts`

**Key Concepts:**
- Foreign key constraints
- Cascade delete vs restrict
- Transaction handling

---

### Step 1.3: Meal Type CRUD Operations (1 hour)

**What you'll learn:** Managing configurable settings

**Tasks:**
1. Create `lib/database/mealTypes.ts`
2. Implement:
   - `createMealType(params: MealTypeParams)`
   - `getMealTypes(activeOnly?: boolean)`
   - `updateMealType(id: number, params: Partial<MealTypeParams>)`
   - `deleteMealType(id: number)` (check for meal logs first!)
3. Add tests in `__tests__/mealTypes.test.ts`
4. Seed default meal types (breakfast, snack)

---

### Step 1.4: Enhanced Ingredient Operations (1 hour)

**What you'll learn:** Extending existing functionality

**Tasks:**
1. Update `lib/database/ingredients.ts`
2. Add:
   - `createIngredient(name: string, categoryId?: number)`
   - `toggleIngredientActive(id: number)`
   - `getIngredientsByCategory(categoryId: number)`
   - `updateIngredient(id: number, params: Partial<Ingredient>)`
3. Update seed function to use categories
4. Add tests for new functionality

---

### Step 1.5: Zustand Store Updates (30 min)

**What you'll learn:** State management for new data

**Tasks:**
1. Update `lib/store/index.ts`
2. Add state:
   - `categories: Category[]`
   - `mealTypes: MealType[]`
3. Add actions:
   - `loadCategories()`
   - `loadMealTypes()`
   - `addCategory(name: string)`
   - `addMealType(params: MealTypeParams)`
4. Update existing actions to use new schema

---

### Step 1.6: Manage Ingredients Screen (2 hours)

**What you'll learn:** Complex forms with validation

**Tasks:**
1. Create `app/(tabs)/manage-ingredients.tsx`
2. Features:
   - List all ingredients (with active/inactive indicator)
   - Filter by category
   - Add new ingredient (form with category dropdown)
   - Edit ingredient (inline or modal)
   - Toggle active/inactive
   - Delete ingredient (with confirmation)
3. Handle empty states
4. Add loading states
5. Add error handling

**UI Components:**
- FlatList with sections (by category)
- Switch for active/inactive toggle
- Modal for add/edit form
- Delete confirmation alert

---

### Step 1.7: Manage Categories Screen (1 hour)

**What you'll learn:** Simple CRUD UI patterns

**Tasks:**
1. Create `app/(tabs)/manage-categories.tsx`
2. Features:
   - List all categories
   - Show ingredient count per category
   - Add new category
   - Rename category (inline edit)
   - Delete category (with safety check)
3. Handle empty states
4. Show "cannot delete" message if category has ingredients

**UI Components:**
- FlatList
- TextInput for inline edit
- Modal for add form
- Alert for delete confirmation

---

### Step 1.8: Meal Type Configuration (1 hour)

**What you'll learn:** Settings UI with sliders and toggles

**Tasks:**
1. Add to `app/(tabs)/settings.tsx` (or create new screen)
2. Features:
   - List meal types
   - Toggle active/inactive
   - Configure min/max ingredients (slider)
   - Configure default cooldown (slider)
   - Add new meal type
   - Delete meal type (with safety check)

**UI Components:**
- Switch for active toggle
- Slider for numeric values
- Labels showing current values
- Modal for add form

---

### Step 1.9: Update Suggestions Flow (1 hour)

**What you'll learn:** Dynamic routing with custom data

**Tasks:**
1. Update `app/suggestions/[mealType].tsx`
2. Support custom meal types (not just breakfast/snack)
3. Use meal type configuration (min/max ingredients, cooldown)
4. Update home screen to show all active meal types
5. Generate buttons dynamically from database

**Key Changes:**
- Load meal types from database
- Map meal type IDs to routes
- Apply meal type configuration to algorithm
- Update navigation params

---

### Step 1.10: Data Validation & Safety (30 min)

**What you'll learn:** Protecting data integrity

**Tasks:**
1. Add validation functions in `lib/database/validation.ts`
2. Validate:
   - Unique ingredient names
   - Unique category names
   - Unique meal type names
   - Min ingredients <= max ingredients
   - Cooldown days >= 0
3. Prevent deletion of:
   - Categories with ingredients
   - Meal types with meal logs
   - Last active ingredient
4. Add helpful error messages

---

### Step 1.11: Update Algorithm (30 min)

**What you'll learn:** Making algorithms data-driven

**Tasks:**
1. Update `lib/business-logic/combinationGenerator.ts`
2. Filter inactive ingredients
3. Use meal type configuration for min/max
4. Update `lib/business-logic/varietyEngine.ts`
5. Use meal type cooldown configuration

---

### Step 1.12: Comprehensive Testing (1.5-2 hours)

**What you'll learn:** Testing CRUD operations, UI, and full flows

**Unit Tests:**
1. **Database Operations** (`lib/database/__tests__/`)
   - Test migration system (up/down migrations)
   - Test category CRUD operations
   - Test meal type CRUD operations
   - Test enhanced ingredient operations
   - Test validation functions
   - Test data integrity constraints

2. **Business Logic** (`lib/business-logic/__tests__/`)
   - Test combination generator with inactive ingredients
   - Test variety engine with meal type cooldowns
   - Test algorithm respects active/inactive status

3. **Store** (`lib/store/__tests__/`)
   - Test new actions (loadCategories, addCategory, etc.)
   - Test state updates correctly

**Component Tests:**
1. Manage Ingredients screen renders correctly
2. Manage Categories screen renders correctly
3. Meal Type configuration renders correctly
4. Forms validate input
5. Forms show error states
6. Lists handle empty states

**E2E Tests:**
1. **Full Customization Flow** (New E2E test)
   - Navigate to Manage Categories
   - Add new category "Protein"
   - Navigate to Manage Ingredients
   - Add new ingredient "Chicken" to "Protein" category
   - Navigate to Settings
   - Add new meal type "Lunch"
   - Configure lunch settings (min: 3, max: 5, cooldown: 2)
   - Navigate to home
   - Verify "Lunch Ideas" button appears
   - Click "Lunch Ideas"
   - Verify 4 suggestions appear
   - Verify "Chicken" appears in at least one suggestion
   - Select a meal
   - Confirm logging
   - Navigate to history
   - Verify lunch meal logged

2. **Update Existing E2E Tests**
   - Ensure breakfast/snack tests still pass
   - Update tests if meal type routing changed

**Test Commands:**
```bash
# Run all unit tests
npm test

# Run with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e

# Run E2E with UI (for debugging)
npm run test:e2e:ui
```

**Success Criteria:**
- [ ] All existing tests still pass
- [ ] New unit tests cover >80% of new code
- [ ] E2E test covers full customization flow
- [ ] No test failures
- [ ] Coverage doesn't drop below 70%

---

### Step 1.13: End-of-Phase Validation (30 min - 1 hour)

**What you'll learn:** Complete system validation before moving forward

**Pre-Deployment Checklist:**

1. **Code Quality**
   ```bash
   # TypeScript - must pass
   npx tsc --noEmit

   # Linting - must pass
   npm run lint

   # Tests - must pass
   npm test
   npm run test:e2e
   ```

2. **Database Integrity**
   - [ ] Run migration on fresh database (web mode)
   - [ ] Run migration on fresh database (native mode - Android/iOS)
   - [ ] Verify all tables created
   - [ ] Verify foreign keys work
   - [ ] Verify seed data loads correctly
   - [ ] Test rollback migration (if implemented)

3. **Functionality Testing (Manual)**
   - [ ] Add category successfully
   - [ ] Add ingredient to category
   - [ ] Create custom meal type
   - [ ] Configure meal type settings
   - [ ] Generate suggestions with custom meal type
   - [ ] Log meal with custom ingredients
   - [ ] View history with custom meals
   - [ ] Edit ingredient
   - [ ] Disable ingredient (verify excluded from suggestions)
   - [ ] Delete ingredient with safety checks
   - [ ] Delete category with safety checks

4. **Cross-Platform Testing**
   ```bash
   # Test on web
   npm run web
   # Manually test all features

   # Test on device (Android or iOS)
   npm start
   # Scan QR code and test on device
   ```

5. **Observability Check**
   ```bash
   # Start observability stack
   docker-compose up -d

   # Use the app and check:
   # - Jaeger: http://localhost:16686 (traces appear)
   # - Prometheus: http://localhost:9090 (metrics appear)
   # - Console logs (no errors)
   ```

6. **Build & Deploy (APK)**
   ```bash
   # Build preview APK
   eas build --platform android --profile preview

   # Wait for build to complete
   # Download APK
   # Install on device
   # Test all customization features on installed APK
   ```

**Deployment Validation:**
- [ ] APK builds successfully
- [ ] APK installs on device
- [ ] Database migrations run on first launch
- [ ] All features work in production build
- [ ] No crashes
- [ ] Performance is acceptable

**Git Commit:**
```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: add user customization (Epic 3 Phase 1)

- Implement database migrations system
- Add category management (CRUD)
- Add meal type management (CRUD)
- Enhance ingredient operations
- Create management screens
- Add data validation
- Update algorithms for custom data
- Add comprehensive tests

Tests: 30+ unit tests, 1 new E2E test
All tests passing ✅

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to remote
git push origin main
```

**Documentation:**
- [ ] Update `docs/epic03_mealsrandomizerv1/SESSION_STATUS.md`
- [ ] Update `docs/README.md` with progress
- [ ] Create session notes if needed

---

## 📝 TypeScript Types

Add to `types/database.ts`:

```typescript
export interface Category {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface MealType {
  id: number;
  name: string;
  min_ingredients: number;
  max_ingredients: number;
  default_cooldown_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: number;
  name: string;
  category_id?: number;
  is_active: boolean;
  is_user_added: boolean;
  created_at: string;
  updated_at: string;
}

export interface MealLog {
  id: number;
  meal_type_id: number;
  ingredients: string;
  logged_at: string;
}

export interface MealTypeParams {
  name: string;
  min_ingredients?: number;
  max_ingredients?: number;
  default_cooldown_days?: number;
  is_active?: boolean;
}
```

---

## ✅ Success Criteria

### Functional
- [ ] Users can add custom ingredients
- [ ] Users can create categories and assign ingredients
- [ ] Users can create custom meal types
- [ ] Users can configure meal type settings
- [ ] Users can enable/disable ingredients and meal types
- [ ] Algorithm respects active/inactive status
- [ ] Algorithm uses meal type configuration
- [ ] Deletion is prevented when data is referenced
- [ ] Validation prevents duplicate names

### Quality
- [ ] All existing tests pass (30+ unit tests, 7 E2E tests)
- [ ] New unit tests added (10+ new tests)
- [ ] New E2E test for customization flow (1 test)
- [ ] Test coverage >70% overall
- [ ] Database migrations work correctly
- [ ] No data loss during migration
- [ ] Forms validate user input
- [ ] Error messages are helpful
- [ ] No TypeScript errors
- [ ] Linter passes

### UX
- [ ] Forms are intuitive
- [ ] Feedback is immediate
- [ ] Confirmation prompts prevent accidents
- [ ] Loading states provide feedback
- [ ] Empty states guide users

### Deployment
- [ ] APK builds successfully
- [ ] App installs on device
- [ ] All features work in production build
- [ ] Database migrations run correctly on first install
- [ ] No crashes on device
- [ ] Observability traces appear (Jaeger)
- [ ] Metrics appear (Prometheus)
- [ ] Cross-platform testing complete (web + native)

### Documentation
- [ ] Session status updated
- [ ] Changes documented
- [ ] Git commit pushed

---

## 🎓 Learning Outcomes

After completing Phase 1, you'll understand:
- Database schema evolution and migrations
- Complex CRUD operations with relationships
- Form handling and validation in React Native
- Data integrity and safety checks
- Configuration-driven algorithms
- State management for complex data

---

## 🚀 Next Steps

After completing Phase 1:
1. Use the app with custom data for a few days
2. Identify any usability issues
3. Move to [Phase 2: Branding & Identity →](./PHASE2_BRANDING_IDENTITY.md)

---

[← Back to Overview](./OVERVIEW.md) | [Next: Phase 2 →](./PHASE2_BRANDING_IDENTITY.md)

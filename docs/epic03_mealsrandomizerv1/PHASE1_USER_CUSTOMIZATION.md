# Phase 1: User Customization

[← Back to Overview](./OVERVIEW.md)

---

## 🎯 Goal

Give users complete control over their meal options by allowing them to add custom ingredients, categories, and meal types.

**Current Limitation:** The app is hardcoded with 19-22 Portuguese ingredients and only supports "breakfast" and "snack" meal types.

**After Phase 1:** Users can add their own ingredients, create categories (e.g., "Protein", "Fruit", "Dairy"), and define custom meal types (e.g., "Lunch", "Dessert").

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

### Step 1.12: Testing (1 hour)

**What you'll learn:** Testing CRUD operations and UI

**Tasks:**
1. Unit tests for database operations
2. Tests for validation logic
3. Tests for migration system
4. Component tests for forms
5. E2E test for full customization flow:
   - Add category
   - Add ingredient to category
   - Add meal type
   - Generate suggestions with custom data
   - Log meal
   - Verify history

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
- [ ] All existing tests pass
- [ ] New features have tests
- [ ] Database migrations work correctly
- [ ] No data loss during migration
- [ ] Forms validate user input
- [ ] Error messages are helpful
- [ ] No TypeScript errors

### UX
- [ ] Forms are intuitive
- [ ] Feedback is immediate
- [ ] Confirmation prompts prevent accidents
- [ ] Loading states provide feedback
- [ ] Empty states guide users

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

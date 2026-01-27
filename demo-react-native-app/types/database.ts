export interface Ingredient {
  id: string;
  name: string;
  category: string;  // Changed from union type to string (more flexible)
  mealTypes: string[];  // Changed from union type to string[] (more flexible)
  category_id?: string;  // NEW: optional FK to categories table
  is_active: boolean;  // NEW: whether ingredient is enabled
  is_user_added: boolean;  // NEW: whether user added it (vs seeded)
  createdAt: string;
  updated_at?: string;  // NEW: optional for backwards compatibility
}

export interface MealLog {
  id: string;
  date: string;
  mealType: string; // Dynamic meal type name (e.g., 'breakfast', 'snack', 'lunch')
  name?: string | null; // NEW: Optional meal name (e.g., "Mom's special")
  ingredients: string[]; // Array of ingredient IDs (legacy, for backward compat)
  createdAt: string;
  isFavorite: boolean; // Whether this combination is marked as favorite
  // Computed/joined
  components?: MealComponent[]; // NEW: Ingredient + preparation pairs
}

// Phase 2: Data Model Evolution - Preparation Methods
export interface PreparationMethod {
  id: string;
  name: string;
  isPredefined: boolean; // true = system method, false = user-added
  createdAt: string;
}

// Phase 2: Data Model Evolution - Meal Components
export interface MealComponent {
  id: string;
  mealLogId: string;
  ingredientId: string;
  preparationMethodId: string | null; // NULL = no preparation (e.g., milk)
  createdAt: string;
}

export interface Preferences {
  cooldownDays: number;
  suggestionsCount: number;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface MealType {
  id: string;
  name: string;
  min_ingredients: number;
  max_ingredients: number;
  default_cooldown_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Phase 3: Enhanced Variety - Pairing Rules
export interface PairingRule {
  id: string;
  ingredientAId: string;
  ingredientBId: string;
  ruleType: 'positive' | 'negative';
  createdAt: string;
}
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
  ingredients: string[]; // Array of ingredient IDs
  createdAt: string;
  isFavorite: boolean; // Whether this combination is marked as favorite
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
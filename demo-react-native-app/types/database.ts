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
  ingredients: string[]; // Array of ingredient IDs
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
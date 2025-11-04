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

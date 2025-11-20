import { getDatabase } from './index';
import { addIngredient, getAllIngredients } from './ingredients';

export const DEFAULT_INGREDIENTS = {
  proteins: [
    { name: 'Milk', category: 'protein' as const, mealTypes: ['breakfast' as const] },
    { name: 'Greek Yogurt', category: 'protein' as const, mealTypes: ['breakfast' as const] },
    { name: 'Normal Yogurt', category: 'protein' as const, mealTypes: ['breakfast' as const] },
    {
      name: 'Butter',
      category: 'protein' as const,
      mealTypes: ['breakfast' as const, 'snack' as const],
    },
    {
      name: 'Cheese',
      category: 'protein' as const,
      mealTypes: ['breakfast' as const, 'snack' as const],
    },
    { name: 'Eggs', category: 'protein' as const, mealTypes: ['breakfast' as const] },
  ],
  carbs: [
    { name: 'Cereals', category: 'carb' as const, mealTypes: ['breakfast' as const] },
    {
      name: 'Pão Branco',
      category: 'carb' as const,
      mealTypes: ['breakfast' as const, 'snack' as const],
    },
    {
      name: 'Pão Mistura',
      category: 'carb' as const,
      mealTypes: ['breakfast' as const, 'snack' as const],
    },
    {
      name: 'Pão de Água',
      category: 'carb' as const,
      mealTypes: ['breakfast' as const, 'snack' as const],
    },
    {
      name: 'Pão de Forma',
      category: 'carb' as const,
      mealTypes: ['breakfast' as const, 'snack' as const],
    },
    {
      name: 'Italiana',
      category: 'carb' as const,
      mealTypes: ['breakfast' as const, 'snack' as const],
    },
    {
      name: 'Regueifa',
      category: 'carb' as const,
      mealTypes: ['breakfast' as const, 'snack' as const],
    },
  ],
  sweets: [
    {
      name: 'Jam',
      category: 'sweet' as const,
      mealTypes: ['breakfast' as const, 'snack' as const],
    },
    {
      name: 'Marmelada',
      category: 'sweet' as const,
      mealTypes: ['breakfast' as const, 'snack' as const],
    },
    {
      name: 'Cookies',
      category: 'sweet' as const,
      mealTypes: ['breakfast' as const, 'snack' as const],
    },
  ],
  fruits: [
    { name: 'Apple', category: 'fruit' as const, mealTypes: ['snack' as const] },
    { name: 'Banana', category: 'fruit' as const, mealTypes: ['snack' as const] },
    { name: 'Pear', category: 'fruit' as const, mealTypes: ['snack' as const] },
  ],
};

export async function seedDatabase(): Promise<void> {
  const allIngredients = [
    ...DEFAULT_INGREDIENTS.proteins,
    ...DEFAULT_INGREDIENTS.carbs,
    ...DEFAULT_INGREDIENTS.sweets,
    ...DEFAULT_INGREDIENTS.fruits,
  ];

  // Check if already seeded
  const db = getDatabase();
  const existing = await getAllIngredients(db);
  if (existing.length > 0) {
    console.log('✅ Database already seeded');
    return;
  }

  // Add all ingredients
  for (const ingredient of allIngredients) {
    await addIngredient(db, ingredient);
  }

  console.log(`✅ Seeded ${allIngredients.length} ingredients`);
}

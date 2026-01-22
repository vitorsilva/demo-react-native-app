  import { initDatabase, resetDatabase, getDatabase } from '../index';
  import { addIngredient } from '../ingredients';
  import { logMeal } from '../mealLogs';
  import { addMealType, deleteMealType } from '../mealTypes';
  import { resetTestDatabase } from './testDb';

  jest.mock('../index');

  describe('Database Integration - Delete Safety Checks', () => {
    beforeEach(async () => {
      resetTestDatabase();
      resetDatabase();
      await initDatabase();
    });

    describe('MealType deletion constraints', () => {
      test('deleteMealType fails when meal logs reference it', async () => {
        const db = getDatabase();
        const created = await addMealType(db, { name: 'brunch' });

        await logMeal(db, {
          date: new Date().toISOString(),
          mealType: 'brunch' as 'breakfast' | 'snack',
          ingredients: ['ingredient-1'],
        });

        const result = await deleteMealType(db, created.id);

        expect(result.success).toBe(false);
        expect(result.error).toContain('meal log(s) reference it');
      });

      test('deleteMealType fails when ingredients include it', async () => {
        const db = getDatabase();
        const created = await addMealType(db, { name: 'dinner' });

        await addIngredient(db, {
          name: 'Chicken',
          category: 'protein',
          mealTypes: ['dinner'] as unknown as ('breakfast' | 'snack')[],
        });

        const result = await deleteMealType(db, created.id);

        expect(result.success).toBe(false);
        expect(result.error).toContain('ingredient(s) are assigned to it');
      });

      test('deleteMealType returns error for non-existent ID', async () => {
        const db = getDatabase();

        const result = await deleteMealType(db, 'non-existent-id');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Meal type not found');
      });
    });
  });
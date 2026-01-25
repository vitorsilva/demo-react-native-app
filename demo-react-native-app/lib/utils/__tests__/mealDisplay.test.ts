/**
 * Unit tests for mealDisplay utility functions.
 * Tests formatMealDisplay and formatMealComponent functions.
 */

import type {
  Ingredient,
  MealComponent,
  MealLog,
  PreparationMethod,
} from '../../../types/database';
import { formatMealComponent, formatMealDisplay } from '../mealDisplay';

describe('mealDisplay utilities', () => {
  // Test data setup
  const mockIngredients: Ingredient[] = [
    {
      id: 'ing-chicken',
      name: 'chicken',
      category: 'proteins',
      mealTypes: ['lunch', 'dinner'],
      is_active: true,
      is_user_added: false,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'ing-bread',
      name: 'bread',
      category: 'carbs',
      mealTypes: ['breakfast', 'lunch'],
      is_active: true,
      is_user_added: false,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'ing-milk',
      name: 'milk',
      category: 'dairy',
      mealTypes: ['breakfast'],
      is_active: true,
      is_user_added: false,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'ing-eggs',
      name: 'eggs',
      category: 'proteins',
      mealTypes: ['breakfast'],
      is_active: true,
      is_user_added: false,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const mockPrepMethods: PreparationMethod[] = [
    {
      id: 'prep-fried',
      name: 'fried',
      isPredefined: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'prep-grilled',
      name: 'grilled',
      isPredefined: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'prep-toasted',
      name: 'toasted',
      isPredefined: false,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'prep-boiled',
      name: 'boiled',
      isPredefined: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const baseMealLog: MealLog = {
    id: 'meal-1',
    date: '2026-01-25',
    mealType: 'breakfast',
    ingredients: [],
    createdAt: '2026-01-25T08:00:00.000Z',
    isFavorite: false,
  };

  describe('formatMealDisplay', () => {
    describe('named meals', () => {
      it('should return the meal name when meal has a name', () => {
        const meal: MealLog = {
          ...baseMealLog,
          name: "Mom's special",
        };
        const components: MealComponent[] = [
          {
            id: 'comp-1',
            mealLogId: meal.id,
            ingredientId: 'ing-chicken',
            preparationMethodId: 'prep-fried',
            createdAt: meal.createdAt,
          },
        ];

        const result = formatMealDisplay(
          meal,
          components,
          mockIngredients,
          mockPrepMethods
        );

        expect(result).toBe("Mom's special");
      });

      it('should handle unicode characters in meal names', () => {
        const meal: MealLog = {
          ...baseMealLog,
          name: 'Frango à Portuguesa 🍗',
        };

        const result = formatMealDisplay(meal, [], mockIngredients, mockPrepMethods);

        expect(result).toBe('Frango à Portuguesa 🍗');
      });

      it('should ignore components when meal has a name', () => {
        const meal: MealLog = {
          ...baseMealLog,
          name: 'Quick Breakfast',
        };
        const components: MealComponent[] = [
          {
            id: 'comp-1',
            mealLogId: meal.id,
            ingredientId: 'ing-eggs',
            preparationMethodId: 'prep-fried',
            createdAt: meal.createdAt,
          },
          {
            id: 'comp-2',
            mealLogId: meal.id,
            ingredientId: 'ing-bread',
            preparationMethodId: 'prep-toasted',
            createdAt: meal.createdAt,
          },
        ];

        const result = formatMealDisplay(
          meal,
          components,
          mockIngredients,
          mockPrepMethods
        );

        // Should return name, not component-based display
        expect(result).toBe('Quick Breakfast');
      });
    });

    describe('unnamed meals with components', () => {
      it('should format single component with preparation method', () => {
        const meal: MealLog = {
          ...baseMealLog,
          name: null,
        };
        const components: MealComponent[] = [
          {
            id: 'comp-1',
            mealLogId: meal.id,
            ingredientId: 'ing-chicken',
            preparationMethodId: 'prep-fried',
            createdAt: meal.createdAt,
          },
        ];

        const result = formatMealDisplay(
          meal,
          components,
          mockIngredients,
          mockPrepMethods
        );

        expect(result).toBe('fried chicken');
      });

      it('should format single component without preparation method', () => {
        const meal: MealLog = {
          ...baseMealLog,
          name: null,
        };
        const components: MealComponent[] = [
          {
            id: 'comp-1',
            mealLogId: meal.id,
            ingredientId: 'ing-milk',
            preparationMethodId: null,
            createdAt: meal.createdAt,
          },
        ];

        const result = formatMealDisplay(
          meal,
          components,
          mockIngredients,
          mockPrepMethods
        );

        expect(result).toBe('milk');
      });

      it('should format multiple components joined by " + "', () => {
        const meal: MealLog = {
          ...baseMealLog,
          name: null,
        };
        const components: MealComponent[] = [
          {
            id: 'comp-1',
            mealLogId: meal.id,
            ingredientId: 'ing-milk',
            preparationMethodId: null,
            createdAt: meal.createdAt,
          },
          {
            id: 'comp-2',
            mealLogId: meal.id,
            ingredientId: 'ing-bread',
            preparationMethodId: 'prep-toasted',
            createdAt: meal.createdAt,
          },
          {
            id: 'comp-3',
            mealLogId: meal.id,
            ingredientId: 'ing-eggs',
            preparationMethodId: 'prep-fried',
            createdAt: meal.createdAt,
          },
        ];

        const result = formatMealDisplay(
          meal,
          components,
          mockIngredients,
          mockPrepMethods
        );

        expect(result).toBe('milk + toasted bread + fried eggs');
      });

      it('should handle mixed components with and without preparation methods', () => {
        const meal: MealLog = {
          ...baseMealLog,
          name: null,
        };
        const components: MealComponent[] = [
          {
            id: 'comp-1',
            mealLogId: meal.id,
            ingredientId: 'ing-chicken',
            preparationMethodId: 'prep-grilled',
            createdAt: meal.createdAt,
          },
          {
            id: 'comp-2',
            mealLogId: meal.id,
            ingredientId: 'ing-milk',
            preparationMethodId: null,
            createdAt: meal.createdAt,
          },
        ];

        const result = formatMealDisplay(
          meal,
          components,
          mockIngredients,
          mockPrepMethods
        );

        expect(result).toBe('grilled chicken + milk');
      });
    });

    describe('legacy meals (no components, using ingredients array)', () => {
      it('should fall back to legacy ingredients array when no components', () => {
        const meal: MealLog = {
          ...baseMealLog,
          name: null,
          ingredients: ['ing-milk', 'ing-bread'],
        };

        const result = formatMealDisplay(meal, [], mockIngredients, mockPrepMethods);

        expect(result).toBe('milk + bread');
      });

      it('should handle single ingredient in legacy array', () => {
        const meal: MealLog = {
          ...baseMealLog,
          name: null,
          ingredients: ['ing-eggs'],
        };

        const result = formatMealDisplay(meal, [], mockIngredients, mockPrepMethods);

        expect(result).toBe('eggs');
      });
    });

    describe('edge cases', () => {
      it('should return empty string for meal with no name, no components, and no legacy ingredients', () => {
        const meal: MealLog = {
          ...baseMealLog,
          name: null,
          ingredients: [],
        };

        const result = formatMealDisplay(meal, [], mockIngredients, mockPrepMethods);

        expect(result).toBe('');
      });

      it('should use ingredient ID as fallback when ingredient not found', () => {
        const meal: MealLog = {
          ...baseMealLog,
          name: null,
        };
        const components: MealComponent[] = [
          {
            id: 'comp-1',
            mealLogId: meal.id,
            ingredientId: 'ing-unknown',
            preparationMethodId: null,
            createdAt: meal.createdAt,
          },
        ];

        const result = formatMealDisplay(meal, components, mockIngredients, mockPrepMethods);

        expect(result).toBe('ing-unknown');
      });

      it('should skip preparation method when prep method not found', () => {
        const meal: MealLog = {
          ...baseMealLog,
          name: null,
        };
        const components: MealComponent[] = [
          {
            id: 'comp-1',
            mealLogId: meal.id,
            ingredientId: 'ing-chicken',
            preparationMethodId: 'prep-unknown',
            createdAt: meal.createdAt,
          },
        ];

        const result = formatMealDisplay(meal, components, mockIngredients, mockPrepMethods);

        // Should just return ingredient name without prep method
        expect(result).toBe('chicken');
      });

      it('should use ingredient ID in legacy fallback when ingredient not found', () => {
        const meal: MealLog = {
          ...baseMealLog,
          name: null,
          ingredients: ['ing-unknown-1', 'ing-unknown-2'],
        };

        const result = formatMealDisplay(meal, [], mockIngredients, mockPrepMethods);

        expect(result).toBe('ing-unknown-1 + ing-unknown-2');
      });

      it('should treat undefined name the same as null', () => {
        const meal: MealLog = {
          ...baseMealLog,
          // name is undefined (not set)
        };
        const components: MealComponent[] = [
          {
            id: 'comp-1',
            mealLogId: meal.id,
            ingredientId: 'ing-milk',
            preparationMethodId: null,
            createdAt: meal.createdAt,
          },
        ];

        const result = formatMealDisplay(
          meal,
          components,
          mockIngredients,
          mockPrepMethods
        );

        expect(result).toBe('milk');
      });

      it('should treat empty string name as unnamed (show components)', () => {
        const meal: MealLog = {
          ...baseMealLog,
          name: '',
        };
        const components: MealComponent[] = [
          {
            id: 'comp-1',
            mealLogId: meal.id,
            ingredientId: 'ing-chicken',
            preparationMethodId: 'prep-fried',
            createdAt: meal.createdAt,
          },
        ];

        const result = formatMealDisplay(
          meal,
          components,
          mockIngredients,
          mockPrepMethods
        );

        // Empty string is falsy, so should show components
        expect(result).toBe('fried chicken');
      });
    });
  });

  describe('formatMealComponent', () => {
    it('should format component with preparation method', () => {
      const component: MealComponent = {
        id: 'comp-1',
        mealLogId: 'meal-1',
        ingredientId: 'ing-chicken',
        preparationMethodId: 'prep-fried',
        createdAt: '2026-01-25T08:00:00.000Z',
      };

      const result = formatMealComponent(component, mockIngredients, mockPrepMethods);

      expect(result).toBe('fried chicken');
    });

    it('should format component without preparation method', () => {
      const component: MealComponent = {
        id: 'comp-1',
        mealLogId: 'meal-1',
        ingredientId: 'ing-milk',
        preparationMethodId: null,
        createdAt: '2026-01-25T08:00:00.000Z',
      };

      const result = formatMealComponent(component, mockIngredients, mockPrepMethods);

      expect(result).toBe('milk');
    });

    it('should return ingredient ID if ingredient not found', () => {
      const component: MealComponent = {
        id: 'comp-1',
        mealLogId: 'meal-1',
        ingredientId: 'ing-unknown',
        preparationMethodId: null,
        createdAt: '2026-01-25T08:00:00.000Z',
      };

      const result = formatMealComponent(component, mockIngredients, mockPrepMethods);

      expect(result).toBe('ing-unknown');
    });

    it('should skip prep method if not found', () => {
      const component: MealComponent = {
        id: 'comp-1',
        mealLogId: 'meal-1',
        ingredientId: 'ing-bread',
        preparationMethodId: 'prep-unknown',
        createdAt: '2026-01-25T08:00:00.000Z',
      };

      const result = formatMealComponent(component, mockIngredients, mockPrepMethods);

      // Should return just ingredient name
      expect(result).toBe('bread');
    });
  });
});

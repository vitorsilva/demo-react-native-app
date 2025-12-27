import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ManageIngredientsScreen from '../manage-ingredients';
import { useStore } from '@/lib/store';
import { Alert } from 'react-native';

// Mock store
jest.mock('@/lib/store', () => ({
  useStore: jest.fn(),
}));

// Mock useThemeColor
jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: () => '#000000',
}));

// Mock IconSymbol
jest.mock('@/components/ui/icon-symbol', () => ({
  IconSymbol: 'IconSymbol',
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('ManageIngredientsScreen', () => {
  const mockIngredients = [
    { id: '1', name: 'Apple', category_id: '1', is_active: true },
    { id: '2', name: 'Banana', category_id: '1', is_active: false },
  ];

  const mockCategories = [
    { id: '1', name: 'Fruit', created_at: '', updated_at: '' },
  ];

  const mockActions = {
    loadIngredients: jest.fn(),
    loadCategories: jest.fn(),
    addIngredient: jest.fn(),
    updateIngredient: jest.fn(),
    deleteIngredient: jest.fn(),
    toggleIngredientActive: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useStore as unknown as jest.Mock).mockReturnValue({
      ingredients: mockIngredients,
      categories: mockCategories,
      isLoading: false,
      ...mockActions,
    });
  });

  it('renders correctly', () => {
    const { getByText } = render(<ManageIngredientsScreen />);

    expect(getByText('Ingredients')).toBeTruthy();
    expect(getByText('Fruit')).toBeTruthy();
    expect(getByText('Apple')).toBeTruthy();
    expect(getByText('Banana')).toBeTruthy();
    expect(getByText('(Inactive)')).toBeTruthy();
  });

  it('loads data on mount', () => {
    render(<ManageIngredientsScreen />);
    expect(mockActions.loadIngredients).toHaveBeenCalled();
    expect(mockActions.loadCategories).toHaveBeenCalled();
  });

  it('opens modal when add button is pressed', () => {
    const { getByTestId, getByText } = render(<ManageIngredientsScreen />);

    fireEvent.press(getByTestId('add-ingredient-button'));

    expect(getByText('Name')).toBeTruthy(); // Form label
    expect(getByText('Save')).toBeTruthy();
  });

  it('calls toggleIngredientActive when toggle button is pressed', async () => {
    const { getByTestId } = render(<ManageIngredientsScreen />);

    fireEvent.press(getByTestId('toggle-ingredient-1'));

    expect(mockActions.toggleIngredientActive).toHaveBeenCalledWith('1');
  });

  it('shows delete confirmation when delete button is pressed', () => {
    const { getByTestId } = render(<ManageIngredientsScreen />);

    fireEvent.press(getByTestId('delete-ingredient-1'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete Ingredient',
      expect.stringContaining('Are you sure'),
      expect.any(Array)
    );
  });
});

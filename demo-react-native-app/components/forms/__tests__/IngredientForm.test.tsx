import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { IngredientForm } from '../IngredientForm';

// Mock useThemeColor
jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: () => '#000000',
}));

describe('IngredientForm', () => {
  const mockCategories = [
    { id: '1', name: 'Fruit', created_at: '', updated_at: '' },
    { id: '2', name: 'Vegetable', created_at: '', updated_at: '' },
  ];

  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default values', () => {
    const { getByText, getByPlaceholderText } = render(
      <IngredientForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(getByText('Name')).toBeTruthy();
    expect(getByPlaceholderText('e.g., Avocado')).toBeTruthy();
    expect(getByText('Category')).toBeTruthy();
    expect(getByText('Fruit')).toBeTruthy();
    expect(getByText('Vegetable')).toBeTruthy();
    expect(getByText('Save')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('renders correctly with initial values', () => {
    const initialValues = {
      name: 'Apple',
      category_id: '1',
      is_active: false,
    };

    const { getByDisplayValue } = render(
      <IngredientForm
        initialValues={initialValues}
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(getByDisplayValue('Apple')).toBeTruthy();
  });

  it('validates required fields', () => {
    const { getByText } = render(
      <IngredientForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.press(getByText('Save'));

    expect(getByText('Name is required')).toBeTruthy();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits valid data', () => {
    const { getByPlaceholderText, getByText } = render(
      <IngredientForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.changeText(getByPlaceholderText('e.g., Avocado'), 'Banana');
    // Default category is selected (first one: Fruit)

    fireEvent.press(getByText('Save'));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'Banana',
      category_id: '1',
      is_active: true,
    });
  });

  it('allows changing category', () => {
    const { getByText, getByPlaceholderText } = render(
      <IngredientForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.changeText(getByPlaceholderText('e.g., Avocado'), 'Carrot');
    fireEvent.press(getByText('Vegetable'));
    fireEvent.press(getByText('Save'));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'Carrot',
      category_id: '2',
      is_active: true,
    });
  });

  it('calls onCancel when cancel button is pressed', () => {
    const { getByText } = render(
      <IngredientForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.press(getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../index';

describe('HomeScreen', () => {
    it('renders correctly', () => {
      const { getByText } = render(<HomeScreen />);

      expect(getByText('Hello World!')).toBeTruthy();
    });
});
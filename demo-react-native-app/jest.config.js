module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}', // Add lib directory
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**', // Exclude test files from coverage
    '!**/__mocks__/**', // Exclude mocks from coverage
  ],
  testMatch: [
    '**/__tests__/**/*.test.{js,jsx,ts,tsx}', // Files in __tests__ ending in .test.ts
    '**/?(*.)+(spec|test).{js,jsx,ts,tsx}', // Files ending in .spec.ts or .test.ts
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/', // Exclude Playwright E2E tests from Jest
  ],
  moduleNameMapper: {
    '^expo-sqlite$': '<rootDir>/lib/database/__tests__/__mocks__/expo-sqlite.ts',
    '^expo-crypto$': '<rootDir>/lib/database/__tests__/__mocks__/expo-crypto.ts',
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/lib/database/__tests__/__mocks__/async-storage.ts',
  },
};

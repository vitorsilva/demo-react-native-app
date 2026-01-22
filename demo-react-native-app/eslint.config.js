// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const boundaries = require('eslint-plugin-boundaries');
const sonarjs = require('eslint-plugin-sonarjs');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './demo-react-native-app/tsconfig.json',
        },
      },
    },
    rules: {
      // Prettier handles formatting
      'prettier/prettier': 'off',
    },
  },
  // Architecture boundary rules
  {
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: ['app/*', 'app/**/*'], mode: 'file' },
        { type: 'components', pattern: ['components/*', 'components/**/*'], mode: 'file' },
        { type: 'store', pattern: ['lib/store/*', 'lib/store/**/*'], mode: 'file' },
        { type: 'business-logic', pattern: ['lib/business-logic/*', 'lib/business-logic/**/*'], mode: 'file' },
        { type: 'database', pattern: ['lib/database/*', 'lib/database/**/*'], mode: 'file' },
        { type: 'telemetry', pattern: ['lib/telemetry/*', 'lib/telemetry/**/*'], mode: 'file' },
        { type: 'types', pattern: ['types/*', 'types/**/*'], mode: 'file' },
        { type: 'hooks', pattern: ['hooks/*', 'hooks/**/*'], mode: 'file' },
        { type: 'constants', pattern: ['constants/*', 'constants/**/*'], mode: 'file' },
        { type: 'i18n', pattern: ['lib/i18n/*', 'lib/i18n/**/*'], mode: 'file' },
      ],
      'boundaries/ignore': ['**/*.test.ts', '**/__mocks__/**', '**/e2e/**'],
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'allow', // Allow external packages by default
          rules: [
            // App cannot import: database, business-logic directly
            {
              from: 'app',
              disallow: ['database', 'business-logic'],
              message: 'App screens must access data through the store, not directly',
            },
            // Components cannot import: store, database, business-logic
            {
              from: 'components',
              disallow: ['store', 'database', 'business-logic'],
              message: 'Components should be presentational and receive data via props',
            },
            // Business logic cannot import: database, store, app, components
            {
              from: 'business-logic',
              disallow: ['database', 'store', 'app', 'components'],
              message: 'Business logic should be pure functions without side effects',
            },
            // Database cannot import: store, business-logic, app, components
            {
              from: 'database',
              disallow: ['store', 'business-logic', 'app', 'components'],
              message: 'Database layer should be independent',
            },
            // Telemetry cannot import: app, components, store, database, business-logic
            {
              from: 'telemetry',
              disallow: ['app', 'components', 'store', 'database', 'business-logic'],
              message: 'Telemetry should not depend on app-specific code',
            },
            // Types cannot import other app code
            {
              from: 'types',
              disallow: ['app', 'components', 'store', 'database', 'business-logic', 'telemetry', 'hooks', 'constants', 'i18n'],
              message: 'Type files should only contain type definitions',
            },
          ],
        },
      ],
      'boundaries/no-unknown': 'off', // External packages are expected
      'boundaries/no-unknown-files': 'off', // Config files, etc. are expected
    },
  },
  // Exception: _layout.tsx can import database for one-time initialization
  {
    files: ['app/_layout.tsx'],
    rules: {
      'boundaries/element-types': 'off',
    },
  },
  // SonarJS rules for code quality
  {
    plugins: { sonarjs },
    rules: {
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-duplicate-string': ['warn', { threshold: 3 }],
      'sonarjs/no-identical-functions': 'warn',
      'sonarjs/no-collapsible-if': 'warn',
      'sonarjs/no-collection-size-mischeck': 'error',
      'sonarjs/no-redundant-boolean': 'warn',
      'sonarjs/no-unused-collection': 'warn',
      'sonarjs/prefer-immediate-return': 'warn',
      'sonarjs/no-inverted-boolean-check': 'warn',
    },
  },
  // Import ordering rules
  {
    rules: {
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
            'type',
          ],
          'newlines-between': 'never',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-duplicates': 'warn',
    },
  },
]);

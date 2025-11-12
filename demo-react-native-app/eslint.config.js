// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

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
]);

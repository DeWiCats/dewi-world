// ESLint configuration for DEWI World App (Expo)
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ['dist/*', '.expo/*'],
  },
  // Add specific configuration for Node.js files
  {
    files: ['babel.config.js', 'metro.config.js', '*.config.js'],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
      },
      sourceType: 'commonjs',
    },
  },
  {
    rules: {
      'import/no-unresolved': 'off', // Temporarily disable to avoid resolver issues
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  },
]);

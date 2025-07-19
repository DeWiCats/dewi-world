// Root ESLint configuration for DEWI monorepo
const { defineConfig } = require('eslint/config');

module.exports = defineConfig([
  {
    ignores: [
      'dist/*',
      'build/*',
      '**/node_modules/*',
      '**/dist/*',
      '**/build/*',
      '**/.expo/*',
      '**/ios/*',
      '**/android/*'
    ],
  },
  {
    files: ['**/*.js', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      'prefer-const': 'error',
    },
  },
]); 
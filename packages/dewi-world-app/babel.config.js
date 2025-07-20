/* eslint-env node */

/**
 * Ensure all `EXPO_PUBLIC_*` vars from the monorepo root `.env`
 * are available when Babel runs (they’ll then be inlined by
 * `babel-plugin-transform-inline-environment-variables`, which Expo
 * includes by default).
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
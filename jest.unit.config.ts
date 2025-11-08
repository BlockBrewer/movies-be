import config from './jest.config';

const { testRegex, ...baseConfig } = config;

export default {
  ...baseConfig,
  testMatch: ['**/tests/unit/**/*.spec.ts'],
};

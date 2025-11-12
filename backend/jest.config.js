export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'index.js',
    '!node_modules/**',
    '!tests/**',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};
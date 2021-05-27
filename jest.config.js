export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  bail: true,
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text-summary', 'lcov'],
  collectCoverageFrom: ['src/**/*.ts'],
  verbose: true,
  testMatch: ['**/test/**/*.test.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  extensionsToTreatAsEsm: ['.ts'],
};

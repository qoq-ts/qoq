module.exports = {
  preset: 'ts-jest',
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
      tsconfig: 'tsconfig.cjs.json',
    },
  },
};

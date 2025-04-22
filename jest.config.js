export default {
  reporters: [
    'default',
    [
      'jest-junit',
      {
        usePathForSuiteName: 'true',
        classNameTemplate: '{filepath}'
      }
    ]
  ],
  roots: [
    '<rootDir>/src/'
  ],
  testEnvironment: 'node',
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/**/node_modules/**',
    '!src/typedoc/**',
    '!src/docs/**'
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  modulePathIgnorePatterns: [
    'node_modules',
    'src/docs/typedoc-theme',
    'src/typedoc/theme/node_modules'
  ],
  moduleNameMapper: {
    "^chalk$": "<rootDir>/src/__tests__/__mocks__/chalk"
  }
};
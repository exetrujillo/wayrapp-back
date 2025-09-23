// jest.config.cjs
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '.*\\.contract\\.test\\.ts$'],
  transform: {
    // Usa ts-jest para nuestros archivos .ts
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
    // Y también usa ts-jest para los archivos .js y .mjs (de node_modules)
    '^.+\\.(js|mjs)$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  transformIgnorePatterns: ['/node_modules/(?!uuid)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

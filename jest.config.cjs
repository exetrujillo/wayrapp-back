// jest.config.cjs
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '.*\\.contract\\.test\\.ts$'],
  transform: {
    // Usa ts-jest para nuestros archivos .ts
    '^.+\\.ts$': ['ts-jest', { 
      tsconfig: 'tsconfig.test.json'
    }],
    // Y también usa ts-jest para los archivos .js y .mjs (de node_modules)
    '^.+\\.(js|mjs)$': ['ts-jest', { 
      tsconfig: 'tsconfig.test.json'
    }],
  },
  // Permite que Jest transforme uuid, testcontainers y otros módulos ES
  transformIgnorePatterns: [
    '/node_modules/(?!(uuid|@testcontainers|testcontainers|dockerode)/)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Usa nuestro wrapper CommonJS para uuid
    '^uuid$': '<rootDir>/__tests__/uuid-wrapper.cjs',
  },
  // Configura extensiones de archivo
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mjs'],
};

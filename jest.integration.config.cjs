// jest.integration.config.cjs
const unitConfig = require('./jest.config.cjs');

module.exports = {
  ...unitConfig,
  // Sobrescribe el testMatch para apuntar a los tests de integración
  testMatch: ['<rootDir>/__tests__/integration/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  testTimeout: 30000,
  maxWorkers: 1,
  transformIgnorePatterns: ['/node_modules/(?!uuid)'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
    '^.+\\.(js|mjs)$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  // Asegúrate de que los patrones de transformación y el mapeador se hereden
  // ...unitConfig ya lo hace, así que no necesitas redefinirlos.
};
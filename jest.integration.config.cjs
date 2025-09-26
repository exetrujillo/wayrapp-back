// jest.integration.config.cjs
const unitConfig = require('./jest.config.cjs');

module.exports = {
  ...unitConfig,
  // Sobrescribe el testMatch para apuntar a los tests de integración
  testMatch: ['<rootDir>/__tests__/integration/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  testTimeout: 30000,
  maxWorkers: 1,
  // Configuración más agresiva para transformar módulos ES
  transformIgnorePatterns: [
    // Transforma todos los módulos excepto los que están explícitamente excluidos
    '/node_modules/(?!.*)'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
      useESM: false
    }],
    '^.+\\.(js|jsx|mjs|cjs)$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
      useESM: false
    }],
  },
  // Mapea módulos problemáticos
  moduleNameMapper: {
    ...unitConfig.moduleNameMapper,
    // Usa nuestro wrapper CommonJS para uuid
    '^uuid$': '<rootDir>/__tests__/uuid-wrapper.cjs',
  },
  // Configura extensiones de archivo
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mjs', 'cjs'],
  // Configuración adicional para manejar módulos ES
  extensionsToTreatAsEsm: []
};

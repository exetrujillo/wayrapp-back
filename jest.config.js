// jest.config.js (para tests unitarios)
import integrationConfig from './jest.integration.config.js';

export default {
  ...integrationConfig, // Hereda la configuración base (preset, moduleNameMapper, etc.)
  
  // Sobrescribe las opciones específicas para tests unitarios
  testMatch: [ // Solo busca tests dentro de la carpeta src
    '<rootDir>/src/**/*.test.ts',
  ],
  
  // ¡No uses Testcontainers para tests unitarios!
  globalSetup: undefined,
  globalTeardown: undefined,
};
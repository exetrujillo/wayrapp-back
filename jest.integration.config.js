/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  // Usamos el preset específico para ESM. Es la forma moderna y recomendada.
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',

  // Le decimos a Jest que la raíz de todo el proyecto es el directorio actual
  // para que pueda encontrar tanto 'src' como '__tests__'.
  roots: ['<rootDir>'],

  // Configuración para settear el entorno de pruebas antes y después de todos los tests.
  globalSetup: '<rootDir>/__tests__/setup.ts',
  globalTeardown: '<rootDir>/__tests__/setup.ts',

  // Mapeo de módulos explícito y correcto para los alias y las extensiones .js de ESM.
  moduleNameMapper: {
    '^@/(.*)\\.js$': '<rootDir>/src/$1.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Patrones para que Jest encuentre los archivos de test en todas las ubicaciones planificadas.
  testMatch: [
    '<rootDir>/__tests__/**/*.test.ts', // Solo busca tests en la carpeta raíz __tests__
  ],
  
  // Configuración de cobertura de código precisa para medir solo el código fuente.
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/__tests__/**', // No incluir carpetas de test dentro de src
    '!src/**/*.test.ts',    // No incluir archivos de test dentro de src
  ],

  // Buenas prácticas para asegurar el aislamiento de los tests.
  clearMocks: true,
};
/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  // Usamos el preset específico para ESM. Es la forma moderna y recomendada.
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',

  // Le decimos a Jest que la raíz de todo el proyecto es el directorio actual
  // para que pueda encontrar tanto 'src' como '__tests__'.
  roots: ['<rootDir>'],

  // Mapeo de módulos explícito y correcto para los alias y las extensiones .js de ESM.
  moduleNameMapper: {
    '^@/(.*)\\.js$': '<rootDir>/src/$1.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Patrones para que Jest encuentre los archivos de test en todas las ubicaciones planificadas.
  testMatch: [
    '<rootDir>/__tests__/**/*.test.ts', // Busca tests en la carpeta raíz __tests__
    '<rootDir>/src/**/*.test.ts',      // Y también busca tests dentro de src (para tests unitarios de módulos)
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
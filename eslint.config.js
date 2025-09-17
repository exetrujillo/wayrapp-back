// @ts-check

import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  // Configuraciones globales
  {
    ignores: ['node_modules', 'dist'],
  },

  // Configuración base de ESLint
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // Configuración para archivos TypeScript
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
  },

  // Integración con Prettier (debe ser la última!)
  eslintPluginPrettierRecommended
);

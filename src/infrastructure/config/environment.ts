// src/infrastructure/config/environment.ts

/**
 * Módulo de configuración de variables de entorno.
 *
 * Este módulo es el ÚNICO punto de verdad para acceder a las variables de entorno
 * de la aplicación. Utiliza Zod para validar `process.env` en el momento del arranque.
 *
 * Si alguna variable requerida falta o tiene un formato incorrecto, la aplicación
 * fallará al iniciarse con un error claro y conciso, siguiendo el principio
 * de "fallar rápido" (fail-fast).
 *
 * El resto de la aplicación NUNCA debe acceder a `process.env` directamente.
 * En su lugar, debe importar el objeto `config` exportado desde este módulo
 * para obtener una configuración segura y tipada.
 *
 * @module EnvironmentConfig
 * @category Infrastructure/Config
 * @author Exequiel Trujillo
 * @since 1.0.0
 */

import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import dotenv from 'dotenv';

dotenv.config(); // Carga las variables de entorno desde el archivo .env

// 1. Definimos un esquema para las PARTES de la conexión
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().min(1).max(65535).default(3000),

  // Database type selection
  DATABASE_TYPE: z.enum(['postgresql', 'mysql']).default('postgresql'),

  // Variables para PostgreSQL
  DB_POSTGRES_USER: z.string().optional(),
  DB_POSTGRES_PASSWORD: z.string().optional(),
  DB_POSTGRES_HOST: z.string().optional(),
  DB_POSTGRES_PORT: z.coerce.number().optional(),
  DB_POSTGRES_NAME: z.string().optional(),

  // Variables para MySQL
  DB_MYSQL_USER: z.string().optional(),
  DB_MYSQL_PASSWORD: z.string().optional(),
  DB_MYSQL_HOST: z.string().optional(),
  DB_MYSQL_PORT: z.coerce.number().optional(),
  DB_MYSQL_NAME: z.string().optional(),
});

// 2. Validamos las partes
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const validationError = fromZodError(parsedEnv.error);
  console.error(
    '❌ Invalid environment variables:',
    validationError.toString()
  );
  process.exit(1);
}

// 3. CONSTRUIMOS las URLs aquí, con datos ya validados
const env = parsedEnv.data;

// Build database URLs only if the required variables are present
const databaseUrls = {
  postgres:
    env.DB_POSTGRES_USER &&
    env.DB_POSTGRES_PASSWORD &&
    env.DB_POSTGRES_HOST &&
    env.DB_POSTGRES_PORT &&
    env.DB_POSTGRES_NAME
      ? `postgresql://${env.DB_POSTGRES_USER}:${env.DB_POSTGRES_PASSWORD}@${env.DB_POSTGRES_HOST}:${env.DB_POSTGRES_PORT}/${env.DB_POSTGRES_NAME}?schema=public`
      : undefined,
  mysql:
    env.DB_MYSQL_USER &&
    env.DB_MYSQL_PASSWORD &&
    env.DB_MYSQL_HOST &&
    env.DB_MYSQL_PORT &&
    env.DB_MYSQL_NAME
      ? `mysql://${env.DB_MYSQL_USER}:${env.DB_MYSQL_PASSWORD}@${env.DB_MYSQL_HOST}:${env.DB_MYSQL_PORT}/${env.DB_MYSQL_NAME}`
      : undefined,
};

// 4. Exportamos una configuración final que incluye las URLs construidas
export const config = {
  ...env, // NODE_ENV, PORT, etc.
  DATABASE_URL_POSTGRES: databaseUrls.postgres,
  DATABASE_URL_MYSQL: databaseUrls.mysql,
};

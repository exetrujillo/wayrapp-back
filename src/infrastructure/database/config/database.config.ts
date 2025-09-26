// src/infrastructure/database/config/database.config.ts

import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

/**
 * Esquema de validación para configuración de PostgreSQL
 */
export const PostgreSQLConfigSchema = z.object({
  host: z.string().min(1, 'PostgreSQL host is required'),
  port: z.number().int().min(1).max(65535).default(5432),
  database: z.string().min(1, 'PostgreSQL database name is required'),
  username: z.string().min(1, 'PostgreSQL username is required'),
  password: z.string().min(1, 'PostgreSQL password is required'),
  ssl: z.boolean().default(false),
  poolSize: z.number().int().min(1).max(100).default(10),
  logging: z.boolean().default(false),
});

/**
 * Esquema de validación para configuración de MySQL
 */
export const MySQLConfigSchema = z.object({
  host: z.string().min(1, 'MySQL host is required'),
  port: z.number().int().min(1).max(65535).default(3306),
  database: z.string().min(1, 'MySQL database name is required'),
  username: z.string().min(1, 'MySQL username is required'),
  password: z.string().min(1, 'MySQL password is required'),
  poolSize: z.number().int().min(1).max(100).default(10),
  acquireTimeout: z.number().int().min(1000).default(60000),
  logging: z.boolean().default(false),
});

/**
 * Esquema principal de configuración de base de datos
 */
export const DatabaseConfigSchema = z
  .object({
    type: z.enum(['postgresql', 'mysql'], {
      message: 'Database type must be postgresql or mysql',
    }),
    postgresql: PostgreSQLConfigSchema.optional(),
    mysql: MySQLConfigSchema.optional(),
  })
  .refine(
    (data) => {
      // Validar que la configuración específica existe para el tipo seleccionado
      return data[data.type] !== undefined;
    },
    {
      message: 'Configuration for selected database type is required',
      path: ['database_config'],
    }
  );

export type PostgreSQLConfig = z.infer<typeof PostgreSQLConfigSchema>;
export type MySQLConfig = z.infer<typeof MySQLConfigSchema>;
export type DatabaseConfigType = z.infer<typeof DatabaseConfigSchema>;

/**
 * Clase para gestionar la configuración de base de datos multi-tipo
 */
export class DatabaseConfig {
  private constructor(
    public readonly type: 'postgresql' | 'mysql',
    public readonly postgresql?: PostgreSQLConfig,
    public readonly mysql?: MySQLConfig
  ) {}

  /**
   * Carga la configuración de base de datos desde variables de entorno
   * @returns Instancia de DatabaseConfig validada
   * @throws Error si la configuración es inválida
   */
  static load(): DatabaseConfig {
    const databaseType = (process.env.DATABASE_TYPE || 'postgresql') as
      | 'postgresql'
      | 'mysql';

    const config = {
      type: databaseType,
      postgresql:
        databaseType === 'postgresql'
          ? {
              host: process.env.DB_POSTGRES_HOST,
              port: process.env.DB_POSTGRES_PORT
                ? parseInt(process.env.DB_POSTGRES_PORT)
                : 5432,
              database: process.env.DB_POSTGRES_NAME,
              username: process.env.DB_POSTGRES_USER,
              password: process.env.DB_POSTGRES_PASSWORD,
              ssl: process.env.DB_POSTGRES_SSL === 'true',
              poolSize: process.env.DB_POSTGRES_POOL_SIZE
                ? parseInt(process.env.DB_POSTGRES_POOL_SIZE)
                : 10,
              logging: process.env.DB_POSTGRES_LOGGING === 'true',
            }
          : undefined,
      mysql:
        databaseType === 'mysql'
          ? {
              host: process.env.DB_MYSQL_HOST,
              port: process.env.DB_MYSQL_PORT
                ? parseInt(process.env.DB_MYSQL_PORT)
                : 3306,
              database: process.env.DB_MYSQL_NAME,
              username: process.env.DB_MYSQL_USER,
              password: process.env.DB_MYSQL_PASSWORD,
              poolSize: process.env.DB_MYSQL_POOL_SIZE
                ? parseInt(process.env.DB_MYSQL_POOL_SIZE)
                : 10,
              acquireTimeout: process.env.DB_MYSQL_ACQUIRE_TIMEOUT
                ? parseInt(process.env.DB_MYSQL_ACQUIRE_TIMEOUT)
                : 60000,
              logging: process.env.DB_MYSQL_LOGGING === 'true',
            }
          : undefined,
    };

    const validationResult = DatabaseConfigSchema.safeParse(config);

    if (!validationResult.success) {
      const validationError = fromZodError(validationResult.error);
      throw new Error(
        `Invalid database configuration: ${validationError.toString()}`
      );
    }

    const validatedConfig = validationResult.data;

    return new DatabaseConfig(
      validatedConfig.type,
      validatedConfig.postgresql,
      validatedConfig.mysql
    );
  }

  /**
   * Obtiene la configuración específica para el tipo de base de datos actual
   * @returns Configuración específica del tipo de BD
   */
  getCurrentConfig(): PostgreSQLConfig | MySQLConfig {
    switch (this.type) {
      case 'postgresql':
        if (!this.postgresql) {
          throw new Error('PostgreSQL configuration is missing');
        }
        return this.postgresql;
      case 'mysql':
        if (!this.mysql) {
          throw new Error('MySQL configuration is missing');
        }
        return this.mysql;
      default:
        throw new Error(`Unsupported database type: ${this.type}`);
    }
  }

  /**
   * Verifica si la configuración es válida para el tipo especificado
   * @param type Tipo de base de datos a verificar
   * @returns true si la configuración es válida
   */
  isValidForType(type: 'postgresql' | 'mysql'): boolean {
    try {
      return this.type === type && this[type] !== undefined;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene la cadena de conexión para el tipo de base de datos actual
   * @returns Cadena de conexión
   */
  getConnectionString(): string {
    switch (this.type) {
      case 'postgresql': {
        const config = this.postgresql!;
        const sslMode = config.ssl ? 'require' : 'disable';
        return `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}?sslmode=${sslMode}&connection_limit=${config.poolSize}`;
      }
      case 'mysql': {
        const config = this.mysql!;
        return `mysql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
      }
      default:
        throw new Error(`Unsupported database type: ${this.type}`);
    }
  }
}

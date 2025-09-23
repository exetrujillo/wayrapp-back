// __tests__/setup.ts

/**
 * Archivo de configuración de entorno para las suites de tests de integración.
 *
 * Este script utiliza los hooks `beforeAll` y `afterAll` de Jest para gestionar
 * el ciclo de vida de un contenedor de base de datos efímero usando Testcontainers.
 *
 * - `beforeAll`: Se ejecuta una vez antes de todos los tests en una suite (archivo).
 *   Se encarga de levantar un contenedor de base de datos, aplicar las migraciones
 *   de Prisma y preparar el entorno para las pruebas.
 *
 * - `afterAll`: Se ejecuta una vez después de que todos los tests en la suite han
 *   terminado. Se encarga de detener y destruir el contenedor para limpiar los recursos.
 *
 * Este enfoque garantiza que cada suite de tests se ejecute en una base de datos
 * completamente aislada y limpia.
 *
 * @module TestSetup
 * @category Testing
 * @author Exequiel Trujillo
 * @since 1.0.0
 */

import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql';
import {
  MongoDBContainer,
  StartedMongoDBContainer,
} from '@testcontainers/mongodb';
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

type SupportedContainer =
  | StartedPostgreSqlContainer
  | StartedMySqlContainer
  | StartedMongoDBContainer;

let container: SupportedContainer;

/**
 * Utilidades para tests de integración que pueden ser reutilizadas
 * por diferentes suites de tests.
 */
export class TestDatabaseUtils {
  /**
   * Crea un cliente de Prisma configurado para usar la URL de test
   * que se establece dinámicamente por Testcontainers.
   */
  static createTestPrismaClient(): PrismaClient {
    if (!process.env.TEST_DATABASE_URL) {
      throw new Error(
        'TEST_DATABASE_URL not set. Make sure the test container is running.'
      );
    }

    return new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL,
        },
      },
    });
  }

  /**
   * Limpia todas las tablas de la base de datos de test.
   * Útil para el beforeEach de los tests de integración.
   */
  static async cleanDatabase(prismaClient: PrismaClient): Promise<void> {
    // Limpiamos en orden inverso de dependencias para evitar errores de FK
    await prismaClient.user.deleteMany();
    // Aquí agregaremos más tablas conforme las vayamos creando
  }

  /**
   * Desconecta el cliente de Prisma de forma segura.
   * Útil para el afterAll de los tests de integración.
   */
  static async disconnectPrismaClient(
    prismaClient: PrismaClient
  ): Promise<void> {
    await prismaClient.$disconnect();
  }
}

// Aumentamos el timeout de Jest para dar tiempo a que el contenedor arranque.
jest.setTimeout(60000);

beforeAll(async () => {
  const dbType = process.env.TEST_DB_TYPE || 'postgres';
  console.log(`\nSetting up Testcontainer for: ${dbType}`);

  switch (dbType) {
    case 'postgres':
      container = await new PostgreSqlContainer('postgres:17.3-alpine').start();
      process.env.TEST_DATABASE_URL = container.getConnectionUri();
      break;
    case 'mysql':
      container = await new MySqlContainer('mysql:8.4')
        .withUser('testuser')
        .withRootPassword('testpass')
        .withDatabase('testdb')
        .start();
      process.env.TEST_DATABASE_URL = container.getConnectionUri();
      break;
    case 'mongodb':
      container = await new MongoDBContainer('mongo:8.0').start();
      process.env.TEST_DATABASE_URL = container.getConnectionString();
      break;
    default:
      throw new Error(`TEST_DB_TYPE no soportado: ${dbType}`);
  }

  console.log(`Iniciado el container de tipo ${dbType}.`);
  console.log(`URL de conexión: ${process.env.TEST_DATABASE_URL}`);

  if (dbType === 'postgres' || dbType === 'mysql') {
    console.log('Corriendo las migraciones de bases de datos...');
    await execAsync(
      `cross-env DATABASE_URL_POSTGRES=${process.env.TEST_DATABASE_URL} npx prisma migrate deploy`
    );
    console.log('Migraciones aplicadas exitosamente.');
  }
});

afterAll(async () => {
  console.log('\nDestruyendo Testcontainer...');
  if (container) {
    await container.stop();
    console.log('Testcontainer detenido.');
  }
});

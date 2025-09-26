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
import { PrismaClient } from '@/infrastructure/node_modules/.prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

type SupportedContainer = StartedPostgreSqlContainer | StartedMySqlContainer;

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
        'TEST_DATABASE_URL no seteado. Asegúrate de que el test container esté corriendo.'
      );
    }

    // Configuramos las variables de entorno que Prisma espera según el proveedor
    const dbProvider = process.env.DATABASE_PROVIDER;
    if (dbProvider === 'postgres') {
      process.env.DATABASE_URL_POSTGRES = process.env.TEST_DATABASE_URL;
    } else if (dbProvider === 'mysql') {
      process.env.DATABASE_URL_MYSQL = process.env.TEST_DATABASE_URL;
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

// Timeout de Jest para dar tiempo a que el contenedor arranque
jest.setTimeout(60000);

beforeAll(async () => {
  const dbProvider = process.env.DATABASE_PROVIDER;
  if (!dbProvider) {
    throw new Error(
      'La variable de entorno DATABASE_PROVIDER no está definida. Ejecuta los tests a través de los scripts de npm (ej: npm run test:integration:postgres)'
    );
  }

  console.log(`\nConfigurando Testcontainer para: ${dbProvider}`);

  switch (dbProvider) {
    case 'postgres':
      container = await new PostgreSqlContainer('postgres:17.3-alpine').start();
      process.env.TEST_DATABASE_URL = container.getConnectionUri();
      break;
    case 'mysql':
      container = await new MySqlContainer('mysql:8.4')
        .withRootPassword('testpass')
        .withDatabase('testdb')
        .start();
      process.env.TEST_DATABASE_URL = container.getConnectionUri();
      break;
    default:
      throw new Error(`DATABASE_PROVIDER no soportado: ${dbProvider}`);
  }

  console.log(`Iniciado el container de tipo ${dbProvider}.`);
  console.log(`URL de conexión: ${process.env.TEST_DATABASE_URL}`);

  let migrateCommand: string;
  if (dbProvider === 'postgres') {
    migrateCommand = `cross-env DATABASE_URL_POSTGRES='${process.env.TEST_DATABASE_URL}' npx prisma migrate deploy`;
  } else if (dbProvider === 'mysql') {
    // Para MySQL, necesitamos usar prisma db push en lugar de migrate deploy
    // porque las migraciones están configuradas para PostgreSQL
    migrateCommand = `cross-env DATABASE_URL_MYSQL='${process.env.TEST_DATABASE_URL}' npx prisma db push --force-reset`;
  } else {
    // Esto es por seguridad, aunque el switch anterior ya debería haber fallado
    throw new Error('No se pudo determinar el comando de migración.');
  }

  console.log('Ejecutando las migraciones de base de datos...');
  console.log(`Comando: ${migrateCommand}`);
  await execAsync(migrateCommand);
  console.log('Migraciones aplicadas exitosamente.');
});

afterAll(async () => {
  console.log('\nDestruyendo Testcontainer...');
  if (container) {
    await container.stop();
    console.log('Testcontainer detenido.');
  }
});

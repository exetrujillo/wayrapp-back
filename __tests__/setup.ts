// __tests__/setup.ts

/**
 * Módulo de configuración global para el entorno de pruebas de Jest.
 *
 * Este archivo es responsable de gestionar el ciclo de vida de los servicios externos
 * necesarios para las pruebas de integración, como las bases de datos. Utiliza
 * Testcontainers para crear y destruir dinámicamente contenedores Docker efímeros,
 * garantizando un entorno de prueba limpio y aislado para cada ejecución.
 *
 * La base de datos a utilizar (PostgreSQL, MySQL, MongoDB) se selecciona mediante
 * la variable de entorno `TEST_DB_TYPE`.
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
import { exec } from 'child_process'; // Importamos para poder ejecutar comandos de shell desde Node.js
import { promisify } from 'util'; // Importamos para poder usar 'exec' con async/await

const execAsync = promisify(exec); // Creamos una versión de 'exec' que retorna Promise.

// Definimos un tipo que representa cualquiera de los contenedores que podemos iniciar
type SupportedContainer =
  | StartedPostgreSqlContainer
  | StartedMySqlContainer
  | StartedMongoDBContainer;

// Extendemos el objeto global de Node.js para declarar de forma segura
// una variable global que usaremos para pasar la referencia del contenedor
// desde la función 'setup' a la función 'teardown'
declare global {
  var __TESTCONTAINER__: SupportedContainer;
}

/**
 * Función de configuración global (`globalSetup`) para Jest.
 * Se ejecuta UNA VEZ antes de que comiencen todas las suites de pruebas.
 * Se usa en jest.config.js y jest.integration.config.js
 */
const setup = async () => {
  // 1. Determinar qué base de datos usar, basándose en la variable de entorno.
  //    Si no se especifica, se usa PostgreSQL por defecto
  const dbType = process.env.TEST_DB_TYPE || 'postgres';
  console.log(`\nSetteando Testcontainer para: ${dbType}`);

  let container: SupportedContainer;
  let connectionUri: string;

  // 2. Iniciar el contenedor Docker correspondiente según el dbType
  switch (dbType) {
    case 'postgres':
      container = await new PostgreSqlContainer('postgres:17.3-alpine').start();
      connectionUri = container.getConnectionUri();
      break;

    case 'mysql':
      container = await new MySqlContainer('mysql:8.4')
        .withUser('testuser')
        .withRootPassword('testpass')
        .withDatabase('testdb')
        .start();
      connectionUri = container.getConnectionUri();
      break;

    case 'mongodb':
      container = await new MongoDBContainer('mongo:8.0').start();
      connectionUri = container.getConnectionString();
      break;

    default:
      throw new Error(`No hay soporte para TEST_DB_TYPE: ${dbType}`);
  }

  // 3. Almacenar la URL de conexión del contenedor en una variable de entorno.
  //    Nuestra aplicación (y Prisma Client) leerá esta variable para saber a qué
  //    base de datos efímera debe conectarse durante los tests
  process.env.TEST_DATABASE_URL = connectionUri;

  // 4. Guardar la referencia al contenedor iniciado en nuestra variable global
  //    para que la función 'teardown' pueda encontrarlo y detenerlo
  global.__TESTCONTAINER__ = container;

  console.log(`${dbType} container iniciado.`);
  console.log(`URL de conexión: ${connectionUri}`);

  // 5. Aplicar las migraciones de la base de datos (solo para SQL)
  //    Esto asegura que la base de datos efímera tenga la estructura de tablas correcta
  if (dbType === 'postgres' || dbType === 'mysql') {
    console.log('Corriendo migraciones de la base de datos...');

    await execAsync('npx prisma migrate deploy', {
      env: {
        ...process.env, // Hereda el entorno actual (importante para encontrar 'npx')
        // Establece la URL de la base de datos que usará el comando 'migrate'
        DATABASE_URL_POSTGRES: connectionUri,
        // Y las otras URLs con valores ficticios para satisfacer la validación del esquema
        DATABASE_URL_MYSQL: 'mysql://dummy:dummy@dummy:3306/dummy',
        DATABASE_URL_MONGO: 'mongodb://dummy:dummy@dummy:27017/dummy',
      },
    });

    console.log('Migraciones aplicadas correctamente.');
  }
};

// Exportamos 'setup' como la exportación por defecto, que es lo que Jest
// buscará para la propiedad 'globalSetup'
export default setup;

/**
 * Función de limpieza global (`globalTeardown`) para Jest.
 * Se ejecuta UNA VEZ después de que han terminado todas las suites de pruebas.
 */
export const teardown = async () => {
  const dbType = process.env.TEST_DB_TYPE || 'postgres';
  console.log(`\nTearing down Testcontainer for: ${dbType}`);

  if (global.__TESTCONTAINER__) {
    await global.__TESTCONTAINER__.stop();
    console.log(`${dbType} container stopped.`);
  }
};

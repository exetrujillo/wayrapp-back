// __tests__/setup.ts

import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql';
import {
  MongoDBContainer,
  StartedMongoDBContainer,
} from '@testcontainers/mongodb';

type SupportedContainer =
  | StartedPostgreSqlContainer
  | StartedMySqlContainer
  | StartedMongoDBContainer;

declare global {
  var __TESTCONTAINER__: SupportedContainer;
}

export async function setup() {
  const dbType = process.env.TEST_DB_TYPE || 'postgres';
  console.log(`\nSetting up Testcontainer for: ${dbType}`);

  let container: SupportedContainer;
  let connectionUri: string;

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
      throw new Error(`Unsupported TEST_DB_TYPE: ${dbType}`);
  }

  process.env.TEST_DATABASE_URL = connectionUri;
  global.__TESTCONTAINER__ = container;

  console.log(`${dbType} container started.`);
  console.log(`Connection URL: ${connectionUri}`);
}

export async function teardown() {
  const dbType = process.env.TEST_DB_TYPE || 'postgres';
  console.log(`\nTearing down Testcontainer for: ${dbType}`);

  if (global.__TESTCONTAINER__) {
    await global.__TESTCONTAINER__.stop();
    console.log(`${dbType} container stopped.`);
  }
}

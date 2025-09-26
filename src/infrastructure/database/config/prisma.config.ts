// src/infrastructure/database/config/prisma.config.ts

import { PrismaClient } from '@/infrastructure/node_modules/.prisma/client';
import { config } from '@/infrastructure/config/environment';

/**
 * Crea y configura una instancia de PrismaClient para desarrollo y producción.
 * Este cliente NO debe ser usado en tests - los tests tienen su propio setup
 * con TestDatabaseUtils para mantener el aislamiento completo.
 */
const createPrismaClient = () => {
  const databaseUrl = config.DATABASE_URL_POSTGRES;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL_POSTGRES is not defined. Please check your .env file.'
    );
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
};

const prismaClient = createPrismaClient();

export default prismaClient;

// src/infrastructure/database/config/prisma.config.ts

import { PrismaClient } from '@prisma/client';
import { config } from '@/infrastructure/config/environment';

/**
 * Crea y configura una instancia de PrismaClient para la aplicación.
 * Centraliza la lógica de conexión, permitiendo que la URL de la base de datos
 * sea sobrescrita por variables de entorno, lo cual es esencial para el testing.
 */
const createPrismaClient = () => {
  const databaseUrl =
    process.env.TEST_DATABASE_URL || config.DATABASE_URL_POSTGRES;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not defined. Please check your .env file or test setup.'
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

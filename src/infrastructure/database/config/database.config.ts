// src/infrastructure/database/config/database.config.ts

import prismaClient from '@/infrastructure/database/config/prisma.config.js';

// En el futuro, este archivo usará un Factory para decidir qué cliente usar.
// Por ahora, exporta directamente el cliente de Prisma configurado.
const dbClient = prismaClient;

export default dbClient;

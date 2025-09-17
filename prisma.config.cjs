// prisma.config.cjs

/**
 * Configuración para la CLI de Prisma en formato CommonJS.
 * Le dice a los comandos 'migrate', 'generate', etc., dónde encontrar el esquema.
 * No tiene dependencias para evitar ciclos durante 'prisma generate'.
 */
module.exports = {
  schema: './src/infrastructure/database/adapters/prisma/schema.prisma',
};

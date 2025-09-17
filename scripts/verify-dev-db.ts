// scripts/verify-dev-db.ts

import dbClient from '../src/infrastructure/database/config/database.config.js';

async function verifyDevConnection() {
  console.log('Verifying connection to the DEVELOPMENT database...');
  try {
    // Hacemos una consulta simple para forzar la conexión
    await dbClient.$queryRaw`SELECT 1`;
    console.log('✅ DEVELOPMENT database connection successful!');
  } catch (error) {
    console.error('❌ FAILED to connect to the DEVELOPMENT database.');
    console.error(error);
    process.exit(1);
  } finally {
    await dbClient.$disconnect();
  }
}

verifyDevConnection();

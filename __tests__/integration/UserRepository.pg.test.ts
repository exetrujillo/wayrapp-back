// __tests__/integration/postgresql/UserRepository.pg.test.ts

import { UserRepository } from '@/infrastructure/database/adapters/prisma/repositories/UserRepository';
import { TestDatabaseUtils } from '../setup';
// Importa la función de test de contrato
import { makeUserRepositoryContractTest } from '@/core/interfaces/repositories/__tests__/IUserRepository.contract.test';

// Llama a la función de test de contrato, pasándole la implementación de Prisma
makeUserRepositoryContractTest(
  'UserRepository Integration Tests - Contract', // Descripción clara
  () => {
    // Esta función configura el repositorio para el test de contrato
    const prismaClient = TestDatabaseUtils.createTestPrismaClient();
    const userRepository = new UserRepository(prismaClient);

    return {
      repository: userRepository,
      cleanDatabase: () => TestDatabaseUtils.cleanDatabase(prismaClient),
      verifyUserInDatabase: async (id: string) => {
        const user = await prismaClient.user.findUnique({ where: { id } });
        return user !== null;
      },
    };
  },
  async () => {
    // Esta función limpia los recursos al final del contrato
    const prismaClient = TestDatabaseUtils.createTestPrismaClient();
    await TestDatabaseUtils.disconnectPrismaClient(prismaClient);
  }
);

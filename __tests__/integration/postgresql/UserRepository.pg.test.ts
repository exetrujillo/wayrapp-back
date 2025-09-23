// __tests__/integration/postgresql/UserRepository.pg.test.ts

import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '@/core/interfaces/repositories/IUserRepository';
import { PrismaUserRepository } from '@/infrastructure/database/adapters/prisma/repositories/PrismaUserRepository';
import { TestDatabaseUtils } from '../../setup';

describe('PrismaUserRepository Integration Tests', () => {
  let userRepository: IUserRepository;
  let prismaClient: PrismaClient;

  beforeAll(() => {
    // Usamos la utilidad para crear el cliente de Prisma
    prismaClient = TestDatabaseUtils.createTestPrismaClient();
    userRepository = new PrismaUserRepository(prismaClient);
  });

  // Usamos la utilidad para limpiar la base de datos
  beforeEach(async () => {
    await TestDatabaseUtils.cleanDatabase(prismaClient);
  });

  afterAll(async () => {
    // Usamos la utilidad para desconectar
    await TestDatabaseUtils.disconnectPrismaClient(prismaClient);
  });

  describe('create', () => {
    it('debería crear un nuevo usuario y retornarlo', async () => {
      const userData = {
        id: uuidv4(),
        email: 'test@example.com',
        passwordHash:
          '$2b$12$L9.o/C.s5/b4j2e5.d8B9eO3U.G9eY2n9Z6k3W2b7j2k3X8.l2A3O',
        role: 'student' as const,
      };

      const createdUser = await userRepository.create(userData);

      expect(createdUser).toBeDefined();
      expect(createdUser.id).toBe(userData.id);
      expect(createdUser.email).toBe(userData.email);

      const userInDb = await prismaClient.user.findUnique({
        where: { id: userData.id },
      });
      expect(userInDb).not.toBeNull();
      expect(userInDb?.email).toBe(userData.email);
    });
  });
});

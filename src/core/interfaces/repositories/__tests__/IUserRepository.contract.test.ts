// src/core/interfaces/repositories/__tests__/IUserRepository.contract.test.ts

import { v4 as uuidv4 } from 'uuid';
import { IUserRepository } from '../IUserRepository';

/**
 * Función de test de contrato para IUserRepository.
 * Cualquier implementación de IUserRepository debe pasar estos tests.
 *
 * @param description Descripción de la suite de tests (ej. "PrismaUserRepository Contract")
 * @param setupRepository Función que devuelve una instancia de IUserRepository y funciones de utilidad.
 * @param teardownRepository Función para limpiar recursos después de todos los tests.
 */
export function makeUserRepositoryContractTest(
  description: string,
  setupRepository: () => {
    repository: IUserRepository;
    cleanDatabase: () => Promise<void>;
    verifyUserInDatabase: (id: string) => Promise<boolean>;
  },
  teardownRepository: () => Promise<void>
) {
  describe(description, () => {
    let userRepository: IUserRepository;
    let cleanDatabase: () => Promise<void>;
    let verifyUserInDatabase: (id: string) => Promise<boolean>;

    // Se ejecuta una vez antes de todos los tests en esta suite
    beforeAll(() => {
      const setup = setupRepository();
      userRepository = setup.repository;
      cleanDatabase = setup.cleanDatabase;
      verifyUserInDatabase = setup.verifyUserInDatabase;
    });

    // Se ejecuta antes de cada test para asegurar un estado limpio
    beforeEach(async () => {
      await cleanDatabase();
    });

    // Se ejecuta una vez después de todos los tests en esta suite
    afterAll(async () => {
      await teardownRepository();
    });

    // --- Tests del contrato ---

    describe('create', () => {
      it('debería crear un nuevo usuario y retornarlo', async () => {
        const userData = {
          id: uuidv4(),
          email: 'contract-test@example.com',
          passwordHash:
            '$2b$12$L9.o/C.s5/b4j2e5.d8B9eO3U.G9eY2n9Z6k3W2b7j2k3X8.l2A3O',
          role: 'student' as const,
        };

        const createdUser = await userRepository.create(userData);

        expect(createdUser).toBeDefined();
        expect(createdUser.id).toBe(userData.id);
        expect(createdUser.email).toBe(userData.email);
        expect(createdUser.role).toBe(userData.role);
        expect(createdUser.passwordHash).toBe(userData.passwordHash);
        expect(createdUser.createdAt).toBeInstanceOf(Date);
        expect(createdUser.updatedAt).toBeInstanceOf(Date);

        // Verificar que el usuario realmente se guardó en la base de datos
        const userExistsInDb = await verifyUserInDatabase(userData.id);
        expect(userExistsInDb).toBe(true);
      });
    });

    describe('findById', () => {
      it('debería encontrar un usuario por su ID', async () => {
        const userData = {
          id: uuidv4(),
          email: 'findbyid-test@example.com',
          passwordHash: '$2b$12$test.hash',
          role: 'student' as const,
        };

        await userRepository.create(userData);
        const foundUser = await userRepository.findById(userData.id);

        expect(foundUser).toBeDefined();
        expect(foundUser?.id).toBe(userData.id);
        expect(foundUser?.email).toBe(userData.email);
      });

      it('debería retornar null si el usuario no existe', async () => {
        const nonExistentId = uuidv4();
        const foundUser = await userRepository.findById(nonExistentId);

        expect(foundUser).toBeNull();
      });
    });

    describe('findByEmail', () => {
      it('debería encontrar un usuario por su email', async () => {
        const userData = {
          id: uuidv4(),
          email: 'findbyemail-test@example.com',
          passwordHash: '$2b$12$test.hash',
          role: 'content_creator' as const,
        };

        await userRepository.create(userData);
        const foundUser = await userRepository.findByEmail(userData.email);

        expect(foundUser).toBeDefined();
        expect(foundUser?.id).toBe(userData.id);
        expect(foundUser?.email).toBe(userData.email);
      });

      it('debería retornar null si el email no existe', async () => {
        const foundUser = await userRepository.findByEmail(
          'nonexistent@example.com'
        );

        expect(foundUser).toBeNull();
      });
    });

    describe('update', () => {
      it('debería actualizar un usuario existente', async () => {
        const userData = {
          id: uuidv4(),
          email: 'update-test@example.com',
          passwordHash: '$2b$12$original.hash',
          role: 'student' as const,
        };

        await userRepository.create(userData);

        const updateData = {
          email: 'updated-email@example.com',
          role: 'admin' as const,
        };

        const updatedUser = await userRepository.update(
          userData.id,
          updateData
        );

        expect(updatedUser).toBeDefined();
        expect(updatedUser?.id).toBe(userData.id);
        expect(updatedUser?.email).toBe(updateData.email);
        expect(updatedUser?.role).toBe(updateData.role);
        expect(updatedUser?.passwordHash).toBe(userData.passwordHash); // No debería cambiar
      });

      it('debería retornar null si el usuario no existe', async () => {
        const nonExistentId = uuidv4();
        const updatedUser = await userRepository.update(nonExistentId, {
          email: 'test@example.com',
        });

        expect(updatedUser).toBeNull();
      });
    });

    describe('delete', () => {
      it('debería eliminar un usuario existente', async () => {
        const userData = {
          id: uuidv4(),
          email: 'delete-test@example.com',
          passwordHash: '$2b$12$test.hash',
          role: 'student' as const,
        };

        await userRepository.create(userData);

        // Verificar que el usuario existe antes de eliminarlo
        const userBeforeDelete = await userRepository.findById(userData.id);
        expect(userBeforeDelete).toBeDefined();

        // Eliminar el usuario
        await userRepository.delete(userData.id);

        // Verificar que el usuario ya no existe
        const userAfterDelete = await userRepository.findById(userData.id);
        expect(userAfterDelete).toBeNull();
      });

      it('no debería fallar al intentar eliminar un usuario que no existe', async () => {
        const nonExistentId = uuidv4();

        // Esta operación no debería lanzar un error
        await expect(
          userRepository.delete(nonExistentId)
        ).resolves.not.toThrow();
      });
    });
  });
}

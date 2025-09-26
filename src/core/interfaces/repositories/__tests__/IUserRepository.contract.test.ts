// src/core/interfaces/repositories/__tests__/IUserRepository.contract.test.ts

import { v4 as uuidv4 } from 'uuid';
import { IUserRepository } from '../IUserRepository';
import { User } from '@/core/domain/entities/User';
import { Email } from '@/core/domain/value-objects/Email';
import { HashedPassword } from '@/core/domain/value-objects/Password';
import { Role } from '@/core/domain/value-objects/Role';

/**
 * Función de test de contrato para IUserRepository.
 * Cualquier implementación de IUserRepository debe pasar estos tests.
 *
 * @param description Descripción de la suite de tests (ej. "UserRepository Contract")
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
        const userData = new User(
          uuidv4(),
          new Email('contract-test@example.com'),
          new HashedPassword(
            '$2b$12$L9.o/C.s5/b4j2e5.d8B9eO3U.G9eY2n9Z6k3W2b7j2k3X8.l2A3O'
          ),
          new Role('student'),
          new Date(), // Será ignorado por create
          new Date() // Será ignorado por create
        );

        // Crear datos de usuario sin timestamps para el método create
        const createData = {
          id: userData.id,
          email: userData.email,
          passwordHash: userData.passwordHash,
          role: userData.role,
        } as Omit<User, 'createdAt' | 'updatedAt'>;
        const createdUser = await userRepository.create(createData);

        expect(createdUser).toBeInstanceOf(User);
        expect(createdUser.id).toBe(userData.id);
        expect(createdUser.email).toBeInstanceOf(Email);
        expect(createdUser.email.value).toBe(userData.email.value);
        expect(createdUser.passwordHash).toBeInstanceOf(HashedPassword);
        expect(createdUser.passwordHash.value).toBe(
          userData.passwordHash.value
        );
        expect(createdUser.role).toBeInstanceOf(Role);
        expect(createdUser.role.value).toBe(userData.role.value);
        expect(createdUser.createdAt).toBeInstanceOf(Date);
        expect(createdUser.updatedAt).toBeInstanceOf(Date);

        // Verificar que el usuario realmente se guardó en la base de datos
        const userExistsInDb = await verifyUserInDatabase(userData.id);
        expect(userExistsInDb).toBe(true);
      });
    });

    describe('findById', () => {
      it('debería encontrar un usuario por su ID', async () => {
        const userData = new User(
          uuidv4(),
          new Email('findbyid-test@example.com'),
          new HashedPassword(
            '$2b$12$L9.o/C.s5/b4j2e5.d8B9eO3U.G9eY2n9Z6k3W2b7j2k3X8.l2A3O'
          ),
          new Role('student'),
          new Date(),
          new Date()
        );

        const createData = {
          id: userData.id,
          email: userData.email,
          passwordHash: userData.passwordHash,
          role: userData.role,
        } as Omit<User, 'createdAt' | 'updatedAt'>;
        await userRepository.create(createData);
        const foundUser = await userRepository.findById(userData.id);

        expect(foundUser).toBeInstanceOf(User);
        expect(foundUser?.id).toBe(userData.id);
        expect(foundUser?.email).toBeInstanceOf(Email);
        expect(foundUser?.email.value).toBe(userData.email.value);
        expect(foundUser?.passwordHash).toBeInstanceOf(HashedPassword);
        expect(foundUser?.role).toBeInstanceOf(Role);
      });

      it('debería retornar null si el usuario no existe', async () => {
        const nonExistentId = uuidv4();
        const foundUser = await userRepository.findById(nonExistentId);

        expect(foundUser).toBeNull();
      });
    });

    describe('findByEmail', () => {
      it('debería encontrar un usuario por su email', async () => {
        const userData = new User(
          uuidv4(),
          new Email('findbyemail-test@example.com'),
          new HashedPassword(
            '$2b$12$L9.o/C.s5/b4j2e5.d8B9eO3U.G9eY2n9Z6k3W2b7j2k3X8.l2A3O'
          ),
          new Role('content_creator'),
          new Date(),
          new Date()
        );

        const createData = {
          id: userData.id,
          email: userData.email,
          passwordHash: userData.passwordHash,
          role: userData.role,
        } as Omit<User, 'createdAt' | 'updatedAt'>;
        await userRepository.create(createData);
        const foundUser = await userRepository.findByEmail(
          userData.email.value
        );

        expect(foundUser).toBeInstanceOf(User);
        expect(foundUser?.id).toBe(userData.id);
        expect(foundUser?.email).toBeInstanceOf(Email);
        expect(foundUser?.email.value).toBe(userData.email.value);
        expect(foundUser?.role).toBeInstanceOf(Role);
        expect(foundUser?.role.value).toBe(userData.role.value);
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
        const userData = new User(
          uuidv4(),
          new Email('update-test@example.com'),
          new HashedPassword(
            '$2b$12$L9.o/C.s5/b4j2e5.d8B9eO3U.G9eY2n9Z6k3W2b7j2k3X8.l2A3O'
          ),
          new Role('student'),
          new Date(),
          new Date()
        );

        const createData = {
          id: userData.id,
          email: userData.email,
          passwordHash: userData.passwordHash,
          role: userData.role,
        } as Omit<User, 'createdAt' | 'updatedAt'>;
        await userRepository.create(createData);

        const updateData = {
          email: new Email('updated-email@example.com'),
          role: new Role('admin'),
        };

        const updatedUser = await userRepository.update(
          userData.id,
          updateData
        );

        expect(updatedUser).toBeInstanceOf(User);
        expect(updatedUser?.id).toBe(userData.id);
        expect(updatedUser?.email).toBeInstanceOf(Email);
        expect(updatedUser?.email.value).toBe(updateData.email.value);
        expect(updatedUser?.role).toBeInstanceOf(Role);
        expect(updatedUser?.role.value).toBe(updateData.role.value);
        expect(updatedUser?.passwordHash).toBeInstanceOf(HashedPassword);
        expect(updatedUser?.passwordHash.value).toBe(
          userData.passwordHash.value
        ); // No debería cambiar
      });

      it('debería retornar null si el usuario no existe', async () => {
        const nonExistentId = uuidv4();
        const updatedUser = await userRepository.update(nonExistentId, {
          email: new Email('test@example.com'),
        });

        expect(updatedUser).toBeNull();
      });
    });

    describe('delete', () => {
      it('debería eliminar un usuario existente', async () => {
        const userData = new User(
          uuidv4(),
          new Email('delete-test@example.com'),
          new HashedPassword(
            '$2b$12$L9.o/C.s5/b4j2e5.d8B9eO3U.G9eY2n9Z6k3W2b7j2k3X8.l2A3O'
          ),
          new Role('student'),
          new Date(),
          new Date()
        );

        const createData = {
          id: userData.id,
          email: userData.email,
          passwordHash: userData.passwordHash,
          role: userData.role,
        } as Omit<User, 'createdAt' | 'updatedAt'>;
        await userRepository.create(createData);

        // Verificar que el usuario existe antes de eliminarlo
        const userBeforeDelete = await userRepository.findById(userData.id);
        expect(userBeforeDelete).toBeInstanceOf(User);

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

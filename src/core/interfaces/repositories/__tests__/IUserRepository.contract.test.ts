// src/core/interfaces/repositories/__tests__/IUserRepository.contract.test.ts

import { v4 as uuidv4 } from 'uuid';
import { IUserRepository } from '../IUserRepository';
import { User } from '@/core/domain/entities/User';
import { Email } from '@/core/domain/value-objects/Email';
import { HashedPassword } from '@/core/domain/value-objects/Password';
import { Role } from '@/core/domain/value-objects/Role';
import { Username } from '@/core/domain/value-objects/Username';
import { CountryCode } from '@/core/domain/value-objects/CountryCode';

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
        // Datos básicos para crear el usuario
        const userData = {
          email: new Email('contract-test@example.com'),
          username: new Username('contract_user'),
          passwordHash: new HashedPassword(
            '$2b$12$L9.o/C.s5/b4j2e5.d8B9eO3U.G9eY2n9Z6k3W2b7j2k3X8.l2A3O'
          ),
          role: new Role('student'),
          countryCode: new CountryCode('US'),
        };

        const createdUser = await userRepository.create(userData);

        expect(createdUser).toBeInstanceOf(User);
        expect(createdUser.id).toBeDefined(); // ID generado automáticamente
        expect(typeof createdUser.id).toBe('string');
        expect(createdUser.email).toBeInstanceOf(Email);
        expect(createdUser.email.value).toBe(userData.email.value);
        expect(createdUser.username).toBeInstanceOf(Username);
        expect(createdUser.username.value).toBe(userData.username.value);
        expect(createdUser.passwordHash).toBeInstanceOf(HashedPassword);
        expect(createdUser.passwordHash.value).toBe(
          userData.passwordHash.value
        );
        expect(createdUser.role).toBeInstanceOf(Role);
        expect(createdUser.role.value).toBe(userData.role.value);
        expect(createdUser.countryCode).toBeInstanceOf(CountryCode);
        expect(createdUser.countryCode?.value).toBe(userData.countryCode.value);
        expect(createdUser.createdAt).toBeInstanceOf(Date);
        expect(createdUser.updatedAt).toBeInstanceOf(Date);

        // Verificar que el usuario realmente se guardó en la base de datos
        const userExistsInDb = await verifyUserInDatabase(createdUser.id);
        expect(userExistsInDb).toBe(true);
      });
    });

    describe('findById', () => {
      it('debería encontrar un usuario por su ID', async () => {
        const userData = {
          email: new Email('findbyid-test@example.com'),
          username: new Username('findbyid_user'),
          passwordHash: new HashedPassword(
            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5DDu.'
          ),
          role: new Role('student'),
          countryCode: new CountryCode('BR'),
        };

        const createdUser = await userRepository.create(userData);
        const foundUser = await userRepository.findById(createdUser.id);

        expect(foundUser).toBeInstanceOf(User);
        expect(foundUser?.id).toBe(createdUser.id);
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
        const userData = {
          email: new Email('findbyemail-test@example.com'),
          username: new Username('findbyemail_user'),
          passwordHash: new HashedPassword(
            '$2b$12$L9.o/C.s5/b4j2e5.d8B9eO3U.G9eY2n9Z6k3W2b7j2k3X8.l2A3O'
          ),
          role: new Role('content_creator'),
        };

        const createdUser = await userRepository.create(userData);
        const foundUser = await userRepository.findByEmail(
          userData.email.value
        );

        expect(foundUser).toBeInstanceOf(User);
        expect(foundUser?.id).toBe(createdUser.id);
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
        const userData = {
          email: new Email('update-test@example.com'),
          username: new Username('update_user'),
          passwordHash: new HashedPassword(
            '$2b$12$L9.o/C.s5/b4j2e5.d8B9eO3U.G9eY2n9Z6k3W2b7j2k3X8.l2A3O'
          ),
          role: new Role('student'),
        };

        const createdUser = await userRepository.create(userData);

        const updateData = {
          email: new Email('updated-email@example.com'),
          role: new Role('admin'),
        };

        const updatedUser = await userRepository.update(
          createdUser.id,
          updateData
        );

        expect(updatedUser).toBeInstanceOf(User);
        expect(updatedUser?.id).toBe(createdUser.id);
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
        const userData = {
          email: new Email('delete-test@example.com'),
          username: new Username('delete_user'),
          passwordHash: new HashedPassword(
            '$2b$12$L9.o/C.s5/b4j2e5.d8B9eO3U.G9eY2n9Z6k3W2b7j2k3X8.l2A3O'
          ),
          role: new Role('student'),
        };

        const createdUser = await userRepository.create(userData);

        // Verificar que el usuario existe antes de eliminarlo
        const userBeforeDelete = await userRepository.findById(createdUser.id);
        expect(userBeforeDelete).toBeInstanceOf(User);

        // Eliminar el usuario
        await userRepository.delete(createdUser.id);

        // Verificar que el usuario ya no existe
        const userAfterDelete = await userRepository.findById(createdUser.id);
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

    describe('countUsers', () => {
      it('debería contar el número total de usuarios', async () => {
        // Inicialmente no debería haber usuarios
        let userCount = await userRepository.countUsers();
        expect(userCount).toBe(0);

        // Crear algunos usuarios
        const userData1 = {
          email: new Email('contract-test@example.com'),
          username: new Username('count_user1'),
          passwordHash: new HashedPassword(
            '$2b$12$L9.o/C.s5/b4j2e5.d8B9eO3U.G9eY2n9Z6k3W2b7j2k3X8.l2A3O'
          ),
          role: new Role('student'),
        };
        const userData2 = {
          email: new Email('contract-test2@example.com'),
          username: new Username('count_user2'),
          passwordHash: new HashedPassword(
            '$2b$12$L9.o/C.s5/b4j2e5.d8B9eO3U.G9eY2n9Z6k3W2b7j2k3X8.l2A3O'
          ),
          role: new Role('admin'),
        };

        await userRepository.create(userData1);
        await userRepository.create(userData2);

        // Ahora el conteo debería reflejar los usuarios creados
        userCount = await userRepository.countUsers();
        expect(userCount).toBe(2);
      });
    });

    describe('findUsersByRole', () => {
      it('debería encontrar usuarios por su rol', async () => {
        // Crear algunos usuarios
        const userData1 = {
          email: new Email('contract-test@example.com'),
          username: new Username('role_test_user1'),
          passwordHash: new HashedPassword(
            '$2b$12$L9.o/C.s5/b4j2e5.d8B9eO3U.G9eY2n9Z6k3W2b7j2k3X8.l2A3O'
          ),
          role: new Role('student'),
        };
        const userData2 = {
          email: new Email('contract-test2@example.com'),
          username: new Username('role_test_user2'),
          passwordHash: new HashedPassword(
            '$2b$12$L9.o/C.s5/b4j2e5.d8B9eO3U.G9eY2n9Z6k3W2b7j2k3X8.l2A3O'
          ),
          role: new Role('admin'),
        };
        const userData3 = {
          email: new Email('contract-test3@example.com'),
          username: new Username('role_test_user3'),
          passwordHash: new HashedPassword(
            '$2b$12$L9.o/C.s5/b4j2e5.d8B9eO3U.G9eY2n9Z6k3W2b7j2k3X8.l2A3O'
          ),
          role: new Role('admin'),
        };

        await userRepository.create(userData1);
        await userRepository.create(userData2);
        await userRepository.create(userData3);

        const students = await userRepository.findUsersByRole('student');
        const admins = await userRepository.findUsersByRole('admin');
        expect(students.length).toBe(1);
        expect(admins.length).toBe(2);
      });
    });
  });
}

// src/core/domain/entities/__tests__/User.test.ts

import { v4 as uuidv4 } from 'uuid';
import { User } from '@/core/domain/entities/User';
import { Email } from '@/core/domain/value-objects/Email';
import { Role } from '@/core/domain/value-objects/Role';
import {
  PlainPassword,
  HashedPassword,
} from '@/core/domain/value-objects/Password';
import { PasswordService } from '@/infrastructure/services/PasswordService';

describe('User Entity', () => {
  let passwordService: PasswordService;

  beforeAll(() => {
    passwordService = new PasswordService(12);
  });

  describe('constructor', () => {
    it('debería crear un usuario válido con value objects', async () => {
      const id = uuidv4();
      const email = new Email('test@example.com');
      const role = new Role('student');
      const plainPassword = new PlainPassword('TestPass123!');
      const passwordHash = await passwordService.hash(plainPassword);
      const now = new Date();

      const user = new User(id, email, passwordHash, role, now, now);

      expect(user.id).toBe(id);
      expect(user.email).toBe(email);
      expect(user.role).toBe(role);
      expect(user.passwordHash).toBe(passwordHash);
      expect(user.createdAt).toBe(now);
      expect(user.updatedAt).toBe(now);
    });

    it('debería crear usuarios con diferentes roles', async () => {
      const validRoleStrings = ['student', 'content_creator', 'admin'];

      for (const roleString of validRoleStrings) {
        const role = new Role(roleString);
        const email = new Email(`${roleString}@example.com`);
        const plainPassword = new PlainPassword(`${roleString}Pass123!`);
        const passwordHash = await passwordService.hash(plainPassword);

        const user = new User(
          uuidv4(),
          email,
          passwordHash,
          role,
          new Date(),
          new Date()
        );

        expect(user.role.value).toBe(roleString);
        expect(user.email.value).toBe(`${roleString}@example.com`);
        expect(user.passwordHash.isBcryptHash()).toBe(true);
      }
    });
  });

  describe('getters', () => {
    it('debería exponer propiedades correctamente', async () => {
      const id = uuidv4();
      const email = new Email('test@example.com');
      const role = new Role('student');
      const plainPassword = new PlainPassword('TestPass123!');
      const passwordHash = await passwordService.hash(plainPassword);
      const now = new Date();

      const user = new User(id, email, passwordHash, role, now, now);

      // Validar que el ID es un UUID válido (formato v4)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(user.id).toMatch(uuidRegex);

      // Validar propiedades básicas
      expect(user.email.value).toBe('test@example.com');
      expect(user.role.value).toBe('student');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);

      // Validar que el passwordHash tiene el formato esperado de bcrypt
      expect(user.passwordHash.value).toMatch(/^\$2b\$12\$/);
      expect(user.passwordHash.isBcryptHash()).toBe(true);
    });
  });

  describe('domain methods', () => {
    it('debería mantener timestamps coherentes', async () => {
      const now = new Date();
      const email = new Email('timestamp-test@example.com');
      const role = new Role('student');
      const plainPassword = new PlainPassword('TimestampPass123!');
      const passwordHash = await passwordService.hash(plainPassword);

      const user = new User(uuidv4(), email, passwordHash, role, now, now);

      expect(user.createdAt).toBe(now);
      expect(user.updatedAt).toBe(now);
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(
        user.updatedAt.getTime()
      );
    });

    it('debería generar IDs únicos para diferentes usuarios', async () => {
      const plainPassword1 = new PlainPassword('User1Pass123!');
      const plainPassword2 = new PlainPassword('User2Pass456@');

      const user1 = new User(
        uuidv4(),
        new Email('user1@example.com'),
        await passwordService.hash(plainPassword1),
        new Role('student'),
        new Date(),
        new Date()
      );

      const user2 = new User(
        uuidv4(),
        new Email('user2@example.com'),
        await passwordService.hash(plainPassword2),
        new Role('content_creator'),
        new Date(),
        new Date()
      );

      expect(user1.id).not.toBe(user2.id);
      expect(user1.email.value).not.toBe(user2.email.value);
      expect(user1.passwordHash.value).not.toBe(user2.passwordHash.value);

      // Ambos deben ser UUIDs válidos
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(user1.id).toMatch(uuidRegex);
      expect(user2.id).toMatch(uuidRegex);
    });

    it('debería exponer métodos de utilidad del role', async () => {
      const studentPlainPassword = new PlainPassword('StudentPass123!');
      const adminPlainPassword = new PlainPassword('AdminPass456@');

      const studentUser = new User(
        uuidv4(),
        new Email('student@example.com'),
        await passwordService.hash(studentPlainPassword),
        new Role('student'),
        new Date(),
        new Date()
      );

      const adminUser = new User(
        uuidv4(),
        new Email('admin@example.com'),
        await passwordService.hash(adminPlainPassword),
        new Role('admin'),
        new Date(),
        new Date()
      );

      expect(studentUser.role.isStudent()).toBe(true);
      expect(studentUser.role.canCreateContent()).toBe(false);

      expect(adminUser.role.isAdmin()).toBe(true);
      expect(adminUser.role.canCreateContent()).toBe(true);
      expect(adminUser.role.hasAdminPrivileges()).toBe(true);
    });

    it('debería exponer métodos de utilidad de la entidad User', async () => {
      const studentPlainPassword = new PlainPassword('StudentPass123!');
      const creatorPlainPassword = new PlainPassword('CreatorPass456@');
      const adminPlainPassword = new PlainPassword('AdminPass789#');

      const studentUser = new User(
        uuidv4(),
        new Email('student@example.com'),
        await passwordService.hash(studentPlainPassword),
        new Role('student'),
        new Date(),
        new Date()
      );

      const contentCreatorUser = new User(
        uuidv4(),
        new Email('creator@example.com'),
        await passwordService.hash(creatorPlainPassword),
        new Role('content_creator'),
        new Date(),
        new Date()
      );

      const adminUser = new User(
        uuidv4(),
        new Email('admin@example.com'),
        await passwordService.hash(adminPlainPassword),
        new Role('admin'),
        new Date(),
        new Date()
      );

      // Test métodos delegados de User
      expect(studentUser.canCreateContent()).toBe(false);
      expect(studentUser.hasAdminPrivileges()).toBe(false);
      expect(studentUser.isStudent()).toBe(true);
      expect(studentUser.isContentCreator()).toBe(false);
      expect(studentUser.isAdmin()).toBe(false);

      expect(contentCreatorUser.canCreateContent()).toBe(true);
      expect(contentCreatorUser.hasAdminPrivileges()).toBe(false);
      expect(contentCreatorUser.isStudent()).toBe(false);
      expect(contentCreatorUser.isContentCreator()).toBe(true);
      expect(contentCreatorUser.isAdmin()).toBe(false);

      expect(adminUser.canCreateContent()).toBe(true);
      expect(adminUser.hasAdminPrivileges()).toBe(true);
      expect(adminUser.isStudent()).toBe(false);
      expect(adminUser.isContentCreator()).toBe(false);
      expect(adminUser.isAdmin()).toBe(true);

      // Test métodos getter de valores
      expect(studentUser.getEmailValue()).toBe('student@example.com');
      expect(studentUser.getRoleValue()).toBe('student');
      expect(studentUser.getPasswordHashValue()).toMatch(/^\$2b\$12\$/);

      // Verificar que las contraseñas se pueden validar correctamente
      expect(
        await passwordService.verify(
          studentPlainPassword,
          studentUser.passwordHash
        )
      ).toBe(true);
      expect(
        await passwordService.verify(
          creatorPlainPassword,
          contentCreatorUser.passwordHash
        )
      ).toBe(true);
      expect(
        await passwordService.verify(adminPlainPassword, adminUser.passwordHash)
      ).toBe(true);
    });
  });

  describe('validaciones del constructor', () => {
    let validEmail: Email;
    let validRole: Role;
    let validPasswordHash: HashedPassword;
    let validDate: Date;

    beforeAll(async () => {
      validEmail = new Email('test@example.com');
      validRole = new Role('student');
      const plainPassword = new PlainPassword('ValidPass123!');
      validPasswordHash = await passwordService.hash(plainPassword);
      validDate = new Date();
    });

    it('debería lanzar error con ID inválido', () => {
      expect(() => {
        new User(
          '',
          validEmail,
          validPasswordHash,
          validRole,
          validDate,
          validDate
        );
      }).toThrow('ID de usuario inválido');

      expect(() => {
        new User(
          '   ',
          validEmail,
          validPasswordHash,
          validRole,
          validDate,
          validDate
        );
      }).toThrow('ID de usuario inválido');
    });

    it('debería lanzar error con passwordHash inválido', () => {
      expect(() => {
        new User(
          uuidv4(),
          validEmail,
          null as unknown as HashedPassword,
          validRole,
          validDate,
          validDate
        );
      }).toThrow('El usuario debe tener un hash de contraseña válido');

      expect(() => {
        new User(
          uuidv4(),
          validEmail,
          'invalid' as unknown as HashedPassword,
          validRole,
          validDate,
          validDate
        );
      }).toThrow('El usuario debe tener un hash de contraseña válido');
    });

    it('debería lanzar error con fechas inválidas', () => {
      expect(() => {
        new User(
          uuidv4(),
          validEmail,
          validPasswordHash,
          validRole,
          null as unknown as Date,
          validDate
        );
      }).toThrow('Fecha de creación inválida');

      expect(() => {
        new User(
          uuidv4(),
          validEmail,
          validPasswordHash,
          validRole,
          validDate,
          null as unknown as Date
        );
      }).toThrow('Fecha de actualización inválida');
    });

    it('debería lanzar error si updatedAt es anterior a createdAt', () => {
      const createdAt = new Date('2023-01-02');
      const updatedAt = new Date('2023-01-01');

      expect(() => {
        new User(
          uuidv4(),
          validEmail,
          validPasswordHash,
          validRole,
          createdAt,
          updatedAt
        );
      }).toThrow(
        'La fecha de actualización no puede ser anterior a la fecha de creación'
      );
    });

    describe('integration with PasswordService', () => {
      it('debería funcionar correctamente en un flujo completo de autenticación', async () => {
        // Simular registro de usuario
        const plainPassword = new PlainPassword('UserRegistration123!');
        const hashedPassword = await passwordService.hash(plainPassword);

        const user = new User(
          uuidv4(),
          new Email('integration@example.com'),
          hashedPassword,
          new Role('student'),
          new Date(),
          new Date()
        );

        // Verificar que el usuario se creó correctamente
        expect(user.passwordHash.isBcryptHash()).toBe(true);
        expect(user.passwordHash.getBcryptCost()).toBe(12);
        expect(user.passwordHash.hasSecureCost()).toBe(true);

        // Simular login exitoso
        const loginPassword = new PlainPassword('UserRegistration123!');
        const loginSuccess = await passwordService.verify(
          loginPassword,
          user.passwordHash
        );
        expect(loginSuccess).toBe(true);

        // Simular login fallido
        const wrongPassword = new PlainPassword('WrongPassword123!');
        const loginFailure = await passwordService.verify(
          wrongPassword,
          user.passwordHash
        );
        expect(loginFailure).toBe(false);
      });

      it('debería manejar múltiples usuarios con diferentes contraseñas', async () => {
        const users = [];
        const passwords = ['FirstUser123!', 'SecondUser456@', 'ThirdUser789#'];

        // Crear usuarios con diferentes contraseñas
        for (let i = 0; i < passwords.length; i++) {
          const plainPassword = new PlainPassword(passwords[i]);
          const hashedPassword = await passwordService.hash(plainPassword);

          const user = new User(
            uuidv4(),
            new Email(`user${i + 1}@example.com`),
            hashedPassword,
            new Role('student'),
            new Date(),
            new Date()
          );

          users.push({ user, plainPassword });
        }

        // Verificar que cada usuario puede autenticarse con su propia contraseña
        for (let i = 0; i < users.length; i++) {
          const { user, plainPassword } = users[i];
          const isValid = await passwordService.verify(
            plainPassword,
            user.passwordHash
          );
          expect(isValid).toBe(true);

          // Verificar que no puede autenticarse con contraseñas de otros usuarios
          for (let j = 0; j < passwords.length; j++) {
            if (i !== j) {
              const otherPassword = new PlainPassword(passwords[j]);
              const isInvalid = await passwordService.verify(
                otherPassword,
                user.passwordHash
              );
              expect(isInvalid).toBe(false);
            }
          }
        }
      });
    });
  });
});

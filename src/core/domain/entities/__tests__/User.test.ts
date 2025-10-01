// src/core/domain/entities/__tests__/User.test.ts

import { v4 as uuidv4 } from 'uuid';
import { User } from '@/core/domain/entities/User';
import { Email } from '@/core/domain/value-objects/Email';
import { Role } from '@/core/domain/value-objects/Role';
import { Username } from '@/core/domain/value-objects/Username';
import { CountryCode } from '@/core/domain/value-objects/CountryCode';
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

  describe('factory methods', () => {
    it('debería crear un usuario válido con User.create()', async () => {
      const email = new Email('test@example.com');
      const username = new Username('testuser');
      const role = new Role('student');
      const countryCode = new CountryCode('US');
      const plainPassword = new PlainPassword('TestPass123!');
      const passwordHash = await passwordService.hash(plainPassword);

      const user = User.create(
        email,
        username,
        passwordHash,
        role,
        countryCode
      );

      expect(user.id).toBeDefined();
      expect(typeof user.id).toBe('string');
      expect(user.email).toBe(email);
      expect(user.username).toBe(username);
      expect(user.role).toBe(role);
      expect(user.countryCode).toBe(countryCode);
      expect(user.passwordHash).toBe(passwordHash);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(
        user.updatedAt.getTime()
      );
    });

    it('debería crear un usuario con ID específico usando User.create()', async () => {
      const id = uuidv4();
      const email = new Email('test@example.com');
      const username = new Username('testuser');
      const role = new Role('student');
      const plainPassword = new PlainPassword('TestPass123!');
      const passwordHash = await passwordService.hash(plainPassword);

      const user = User.create(email, username, passwordHash, role, null, id);

      expect(user.id).toBe(id);
      expect(user.email).toBe(email);
      expect(user.username).toBe(username);
      expect(user.role).toBe(role);
      expect(user.countryCode).toBe(null);
      expect(user.passwordHash).toBe(passwordHash);
    });

    it('debería reconstruir un usuario desde persistencia con User.fromPersistence()', async () => {
      const id = uuidv4();
      const email = new Email('test@example.com');
      const username = new Username('testuser');
      const role = new Role('student');
      const countryCode = new CountryCode('BR');
      const plainPassword = new PlainPassword('TestPass123!');
      const passwordHash = await passwordService.hash(plainPassword);
      const createdAt = new Date('2023-01-01');
      const updatedAt = new Date('2023-01-02');

      const user = User.fromPersistence(
        id,
        email,
        username,
        passwordHash,
        role,
        countryCode,
        createdAt,
        updatedAt
      );

      expect(user.id).toBe(id);
      expect(user.email).toBe(email);
      expect(user.username).toBe(username);
      expect(user.role).toBe(role);
      expect(user.countryCode).toBe(countryCode);
      expect(user.passwordHash).toBe(passwordHash);
      expect(user.createdAt).toBe(createdAt);
      expect(user.updatedAt).toBe(updatedAt);
    });

    it('debería crear usuarios con diferentes roles usando User.create()', async () => {
      const validRoleStrings = ['student', 'content_creator', 'admin'];

      for (const roleString of validRoleStrings) {
        const role = new Role(roleString);
        const email = new Email(`${roleString}@example.com`);
        const username = new Username(`${roleString}_user`);
        const plainPassword = new PlainPassword(`${roleString}Pass123!`);
        const passwordHash = await passwordService.hash(plainPassword);

        const user = User.create(email, username, passwordHash, role);

        expect(user.role.value).toBe(roleString);
        expect(user.email.value).toBe(`${roleString}@example.com`);
        expect(user.username.value).toBe(`${roleString}_user`);
        expect(user.passwordHash.isBcryptHash()).toBe(true);
        expect(user.id).toBeDefined();
      }
    });
  });

  describe('getters', () => {
    it('debería exponer propiedades correctamente', async () => {
      const email = new Email('test@example.com');
      const username = new Username('testuser');
      const role = new Role('student');
      const plainPassword = new PlainPassword('TestPass123!');
      const passwordHash = await passwordService.hash(plainPassword);

      const user = User.create(email, username, passwordHash, role);

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
      const email = new Email('timestamp-test@example.com');
      const username = new Username('timestamp_user');
      const role = new Role('student');
      const plainPassword = new PlainPassword('TimestampPass123!');
      const passwordHash = await passwordService.hash(plainPassword);

      const user = User.create(email, username, passwordHash, role);

      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(
        user.updatedAt.getTime()
      );
    });

    it('debería generar IDs únicos para diferentes usuarios', async () => {
      const plainPassword1 = new PlainPassword('User1Pass123!');
      const plainPassword2 = new PlainPassword('User2Pass456@');

      const user1 = User.create(
        new Email('user1@example.com'),
        new Username('user1'),
        await passwordService.hash(plainPassword1),
        new Role('student')
      );

      const user2 = User.create(
        new Email('user2@example.com'),
        new Username('user2'),
        await passwordService.hash(plainPassword2),
        new Role('content_creator')
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

      const studentUser = User.create(
        new Email('student@example.com'),
        new Username('student_user'),
        await passwordService.hash(studentPlainPassword),
        new Role('student')
      );

      const adminUser = User.create(
        new Email('admin@example.com'),
        new Username('admin_user'),
        await passwordService.hash(adminPlainPassword),
        new Role('admin')
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

      const studentUser = User.create(
        new Email('student@example.com'),
        new Username('student_user'),
        await passwordService.hash(studentPlainPassword),
        new Role('student')
      );

      const contentCreatorUser = User.create(
        new Email('creator@example.com'),
        new Username('creator_user'),
        await passwordService.hash(creatorPlainPassword),
        new Role('content_creator')
      );

      const adminUser = User.create(
        new Email('admin@example.com'),
        new Username('admin_user'),
        await passwordService.hash(adminPlainPassword),
        new Role('admin')
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

  describe('validaciones de factory methods', () => {
    let validEmail: Email;
    let validUsername: Username;
    let validRole: Role;
    let validPasswordHash: HashedPassword;

    beforeAll(async () => {
      validEmail = new Email('test@example.com');
      validUsername = new Username('testuser');
      validRole = new Role('student');
      const plainPassword = new PlainPassword('ValidPass123!');
      validPasswordHash = await passwordService.hash(plainPassword);
    });

    it('debería lanzar error con ID inválido en fromPersistence', () => {
      const validDate = new Date();

      expect(() => {
        User.fromPersistence(
          '',
          validEmail,
          validUsername,
          validPasswordHash,
          validRole,
          null,
          validDate,
          validDate
        );
      }).toThrow('ID de usuario inválido');

      expect(() => {
        User.fromPersistence(
          '   ',
          validEmail,
          validUsername,
          validPasswordHash,
          validRole,
          null,
          validDate,
          validDate
        );
      }).toThrow('ID de usuario inválido');
    });

    it('debería lanzar error con passwordHash inválido en fromPersistence', () => {
      const validDate = new Date();

      expect(() => {
        User.fromPersistence(
          uuidv4(),
          validEmail,
          validUsername,
          null as unknown as HashedPassword,
          validRole,
          null,
          validDate,
          validDate
        );
      }).toThrow('El usuario debe tener un hash de contraseña válido');

      expect(() => {
        User.fromPersistence(
          uuidv4(),
          validEmail,
          validUsername,
          'invalid' as unknown as HashedPassword,
          validRole,
          null,
          validDate,
          validDate
        );
      }).toThrow('El usuario debe tener un hash de contraseña válido');
    });

    it('debería lanzar error con fechas inválidas en fromPersistence', () => {
      const validDate = new Date();

      expect(() => {
        User.fromPersistence(
          uuidv4(),
          validEmail,
          validUsername,
          validPasswordHash,
          validRole,
          null,
          null as unknown as Date,
          validDate
        );
      }).toThrow('Fecha de creación inválida');

      expect(() => {
        User.fromPersistence(
          uuidv4(),
          validEmail,
          validUsername,
          validPasswordHash,
          validRole,
          null,
          validDate,
          null as unknown as Date
        );
      }).toThrow('Fecha de actualización inválida');
    });

    it('debería lanzar error si updatedAt es anterior a createdAt en fromPersistence', () => {
      const createdAt = new Date('2023-01-02');
      const updatedAt = new Date('2023-01-01');

      expect(() => {
        User.fromPersistence(
          uuidv4(),
          validEmail,
          validUsername,
          validPasswordHash,
          validRole,
          null,
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

        const user = User.create(
          new Email('integration@example.com'),
          new Username('integration_user'),
          hashedPassword,
          new Role('student')
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

          const user = User.create(
            new Email(`user${i + 1}@example.com`),
            new Username(`user${i + 1}`),
            hashedPassword,
            new Role('student')
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

  describe('nuevos value objects integrados', () => {
    it('debería manejar correctamente Username y CountryCode', async () => {
      const email = new Email('newuser@example.com');
      const username = new Username('nuevo_usuario');
      const countryCode = new CountryCode('AR');
      const role = new Role('student');
      const plainPassword = new PlainPassword('NewUserPass123!');
      const passwordHash = await passwordService.hash(plainPassword);

      const user = User.create(
        email,
        username,
        passwordHash,
        role,
        countryCode
      );

      // Test métodos getter de los nuevos value objects
      expect(user.getUsernameValue()).toBe('nuevo_usuario');
      expect(user.getCountryCodeValue()).toBe('AR');
      expect(user.getCountryName()).toBe('Argentina');
      expect(user.getCountryFlag()).toBe('🇦🇷');

      // Test métodos de clasificación geográfica
      expect(user.isFromSouthAmerica()).toBe(true);
      expect(user.isFromNorthAmerica()).toBe(false);
      expect(user.isFromEurope()).toBe(false);
    });

    it('debería manejar correctamente usuarios sin país', async () => {
      const email = new Email('noCountry@example.com');
      const username = new Username('sin_pais');
      const role = new Role('student');
      const plainPassword = new PlainPassword('NoCountryPass123!');
      const passwordHash = await passwordService.hash(plainPassword);

      const user = User.create(email, username, passwordHash, role); // Sin countryCode

      expect(user.getCountryCodeValue()).toBe(null);
      expect(user.getCountryName()).toBe(null);
      expect(user.getCountryFlag()).toBe(null);
      expect(user.isFromSouthAmerica()).toBe(false);
    });

    it('debería validar correctamente países transcontinentales', async () => {
      const email = new Email('russian@example.com');
      const username = new Username('usuario_ruso');
      const countryCode = new CountryCode('RU');
      const role = new Role('content_creator');
      const plainPassword = new PlainPassword('RussianPass123!');
      const passwordHash = await passwordService.hash(plainPassword);

      const user = User.create(
        email,
        username,
        passwordHash,
        role,
        countryCode
      );

      expect(user.getCountryName()).toBe('Россия');
      expect(user.isFromEurope()).toBe(true);
      expect(user.isFromAsia()).toBe(true); // Rusia es transcontinental
      expect(user.countryCode?.isTranscontinental()).toBe(true);
      expect(user.countryCode?.getPrimaryContinent()).toBe('Asia');
    });
  });
});

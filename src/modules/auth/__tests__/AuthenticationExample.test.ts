// src/modules/auth/__tests__/AuthenticationExample.test.ts

import { User } from '@/core/domain/entities/User';
import { Email } from '@/core/domain/value-objects/Email';
import { Username } from '@/core/domain/value-objects/Username';
import { Role } from '@/core/domain/value-objects/Role';
import { PlainPassword } from '@/core/domain/value-objects/Password';
import { PasswordService } from '@/infrastructure/services/PasswordService';

/**
 * Este test demuestra cómo usar bcrypt real en un flujo de autenticación completo
 * en lugar de hardcodear hashes de contraseñas.
 */
describe('Authentication Example with Real bcrypt', () => {
  let passwordService: PasswordService;

  beforeAll(() => {
    passwordService = new PasswordService(12);
  });

  describe('User Registration Flow', () => {
    it('debería registrar un usuario con contraseña hasheada usando bcrypt', async () => {
      // Datos de entrada del usuario
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        role: 'student',
      };

      // 1. Validar y crear value objects
      const email = new Email(userData.email);
      const plainPassword = new PlainPassword(userData.password);
      const role = new Role(userData.role);

      // 2. Hashear la contraseña usando bcrypt real
      const hashedPassword = await passwordService.hash(plainPassword);

      // 3. Crear la entidad User
      const user = User.create(
        email,
        new Username('newuser'),
        hashedPassword,
        role
      );

      // Verificaciones
      expect(user.email.value).toBe(userData.email);
      expect(user.role.value).toBe(userData.role);
      expect(user.passwordHash.isBcryptHash()).toBe(true);
      expect(user.passwordHash.getBcryptCost()).toBe(12);
      expect(user.passwordHash.hasSecureCost()).toBe(true);

      // Verificar que la contraseña original no está almacenada
      expect(user.passwordHash.value).not.toContain(userData.password);
      expect(user.passwordHash.value).toMatch(/^\$2b\$12\$/);
    });
  });

  describe('User Login Flow', () => {
    let registeredUser: User;
    const originalPassword = 'UserLoginPassword123!';

    beforeAll(async () => {
      // Simular un usuario ya registrado en el sistema
      const plainPassword = new PlainPassword(originalPassword);
      const hashedPassword = await passwordService.hash(plainPassword);

      registeredUser = User.create(
        new Email('loginuser@example.com'),
        new Username('loginuser'),
        hashedPassword,
        new Role('content_creator')
      );
    });

    it('debería autenticar correctamente con la contraseña correcta', async () => {
      // Simular datos de login
      const loginData = {
        email: 'loginuser@example.com',
        password: originalPassword,
      };

      // 1. Buscar usuario por email (simulado)
      const foundUser = registeredUser; // En un caso real, esto vendría de la base de datos

      // 2. Validar email coincide
      expect(foundUser.email.value).toBe(loginData.email);

      // 3. Verificar contraseña usando bcrypt
      const loginPassword = new PlainPassword(loginData.password);
      const isPasswordValid = await passwordService.verify(
        loginPassword,
        foundUser.passwordHash
      );

      expect(isPasswordValid).toBe(true);
    });

    it('debería rechazar autenticación con contraseña incorrecta', async () => {
      const loginData = {
        email: 'loginuser@example.com',
        password: 'WrongPassword123!',
      };

      // 1. Buscar usuario por email (simulado)
      const foundUser = registeredUser;

      // 2. Verificar contraseña incorrecta
      const wrongPassword = new PlainPassword(loginData.password);
      const isPasswordValid = await passwordService.verify(
        wrongPassword,
        foundUser.passwordHash
      );

      expect(isPasswordValid).toBe(false);
    });

    it('debería manejar múltiples intentos de login', async () => {
      const attempts = [
        { password: originalPassword, shouldSucceed: true },
        { password: 'WrongPass1!', shouldSucceed: false },
        { password: 'WrongPass2@', shouldSucceed: false },
        { password: originalPassword, shouldSucceed: true },
        { password: 'WrongPass3#', shouldSucceed: false },
      ];

      for (const attempt of attempts) {
        const loginPassword = new PlainPassword(attempt.password);
        const isValid = await passwordService.verify(
          loginPassword,
          registeredUser.passwordHash
        );

        expect(isValid).toBe(attempt.shouldSucceed);
      }
    });
  });

  describe('Password Change Flow', () => {
    it('debería cambiar la contraseña de un usuario existente', async () => {
      // Usuario existente
      const currentPassword = 'CurrentPassword123!';
      const newPassword = 'NewSecurePassword456@';

      const plainCurrentPassword = new PlainPassword(currentPassword);
      const currentHashedPassword =
        await passwordService.hash(plainCurrentPassword);

      let user = User.create(
        new Email('changepass@example.com'),
        new Username('changepass'),
        currentHashedPassword,
        new Role('admin')
      );

      // 1. Verificar contraseña actual
      const isCurrentPasswordValid = await passwordService.verify(
        plainCurrentPassword,
        user.passwordHash
      );
      expect(isCurrentPasswordValid).toBe(true);

      // 2. Hashear nueva contraseña
      const plainNewPassword = new PlainPassword(newPassword);
      const newHashedPassword = await passwordService.hash(plainNewPassword);

      // 3. Actualizar usuario (en un caso real, esto actualizaría la base de datos)
      user = User.fromPersistence(
        user.id,
        user.email,
        user.username,
        newHashedPassword,
        user.role,
        user.status,
        user.countryCode,
        user.lastLogin,
        user.createdAt,
        new Date() // updatedAt actualizado
      );

      // 4. Verificar que la nueva contraseña funciona
      const isNewPasswordValid = await passwordService.verify(
        plainNewPassword,
        user.passwordHash
      );
      expect(isNewPasswordValid).toBe(true);

      // 5. Verificar que la contraseña anterior ya no funciona
      const isOldPasswordStillValid = await passwordService.verify(
        plainCurrentPassword,
        user.passwordHash
      );
      expect(isOldPasswordStillValid).toBe(false);

      // 6. Verificar que los hashes son diferentes
      expect(currentHashedPassword.value).not.toBe(newHashedPassword.value);
    });
  });

  describe('Security Considerations', () => {
    it('debería generar hashes únicos para la misma contraseña', async () => {
      const password = 'SamePassword123!';
      const plainPassword = new PlainPassword(password);

      // Generar múltiples hashes de la misma contraseña
      const hash1 = await passwordService.hash(plainPassword);
      const hash2 = await passwordService.hash(plainPassword);
      const hash3 = await passwordService.hash(plainPassword);

      // Los hashes deben ser diferentes (debido al salt aleatorio)
      expect(hash1.value).not.toBe(hash2.value);
      expect(hash2.value).not.toBe(hash3.value);
      expect(hash1.value).not.toBe(hash3.value);

      // Pero todos deben verificar correctamente con la contraseña original
      expect(await passwordService.verify(plainPassword, hash1)).toBe(true);
      expect(await passwordService.verify(plainPassword, hash2)).toBe(true);
      expect(await passwordService.verify(plainPassword, hash3)).toBe(true);
    });

    it('debería usar cost factor seguro para resistir ataques de fuerza bruta', async () => {
      const password = 'SecurityTest123!';
      const plainPassword = new PlainPassword(password);

      const hashedPassword = await passwordService.hash(plainPassword);
      const hashInfo = hashedPassword.getHashInfo();

      expect(hashInfo.cost).toBe(12);
      expect(hashInfo.hasSecureCost).toBe(true);
      expect(hashInfo.isBcrypt).toBe(true);

      // El hash debe tener la longitud estándar de bcrypt
      expect(hashInfo.length).toBe(60);
      expect(hashInfo.isValidLength).toBe(true);
    });

    it('debería manejar contraseñas con caracteres especiales correctamente', async () => {
      const specialPasswords = [
        'Pass!@#$%^&*()123',
        'Password_Con-Simbolos.456',
        'Complex[]{}|;:,./?789',
        'Unicode_Test_Password_123!',
      ];

      for (const passwordStr of specialPasswords) {
        const plainPassword = new PlainPassword(passwordStr);
        const hashedPassword = await passwordService.hash(plainPassword);

        // Verificar que se puede hashear y verificar correctamente
        expect(hashedPassword.isBcryptHash()).toBe(true);

        const isValid = await passwordService.verify(
          plainPassword,
          hashedPassword
        );
        expect(isValid).toBe(true);
      }
    });
  });
});

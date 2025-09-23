// src/infrastructure/services/__tests__/PasswordService.test.ts

import { PasswordService } from '@/infrastructure/services/PasswordService';
import { IPasswordService } from '@/core/interfaces/services/IPasswordService';
import {
  PlainPassword,
  HashedPassword,
} from '@/core/domain/value-objects/Password';

describe('PasswordService', () => {
  let passwordService: IPasswordService;

  beforeEach(() => {
    passwordService = new PasswordService(12);
  });

  describe('constructor', () => {
    it('debería crear el servicio con salt rounds válidos', () => {
      expect(() => new PasswordService(12)).not.toThrow();
      expect(() => new PasswordService(10)).not.toThrow();
      expect(() => new PasswordService(15)).not.toThrow();
    });

    it('debería lanzar error con salt rounds inválidos', () => {
      expect(() => new PasswordService(9)).toThrow(
        'Salt rounds debe estar entre 10 y 15 para seguridad óptima'
      );
      expect(() => new PasswordService(16)).toThrow(
        'Salt rounds debe estar entre 10 y 15 para seguridad óptima'
      );
    });
  });

  describe('hash', () => {
    it('debería hashear una contraseña válida', async () => {
      const plainPassword = new PlainPassword('ValidPass123!');

      const hashedPassword = await passwordService.hash(plainPassword);

      expect(hashedPassword).toBeInstanceOf(HashedPassword);
      expect(hashedPassword.isBcryptHash()).toBe(true);
      expect(hashedPassword.getBcryptCost()).toBe(12);
      expect(hashedPassword.hasSecureCost()).toBe(true);
    });

    it('debería generar hashes diferentes para la misma contraseña', async () => {
      const plainPassword = new PlainPassword('SamePass123!');

      const hash1 = await passwordService.hash(plainPassword);
      const hash2 = await passwordService.hash(plainPassword);

      expect(hash1.value).not.toBe(hash2.value);
      expect(hash1.equals(hash2)).toBe(false);
    });

    it('debería hashear contraseñas con diferentes complejidades', async () => {
      const passwords = [
        'SimplePass123!',
        'Complex@Password456#',
        'VeryLong&ComplexPassword789$WithManyCharacters!',
      ];

      for (const passwordStr of passwords) {
        const plainPassword = new PlainPassword(passwordStr);
        const hashedPassword = await passwordService.hash(plainPassword);

        expect(hashedPassword.isBcryptHash()).toBe(true);
        expect(hashedPassword.getBcryptCost()).toBe(12);
      }
    });
  });

  describe('verify', () => {
    it('debería verificar correctamente una contraseña válida', async () => {
      const plainPassword = new PlainPassword('CorrectPass123!');
      const hashedPassword = await passwordService.hash(plainPassword);

      const isValid = await passwordService.verify(
        plainPassword,
        hashedPassword
      );

      expect(isValid).toBe(true);
    });

    it('debería rechazar una contraseña incorrecta', async () => {
      const correctPassword = new PlainPassword('CorrectPass123!');
      const wrongPassword = new PlainPassword('WrongPass123!');
      const hashedPassword = await passwordService.hash(correctPassword);

      const isValid = await passwordService.verify(
        wrongPassword,
        hashedPassword
      );

      expect(isValid).toBe(false);
    });

    it('debería verificar múltiples contraseñas correctamente', async () => {
      const testCases = ['FirstPass123!', 'SecondPass456@', 'ThirdPass789#'];

      for (const passwordStr of testCases) {
        const plainPassword = new PlainPassword(passwordStr);
        const hashedPassword = await passwordService.hash(plainPassword);

        const isValid = await passwordService.verify(
          plainPassword,
          hashedPassword
        );
        expect(isValid).toBe(true);
      }
    });

    it('debería manejar verificación con hashes existentes', async () => {
      // Simular un hash que ya existe en la base de datos
      const plainPassword = new PlainPassword('ExistingPass123!');
      const existingHash = new HashedPassword(
        '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW'
      );

      // Esta verificación debería fallar porque el hash no corresponde a la contraseña
      const isValid = await passwordService.verify(plainPassword, existingHash);
      expect(isValid).toBe(false);
    });
  });

  describe('integration tests', () => {
    it('debería funcionar correctamente en un flujo completo de registro y login', async () => {
      // Simular registro de usuario
      const userPassword = new PlainPassword('UserPass123!');
      const hashedForStorage = await passwordService.hash(userPassword);

      // Simular login del usuario
      const loginPassword = new PlainPassword('UserPass123!');
      const loginSuccess = await passwordService.verify(
        loginPassword,
        hashedForStorage
      );

      expect(loginSuccess).toBe(true);

      // Simular intento de login con contraseña incorrecta
      const wrongLoginPassword = new PlainPassword('WrongPass123!');
      const loginFailure = await passwordService.verify(
        wrongLoginPassword,
        hashedForStorage
      );

      expect(loginFailure).toBe(false);
    });

    it('debería mantener la seguridad con diferentes salt rounds', async () => {
      const plainPassword = new PlainPassword('TestPass123!');

      const service10 = new PasswordService(10);
      const service12 = new PasswordService(12);
      const service15 = new PasswordService(15);

      const hash10 = await service10.hash(plainPassword);
      const hash12 = await service12.hash(plainPassword);
      const hash15 = await service15.hash(plainPassword);

      expect(hash10.getBcryptCost()).toBe(10);
      expect(hash12.getBcryptCost()).toBe(12);
      expect(hash15.getBcryptCost()).toBe(15);

      // Todos deberían poder verificar la misma contraseña
      expect(await service10.verify(plainPassword, hash10)).toBe(true);
      expect(await service12.verify(plainPassword, hash12)).toBe(true);
      expect(await service15.verify(plainPassword, hash15)).toBe(true);

      // Verificación cruzada también debería funcionar
      expect(await service12.verify(plainPassword, hash10)).toBe(true);
      expect(await service10.verify(plainPassword, hash12)).toBe(true);
    });
  });
});

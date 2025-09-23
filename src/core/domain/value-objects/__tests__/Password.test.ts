// src/core/domain/value-objects/__tests__/Password.test.ts

import {
  PlainPassword,
  HashedPassword,
} from '@/core/domain/value-objects/Password';
import { PasswordService } from '@/infrastructure/services/PasswordService';

describe('Password Value Objects', () => {
  let passwordService: PasswordService;

  beforeAll(() => {
    passwordService = new PasswordService(12);
  });

  describe('PlainPassword', () => {
    describe('constructor', () => {
      it('debería crear una contraseña válida con todos los requisitos', () => {
        const password = new PlainPassword('ValidPass123!');
        expect(password.value).toBe('ValidPass123!');
      });

      it('debería lanzar error con contraseña muy corta (menos de 8 caracteres)', () => {
        expect(() => new PlainPassword('Pass1!')).toThrow(
          'La contraseña debe tener entre 8 y 100 caracteres'
        );
      });

      it('debería lanzar error con contraseña muy larga (más de 100 caracteres)', () => {
        // Crear una contraseña de exactamente 101 caracteres con complejidad
        const basePassword = 'Password1!'; // 10 caracteres con complejidad
        const tooLongPassword = basePassword + 'A'.repeat(91); // 101 caracteres total
        expect(() => new PlainPassword(tooLongPassword)).toThrow(
          'La contraseña debe tener entre 8 y 100 caracteres'
        );
      });

      it('debería aceptar contraseña de exactamente 100 caracteres', () => {
        // Crear una contraseña de exactamente 100 caracteres con complejidad
        const basePassword = 'Password1!'; // 10 caracteres con complejidad
        const validMaxPassword = basePassword + 'A'.repeat(90); // 100 caracteres exactos
        expect(() => new PlainPassword(validMaxPassword)).not.toThrow();
      });

      it('debería lanzar error con contraseña vacía', () => {
        expect(() => new PlainPassword('')).toThrow(
          'La contraseña debe ser una cadena de texto válida'
        );
      });

      it('debería lanzar error con contraseña null o undefined', () => {
        expect(() => new PlainPassword(null as unknown as string)).toThrow(
          'La contraseña debe ser una cadena de texto válida'
        );
        expect(() => new PlainPassword(undefined as unknown as string)).toThrow(
          'La contraseña debe ser una cadena de texto válida'
        );
      });

      it('debería aceptar contraseña de exactamente 8 caracteres con complejidad', () => {
        expect(() => new PlainPassword('Pass123!')).not.toThrow();
      });

      it('debería lanzar error sin letra minúscula', () => {
        expect(() => new PlainPassword('PASSWORD123!')).toThrow(
          'La contraseña debe incluir: al menos una letra minúscula (a-z)'
        );
      });

      it('debería lanzar error sin letra mayúscula', () => {
        expect(() => new PlainPassword('password123!')).toThrow(
          'La contraseña debe incluir: al menos una letra mayúscula (A-Z)'
        );
      });

      it('debería lanzar error sin número', () => {
        expect(() => new PlainPassword('Password!')).toThrow(
          'La contraseña debe incluir: al menos un número (0-9)'
        );
      });

      it('debería lanzar error sin carácter especial', () => {
        expect(() => new PlainPassword('Password123')).toThrow(
          'La contraseña debe incluir: al menos un carácter especial'
        );
      });

      it('debería lanzar error con múltiples requisitos faltantes', () => {
        expect(() => new PlainPassword('password')).toThrow(
          'La contraseña debe incluir: al menos una letra mayúscula (A-Z), al menos un número (0-9), al menos un carácter especial'
        );
      });
    });

    describe('security validations', () => {
      it('debería rechazar caracteres peligrosos (XSS)', () => {
        const dangerousPasswords = [
          'Pass123<script>',
          'Pass123"alert',
          "Pass123'drop",
          'Pass123`eval',
          'Pass123>close',
        ];

        dangerousPasswords.forEach((password) => {
          expect(() => new PlainPassword(password)).toThrow(
            'La contraseña contiene caracteres no permitidos o patrones de seguridad peligrosos'
          );
        });
      });

      it('debería rechazar patrones de inyección', () => {
        const injectionPasswords = [
          'Pass123javascript:',
          'Pass123data:text',
          'Pass123vbscript:',
          'Pass123onclick=',
          'Pass123<script>alert</script>',
          'Pass123eval(',
          'Pass123expression(',
        ];

        injectionPasswords.forEach((password) => {
          expect(() => new PlainPassword(password)).toThrow(
            'La contraseña contiene caracteres no permitidos o patrones de seguridad peligrosos'
          );
        });
      });

      it('debería rechazar caracteres de control', () => {
        const controlCharPasswords = [
          'Pass123\x00null',
          'Pass123\x1fcontrol',
          'Pass123\x7fdelete',
          'Pass123\x9fansi',
        ];

        controlCharPasswords.forEach((password) => {
          expect(() => new PlainPassword(password)).toThrow(
            'La contraseña contiene caracteres no permitidos o patrones de seguridad peligrosos'
          );
        });
      });

      it('debería aceptar caracteres especiales seguros básicos', () => {
        const basicSpecialChars = [
          'Password1!',
          'Password1@',
          'Password1#',
          'Password1$',
          'Password1%',
          'Password1^',
          'Password1&',
          'Password1*',
        ];

        basicSpecialChars.forEach((password, index) => {
          try {
            expect(() => new PlainPassword(password)).not.toThrow();
          } catch (error) {
            console.log(`Failed at index ${index}, password: ${password}`);
            throw error;
          }
        });
      });

      it('debería aceptar caracteres especiales seguros avanzados', () => {
        const advancedSpecialChars = [
          'Password1(',
          'Password1)',
          'Password1_',
          'Password1+',
          'Password1-',
          'Password1=',
          'Password1[',
          'Password1]',
          'Password1{',
          'Password1}',
          'Password1|',
          'Password1;',
          'Password1:',
          'Password1,',
          'Password1.',
          'Password1/',
          'Password1?',
        ];

        advancedSpecialChars.forEach((password) => {
          expect(() => new PlainPassword(password)).not.toThrow();
        });
      });

      it('debería rechazar caracteres especiales peligrosos', () => {
        const dangerousCharsTests = [
          'Password1<', // Peligroso para XSS
          'Password1>', // Peligroso para XSS
          'Password1"', // Peligroso para inyección
          "Password1'", // Peligroso para inyección
          'Password1`', // Peligroso para inyección
          'Password1\\', // Peligroso para escape
        ];

        dangerousCharsTests.forEach((password) => {
          expect(() => new PlainPassword(password)).toThrow(
            'La contraseña contiene caracteres no permitidos o patrones de seguridad peligrosos'
          );
        });
      });
    });

    describe('validation methods', () => {
      it('isStrong debería retornar true para contraseña que cumple todos los requisitos', () => {
        const strongPassword = new PlainPassword('StrongPass123!');
        expect(strongPassword.isStrong()).toBe(true);
        expect(strongPassword.hasRequiredComplexity()).toBe(true);
      });

      it('hasMinLength debería validar longitud mínima', () => {
        const shortPassword = new PlainPassword('Pass123!');
        const longPassword = new PlainPassword('VeryLongPassword123!');

        expect(shortPassword.hasMinLength(8)).toBe(true);
        expect(shortPassword.hasMinLength(10)).toBe(false);
        expect(longPassword.hasMinLength(15)).toBe(true);
      });

      it('getComplexityInfo debería retornar información detallada', () => {
        const password = new PlainPassword('StrongPass123!');
        const info = password.getComplexityInfo();

        expect(info.hasMinLength).toBe(true);
        expect(info.hasMaxLength).toBe(true);
        expect(info.hasLowerCase).toBe(true);
        expect(info.hasUpperCase).toBe(true);
        expect(info.hasNumber).toBe(true);
        expect(info.hasSpecialChar).toBe(true);
        expect(info.isSecure).toBe(true);
        expect(info.meetsAllRequirements).toBe(true);
      });

      it('getComplexityInfo debería identificar requisitos faltantes', () => {
        // Probar el método directamente con una contraseña débil
        const weakPasswordValue = 'password123!'; // Sin mayúscula
        const tempPassword = Object.create(PlainPassword.prototype);
        tempPassword._value = weakPasswordValue;

        const info = tempPassword.getComplexityInfo();

        expect(info.hasUpperCase).toBe(false);
        expect(info.meetsAllRequirements).toBe(false);
        expect(info.hasLowerCase).toBe(true);
        expect(info.hasNumber).toBe(true);
        expect(info.hasSpecialChar).toBe(true);
      });
    });

    describe('equals', () => {
      it('debería ser igual a otra contraseña con el mismo valor', () => {
        const password1 = new PlainPassword('SamePass123!');
        const password2 = new PlainPassword('SamePass123!');

        expect(password1.equals(password2)).toBe(true);
      });

      it('no debería ser igual a contraseña diferente', () => {
        const password1 = new PlainPassword('Password123!');
        const password2 = new PlainPassword('DifferentPass123!');

        expect(password1.equals(password2)).toBe(false);
      });
    });
  });

  describe('HashedPassword', () => {
    describe('constructor', () => {
      it('debería crear un hash válido de bcrypt', async () => {
        const plainPassword = new PlainPassword('TestPass123!');
        const hashedPassword = await passwordService.hash(plainPassword);

        expect(hashedPassword.isBcryptHash()).toBe(true);
        expect(hashedPassword.getBcryptCost()).toBe(12);
      });

      it('debería lanzar error con hash muy corto', () => {
        expect(() => new HashedPassword('$2b$12$short')).toThrow(
          'El hash debe tener entre 59 y 60 caracteres'
        );
      });

      it('debería lanzar error con hash muy largo', () => {
        const tooLongHash = '$2b$12$' + 'a'.repeat(70); // Más de 72 caracteres
        expect(() => new HashedPassword(tooLongHash)).toThrow(
          'El hash debe tener entre 59 y 60 caracteres'
        );
      });

      it('debería lanzar error con hash vacío', () => {
        expect(() => new HashedPassword('')).toThrow(
          'El hash de contraseña debe ser una cadena de texto válida'
        );
      });

      it('debería lanzar error con hash null o undefined', () => {
        expect(() => new HashedPassword(null as unknown as string)).toThrow(
          'El hash de contraseña debe ser una cadena de texto válida'
        );
        expect(
          () => new HashedPassword(undefined as unknown as string)
        ).toThrow('El hash de contraseña debe ser una cadena de texto válida');
      });

      it('debería lanzar error con cost factor inválido', () => {
        expect(
          () =>
            new HashedPassword(
              '$2b$03$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW'
            )
        ).toThrow('El cost factor del hash bcrypt debe estar entre 4 y 31');
        expect(
          () =>
            new HashedPassword(
              '$2b$32$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW'
            )
        ).toThrow('El cost factor del hash bcrypt debe estar entre 4 y 31');
      });
    });

    describe('security validations', () => {
      it('debería rechazar hash con caracteres peligrosos', () => {
        const dangerousHashes = [
          '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMU<',
          '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWM&',
          '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWM"',
        ];

        dangerousHashes.forEach((hash) => {
          expect(() => new HashedPassword(hash)).toThrow(
            'El hash contiene caracteres no permitidos o patrones de seguridad peligrosos'
          );
        });
      });

      it('debería rechazar hash con patrones de inyección', () => {
        // Crear hashes con longitud correcta pero con patrones peligrosos
        const baseHash =
          '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW';
        const injectionHashes = [
          baseHash.slice(0, -11) + 'javascript:', // Reemplazar los últimos caracteres
          baseHash.slice(0, -6) + 'eval(', // Reemplazar los últimos caracteres
        ];

        injectionHashes.forEach((hash) => {
          expect(() => new HashedPassword(hash)).toThrow(
            'El hash contiene caracteres no permitidos o patrones de seguridad peligrosos'
          );
        });
      });
    });

    describe('validation', () => {
      it('debería validar formato bcrypt correcto', async () => {
        const passwords = ['TestPass1!', 'AnotherPass2@'];

        for (const passwordStr of passwords) {
          const plainPassword = new PlainPassword(passwordStr);
          const hashedPassword = await passwordService.hash(plainPassword);

          expect(() => new HashedPassword(hashedPassword.value)).not.toThrow();
          expect(hashedPassword.isBcryptHash()).toBe(true);
        }
      });

      it('debería rechazar formatos inválidos', () => {
        const invalidHashes = [
          'plaintext',
          '$2b$invalid$hash',
          '$1$tooshort',
          'md5hash',
          '$2b$12$tooshort',
          '$3b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjZdL17lhWy', // Algoritmo inválido
          '$2b$ab$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjZdL17lhWy', // Cost inválido
        ];

        invalidHashes.forEach((hash) => {
          expect(() => new HashedPassword(hash)).toThrow();
        });
      });
    });

    describe('utility methods', () => {
      it('isBcryptHash debería identificar correctamente hashes bcrypt', async () => {
        const plainPassword = new PlainPassword('TestPass123!');
        const hashedPassword = await passwordService.hash(plainPassword);

        expect(hashedPassword.isBcryptHash()).toBe(true);
      });

      it('getBcryptCost debería retornar el cost factor correcto', async () => {
        const plainPassword = new PlainPassword('TestPass123!');

        const service10 = new PasswordService(10);
        const service12 = new PasswordService(12);

        const hash10 = await service10.hash(plainPassword);
        const hash12 = await service12.hash(plainPassword);

        expect(hash10.getBcryptCost()).toBe(10);
        expect(hash12.getBcryptCost()).toBe(12);
      });

      it('hasSecureCost debería validar cost factor seguro (10-15)', async () => {
        const plainPassword = new PlainPassword('TestPass123!');

        const service10 = new PasswordService(10);
        const service12 = new PasswordService(12);
        const service15 = new PasswordService(15);

        const hash10 = await service10.hash(plainPassword);
        const hash12 = await service12.hash(plainPassword);
        const hash15 = await service15.hash(plainPassword);

        expect(hash10.hasSecureCost()).toBe(true);
        expect(hash12.hasSecureCost()).toBe(true);
        expect(hash15.hasSecureCost()).toBe(true);
      });

      it('getHashInfo debería retornar información completa del hash', async () => {
        const plainPassword = new PlainPassword('TestPass123!');
        const hash = await passwordService.hash(plainPassword);
        const info = hash.getHashInfo();

        expect(info.isBcrypt).toBe(true);
        expect(info.cost).toBe(12);
        expect(info.hasSecureCost).toBe(true);
        expect(info.length).toBe(60);
        expect(info.isValidLength).toBe(true);
        expect(info.isSecure).toBe(true);
      });
    });

    describe('equals', () => {
      it('debería ser igual a otro hash con el mismo valor', async () => {
        const plainPassword = new PlainPassword('TestPass123!');
        const hash = await passwordService.hash(plainPassword);

        const hashedPassword1 = new HashedPassword(hash.value);
        const hashedPassword2 = new HashedPassword(hash.value);

        expect(hashedPassword1.equals(hashedPassword2)).toBe(true);
      });

      it('no debería ser igual a hash diferente', async () => {
        const plainPassword1 = new PlainPassword('TestPass123!');
        const plainPassword2 = new PlainPassword('DifferentPass456@');

        const hash1 = await passwordService.hash(plainPassword1);
        const hash2 = await passwordService.hash(plainPassword2);

        expect(hash1.equals(hash2)).toBe(false);
      });
    });

    describe('toString', () => {
      it('debería retornar el valor del hash', async () => {
        const plainPassword = new PlainPassword('TestPass123!');
        const hashedPassword = await passwordService.hash(plainPassword);

        expect(hashedPassword.toString()).toBe(hashedPassword.value);
        expect(hashedPassword.toString()).toMatch(/^\$2b\$12\$/);
      });
    });
  });
});

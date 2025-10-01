// src/core/domain/value-objects/__tests__/Username.test.ts

import { Username } from '@/core/domain/value-objects/Username';

describe('Username Value Object', () => {
  describe('constructor', () => {
    it('debería crear un username válido con caracteres alfanuméricos', () => {
      const validUsernames = [
        'user123',
        'test_user',
        'my-username',
        'User_Name-123',
        'abc',
        'a'.repeat(30), // Máximo permitido
      ];

      validUsernames.forEach((usernameStr) => {
        const username = new Username(usernameStr);
        expect(username.value).toBe(usernameStr);
        expect(username.isValid()).toBe(true);
      });
    });

    it('debería crear username con longitud mínima válida', () => {
      const minUsername = new Username('abc'); // 3 caracteres
      expect(minUsername.value).toBe('abc');
      expect(minUsername.isValid()).toBe(true);
    });

    it('debería crear username con longitud máxima válida', () => {
      const maxUsername = new Username('a'.repeat(30)); // 30 caracteres
      expect(maxUsername.value).toBe('a'.repeat(30));
      expect(maxUsername.isValid()).toBe(true);
    });
  });

  describe('validaciones de error', () => {
    it('debería lanzar error con username vacío', () => {
      expect(() => new Username('')).toThrow(
        'El nombre de usuario no puede estar vacío'
      );
    });

    it('debería lanzar error con username solo espacios', () => {
      expect(() => new Username('   ')).toThrow(
        'El nombre de usuario no puede estar vacío'
      );
    });

    it('debería lanzar error con username null o undefined', () => {
      expect(() => new Username(null as unknown as string)).toThrow(
        'El nombre de usuario no puede estar vacío'
      );
      expect(() => new Username(undefined as unknown as string)).toThrow(
        'El nombre de usuario no puede estar vacío'
      );
    });

    it('debería lanzar error con username muy corto', () => {
      const shortUsernames = ['a', 'ab'];

      shortUsernames.forEach((shortUsername) => {
        expect(() => new Username(shortUsername)).toThrow(
          'El nombre de usuario debe tener al menos 3 caracteres'
        );
      });
    });

    it('debería lanzar error con username muy largo', () => {
      const longUsername = 'a'.repeat(31); // 31 caracteres

      expect(() => new Username(longUsername)).toThrow(
        'El nombre de usuario no puede exceder los 30 caracteres'
      );
    });

    it('debería lanzar error con caracteres inválidos', () => {
      const invalidUsernames = [
        'user@name', // @ no permitido
        'user name', // espacios no permitidos
        'user.name', // punto no permitido
        'user#name', // # no permitido
        'user$name', // $ no permitido
        'user%name', // % no permitido
        'user&name', // & no permitido
        'user*name', // * no permitido
        'user+name', // + no permitido
        'user=name', // = no permitido
        'user!name', // ! no permitido
        'user?name', // ? no permitido
        'user/name', // / no permitido
        'user\\name', // \ no permitido
        'user|name', // | no permitido
        'user<name', // < no permitido
        'user>name', // > no permitido
        'user[name]', // [] no permitidos
        'user{name}', // {} no permitidos
        'user(name)', // () no permitidos
        'user"name"', // comillas no permitidas
        "user'name'", // comillas simples no permitidas
        'user`name`', // backticks no permitidos
        'user~name', // ~ no permitido
        'user^name', // ^ no permitido
        'user,name', // coma no permitida
        'user;name', // punto y coma no permitido
        'user:name', // dos puntos no permitidos
        'user¡name!', // caracteres especiales no ASCII
        'userñame', // ñ no permitida (no ASCII básico)
        'useráme', // acentos no permitidos
      ];

      invalidUsernames.forEach((invalidUsername) => {
        expect(() => new Username(invalidUsername)).toThrow(
          'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos'
        );
      });
    });
  });

  describe('métodos de utilidad', () => {
    it('debería retornar true en isValid() para usernames válidos', () => {
      const validUsernames = [
        'user123',
        'test_user',
        'my-username',
        'User_Name-123',
        'simple',
      ];

      validUsernames.forEach((usernameStr) => {
        const username = new Username(usernameStr);
        expect(username.isValid()).toBe(true);
      });
    });

    it('debería generar display value con @ prefix', () => {
      const testCases = [
        { input: 'user123', expected: '@user123' },
        { input: 'test_user', expected: '@test_user' },
        { input: 'my-username', expected: '@my-username' },
        { input: 'User_Name-123', expected: '@User_Name-123' },
        { input: 'simple', expected: '@simple' },
      ];

      testCases.forEach(({ input, expected }) => {
        const username = new Username(input);
        expect(username.getDisplayValue()).toBe(expected);
      });
    });
  });

  describe('casos edge', () => {
    it('debería manejar usernames con solo números', () => {
      const numericUsername = new Username('123456');
      expect(numericUsername.value).toBe('123456');
      expect(numericUsername.isValid()).toBe(true);
      expect(numericUsername.getDisplayValue()).toBe('@123456');
    });

    it('debería manejar usernames con solo guiones y guiones bajos', () => {
      const specialUsername = new Username('_-_-_-');
      expect(specialUsername.value).toBe('_-_-_-');
      expect(specialUsername.isValid()).toBe(true);
      expect(specialUsername.getDisplayValue()).toBe('@_-_-_-');
    });

    it('debería manejar usernames que empiecen con números', () => {
      const numberStartUsername = new Username('123user');
      expect(numberStartUsername.value).toBe('123user');
      expect(numberStartUsername.isValid()).toBe(true);
    });

    it('debería manejar usernames que empiecen con guiones', () => {
      const dashStartUsername = new Username('-user123');
      expect(dashStartUsername.value).toBe('-user123');
      expect(dashStartUsername.isValid()).toBe(true);
    });

    it('debería manejar usernames que empiecen con guiones bajos', () => {
      const underscoreStartUsername = new Username('_user123');
      expect(underscoreStartUsername.value).toBe('_user123');
      expect(underscoreStartUsername.isValid()).toBe(true);
    });

    it('debería preservar mayúsculas y minúsculas', () => {
      const mixedCaseUsername = new Username('UserName123');
      expect(mixedCaseUsername.value).toBe('UserName123');
      expect(mixedCaseUsername.getDisplayValue()).toBe('@UserName123');
    });
  });

  describe('comparación y igualdad', () => {
    it('debería considerar usernames iguales si tienen el mismo valor', () => {
      const username1 = new Username('testuser');
      const username2 = new Username('testuser');

      expect(username1.value).toBe(username2.value);
      expect(username1.getDisplayValue()).toBe(username2.getDisplayValue());
    });

    it('debería considerar usernames diferentes si tienen valores diferentes', () => {
      const username1 = new Username('testuser1');
      const username2 = new Username('testuser2');

      expect(username1.value).not.toBe(username2.value);
      expect(username1.getDisplayValue()).not.toBe(username2.getDisplayValue());
    });

    it('debería ser case-sensitive', () => {
      const username1 = new Username('TestUser');
      const username2 = new Username('testuser');

      expect(username1.value).not.toBe(username2.value);
      expect(username1.getDisplayValue()).not.toBe(username2.getDisplayValue());
    });
  });

  describe('integración con casos de uso reales', () => {
    it('debería funcionar con usernames típicos de redes sociales', () => {
      const socialUsernames = [
        'john_doe',
        'jane-smith',
        'user2024',
        'dev_master',
        'code-ninja',
        'test_user_123',
      ];

      socialUsernames.forEach((usernameStr) => {
        const username = new Username(usernameStr);
        expect(username.isValid()).toBe(true);
        expect(username.value).toBe(usernameStr);
        expect(username.getDisplayValue()).toBe(`@${usernameStr}`);
      });
    });

    it('debería rechazar usernames problemáticos comunes', () => {
      const problematicUsernames = [
        'admin@site.com', // parece email
        'user name', // con espacios
        'user.name', // con punto
        'user@name', // con arroba
        'user#123', // con hash
        'user$money', // con símbolo de dinero
        'user%percent', // con porcentaje
      ];

      problematicUsernames.forEach((problematicUsername) => {
        expect(() => new Username(problematicUsername)).toThrow();
      });
    });

    it('debería manejar usernames en límites de longitud', () => {
      // Exactamente 3 caracteres (mínimo)
      const minUsername = new Username('abc');
      expect(minUsername.isValid()).toBe(true);

      // Exactamente 30 caracteres (máximo)
      const maxUsername = new Username('a'.repeat(30));
      expect(maxUsername.isValid()).toBe(true);

      // 2 caracteres (muy corto)
      expect(() => new Username('ab')).toThrow();

      // 31 caracteres (muy largo)
      expect(() => new Username('a'.repeat(31))).toThrow();
    });
  });
});

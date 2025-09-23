// src/core/domain/value-objects/__tests__/Email.test.ts

import { Email } from '@/core/domain/value-objects/Email';

describe('Email Value Object', () => {
  describe('constructor', () => {
    it('debería crear un email válido', () => {
      const validEmail = 'test@example.com';
      const email = new Email(validEmail);

      expect(email.value).toBe(validEmail);
    });

    it('debería lanzar error con email inválido - sin @', () => {
      expect(() => new Email('invalid-email')).toThrow('Email inválido');
    });

    it('debería lanzar error con email inválido - sin dominio', () => {
      expect(() => new Email('test@')).toThrow('Email inválido');
    });

    it('debería lanzar error con email inválido - sin usuario', () => {
      expect(() => new Email('@example.com')).toThrow('Email inválido');
    });

    it('debería lanzar error con email vacío', () => {
      expect(() => new Email('')).toThrow('Email inválido');
    });

    it('debería lanzar error con email null o undefined', () => {
      expect(() => new Email(null as unknown as string)).toThrow(
        'Email inválido'
      );
      expect(() => new Email(undefined as unknown as string)).toThrow(
        'Email inválido'
      );
    });

    it('debería normalizar email a lowercase', () => {
      const email = new Email('TEST@EXAMPLE.COM');
      expect(email.value).toBe('test@example.com');
    });
  });

  describe('equals', () => {
    it('debería ser igual a otro email con el mismo valor', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('test@example.com');

      expect(email1.equals(email2)).toBe(true);
    });

    it('debería ser igual ignorando case', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('TEST@EXAMPLE.COM');

      expect(email1.equals(email2)).toBe(true);
    });

    it('no debería ser igual a email diferente', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('other@example.com');

      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('debería retornar el valor del email', () => {
      const emailValue = 'test@example.com';
      const email = new Email(emailValue);

      expect(email.toString()).toBe(emailValue);
    });
  });

  describe('casos edge válidos', () => {
    it('debería aceptar emails con subdominios', () => {
      expect(() => new Email('test@mail.example.com')).not.toThrow();
    });

    it('debería aceptar emails con números', () => {
      expect(() => new Email('user123@example.com')).not.toThrow();
    });

    it('debería aceptar emails con guiones y puntos', () => {
      expect(() => new Email('user.name-test@example.com')).not.toThrow();
    });

    it('debería aceptar emails con + (plus addressing)', () => {
      expect(() => new Email('user+tag@example.com')).not.toThrow();
    });
  });
});

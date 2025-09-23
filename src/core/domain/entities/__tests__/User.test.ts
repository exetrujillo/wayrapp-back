// src/core/domain/entities/__tests__/User.test.ts

import { v4 as uuidv4 } from 'uuid';
import { User, Role } from '../User';

describe('User Entity', () => {
  describe('Role validation', () => {
    it('debería aceptar todos los roles válidos', () => {
      const validRoles: Role[] = ['student', 'content_creator', 'admin'];

      validRoles.forEach((role) => {
        const user: User = {
          id: uuidv4(),
          email: 'test@example.com',
          passwordHash: '$2b$12$test.hash',
          role: role,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(user.role).toBe(role);
        expect(['student', 'content_creator', 'admin']).toContain(user.role);
      });
    });
  });

  it('debería crear una estructura de objeto usuario válida', () => {
    const user: User = {
      id: uuidv4(),
      email: 'test@example.com',
      passwordHash: '$2b$12$L9.o/C.s5/b4j2e5.d8B9eO3U.G9eY2n9Z6k3X8.l2A3O',
      role: 'student' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Validar que el ID es un UUID válido (formato v4)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(user.id).toMatch(uuidRegex);

    // Validar propiedades básicas
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe('student');
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);

    // Validar que el passwordHash tiene el formato esperado de bcrypt
    expect(user.passwordHash).toMatch(/^\$2b\$\d+\$/);
  });

  describe('User creation scenarios', () => {
    it('debería crear usuarios con diferentes roles correctamente', () => {
      const roles: Role[] = ['student', 'content_creator', 'admin'];

      roles.forEach((role) => {
        const user: User = {
          id: uuidv4(),
          email: `${role}@example.com`,
          passwordHash: '$2b$12$test.hash.for.' + role,
          role: role,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(user.role).toBe(role);
        expect(user.email).toContain(role);
      });
    });

    it('debería mantener timestamps coherentes', () => {
      const now = new Date();
      const user: User = {
        id: uuidv4(),
        email: 'timestamp-test@example.com',
        passwordHash: '$2b$12$timestamp.test',
        role: 'student',
        createdAt: now,
        updatedAt: now,
      };

      expect(user.createdAt).toBe(now);
      expect(user.updatedAt).toBe(now);
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(
        user.updatedAt.getTime()
      );
    });

    it('debería generar IDs únicos para diferentes usuarios', () => {
      const user1: User = {
        id: uuidv4(),
        email: 'user1@example.com',
        passwordHash: '$2b$12$hash1',
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const user2: User = {
        id: uuidv4(),
        email: 'user2@example.com',
        passwordHash: '$2b$12$hash2',
        role: 'content_creator',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(user1.id).not.toBe(user2.id);
      expect(user1.email).not.toBe(user2.email);

      // Ambos deben ser UUIDs válidos
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(user1.id).toMatch(uuidRegex);
      expect(user2.id).toMatch(uuidRegex);
    });
  });
});

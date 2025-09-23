// src/core/domain/value-objects/__tests__/Role.test.ts

import { Role } from '@/core/domain/value-objects/Role';

describe('Role Value Object', () => {
  describe('constructor', () => {
    it('debería crear un role válido - student', () => {
      const role = new Role('student');
      expect(role.value).toBe('student');
    });

    it('debería crear un role válido - content_creator', () => {
      const role = new Role('content_creator');
      expect(role.value).toBe('content_creator');
    });

    it('debería crear un role válido - admin', () => {
      const role = new Role('admin');
      expect(role.value).toBe('admin');
    });

    it('debería lanzar error con role inválido', () => {
      expect(() => new Role('invalid_role')).toThrow('Role inválido');
    });

    it('debería lanzar error con role vacío', () => {
      expect(() => new Role('')).toThrow('Role inválido');
    });

    it('debería lanzar error con role null o undefined', () => {
      expect(() => new Role(null as unknown as string)).toThrow(
        'Role inválido'
      );
      expect(() => new Role(undefined as unknown as string)).toThrow(
        'Role inválido'
      );
    });

    it('debería ser case sensitive', () => {
      expect(() => new Role('STUDENT')).toThrow('Role inválido');
      expect(() => new Role('Student')).toThrow('Role inválido');
    });
  });

  describe('equals', () => {
    it('debería ser igual a otro role con el mismo valor', () => {
      const role1 = new Role('student');
      const role2 = new Role('student');

      expect(role1.equals(role2)).toBe(true);
    });

    it('no debería ser igual a role diferente', () => {
      const role1 = new Role('student');
      const role2 = new Role('admin');

      expect(role1.equals(role2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('debería retornar el valor del role', () => {
      const role = new Role('content_creator');
      expect(role.toString()).toBe('content_creator');
    });
  });

  describe('métodos de utilidad', () => {
    it('isStudent debería retornar true para student', () => {
      const role = new Role('student');
      expect(role.isStudent()).toBe(true);
    });

    it('isStudent debería retornar false para otros roles', () => {
      const adminRole = new Role('admin');
      const creatorRole = new Role('content_creator');

      expect(adminRole.isStudent()).toBe(false);
      expect(creatorRole.isStudent()).toBe(false);
    });

    it('isContentCreator debería retornar true para content_creator', () => {
      const role = new Role('content_creator');
      expect(role.isContentCreator()).toBe(true);
    });

    it('isContentCreator debería retornar false para otros roles', () => {
      const studentRole = new Role('student');
      const adminRole = new Role('admin');

      expect(studentRole.isContentCreator()).toBe(false);
      expect(adminRole.isContentCreator()).toBe(false);
    });

    it('isAdmin debería retornar true para admin', () => {
      const role = new Role('admin');
      expect(role.isAdmin()).toBe(true);
    });

    it('isAdmin debería retornar false para otros roles', () => {
      const studentRole = new Role('student');
      const creatorRole = new Role('content_creator');

      expect(studentRole.isAdmin()).toBe(false);
      expect(creatorRole.isAdmin()).toBe(false);
    });

    it('canCreateContent debería retornar true para content_creator y admin', () => {
      const creatorRole = new Role('content_creator');
      const adminRole = new Role('admin');

      expect(creatorRole.canCreateContent()).toBe(true);
      expect(adminRole.canCreateContent()).toBe(true);
    });

    it('canCreateContent debería retornar false para student', () => {
      const studentRole = new Role('student');
      expect(studentRole.canCreateContent()).toBe(false);
    });

    it('hasAdminPrivileges debería retornar true solo para admin', () => {
      const adminRole = new Role('admin');
      const creatorRole = new Role('content_creator');
      const studentRole = new Role('student');

      expect(adminRole.hasAdminPrivileges()).toBe(true);
      expect(creatorRole.hasAdminPrivileges()).toBe(false);
      expect(studentRole.hasAdminPrivileges()).toBe(false);
    });
  });

  describe('validRoles static method', () => {
    it('debería retornar todos los roles válidos', () => {
      const validRoles = Role.validRoles();
      expect(validRoles).toEqual(['student', 'content_creator', 'admin']);
    });
  });
});

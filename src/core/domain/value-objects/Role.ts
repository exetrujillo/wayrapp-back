// src/core/domain/value-objects/Role.ts

export type RoleType = 'student' | 'content_creator' | 'admin';

export class Role {
  private readonly _value: RoleType;
  private static readonly VALID_ROLES: RoleType[] = [
    'student',
    'content_creator',
    'admin',
  ];

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('Role inválido');
    }
    this._value = value.trim() as RoleType;
  }

  get value(): RoleType {
    return this._value;
  }

  equals(other: Role): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  // Métodos de utilidad para verificar roles específicos
  isStudent(): boolean {
    return this._value === 'student';
  }

  isContentCreator(): boolean {
    return this._value === 'content_creator';
  }

  isAdmin(): boolean {
    return this._value === 'admin';
  }

  // Métodos de permisos
  canCreateContent(): boolean {
    return this._value === 'content_creator' || this._value === 'admin';
  }

  hasAdminPrivileges(): boolean {
    return this._value === 'admin';
  }

  // Método estático para obtener roles válidos
  static validRoles(): RoleType[] {
    return [...Role.VALID_ROLES];
  }

  private isValid(value: string): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      return false;
    }

    return Role.VALID_ROLES.includes(trimmedValue as RoleType);
  }
}

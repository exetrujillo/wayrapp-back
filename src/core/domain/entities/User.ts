// src/core/domain/entities/User.ts

import { Email } from '@/core/domain/value-objects/Email';
import { Role } from '@/core/domain/value-objects/Role';
import { HashedPassword } from '@/core/domain/value-objects/Password';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: Email,
    public readonly passwordHash: HashedPassword,
    public readonly role: Role,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validateConstructorParams();
  }

  // Métodos de utilidad que delegan a los value objects
  canCreateContent(): boolean {
    return this.role.canCreateContent();
  }

  hasAdminPrivileges(): boolean {
    return this.role.hasAdminPrivileges();
  }

  isStudent(): boolean {
    return this.role.isStudent();
  }

  isContentCreator(): boolean {
    return this.role.isContentCreator();
  }

  isAdmin(): boolean {
    return this.role.isAdmin();
  }

  // Método para obtener el email como string (útil para APIs)
  getEmailValue(): string {
    return this.email.value;
  }

  // Método para obtener el role como string (útil para APIs)
  getRoleValue(): string {
    return this.role.value;
  }

  // Método para obtener el password hash como string (útil para APIs)
  getPasswordHashValue(): string {
    return this.passwordHash.value;
  }

  private validateConstructorParams(): void {
    if (
      !this.id ||
      typeof this.id !== 'string' ||
      this.id.trim().length === 0
    ) {
      throw new Error('ID de usuario inválido');
    }

    if (!this.passwordHash || !(this.passwordHash instanceof HashedPassword)) {
      throw new Error('Password hash inválido');
    }

    if (!this.createdAt || !(this.createdAt instanceof Date)) {
      throw new Error('Fecha de creación inválida');
    }

    if (!this.updatedAt || !(this.updatedAt instanceof Date)) {
      throw new Error('Fecha de actualización inválida');
    }

    if (this.updatedAt < this.createdAt) {
      throw new Error(
        'La fecha de actualización no puede ser anterior a la fecha de creación'
      );
    }
  }
}

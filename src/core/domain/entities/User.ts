// src/core/domain/entities/User.ts

// Importamos primero los value objects necesarios
import { Email } from '@/core/domain/value-objects/Email';
import { Role } from '@/core/domain/value-objects/Role';
import { HashedPassword } from '@/core/domain/value-objects/Password';
import { v4 as uuidv4 } from 'uuid';

export class User {
  // Constructor privado para forzar uso de factory methods
  private constructor(
    public readonly id: string,
    public readonly email: Email,
    public readonly passwordHash: HashedPassword,
    public readonly role: Role,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validateConstructorParams();
  }

  // FACTORY METHOD - Para crear nuevos usuarios
  static create(
    email: Email,
    passwordHash: HashedPassword,
    role: Role,
    id?: string // Opcional para casos especiales (testing, migración)
  ): User {
    const now = new Date();
    return new User(
      id || User.generateUUID(),
      email,
      passwordHash,
      role,
      now,
      now
    );
  }

  // FACTORY METHOD - Para reconstruir desde BD
  static fromPersistence(
    id: string,
    email: Email,
    passwordHash: HashedPassword,
    role: Role,
    createdAt: Date,
    updatedAt: Date
  ): User {
    return new User(id, email, passwordHash, role, createdAt, updatedAt);
  }

  // Generación de UUID
  private static generateUUID(): string {
    return uuidv4();
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

  /*
   * Validaciones adicionales en el constructor
   * para asegurar la integridad del objeto User
   * y evitar estados inválidos.
   */
  private validateConstructorParams(): void {
    // Validaciones de estructura
    if (
      !this.id ||
      typeof this.id !== 'string' ||
      this.id.trim().length === 0
    ) {
      throw new Error('ID de usuario inválido');
    }

    // Validaciones de value objects (no son estrictamente necesarias
    // si los value objects ya hacen sus propias validaciones,
    // pero añaden una capa extra de seguridad)
    if (!this.email || !(this.email instanceof Email)) {
      throw new Error('El usuario debe tener un email válido');
    }

    if (!this.role || !(this.role instanceof Role)) {
      throw new Error('El usuario debe tener un rol válido asignado');
    }

    if (!this.passwordHash || !(this.passwordHash instanceof HashedPassword)) {
      throw new Error('El usuario debe tener un hash de contraseña válido');
    }

    // Validaciones de fechas
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

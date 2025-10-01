// src/core/domain/entities/User.ts

// Importamos primero los value objects necesarios
import { Email } from '@/core/domain/value-objects/Email';
import { Role } from '@/core/domain/value-objects/Role';
import { HashedPassword } from '@/core/domain/value-objects/Password';
import { Username } from '@/core/domain/value-objects/Username';
import { CountryCode } from '@/core/domain/value-objects/CountryCode';
import { UserStatus } from '@/core/domain/value-objects/UserStatus';
import { v4 as uuidv4 } from 'uuid';

export class User {
  // Constructor privado para forzar uso de factory methods
  private constructor(
    public readonly id: string,
    public readonly email: Email,
    public readonly username: Username,
    public readonly passwordHash: HashedPassword,
    public readonly role: Role,
    public readonly status: UserStatus,
    public readonly countryCode: CountryCode | null, // Opcional - puede ser null
    public readonly lastLogin: Date | null, // Opcional - null si nunca se ha logueado
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validateConstructorParams();
  }

  // FACTORY METHOD - Para crear nuevos usuarios
  static create(
    email: Email,
    username: Username,
    passwordHash: HashedPassword,
    role: Role,
    countryCode?: CountryCode | null, // Opcional
    status?: UserStatus, // Opcional - por defecto pending confirmation
    id?: string // Opcional para casos especiales (testing, migración)
  ): User {
    const now = new Date();
    return new User(
      id || User.generateUUID(),
      email,
      username,
      passwordHash,
      role,
      status || UserStatus.createPendingConfirmation(), // Por defecto pending
      countryCode || null,
      null, // lastLogin es null para usuarios nuevos
      now,
      now
    );
  }

  // FACTORY METHOD - Para reconstruir desde BD
  static fromPersistence(
    id: string,
    email: Email,
    username: Username,
    passwordHash: HashedPassword,
    role: Role,
    status: UserStatus,
    countryCode: CountryCode | null,
    lastLogin: Date | null,
    createdAt: Date,
    updatedAt: Date
  ): User {
    return new User(
      id,
      email,
      username,
      passwordHash,
      role,
      status,
      countryCode,
      lastLogin,
      createdAt,
      updatedAt
    );
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

  // Método para obtener el username como string (útil para APIs)
  getUsernameValue(): string {
    return this.username.value;
  }

  // Método para obtener el role como string (útil para APIs)
  getRoleValue(): string {
    return this.role.value;
  }

  // Método para obtener el password hash como string (útil para APIs)
  getPasswordHashValue(): string {
    return this.passwordHash.value;
  }

  // Métodos para el estado del usuario
  getStatusValue(): string {
    return this.status.value;
  }

  getStatusDisplayName(): string {
    return this.status.getDisplayName();
  }

  // Métodos de estado del usuario
  isActive(): boolean {
    return this.status.isActive();
  }

  isPendingConfirmation(): boolean {
    return this.status.isPendingConfirmation();
  }

  isSuspended(): boolean {
    return this.status.isSuspended();
  }

  isBanned(): boolean {
    return this.status.isBanned();
  }

  // Métodos de negocio relacionados con el estado
  canLogin(): boolean {
    return this.status.canLogin();
  }

  canBeReactivated(): boolean {
    return this.status.canBeReactivated();
  }

  requiresEmailConfirmation(): boolean {
    return this.status.requiresEmailConfirmation();
  }

  isPermanentlyBlocked(): boolean {
    return this.status.isPermanentlyBlocked();
  }

  // Métodos para lastLogin
  getLastLoginValue(): Date | null {
    return this.lastLogin;
  }

  hasEverLoggedIn(): boolean {
    return this.lastLogin !== null;
  }

  getLastLoginFormatted(): string | null {
    if (!this.lastLogin) return null;
    return this.lastLogin.toISOString();
  }

  getDaysSinceLastLogin(): number | null {
    if (!this.lastLogin) return null;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.lastLogin.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Factory methods para cambios de estado
  static createActiveUser(
    email: Email,
    username: Username,
    passwordHash: HashedPassword,
    role: Role,
    countryCode?: CountryCode | null,
    id?: string
  ): User {
    return User.create(
      email,
      username,
      passwordHash,
      role,
      countryCode,
      UserStatus.createActive(),
      id
    );
  }

  static createSuspendedUser(
    email: Email,
    username: Username,
    passwordHash: HashedPassword,
    role: Role,
    countryCode?: CountryCode | null,
    id?: string
  ): User {
    return User.create(
      email,
      username,
      passwordHash,
      role,
      countryCode,
      UserStatus.createSuspended(),
      id
    );
  }

  static createBannedUser(
    email: Email,
    username: Username,
    passwordHash: HashedPassword,
    role: Role,
    countryCode?: CountryCode | null,
    id?: string
  ): User {
    return User.create(
      email,
      username,
      passwordHash,
      role,
      countryCode,
      UserStatus.createBanned(),
      id
    );
  }

  // Métodos para el país
  getCountryCodeValue(): string | null {
    return this.countryCode?.value || null;
  }

  getCountryName(): string | null {
    return this.countryCode?.getDisplayName() || null;
  }

  getCountryFlag(): string | null {
    return this.countryCode?.getFlag() || null;
  }

  // Métodos de clasificación geográfica
  isFromNorthAmerica(): boolean {
    return this.countryCode?.isNorthAmerica() || false;
  }

  isFromSouthAmerica(): boolean {
    return this.countryCode?.isSouthAmerica() || false;
  }

  isFromEurope(): boolean {
    return this.countryCode?.isEurope() || false;
  }

  isFromAsia(): boolean {
    return this.countryCode?.isAsia() || false;
  }

  isFromAfrica(): boolean {
    return this.countryCode?.isAfrica() || false;
  }

  isFromOceania(): boolean {
    return this.countryCode?.isOceania() || false;
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

    if (!this.username || !(this.username instanceof Username)) {
      throw new Error('El usuario debe tener un username válido');
    }

    if (!this.role || !(this.role instanceof Role)) {
      throw new Error('El usuario debe tener un rol válido asignado');
    }

    if (!this.passwordHash || !(this.passwordHash instanceof HashedPassword)) {
      throw new Error('El usuario debe tener un hash de contraseña válido');
    }

    if (!this.status || !(this.status instanceof UserStatus)) {
      throw new Error('El usuario debe tener un estado válido');
    }

    // CountryCode es opcional, pero si existe debe ser válido
    if (
      this.countryCode !== null &&
      !(this.countryCode instanceof CountryCode)
    ) {
      throw new Error('El código de país debe ser válido o null');
    }

    // lastLogin es opcional, pero si existe debe ser una fecha válida
    if (this.lastLogin !== null && !(this.lastLogin instanceof Date)) {
      throw new Error('La fecha de último login debe ser válida o null');
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

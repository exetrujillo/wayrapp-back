// src/core/domain/value-objects/UserStatus.ts

export type UserStatusValue =
  | 'active'
  | 'confirmation_pending'
  | 'suspended'
  | 'banned';

/**
 * Value Object para el estado de un usuario en el sistema.
 *
 * Estados disponibles:
 * - active: Usuario activo y con acceso completo
 * - confirmation_pending: Usuario registrado pero pendiente de confirmar email
 * - suspended: Usuario temporalmente suspendido (puede ser reactivado)
 * - banned: Usuario permanentemente baneado del sistema
 */
export class UserStatus {
  private readonly _value: UserStatusValue;

  private static readonly VALID_STATUSES: UserStatusValue[] = [
    'active',
    'confirmation_pending',
    'suspended',
    'banned',
  ] as const;

  constructor(value: string) {
    this.validate(value);
    this._value = value.trim() as UserStatusValue;
  }

  get value(): UserStatusValue {
    return this._value;
  }

  // Métodos de validación
  private validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('El estado de usuario no puede estar vacío');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new Error('El estado de usuario no puede estar vacío');
    }

    if (!this.isValidStatus(trimmedValue)) {
      throw new Error(
        `Estado de usuario inválido: ${value}. Estados válidos: ${UserStatus.VALID_STATUSES.join(', ')}`
      );
    }
  }

  private isValidStatus(value: string): value is UserStatusValue {
    return UserStatus.VALID_STATUSES.includes(value as UserStatusValue);
  }

  // Métodos de utilidad para verificar estados específicos
  isActive(): boolean {
    return this._value === 'active';
  }

  isPendingConfirmation(): boolean {
    return this._value === 'confirmation_pending';
  }

  isSuspended(): boolean {
    return this._value === 'suspended';
  }

  isBanned(): boolean {
    return this._value === 'banned';
  }

  // Métodos de negocio
  canLogin(): boolean {
    return this.isActive();
  }

  canBeReactivated(): boolean {
    return this.isSuspended() || this.isPendingConfirmation();
  }

  requiresEmailConfirmation(): boolean {
    return this.isPendingConfirmation();
  }

  isPermanentlyBlocked(): boolean {
    return this.isBanned();
  }

  // Factory methods para crear estados específicos
  static createActive(): UserStatus {
    return new UserStatus('active');
  }

  static createPendingConfirmation(): UserStatus {
    return new UserStatus('confirmation_pending');
  }

  static createSuspended(): UserStatus {
    return new UserStatus('suspended');
  }

  static createBanned(): UserStatus {
    return new UserStatus('banned');
  }

  // Método para obtener descripción legible
  getDisplayName(): string {
    const displayNames: Record<UserStatusValue, string> = {
      active: 'Activo',
      confirmation_pending: 'Pendiente de confirmación',
      suspended: 'Suspendido',
      banned: 'Baneado',
    };
    return displayNames[this._value];
  }

  // Método para obtener todos los estados válidos
  static getValidStatuses(): UserStatusValue[] {
    return [...UserStatus.VALID_STATUSES];
  }

  // Método de comparación
  equals(other: UserStatus): boolean {
    return this._value === other._value;
  }

  // Método toString para debugging
  toString(): string {
    return this._value;
  }
}

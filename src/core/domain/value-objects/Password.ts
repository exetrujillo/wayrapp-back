// src/core/domain/value-objects/Password.ts

export class PlainPassword {
  private readonly _value: string;

  // Constantes de validación
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 100;
  private static readonly ALLOWED_SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,./?';

  // Patrones de validación
  private static readonly PATTERNS = {
    hasLowerCase: /[a-z]/,
    hasUpperCase: /[A-Z]/,
    hasNumber: /[0-9]/,
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{}|;:,./?]/,
    // Patrón para detectar caracteres potencialmente peligrosos
    hasDangerousChars: /[<>"'`\x00-\x1f\x7f-\x9f]/,
    // Patrón para detectar secuencias de escape o inyección
    hasInjectionPatterns:
      /(javascript:|data:|vbscript:|on\w+\s*=|<script|<\/script|eval\(|expression\()/i,
  };

  constructor(value: string) {
    // Asignar el valor temporalmente para las validaciones
    this._value = value;
    this.validatePassword(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: PlainPassword): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  /**
   * Verifica si la contraseña cumple con todos los requisitos de complejidad
   */
  isStrong(): boolean {
    return this.hasRequiredComplexity();
  }

  /**
   * Verifica si la contraseña tiene al menos la longitud mínima especificada
   */
  hasMinLength(minLength: number): boolean {
    return this._value.length >= minLength;
  }

  /**
   * Verifica si la contraseña cumple con todos los requisitos de complejidad
   */
  hasRequiredComplexity(): boolean {
    const { hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar } =
      PlainPassword.PATTERNS;

    return (
      hasLowerCase.test(this._value) &&
      hasUpperCase.test(this._value) &&
      hasNumber.test(this._value) &&
      hasSpecialChar.test(this._value)
    );
  }

  /**
   * Obtiene información detallada sobre qué requisitos cumple la contraseña
   */
  getComplexityInfo(): {
    hasMinLength: boolean;
    hasMaxLength: boolean;
    hasLowerCase: boolean;
    hasUpperCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    isSecure: boolean;
    meetsAllRequirements: boolean;
  } {
    const { hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar } =
      PlainPassword.PATTERNS;

    const info = {
      hasMinLength: this._value.length >= PlainPassword.MIN_LENGTH,
      hasMaxLength: this._value.length <= PlainPassword.MAX_LENGTH,
      hasLowerCase: hasLowerCase.test(this._value),
      hasUpperCase: hasUpperCase.test(this._value),
      hasNumber: hasNumber.test(this._value),
      hasSpecialChar: hasSpecialChar.test(this._value),
      isSecure: this.isSecurePassword(this._value),
      meetsAllRequirements: false,
    };

    info.meetsAllRequirements =
      info.hasMinLength &&
      info.hasMaxLength &&
      info.hasLowerCase &&
      info.hasUpperCase &&
      info.hasNumber &&
      info.hasSpecialChar &&
      info.isSecure;

    return info;
  }

  /**
   * Validación completa de la contraseña
   */
  private validatePassword(value: string): void {
    // Validación básica de tipo y existencia
    if (!value || typeof value !== 'string') {
      throw new Error('La contraseña debe ser una cadena de texto válida');
    }

    // Validación de longitud
    if (!this.isValidLength(value)) {
      throw new Error(
        `La contraseña debe tener entre ${PlainPassword.MIN_LENGTH} y ${PlainPassword.MAX_LENGTH} caracteres`
      );
    }

    // Validación de seguridad (caracteres peligrosos e inyecciones)
    if (!this.isSecurePassword(value)) {
      throw new Error(
        'La contraseña contiene caracteres no permitidos o patrones de seguridad peligrosos'
      );
    }

    // Validación de complejidad
    const missing = this.getMissingRequirements(value);
    if (missing.length > 0) {
      throw new Error(`La contraseña debe incluir: ${missing.join(', ')}`);
    }
  }

  /**
   * Verifica si la longitud está dentro del rango permitido
   */
  private isValidLength(value: string): boolean {
    return (
      value.length >= PlainPassword.MIN_LENGTH &&
      value.length <= PlainPassword.MAX_LENGTH
    );
  }

  /**
   * Verifica que la contraseña no contenga caracteres peligrosos o patrones de inyección
   */
  private isSecurePassword(value: string): boolean {
    const { hasDangerousChars, hasInjectionPatterns } = PlainPassword.PATTERNS;

    // No debe contener caracteres peligrosos
    if (hasDangerousChars.test(value)) {
      return false;
    }

    // No debe contener patrones de inyección
    if (hasInjectionPatterns.test(value)) {
      return false;
    }

    // Verificar que solo contenga caracteres permitidos (excluyendo los peligrosos)
    const allowedCharsPattern = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{}|;:,./?\s]+$/;
    return allowedCharsPattern.test(value);
  }

  /**
   * Obtiene una lista de requisitos faltantes
   */
  private getMissingRequirements(value: string): string[] {
    const missing: string[] = [];
    const { hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar } =
      PlainPassword.PATTERNS;

    if (!hasLowerCase.test(value)) {
      missing.push('al menos una letra minúscula (a-z)');
    }
    if (!hasUpperCase.test(value)) {
      missing.push('al menos una letra mayúscula (A-Z)');
    }
    if (!hasNumber.test(value)) {
      missing.push('al menos un número (0-9)');
    }
    if (!hasSpecialChar.test(value)) {
      missing.push(
        `al menos un carácter especial (${PlainPassword.ALLOWED_SPECIAL_CHARS})`
      );
    }

    return missing;
  }
}

export class HashedPassword {
  private readonly _value: string;

  // Constantes para validación de hash
  private static readonly MIN_HASH_LENGTH = 59; // Longitud mínima de bcrypt
  private static readonly MAX_HASH_LENGTH = 60; // Longitud estándar de bcrypt

  // Patrones de validación para diferentes tipos de hash
  private static readonly HASH_PATTERNS = {
    // bcrypt: $2a$, $2b$, $2x$, $2y$ seguido de cost y hash
    bcrypt: /^\$2[abxy]\$([0-9]{2})\$[A-Za-z0-9./]{53}$/,
    // Patrón para detectar caracteres peligrosos en hash
    dangerousChars: /[<>&"'`\x00-\x1f\x7f-\x9f]/,
    // Patrón para detectar intentos de inyección
    injectionPatterns:
      /(javascript:|data:|vbscript:|on\w+\s*=|<script|<\/script|eval\(|expression\()/i,
  };

  constructor(value: string) {
    this.validateHash(value);
    this._value = value.trim();
  }

  get value(): string {
    return this._value;
  }

  equals(other: HashedPassword): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  /**
   * Verifica si el hash es de tipo bcrypt
   */
  isBcryptHash(): boolean {
    return HashedPassword.HASH_PATTERNS.bcrypt.test(this._value);
  }

  /**
   * Obtiene el cost factor del hash bcrypt (si aplica)
   */
  getBcryptCost(): number | null {
    const match = this._value.match(HashedPassword.HASH_PATTERNS.bcrypt);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Verifica si el cost factor está dentro del rango recomendado (10-15)
   */
  hasSecureCost(): boolean {
    const cost = this.getBcryptCost();
    return cost !== null && cost >= 10 && cost <= 15;
  }

  /**
   * Obtiene información detallada sobre el hash
   */
  getHashInfo(): {
    isBcrypt: boolean;
    cost: number | null;
    hasSecureCost: boolean;
    length: number;
    isValidLength: boolean;
    isSecure: boolean;
  } {
    const cost = this.getBcryptCost();

    return {
      isBcrypt: this.isBcryptHash(),
      cost,
      hasSecureCost: this.hasSecureCost(),
      length: this._value.length,
      isValidLength: this.isValidHashLength(this._value),
      isSecure: this.isSecureHash(this._value),
    };
  }

  /**
   * Validación completa del hash
   */
  private validateHash(value: string): void {
    // Validación básica de tipo y existencia
    if (!value || typeof value !== 'string') {
      throw new Error(
        'El hash de contraseña debe ser una cadena de texto válida'
      );
    }

    const trimmedValue = value.trim();

    // Validación de longitud
    if (!this.isValidHashLength(trimmedValue)) {
      throw new Error(
        `El hash debe tener entre ${HashedPassword.MIN_HASH_LENGTH} y ${HashedPassword.MAX_HASH_LENGTH} caracteres`
      );
    }

    // Validación de seguridad
    if (!this.isSecureHash(trimmedValue)) {
      throw new Error(
        'El hash contiene caracteres no permitidos o patrones de seguridad peligrosos'
      );
    }

    // Validación de formato
    if (!this.isValidHashFormat(trimmedValue)) {
      throw new Error(
        'El hash no tiene un formato válido. Se esperaba formato bcrypt ($2a$, $2b$, $2x$, o $2y$)'
      );
    }

    // Validación de cost factor
    const cost = this.getBcryptCostFromValue(trimmedValue);
    if (cost !== null && (cost < 4 || cost > 31)) {
      throw new Error('El cost factor del hash bcrypt debe estar entre 4 y 31');
    }
  }

  /**
   * Verifica si la longitud del hash está dentro del rango válido
   */
  private isValidHashLength(value: string): boolean {
    return (
      value.length >= HashedPassword.MIN_HASH_LENGTH &&
      value.length <= HashedPassword.MAX_HASH_LENGTH
    );
  }

  /**
   * Verifica que el hash no contenga caracteres peligrosos
   */
  private isSecureHash(value: string): boolean {
    const { dangerousChars, injectionPatterns } = HashedPassword.HASH_PATTERNS;

    // No debe contener caracteres peligrosos
    if (dangerousChars.test(value)) {
      return false;
    }

    // No debe contener patrones de inyección
    if (injectionPatterns.test(value)) {
      return false;
    }

    return true;
  }

  /**
   * Verifica si el hash tiene un formato válido
   */
  private isValidHashFormat(value: string): boolean {
    // Por ahora solo soportamos bcrypt, pero se puede extender
    return HashedPassword.HASH_PATTERNS.bcrypt.test(value);
  }

  /**
   * Obtiene el cost factor de un valor de hash (método auxiliar)
   */
  private getBcryptCostFromValue(value: string): number | null {
    const match = value.match(HashedPassword.HASH_PATTERNS.bcrypt);
    return match ? parseInt(match[1], 10) : null;
  }
}

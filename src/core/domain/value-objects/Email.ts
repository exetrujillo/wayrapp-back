// src/core/domain/value-objects/Email.ts

export class Email {
  private readonly _value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('Email inválido');
    }
    this._value = value.toLowerCase().trim();
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  private isValid(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }

    const trimmedEmail = email.trim();
    if (trimmedEmail.length === 0) {
      return false;
    }

    // Regex más completo que soporta casos comunes como + addressing
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    return (
      emailRegex.test(trimmedEmail) &&
      trimmedEmail.length <= 254 && // RFC 5321 limit
      !trimmedEmail.startsWith('.') &&
      !trimmedEmail.endsWith('.')
    );
  }
}

// src/core/domain/value-objects/Username.ts

export class Username {
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 30;
  private static readonly VALID_PATTERN = /^[a-zA-Z0-9_-]+$/;

  constructor(public readonly value: string) {
    this.validate();
  }

  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new Error('El nombre de usuario no puede estar vacío');
    }

    if (this.value.length < Username.MIN_LENGTH) {
      throw new Error(
        `El nombre de usuario debe tener al menos ${Username.MIN_LENGTH} caracteres`
      );
    }

    if (this.value.length > Username.MAX_LENGTH) {
      throw new Error(
        `El nombre de usuario no puede exceder los ${Username.MAX_LENGTH} caracteres`
      );
    }

    if (!Username.VALID_PATTERN.test(this.value)) {
      throw new Error(
        'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos'
      );
    }
  }

  isValid(): boolean {
    return true; // Si llegó hasta aquí, es válido
  }

  getDisplayValue(): string {
    return `@${this.value}`;
  }
}

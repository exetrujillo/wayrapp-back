// src/infrastructure/services/PasswordService.ts

import bcrypt from 'bcrypt';
import {
  PlainPassword,
  HashedPassword,
} from '@/core/domain/value-objects/Password';
import { IPasswordService } from '@/core/interfaces/services/IPasswordService';

export class PasswordService implements IPasswordService {
  private readonly saltRounds: number;

  constructor(saltRounds: number = 12) {
    if (saltRounds < 10 || saltRounds > 15) {
      throw new Error(
        'Salt rounds debe estar entre 10 y 15 para seguridad óptima'
      );
    }
    this.saltRounds = saltRounds;
  }

  async hash(plainPassword: PlainPassword): Promise<HashedPassword> {
    try {
      const hash = await bcrypt.hash(plainPassword.value, this.saltRounds);
      return new HashedPassword(hash);
    } catch (error) {
      throw new Error(
        `Error al hashear la contraseña: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }
  }

  async verify(
    plainPassword: PlainPassword,
    hashedPassword: HashedPassword
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword.value, hashedPassword.value);
    } catch (error) {
      throw new Error(
        `Error al verificar la contraseña: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }
  }
}

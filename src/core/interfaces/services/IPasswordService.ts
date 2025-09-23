// src/core/interfaces/services/IPasswordService.ts

import {
  PlainPassword,
  HashedPassword,
} from '@/core/domain/value-objects/Password';

export interface IPasswordService {
  hash(plainPassword: PlainPassword): Promise<HashedPassword>;
  verify(
    plainPassword: PlainPassword,
    hashedPassword: HashedPassword
  ): Promise<boolean>;
}

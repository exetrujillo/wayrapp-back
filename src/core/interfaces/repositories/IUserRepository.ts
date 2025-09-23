// src/core/interfaces/repositories/IUserRepository.ts

import { User } from '@/core/domain/entities/User.js';

/**
 * Define el contrato que cualquier repositorio de usuarios debe implementar.
 * Esta interfaz es la base para la abstracción de la capa de persistencia.
 */
export interface IUserRepository {
  /**
   * Crea un nuevo usuario en la base de datos.
   * @param userData - Los datos del usuario a crear.
   * @returns El usuario recién creado.
   */
  create(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User>;
}

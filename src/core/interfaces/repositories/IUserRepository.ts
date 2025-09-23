// src/core/interfaces/repositories/IUserRepository.ts

import { User } from '@/core/domain/entities/User';

export interface IUserRepository {
  /**
   * Crea un nuevo usuario en el sistema.
   * @param userData Datos del usuario a crear, excluyendo createdAt y updatedAt.
   * @returns El usuario creado con sus propiedades completas.
   */
  create(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User>;

  /**
   * Busca un usuario por su ID único.
   * @param id El ID del usuario.
   * @returns El usuario encontrado o null si no existe.
   */
  findById(id: string): Promise<User | null>;

  /**
   * Busca un usuario por su dirección de correo electrónico.
   * @param email La dirección de correo electrónico del usuario.
   * @returns El usuario encontrado o null si no existe.
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Actualiza las propiedades de un usuario existente.
   * @param id El ID del usuario a actualizar.
   * @param userData Las propiedades a actualizar.
   * @returns El usuario actualizado o null si el usuario no fue encontrado.
   */
  update(id: string, userData: Partial<User>): Promise<User | null>;

  /**
   * Elimina un usuario del sistema por su ID.
   * @param id El ID del usuario a eliminar.
   */
  delete(id: string): Promise<void>;
}

// src/core/interfaces/repositories/IUserRepository.ts

import { User } from '@/core/domain/entities/User';
import { Email } from '@/core/domain/value-objects/Email';
import { HashedPassword } from '@/core/domain/value-objects/Password';
import { Role } from '@/core/domain/value-objects/Role';

export interface IUserRepository {
  /**
   * Crea un nuevo usuario en el sistema.
   * La entidad User se encarga de generar su propio ID y timestamps.
   * @param userData Datos básicos del usuario (email, password, role).
   * @returns El usuario creado con sus propiedades completas.
   */
  create(userData: {
    email: Email;
    passwordHash: HashedPassword;
    role: Role;
  }): Promise<User>;

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

  // 📊 CONSULTAS ESPECIALES - Para reportes o estadísticas

  /**
   * Cuenta el número total de usuarios en el sistema.
   * @returns El número total de usuarios.
   */
  countUsers(): Promise<number>;

  /**
   * Encuentra usuarios por su rol.
   * @param role El rol de los usuarios a buscar.
   * @returns Una lista de usuarios que coinciden con el rol especificado.
   */
  findUsersByRole(role: string): Promise<User[]>;
}

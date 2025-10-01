// src/core/interfaces/repositories/IUserRepository.ts

import { User } from '@/core/domain/entities/User';
import { Email } from '@/core/domain/value-objects/Email';
import { HashedPassword } from '@/core/domain/value-objects/Password';
import { Role } from '@/core/domain/value-objects/Role';
import { Username } from '@/core/domain/value-objects/Username';
import { CountryCode } from '@/core/domain/value-objects/CountryCode';

export interface IUserRepository {
  /**
   * Crea un nuevo usuario en el sistema.
   * La entidad User se encarga de generar su propio ID y timestamps.
   * @param userData Datos básicos del usuario (email, username, password, role, país opcional).
   * @returns El usuario creado con sus propiedades completas.
   */
  create(userData: {
    email: Email;
    username: Username;
    passwordHash: HashedPassword;
    role: Role;
    countryCode?: CountryCode | null;
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
   * Busca un usuario por su nombre de usuario.
   * @param username El nombre de usuario.
   * @returns El usuario encontrado o null si no existe.
   */
  findByUsername(username: string): Promise<User | null>;

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

  /**
   * Encuentra usuarios por código de país.
   * @param countryCode El código de país de los usuarios a buscar.
   * @returns Una lista de usuarios que coinciden con el país especificado.
   */
  findUsersByCountry(countryCode: string): Promise<User[]>;

  /**
   * Encuentra usuarios por continente.
   * @param continent El continente de los usuarios a buscar ('North America', 'South America', 'Europe', 'Asia', 'Africa', 'Oceania').
   * @returns Una lista de usuarios que pertenecen al continente especificado.
   */
  findUsersByContinent(continent: string): Promise<User[]>;

  /**
   * Obtiene estadísticas de usuarios por continente.
   * @returns Un objeto con el conteo de usuarios por continente.
   */
  getUserStatsByContinent(): Promise<Record<string, number>>;

  /**
   * Obtiene estadísticas de usuarios por país.
   * @returns Un objeto con el conteo de usuarios por país.
   */
  getUserStatsByCountry(): Promise<Record<string, number>>;
}

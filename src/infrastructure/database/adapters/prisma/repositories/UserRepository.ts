// src/infrastructure/database/adapters/prisma/repositories/UserRepository.ts

import {
  PrismaClient,
  Prisma,
  User as PrismaUser,
  Role as PrismaRole,
} from '@/infrastructure/node_modules/.prisma/client';
import { IUserRepository } from '@/core/interfaces/repositories/IUserRepository';
import { User } from '@/core/domain/entities/User';
import { Email } from '@/core/domain/value-objects/Email';
import { HashedPassword } from '@/core/domain/value-objects/Password';
import { Role } from '@/core/domain/value-objects/Role';

/**
 * Errores específicos de Prisma para manejo de errores mejorado
 */
export class UserRepositoryError extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'UserRepositoryError';
  }
}

export class UserNotFoundError extends UserRepositoryError {
  constructor(identifier: string, originalError?: Error) {
    super(`Usuario no encontrado: ${identifier}`, originalError);
    this.name = 'UserNotFoundError';
  }
}

export class UserAlreadyExistsError extends UserRepositoryError {
  constructor(email: string, originalError?: Error) {
    super(`Usuario con email ${email} ya existe`, originalError);
    this.name = 'UserAlreadyExistsError';
  }
}

export class DatabaseConnectionError extends UserRepositoryError {
  constructor(originalError?: Error) {
    super('Error de conexión a la base de datos', originalError);
    this.name = 'DatabaseConnectionError';
  }
}

/**
 * Implementación optimizada de IUserRepository usando Prisma ORM
 * con manejo de errores                                                                                                                                                                                                                                     , logging y optimizaciones de rendimiento
 *
 * Características implementadas:
 * - Manejo específico de errores de Prisma con códigos de error detallados
 * - Logging comprehensivo con métricas de rendimiento
 * - Optimización de queries con select específico de campos
 * - Mapeo correcto entre value objects y enums de Prisma
 * - Gestión de conexiones optimizada
 */
export class UserRepository implements IUserRepository {
  private prisma: PrismaClient;
  private logger: Console;

  constructor(prisma: PrismaClient, logger: Console = console) {
    this.prisma = prisma;
    this.logger = logger;
  }

  async create(userData: {
    email: Email;
    passwordHash: HashedPassword;
    role: Role;
  }): Promise<User> {
    const startTime = Date.now();
    this.logger.log(
      `[UserRepository] Creando usuario con email: ${userData.email.value}`
    );

    try {
      // La entidad se crea a sí misma con UUID
      const user = User.create(
        userData.email,
        userData.passwordHash,
        userData.role
      );

      // Repository solo persiste lo que la entidad ya definió
      await this.prisma.user.create({
        data: {
          id: user.id,
          email: user.getEmailValue(),
          passwordHash: user.getPasswordHashValue(),
          role: this.mapRoleToEnum(user.getRoleValue()),
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });

      const duration = Date.now() - startTime;
      this.logger.log(
        `[UserRepository] Usuario creado exitosamente en ${duration}ms. ID: ${user.id}`
      );

      return user; // Retornamos la entidad que creamos
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `[UserRepository] Fallo al crear usuario después de ${duration}ms:`,
        error
      );

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002: Unique constraint violation
        if (error.code === 'P2002') {
          throw new UserAlreadyExistsError(userData.email.value, error);
        }
        // P1001: Can't reach database server
        if (error.code === 'P1001') {
          throw new DatabaseConnectionError(error);
        }
      }

      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new DatabaseConnectionError(error);
      }

      throw new UserRepositoryError(
        `Fallo al crear el usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async findById(id: string): Promise<User | null> {
    const startTime = Date.now();
    this.logger.log(`[UserRepository] Encontrando usuario por el ID: ${id}`);

    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        // Optimización: seleccionar solo los campos necesarios
        select: {
          id: true,
          email: true,
          passwordHash: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const duration = Date.now() - startTime;

      if (!user) {
        this.logger.log(
          `[UserRepository] Usuario no encontrado por el ID: ${id} (${duration}ms)`
        );
        return null;
      }

      this.logger.log(
        `[UserRepository] Usuario encontrado por el ID: ${id} in ${duration}ms`
      );
      return this.mapToUser(user);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `[UserRepository] Fallo al encontrar usuario por el ID: ${id} después de ${duration}ms:`,
        error
      );

      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new DatabaseConnectionError(error);
      }

      throw new UserRepositoryError(
        `Fallo al encontrar usuario por ID: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const startTime = Date.now();
    this.logger.log(`[UserRepository] Encontrando usuario por email: ${email}`);

    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        // Optimización: seleccionar solo los campos necesarios
        select: {
          id: true,
          email: true,
          passwordHash: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const duration = Date.now() - startTime;

      if (!user) {
        this.logger.log(
          `[UserRepository] Usuario no encontrado por el email: ${email} (${duration}ms)`
        );
        return null;
      }

      this.logger.log(
        `[UserRepository] Usuario encontrado por el email: ${email} en ${duration}ms`
      );
      return this.mapToUser(user);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `[UserRepository] Fallo al encontrar usuario por email: ${email} después de ${duration}ms:`,
        error
      );

      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new DatabaseConnectionError(error);
      }

      throw new UserRepositoryError(
        `Fallo al encontrar usuario por email: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    const startTime = Date.now();
    this.logger.log(`[UserRepository] Actualizando usuario: ${id}`);

    try {
      // Mapear value objects a primitivos para la actualización
      const updateData: {
        email?: string;
        passwordHash?: string;
        role?: PrismaRole;
      } = {};

      if (userData.email) {
        updateData.email = userData.email.value;
      }
      if (userData.passwordHash) {
        updateData.passwordHash = userData.passwordHash.value;
      }
      if (userData.role) {
        updateData.role = this.mapRoleToEnum(userData.role.value);
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateData,
        // Optimización: seleccionar solo los campos necesarios
        select: {
          id: true,
          email: true,
          passwordHash: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const duration = Date.now() - startTime;
      this.logger.log(
        `[UserRepository] Usuario actualizado exitosamente en ${duration}ms. ID: ${id}`
      );

      return this.mapToUser(updatedUser);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `[UserRepository] Fallo al actualizar usuario: ${id} after ${duration}ms:`,
        error
      );

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2025: Record not found
        if (error.code === 'P2025') {
          this.logger.log(
            `[UserRepository] Usuario no encontrado para actualizar: ${id}`
          );
          return null;
        }
        // P2002: Unique constraint violation (email already exists)
        if (error.code === 'P2002') {
          throw new UserAlreadyExistsError(
            userData.email?.value || 'unknown',
            error
          );
        }
        // P1001: Can't reach database server
        if (error.code === 'P1001') {
          throw new DatabaseConnectionError(error);
        }
      }

      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new DatabaseConnectionError(error);
      }

      throw new UserRepositoryError(
        `Fallo al actualizarusuario: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async delete(id: string): Promise<void> {
    const startTime = Date.now();
    this.logger.log(`[UserRepository] Eliminando usuario: ${id}`);

    try {
      await this.prisma.user.delete({
        where: { id },
      });

      const duration = Date.now() - startTime;
      this.logger.log(
        `[UserRepository] Usuario eliminado exitosamente en ${duration}ms. ID: ${id}`
      );
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2025: Record not found - esto es aceptable para delete
        if (error.code === 'P2025') {
          this.logger.log(
            `[UserRepository] Usuario no encontrado para la eliminación: ${id} (${duration}ms) - operación considerada exitosa`
          );
          return; // No lanzar error, el resultado es el mismo
        }
        // P1001: Can't reach database server
        if (error.code === 'P1001') {
          this.logger.error(
            `[UserRepository] Error en la conexión a la base de datos durante la eliminación: ${id} después de ${duration}ms:`,
            error
          );
          throw new DatabaseConnectionError(error);
        }
      }

      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        this.logger.error(
          `[UserRepository] Error desconocido de la base de datos durante la eliminación: ${id} después de ${duration}ms:`,
          error
        );
        throw new DatabaseConnectionError(error);
      }

      this.logger.error(
        `[UserRepository] Fallo al eliminar usuario: ${id} después de ${duration}ms:`,
        error
      );
      throw new UserRepositoryError(
        `Fallo al eliminar usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async countUsers(): Promise<number> {
    const startTime = Date.now();
    this.logger.log('[UserRepository] Contando usuarios...');

    try {
      const count = await this.prisma.user.count();
      const duration = Date.now() - startTime;
      this.logger.log(
        `[UserRepository] Conteo de usuarios completado en ${duration}ms: ${count} usuarios`
      );
      return count;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `[UserRepository] Fallo al contar usuarios después de ${duration}ms:`,
        error
      );

      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new DatabaseConnectionError(error);
      }

      throw new UserRepositoryError(
        `Fallo al contar usuarios: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async findUsersByRole(role: string): Promise<User[]> {
    const startTime = Date.now();
    this.logger.log(`[UserRepository] Encontrando usuarios por rol: ${role}`);
    try {
      const PrismaRoleValue = this.mapRoleToEnum(role);

      const users = await this.prisma.user.findMany({
        where: { role: PrismaRoleValue },
        // Optimización: seleccionar solo los campos necesarios
        select: {
          id: true,
          email: true,
          passwordHash: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const duration = Date.now() - startTime;
      this.logger.log(
        `[UserRepository] Encontrados ${users.length} usuarios con el rol ${role} en ${duration}ms`
      );

      return users.map(this.mapToUser.bind(this));
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `[UserRepository] Fallo al encontrar usuarios por rol: ${role} después de ${duration}ms:`,
        error
      );

      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new DatabaseConnectionError(error);
      }

      throw new UserRepositoryError(
        `Fallo al encontrar usuarios por rol: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Mapea un objeto Prisma User a una entidad de dominio User
   */
  private mapToUser(prismaUser: PrismaUser): User {
    return User.fromPersistence(
      prismaUser.id,
      new Email(prismaUser.email),
      new HashedPassword(prismaUser.passwordHash),
      new Role(this.mapEnumToRole(prismaUser.role)),
      prismaUser.createdAt,
      prismaUser.updatedAt
    );
  }

  /**
   * Mapea un string de role a enum de Prisma
   */
  private mapRoleToEnum(roleValue: string): PrismaRole {
    switch (roleValue) {
      case 'student':
        return 'student' as PrismaRole;
      case 'content_creator':
        return 'content_creator' as PrismaRole;
      case 'admin':
        return 'admin' as PrismaRole;
      default:
        throw new UserRepositoryError(`Valor de rol inválido: ${roleValue}`);
    }
  }

  /**
   * Mapea un enum de Prisma a string de role
   */
  private mapEnumToRole(prismaRole: PrismaRole): string {
    return prismaRole.toString();
  }

  /**
   * Verifica la salud de la conexión a la base de datos
   * Útil para health checks y monitoreo
   */
  async checkHealth(): Promise<{
    healthy: boolean;
    latency?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    this.logger.log('[UserRepository] Chequeando salud de la base de datos...');

    try {
      // Ejecutar una query simple para verificar conectividad
      await this.prisma.$queryRaw`SELECT 1`;

      const latency = Date.now() - startTime;
      this.logger.log(
        `[UserRepository] Check de salud de la base de datos pasada en ${latency}ms`
      );

      return { healthy: true, latency };
    } catch (error) {
      const latency = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';

      this.logger.error(
        `[UserRepository] Check de salud de la base de datos fallido después de ${latency}ms:`,
        error
      );

      return {
        healthy: false,
        latency,
        error: errorMessage,
      };
    }
  }

  /**
   * Obtiene estadísticas de la base de datos para monitoreo
   */
  async getStats(): Promise<{ totalUsers: number; queryTime: number }> {
    const startTime = Date.now();
    this.logger.log(
      '[UserRepository] Obteniendo estadísticas de la base de datos...'
    );

    try {
      const totalUsers = await this.prisma.user.count();
      const queryTime = Date.now() - startTime;

      this.logger.log(
        `[UserRepository] Estadísticas de la base de datos recuperadas en ${queryTime}ms: ${totalUsers} usuarios`
      );

      return { totalUsers, queryTime };
    } catch (error) {
      const queryTime = Date.now() - startTime;
      this.logger.error(
        `[UserRepository] Fallo al obtener estadísticas de la base de datos después de ${queryTime}ms:`,
        error
      );

      throw new UserRepositoryError(
        `No se pudieron obtener estadísticas de la base de datos: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        error instanceof Error ? error : undefined
      );
    }
  }
}

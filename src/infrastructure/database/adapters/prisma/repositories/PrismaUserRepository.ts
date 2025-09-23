// src/infrastructure/database/adapters/prisma/repositories/PrismaUserRepository.ts

import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '@/core/interfaces/repositories/IUserRepository';
import { User } from '@/core/domain/entities/User';

export class PrismaUserRepository implements IUserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const createdUser = await this.prisma.user.create({
      data: {
        id: userData.id,
        email: userData.email,
        passwordHash: userData.passwordHash,
        role: userData.role,
      },
    });

    return {
      id: createdUser.id,
      email: createdUser.email,
      passwordHash: createdUser.passwordHash,
      role: createdUser.role as User['role'],
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
    };
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role as User['role'],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role as User['role'],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          ...(userData.email && { email: userData.email }),
          ...(userData.passwordHash && { passwordHash: userData.passwordHash }),
          ...(userData.role && { role: userData.role }),
        },
      });

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        passwordHash: updatedUser.passwordHash,
        role: updatedUser.role as User['role'],
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };
    } catch {
      // Si el usuario no existe, Prisma lanza un error
      return null;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch {
      // Si el usuario no existe, Prisma lanza un error
      // En este caso, simplemente ignoramos el error ya que el resultado es el mismo
      // (el usuario no existe en la base de datos)
    }
  }
}

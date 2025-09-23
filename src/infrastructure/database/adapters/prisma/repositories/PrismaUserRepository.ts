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
}

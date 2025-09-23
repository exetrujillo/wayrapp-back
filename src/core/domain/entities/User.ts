// src/core/domain/entities/User.ts

export type Role = 'student' | 'content_creator' | 'admin';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

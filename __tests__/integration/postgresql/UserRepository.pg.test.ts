// // __tests__/integration/postgresql/UserRepository.pg.test.ts

// import { PrismaClient } from '@prisma/client';
// import { v4 as uuidv4 } from 'uuid';
// import { IUserRepository } from '@/core/interfaces/repositories/IUserRepository.js';
// import { PrismaUserRepository } from '@/infrastructure/database/adapters/prisma/repositories/PrismaUserRepository.js';

// describe('PrismaUserRepository Integration Tests', () => {
//   let prisma: PrismaClient;
//   let userRepository: IUserRepository;

//   beforeAll(() => {
//     // Obtenemos la URL de la BD de Testcontainers
//     const databaseUrl = process.env.TEST_DATABASE_URL;
//     if (!databaseUrl) {
//       throw new Error('TEST_DATABASE_URL is not set');
//     }
//     // Creamos un cliente de Prisma que apunta a la BD de test
//     prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

//     // Instanciamos la implementación que vamos a probar
//     userRepository = new PrismaUserRepository(prisma);
//   });

//   // Limpiamos la tabla de usuarios antes de cada test para asegurar el aislamiento
//   beforeEach(async () => {
//     await prisma.user.deleteMany();
//   });

//   afterAll(async () => {
//     // Nos desconectamos de la base de datos de prueba al final
//     await prisma.$disconnect();
//   });

//   describe('create', () => {
//     it('should create a new user and return it', async () => {
//       // --- Preparación (Arrange) ---
//       const userData = {
//         id: uuidv4(),
//         email: 'test@example.com',
//         passwordHash: 'hashed_password',
//         role: 'student' as const,
//       };

//       // --- Ejecución (Act) ---
//       const createdUser = await userRepository.create(userData);

//       // --- Aserción (Assert) ---
//       expect(createdUser).toBeDefined();
//       expect(createdUser.id).toBe(userData.id);
//       expect(createdUser.email).toBe(userData.email);

//       // Verificamos que el usuario realmente existe en la BD
//       const userInDb = await prisma.user.findUnique({ where: { id: userData.id } });
//       expect(userInDb).not.toBeNull();
//       expect(userInDb?.email).toBe(userData.email);
//     });
//   });
// });

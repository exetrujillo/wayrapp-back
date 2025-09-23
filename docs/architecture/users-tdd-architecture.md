# Arquitectura TDD de Usuarios - Flujo de Implementación

## Resumen

Este documento describe la arquitectura de Desarrollo Dirigido por Pruebas (TDD) para implementar la gestión de datos de usuarios en nuestro sistema multi-base de datos. La arquitectura sigue los principios de Clean Architecture con un diseño agnóstico de base de datos que soporta PostgreSQL, MySQL y MongoDB.

## Diagrama de Flujo de Implementación

```mermaid
graph TD
    %% TDD Cycle: RED - GREEN - REFACTOR
    
    %% Phase 1: Domain Design (Interface First)
    A[Define Domain Interfaces] --> B[IUserRepository Interface]
    B --> C[User Entity Contracts]
    
    %% Phase 2: Contract Tests (RED)
    C --> D[Write Contract Tests FIRST]
    D --> E[IUserRepository Contract Test]
    E --> F[makeUserRepositoryContractTest]
    F --> G[Tests FAIL - RED State]
    
    %% Phase 3: First Implementation (GREEN)
    G --> H[Implement PostgreSQL Repository]
    H --> I[PrismaUserRepository Implementation]
    I --> J[Integration Test PostgreSQL]
    J --> K[Tests PASS - GREEN State]
    
    %% Phase 4: Refactor & Extend (REFACTOR)
    K --> L[Refactor Implementation]
    L --> M[Add MySQL Implementation]
    M --> N[TypeORMUserRepository]
    N --> O[Integration Test MySQL]
    
    %% Phase 5: MongoDB Extension (TDD Cycle)
    O --> P[Add MongoDB Implementation]
    P --> Q[MongoUserRepository]
    Q --> R[Integration Test MongoDB]
    
    %% Phase 6: Service Layer TDD
    R --> S[Write Service Tests FIRST]
    S --> T[UserService Test Suite]
    T --> U[Use Cases Tests]
    U --> V[Implement UserService]
    V --> W[Implement Use Cases]
    
    %% Phase 7: API Layer TDD
    W --> X[Write Controller Tests FIRST]
    X --> Y[API Integration Tests]
    Y --> Z[DTOs and Validation Tests]
    Z --> AA[Implement Controllers]
    AA --> BB[Implement DTOs and Schemas]
    
    %% Phase 8: Factory Pattern TDD
    BB --> CC[Write Factory Tests FIRST]
    CC --> DD[Database Factory Tests]
    DD --> EE[Implement Database Factory]
    EE --> FF[Configuration Tests]
    FF --> GG[Multi-DB CI/CD Pipeline]
    
    %% Styling - TDD Colors
    classDef redPhase fill:#ffebee,color:#000000,stroke:#d32f2f,stroke-width:2px
    classDef greenPhase fill:#e8f5e8,color:#000000,stroke:#388e3c,stroke-width:2px
    classDef refactorPhase fill:#fff3e0,color:#000000,stroke:#f57c00,stroke-width:2px
    classDef interfacePhase fill:#e3f2fd,color:#000000,stroke:#1976d2,stroke-width:2px
    
    class A,B,C interfacePhase
    class D,E,F,G,S,T,U,X,Y,Z,CC,DD,FF redPhase
    class H,I,J,K,M,N,O,P,Q,R,V,W,AA,BB,EE,GG greenPhase
    class L refactorPhase
```

## Fases de Implementación TDD

### Fase 1: Diseño de Interfaces (Interface First)

#### 1.1 ✅ Entidades de Dominio
```typescript
// src/core/domain/entities/User.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly email: Email,
    public readonly passwordHash: HashedPassword,
    public readonly role: Role,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validateConstructorParams();
  }

  // Métodos de utilidad implementados
  canCreateContent(): boolean { return this.role.canCreateContent(); }
  hasAdminPrivileges(): boolean { return this.role.hasAdminPrivileges(); }
  isStudent(): boolean { return this.role.isStudent(); }
  isContentCreator(): boolean { return this.role.isContentCreator(); }
  isAdmin(): boolean { return this.role.isAdmin(); }
  
  // Getters para APIs
  getEmailValue(): string { return this.email.value; }
  getRoleValue(): string { return this.role.value; }
  getPasswordHashValue(): string { return this.passwordHash.value; }
}
```

**Value Objects Implementados:**
- ✅ `Email`: Validación de formato de email
- ✅ `HashedPassword`: Validación de hash bcrypt
- ✅ `PlainPassword`: Validación de contraseña plana con reglas de fortaleza
- ✅ `Role`: Roles de usuario con métodos de autorización

#### 1.2 ✅ Interface del Repository
```typescript
// src/core/interfaces/repositories/IUserRepository.ts
export interface IUserRepository {
  create(userData: CreateUserData): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, updateData: UpdateUserData): Promise<User | null>;
  delete(id: string): Promise<void>;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  role: string;
}

export interface UpdateUserData {
  email?: string;
  passwordHash?: string;
  role?: string;
}
```

### Fase 2: Tests de Contrato PRIMERO (RED)

#### 2.1 Escribir Tests ANTES de Implementar
```typescript
// src/core/interfaces/repositories/__tests__/IUserRepository.contract.test.ts
export function makeUserRepositoryContractTest(
  description: string,
  setupRepository: () => {
    repository: IUserRepository;
    cleanDatabase: () => Promise<void>;
    verifyUserInDatabase: (id: string) => Promise<boolean>;
  },
  teardownRepository: () => Promise<void>
) {
  // Tests de contrato que todas las implementaciones deben pasar
}
```

### Fase 3: Primera Implementación (GREEN)

#### 3.1 Implementar PostgreSQL para Pasar Tests
```typescript
// src/infrastructure/database/adapters/prisma/repositories/PrismaUserRepository.ts
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}
  // Implementación usando Prisma
}
```

#### 3.2 Tests de Integración
```typescript
// __tests__/integration/postgresql/UserRepository.pg.test.ts
makeUserRepositoryContractTest(
  'PrismaUserRepository Integration Tests',
  () => ({
    repository: new PrismaUserRepository(testPrismaClient),
    cleanDatabase: () => TestDatabaseUtils.cleanDatabase(testPrismaClient),
    verifyUserInDatabase: async (id: string) => {
      const user = await testPrismaClient.user.findUnique({ where: { id } });
      return user !== null;
    }
  }),
  async () => {
    await TestDatabaseUtils.disconnectPrismaClient(testPrismaClient);
  }
);
```

### Fase 4: Capa de Servicios

#### 4.1 Casos de Uso
```typescript
// src/core/use-cases/users/CreateUserUseCase.ts
export class CreateUserUseCase {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('IPasswordService') private passwordService: IPasswordService
  ) {}
}
```

#### 4.2 Implementación del Servicio
```typescript
// src/modules/users/services/UserService.ts
export class UserService {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private updateUserUseCase: UpdateUserUseCase
  ) {}
}
```

### Fase 5: Capa de API

#### 5.1 DTOs y Validación
```typescript
// src/modules/users/dto/CreateUserDto.ts
export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['student', 'content_creator', 'admin'])
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
```

#### 5.2 Controladores
```typescript
// src/modules/users/controllers/UserController.ts
export class UserController {
  constructor(private userService: UserService) {}
  
  async create(req: Request, res: Response): Promise<void> {
    const userData = CreateUserSchema.parse(req.body);
    // Implementación
  }
}
```

### Fase 6: Patrón Factory

#### 6.1 Factory de Base de Datos
```typescript
// src/infrastructure/database/factories/DatabaseFactory.ts
export class DatabaseFactory {
  static createUserRepository(): IUserRepository {
    switch (config.database.type) {
      case 'postgresql': return new PrismaUserRepository(prismaClient);
      case 'mysql': return new TypeORMUserRepository(typeormConnection);
      case 'mongodb': return new MongoUserRepository(mongooseConnection);
    }
  }
}
```

## Estrategia de Testing

### Matriz de Testing Multi-Base de Datos

| Tipo de Test | PostgreSQL | MySQL | MongoDB | Propósito |
|--------------|------------|-------|---------|-----------|
| Tests de Contrato | ✅ | ✅ | ✅ | Asegurar cumplimiento de interfaces |
| Tests de Integración | ✅ | ✅ | ✅ | Validar operaciones de base de datos |
| Tests de Performance | ✅ | ✅ | ✅ | Comparar implementaciones |
| Tests E2E | ✅ | ✅ | ✅ | Validación de flujo completo |

### Pipeline CI/CD

```yaml
# .github/workflows/ci.yml
strategy:
  matrix:
    database: [postgresql, mysql, mongodb]
    node-version: [22.x]
```

## Principios TDD Aplicados

### Ciclo Red-Green-Refactor

1. **🔴 RED**: Escribir un test que falle
   - Definir el comportamiento esperado ANTES de implementar
   - Los tests actúan como especificación ejecutable
   - Garantiza que el test realmente valida la funcionalidad

2. **🟢 GREEN**: Escribir el código mínimo para pasar el test
   - Implementar solo lo necesario para que el test pase
   - No optimizar prematuramente
   - Enfocarse en hacer que funcione

3. **🟡 REFACTOR**: Mejorar el código sin cambiar funcionalidad
   - Limpiar el código manteniendo los tests verdes
   - Aplicar patrones de diseño
   - Optimizar performance si es necesario

### Aplicación en Nuestro Proyecto

- **Tests de Contrato**: Definen el comportamiento que TODAS las implementaciones deben cumplir
- **Implementación Incremental**: Cada nueva BD usa los mismos tests (PostgreSQL → MySQL → MongoDB)
- **Validación Continua**: Los tests garantizan que todas las implementaciones son intercambiables

## Beneficios Clave

1. **TDD Auténtico**: Tests escritos ANTES que implementaciones, dirigiendo el diseño
2. **Agnóstico de Base de Datos**: Cambiar entre bases de datos sin modificar la lógica de negocio
3. **Cumplimiento de Contratos**: Todas las implementaciones garantizadas para funcionar de la misma manera
4. **Calidad por Diseño**: Los tests actúan como especificación ejecutable
5. **Refactoring Seguro**: Cambios con confianza gracias a la cobertura de tests
6. **Arquitectura Limpia**: Separación clara de responsabilidades
7. **Escalable**: Fácil agregar nuevas implementaciones siguiendo el mismo patrón TDD

## Orden de Implementación TDD (Red-Green-Refactor)

### Ciclo 1: Repository Layer
1. ✅ **RED**: Definir interfaces y escribir tests de contrato (IMPLEMENTADO)
2. ✅ **RED**: Crear suite de tests que debe pasar cualquier implementación (IMPLEMENTADO)
3. ⌛ **GREEN**: Implementar PostgreSQL (Prisma) para pasar tests (EN PROGRESO)
4. 🔄 **REFACTOR**: Mejorar implementación PostgreSQL
5. 🔄 **GREEN**: Implementar MySQL (TypeORM) usando mismos tests
6. 🔄 **GREEN**: Implementar MongoDB (Mongoose) usando mismos tests

**Estado Actual del Domain Layer:**
- ✅ User entity con validaciones completas
- ✅ Value objects: Email, Password (Plain/Hashed), Role
- ✅ IUserRepository interface definida
- ✅ Tests unitarios para User entity
- ✅ Tests de contrato para IUserRepository preparados

### Ciclo 2: Service Layer
7. 🔄 **RED**: Escribir tests de servicios y casos de uso PRIMERO
8. 🔄 **GREEN**: Implementar servicios para pasar tests
9. 🔄 **REFACTOR**: Optimizar inyección de dependencias

### Ciclo 3: API Layer
10. 🔄 **RED**: Escribir tests de controladores y validación PRIMERO
11. 🔄 **GREEN**: Implementar controladores y DTOs para pasar tests
12. 🔄 **REFACTOR**: Optimizar validación con Zod

### Ciclo 4: Factory Pattern
13. 🔄 **RED**: Escribir tests de factory pattern PRIMERO
14. 🔄 **GREEN**: Implementar factory para pasar tests
15. 🔄 **REFACTOR**: Configurar CI/CD con testing multi-base de datos

## Próximos Pasos Inmediatos

### Fase Actual: Implementación Repository Layer (GREEN)
1. **Implementar PrismaUserRepository** para pasar los tests de contrato existentes
2. **Configurar Prisma schema** para la entidad User con value objects
3. **Crear tests de integración** con Testcontainers para PostgreSQL
4. **Validar que todos los tests pasan** (GREEN state)

### Siguientes Fases:
- Extender a implementaciones de MySQL (TypeORM) y MongoDB (Mongoose)
- Implementar la capa de servicios con inyección de dependencias
- Crear DTOs y validación con Zod
- Implementar controladores HTTP
- Configurar Factory pattern para selección de BD
- Crear documentación completa de la API
- Configurar benchmarking de performance entre bases de datos

### Estado del Proyecto:
- ✅ **Domain Layer**: Completamente implementado con TDD
- ⌛ **Repository Layer**: Interfaces definidas, implementaciones pendientes
- 🔄 **Service Layer**: Pendiente
- 🔄 **API Layer**: Pendiente
- 🔄 **Factory Pattern**: Pendiente
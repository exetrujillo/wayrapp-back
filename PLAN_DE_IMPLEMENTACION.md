# Plan General de Desarrollo TDD desde Cero

## Fase 1: Configuración Base del Proyecto

**Objetivo: Establecer fundamentos sólidos con las dependencias más actualizadas**

### 1. Inicialización del proyecto ✅

- Crear `wayrapp-back` con Node.js v22.19.0 (LTS) y TypeScript 5.9.2 ✅
- Package.json minimalista con solo las dependencias esenciales iniciales ✅
- Setup de ESLint, Prettier y Husky para calidad de código ✅

### 2. Configuración de Testing

- Jest v30.0, lanzada en junio de 2025, con TypeScript y ESM support.
- Supertest para test de integración HTTP
- Testcontainers para aislamiento completo de las bases de datos en tests.
- Configuración de Husky integrada con pipeline de testing (pre-commit para unit tests, pre-push para integration tests)
- Separación estricta de bases de datos de test como en el proyecto original de wayrapp

### 3. Configuración de Docker multibase de datos

**Bases a incluir desde el inicio:**

- PostgreSQL (Prisma)
- MySQL para validar compatibilidad SQL
- MongoDB para testing NoSQL

**Configuraciones Docker:**

- Docker Compose para desarrollo con las 3 BDs
- Docker Compose para testing con bases temporales en memoria
- Scripts automatizados para gestión de entornos
- Red Docker para comunicación entre servicios

### 4. Estructura de carpetas

- `src/core/`: Lógica de negocio pura (domain, interfaces, use-cases)
- `src/infrastructure/`: Implementaciones técnicas (database adapters, web, external services)
- `src/modules/`: Features organizados por dominio (auth, users, content, progress)
- `src/shared/`: Utilidades compartidas y tipos globales

### 5. Configuración de Variables de Entorno

- Templates de configuración para desarrollo, testing y producción
- Validación de variables con Zod schemas
- Configuración específica por BD: PostgreSQL, MySQL, MongoDB
- Separación estricta entre entornos

### 6. Configuración de CI/CD Base

- GitHub Actions con matrix testing
- Testing simultáneo contra PostgreSQL, MySQL y MongoDB
- Quality gates con coverage y linting
- Automated dependency updates

## Estructura de Carpetas Detallada

```
wayrapp-back/
├── src/
│   ├── core/                           # Lógica de negocio pura (Clean Architecture)
│   │   ├── domain/                     # Entidades de dominio
│   │   │   ├── entities/               # User, Course, Level, Section, Module, Lesson, Exercise
│   │   │   ├── value-objects/          # Email, Password, XP, Streak
│   │   │   └── events/                 # Domain events (UserRegistered, LessonCompleted)
│   │   ├── interfaces/                 # Contratos abstractos
│   │   │   ├── repositories/           # IUserRepository, ICourseRepository, IProgressRepository
│   │   │   ├── services/               # IAuthService, IContentService, IProgressService
│   │   │   ├── gateways/               # IEmailGateway, IFileGateway, ICacheGateway
│   │   │   └── use-cases/              # Interfaces de casos de uso
│   │   └── use-cases/                  # Lógica de aplicación
│   │       ├── auth/                   # LoginUseCase, RegisterUseCase, RefreshTokenUseCase
│   │       ├── users/                  # CreateUserUseCase, UpdateProfileUseCase
│   │       ├── content/                # CreateCourseUseCase, GetLessonsUseCase
│   │       └── progress/               # TrackProgressUseCase, UpdateXPUseCase
│   │
│   ├── infrastructure/                 # Implementaciones técnicas
│   │   ├── database/                   # Persistencia agnóstica
│   │   │   ├── adapters/               # Implementaciones específicas por BD
│   │   │   │   ├── prisma/             # PostgreSQL con Prisma
│   │   │   │   │   ├── repositories/   # PrismaUserRepository, PrismaCourseRepository
│   │   │   │   │   ├── migrations/     # Migraciones Prisma
│   │   │   │   │   └── schema.prisma   # Schema Prisma
│   │   │   │   ├── typeorm/            # MySQL con TypeORM
│   │   │   │   │   ├── repositories/   # TypeORMUserRepository, TypeORMCourseRepository
│   │   │   │   │   ├── entities/       # TypeORM entities
│   │   │   │   │   └── migrations/     # Migraciones TypeORM
│   │   │   │   └── mongoose/           # MongoDB con Mongoose
│   │   │   │       ├── repositories/   # MongoUserRepository, MongoCourseRepository
│   │   │   │       ├── schemas/        # Mongoose schemas
│   │   │   │       └── migrations/     # MongoDB migrations
│   │   │   ├── factories/              # Database Factory Pattern
│   │   │   │   ├── DatabaseFactory.ts  # Factory principal
│   │   │   │   ├── PrismaFactory.ts    # Factory Prisma
│   │   │   │   ├── TypeORMFactory.ts   # Factory TypeORM
│   │   │   │   └── MongooseFactory.ts  # Factory Mongoose
│   │   │   └── config/                 # Configuraciones BD
│   │   │       ├── database.config.ts  # Config principal
│   │   │       ├── prisma.config.ts    # Config Prisma
│   │   │       ├── typeorm.config.ts   # Config TypeORM
│   │   │       └── mongoose.config.ts  # Config Mongoose
│   │   ├── web/                        # HTTP/Express
│   │   │   ├── controllers/            # HTTP controllers
│   │   │   ├── middleware/             # Express middleware (auth, validation, security)
│   │   │   ├── routes/                 # Route definitions
│   │   │   ├── validators/             # Request validation con Zod
│   │   │   └── app.ts                  # Express app setup
│   │   ├── external/                   # Servicios externos
│   │   │   ├── email/                  # Email providers (SendGrid, etc.)
│   │   │   ├── storage/                # File storage (AWS S3, etc.)
│   │   │   └── cache/                  # Cache providers (Redis, etc.)
│   │   └── config/                     # Configuraciones generales
│   │       ├── environment.ts          # Variables de entorno con validación Zod
│   │       ├── container.ts            # DI Container (tsyringe/inversify)
│   │       └── logger.ts               # Logging config (Winston)
│   │
│   ├── modules/                        # Organización por features (como tu proyecto actual)
│   │   ├── auth/                       # Módulo de autenticación
│   │   │   ├── controllers/            # AuthController
│   │   │   ├── services/               # AuthService
│   │   │   ├── dto/                    # LoginDto, RegisterDto, RefreshTokenDto
│   │   │   ├── validators/             # Zod schemas para auth
│   │   │   └── __tests__/              # Tests del módulo auth
│   │   ├── users/                      # Módulo de usuarios
│   │   │   ├── controllers/            # UserController
│   │   │   ├── services/               # UserService
│   │   │   ├── dto/                    # UserDto, CreateUserDto, UpdateUserDto
│   │   │   ├── validators/             # User validation schemas
│   │   │   └── __tests__/              # Tests del módulo users
│   │   ├── content/                    # Módulo de contenido jerárquico
│   │   │   ├── controllers/            # ContentController, LessonController
│   │   │   ├── services/               # ContentService, LessonService
│   │   │   ├── dto/                    # CourseDto, LevelDto, SectionDto, ModuleDto, LessonDto
│   │   │   ├── validators/             # Content validation schemas
│   │   │   └── __tests__/              # Tests del módulo content
│   │   └── progress/                   # Módulo de progreso y gamificación
│   │       ├── controllers/            # ProgressController
│   │       ├── services/               # ProgressService
│   │       ├── dto/                    # ProgressDto, XPDto, StreakDto
│   │       ├── validators/             # Progress validation schemas
│   │       └── __tests__/              # Tests del módulo progress
│   │
│   ├── shared/                         # Utilidades compartidas
│   │   ├── types/                      # Tipos TypeScript globales
│   │   ├── utils/                      # Funciones utilitarias
│   │   ├── constants/                  # Constantes de la app
│   │   ├── errors/                     # Custom errors y error handling
│   │   └── __tests__/                  # Tests de utilidades compartidas
│   │
│   └── server.ts                       # Entry point del servidor
│
├── __tests__/                          # Tests globales y de integración
│   ├── integration/                    # Tests de integración por BD
│   │   ├── postgresql/                 # Tests con PostgreSQL
│   │   ├── mysql/                      # Tests con MySQL
│   │   └── mongodb/                    # Tests con MongoDB
│   ├── e2e/                            # Tests end-to-end
│   ├── fixtures/                       # Datos de prueba
│   ├── utils/                          # Utilidades de testing
│   └── setup.ts                        # Setup global de tests
│
├── docker/                             # Configuraciones Docker
│   ├── Dockerfile.dev                  # Dockerfile desarrollo
│   ├── Dockerfile.test                 # Dockerfile testing
│   ├── Dockerfile.prod                 # Dockerfile producción
│   └── scripts/                        # Scripts Docker
│       ├── setup-postgres.sh           # Setup PostgreSQL
│       ├── setup-mysql.sh              # Setup MySQL
│       └── setup-mongodb.sh            # Setup MongoDB
│
├── docs/                               # Documentación
│   ├── api/                            # Documentación API (OpenAPI/Swagger)
│   ├── architecture/                   # Diagramas arquitectura
│   └── deployment/                     # Guías deployment
│
├── scripts/                            # Scripts de utilidad
│   ├── setup-dev.sh                    # Setup desarrollo
│   ├── setup-test.sh                   # Setup testing
│   ├── migrate-all.sh                  # Migraciones todas las BDs
│   └── seed-data.sh                    # Seed data para desarrollo
│
├── .github/                            # GitHub Actions
│   └── workflows/                      # CI/CD workflows
│       ├── ci.yml                      # Continuous Integration
│       └── cd.yml                      # Continuous Deployment
│
├── .env.example                        # Template variables entorno
├── .env.test.example                   # Template variables test
├── docker-compose.yml                  # Docker desarrollo
├── docker-compose.test.yml             # Docker testing
├── docker-compose.prod.yml             # Docker producción
├── jest.config.js                      # Configuración Jest
├── jest.integration.config.js          # Config Jest integración
├── tsconfig.json                       # Configuración TypeScript
├── tsconfig.build.json                 # Config TypeScript para build
├── .eslintrc.js                        # Configuración ESLint
├── .prettierrc                         # Configuración Prettier
├── .husky/                             # Git hooks
│   ├── pre-commit                      # Lint + format + unit tests
│   └── pre-push                        # Integration tests
└── package.json                        # Dependencias y scripts
```

## Fase 2: Capa de Abstracción de Datos

**Objetivo: Implementar el patrón Repository agnóstico con soporte multi-BD**

### 7. Definir interfaces base

- Crear interfaces de Repository abstractas para User, Course, Progress
- Definir DTOs independientes del ORM (sin dependencias de Prisma/TypeORM/Mongoose)
- Establecer contratos de servicios con inyección de dependencias
- Definir interfaces para gateways externos (email, storage, cache)

### 8. Implementar Factory Pattern multi-BD

- Database Factory principal que soporte PostgreSQL, MySQL y MongoDB
- Repository Factory para instanciar repositories según configuración
- Configuration-driven database selection basada en variables de entorno
- Connection pooling agnóstico para cada tipo de BD

### 9. Primera implementación (PostgreSQL + Prisma)

- Adapter específico para Prisma
- Tests de contrato para validar implementación contra interfaces
- Migración del schema existente al nuevo patrón agnóstico

## Fase 3: Módulo de Usuarios con TDD Estricto

**Implementar el primer módulo completo validando el diseño agnóstico**

### 10. TDD para User Domain

- Tests para entidades User con value objects (Email, Password)
- Implementar User entity con validaciones de dominio
- Tests para User repository interface con los 3 tipos de BD
- Domain events para acciones de usuario (UserRegistered, ProfileUpdated)

### 11. TDD para User Repository multi-BD

- Tests de contrato para IUserRepository ejecutados contra PostgreSQL, MySQL y MongoDB
- Implementación Prisma, TypeORM y Mongoose del UserRepository
- Integration tests con test databases usando Testcontainers
- Validación de que todas las implementaciones cumplen el mismo contrato

### 12. TDD para User Service con DI

- Tests unitarios para lógica de negocio usando mocks
- Implementación con dependency injection (tsyringe/inversify)
- Tests de integración validando el flujo completo con diferentes BDs
- Manejo de errores consistente entre implementaciones

## Fase 4: Autenticación y Middleware

**Objetivo: Seguridad y middleware base**

### 13. Sistema de autenticación TDD agnóstico

- Tests para JWT handling independiente de la BD
- Implementación de auth middleware compatible con todas las BDs
- Role-based access control usando el patrón de tu proyecto actual
- Token blacklist service agnóstico

### 14. Middleware foundation

- Error handling middleware con logging estructurado
- Validation middleware con Zod schemas
- Security middleware (helmet, CORS, rate limiting)
- Health check endpoints para monitoreo de las 3 BDs

## Fase 5: Content Management con Jerarquía

**Objetivo: Implementar la estructura jerárquica agnóstica**

### 15. TDD para Content Domain multi-BD

- Tests para entidades Course, Level, Section, Module, Lesson, Exercise
- Validaciones de jerarquía y relaciones funcionando en SQL y NoSQL
- Business rules implementation agnóstica
- Domain events para gestión de contenido

### 16. Content Repository Layer agnóstico

- Implementación de content repositories para PostgreSQL, MySQL y MongoDB
- Tests de integración para operaciones CRUD en las 3 BDs
- Optimización de queries jerárquicas específicas por tipo de BD
- Manejo de relaciones many-to-many entre Lessons y Exercises

### 17. Content Services con cache agnóstico

- Lógica de negocio para gestión de contenido independiente de BD
- Cache management compatible con la implementación actual
- Validation y error handling consistente
- Packaged content API para offline support

## Fase 6: Validación del Diseño Agnóstico

**Objetivo: Probar completamente la arquitectura multi-BD**

### 18. Implementar MongoDB adapter completo

- Crear implementación completa para MongoDB usando Mongoose
- Validar que las interfaces funcionan correctamente con NoSQL
- Tests de migración de datos entre PostgreSQL, MySQL y MongoDB
- Optimizaciones específicas para documentos vs relacional

### 19. Database Factory completion y testing

- Configuration-driven database selection por módulo
- Environment-based database switching (dev/test/prod)
- Performance testing comparativo entre las 3 implementaciones
- Load testing para validar escalabilidad

## Fase 7: API Layer y Documentación

**Objetivo: Exposición HTTP agnóstica y documentación**

### 20. Express controllers con TDD multi-BD

- Tests de integration para endpoints funcionando con las 3 BDs
- Request/Response validation con Zod
- Error handling HTTP consistente
- API versioning preparado para futuras expansiones

### 21. API Documentation

- OpenAPI/Swagger setup como en el proyecto actual
- Interactive documentation con ejemplos para cada BD
- Postman collections con environments para cada BD
- Database setup documentation actualizada

## Fase 8: Performance y Production Ready

**Objetivo: Optimización y deployment multi DB**

### 22. Performance optimization agnóstica

- Database indexing optimizado para cada tipo de BD
- Query optimization específica (SQL vs NoSQL)
- Caching strategies usando el sistema actual
- Connection pooling optimizado por BD

### 23. Production setup multi-entorno

- Docker configuration para las 3 BDs en producción
- CI/CD pipeline con matrix testing (PostgreSQL, MySQL, MongoDB)
- Monitoring y health checks específicos por BD
- Deployment strategies para diferentes proveedores cloud

## Principios TDD a Seguir

1. **Red-Green-Refactor**: Cada test debe fallar primero en las 3 BDs
2. **Contract Testing**: Todas las implementaciones deben pasar los mismos tests
3. **Multi-BD Testing**: Cada feature debe probarse en PostgreSQL, MySQL y MongoDB
4. **Integration First**: Tests de integración antes que unitarios para validar agnóstico
5. **Performance Testing**: Comparar rendimiento entre implementaciones

## Herramientas Recomendadas (Actualizadas)

- **Runtime**: Node.js v22.19.0 (LTS)
- **TypeScript**: 5.9.2
- **Testing**: Jest v30.0 + Supertest + Testcontainers
- **Validation**: Zod
- **DI**: tsyringe
- **Database**: Prisma v6.16.0 + TypeORM 0.3.26 + Mongoose 8.x
- **HTTP**: Express 5.1 + Helmet + CORS

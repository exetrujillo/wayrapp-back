# Guía TDD: Desarrollo Dirigido por Pruebas - Paso a Paso

## ¿Qué es TDD y por qué usarlo?

**TDD (Test-Driven Development)** es una metodología donde escribes las pruebas ANTES que el código. Esto te ayuda a:

- Diseñar mejor tu código
- Asegurar que funciona correctamente
- Facilitar cambios futuros sin romper nada
- Documentar cómo debe comportarse tu código

## Ciclo TDD: Red → Green → Refactor

1. **🔴 RED**: Escribe una prueba que falle (porque aún no existe el código)
2. **🟢 GREEN**: Escribe el código mínimo para que la prueba pase
3. **🟡 REFACTOR**: Mejora el código sin cambiar su comportamiento

### Aplicación del Ciclo en esta Fase

En **Fase 1** estamos en el estado **🔴 RED** porque:

- Definimos las interfaces (contratos) de lo que queremos
- Escribimos tests que validan estos contratos
- Los tests fallan porque aún no existe la implementación

Esto nos prepara perfectamente para **Fase 2** donde implementaremos el código para pasar los tests (**🟢 GREEN**).

---

# Fase 1: Definir Interfaces y Entidades de Dominio

## ¿Qué vamos a hacer en esta fase?

En esta fase definimos **QUÉ** hace nuestro sistema, no **CÓMO** lo hace. Piénsalo como crear el "manual de instrucciones" antes de construir la máquina.

## Paso 1.1: Crear la Entidad de Dominio

### ¿Qué es una Entidad de Dominio?

Es la representación de un concepto importante en tu negocio (Usuario, Curso, Lección, Ejercicio, Progreso, etc.). Contiene las reglas de negocio y validaciones.

### Estructura General de una Entidad

**Archivo**: `src/core/domain/entities/YourEntity.ts`

```typescript
// Esta clase representa una ENTIDAD PRINCIPAL de tu sistema
export class YourEntity {
  constructor(
    public readonly id: string, // ID único de la entidad
    public readonly name: string, // Nombre o título principal
    public readonly description: string, // Descripción de la entidad
    public readonly status: EntityStatus, // Estado usando Value Object
    public readonly ownerId: string, // ID del propietario/creador
    public readonly isActive: boolean, // ¿Está activa/disponible?
    public readonly createdAt: Date, // Cuándo se creó
    public readonly updatedAt: Date // Cuándo se actualizó por última vez
  ) {
    // Validamos que los datos sean correctos al crear la entidad
    this.validateConstructorParams();
  }

  // ✨ REGLAS DE NEGOCIO ✨
  // Estas funciones encapsulan la lógica de qué puede hacer tu entidad

  canBeAccessedBy(userRole: string): boolean {
    // Define quién puede acceder a esta entidad
    return (
      this.isActive &&
      ['authorized_role_1', 'authorized_role_2'].includes(userRole)
    );
  }

  canBeModifiedBy(userId: string, userRole: string): boolean {
    // Define quién puede modificar esta entidad
    return this.ownerId === userId || userRole === 'admin';
  }

  isAvailableForOperation(): boolean {
    // Define cuándo la entidad está disponible para operaciones
    return this.isActive && this.status.isOperational();
  }

  // 🔧 MÉTODOS DE UTILIDAD 🔧
  // Facilitan el uso de la entidad en otras partes del código

  getDisplayName(): string {
    return this.name;
  }

  getStatusValue(): string {
    return this.status.value;
  }

  private validateConstructorParams(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Entity name cannot be empty');
    }
    if (!this.description || this.description.trim().length === 0) {
      throw new Error('Entity description cannot be empty');
    }
    // Más validaciones específicas de tu entidad...
  }
}
```

### ¿Por qué hacer esto?

- **Centraliza las reglas**: Toda la lógica de qué puede hacer tu entidad está en un lugar
- **Previene errores**: Las validaciones evitan datos incorrectos
- **Facilita testing**: Es fácil probar estas reglas
- **Documenta el negocio**: El código explica cómo funciona tu entidad

## Paso 1.2: Crear Value Objects

### ¿Qué son los Value Objects?

Son objetos que representan valores con validaciones específicas. No tienen identidad propia, solo importa su valor.

### Estructura General de un Value Object

**Archivo**: `src/core/domain/value-objects/EntityStatus.ts`

```typescript
// Este objeto representa el estado de cualquier entidad en tu sistema
export class EntityStatus {
  private static readonly VALID_STATUSES = [
    'active',
    'inactive',
    'pending',
    'archived',
  ] as const;

  constructor(public readonly value: string) {
    this.validate();
  }

  // 🎯 REGLAS DE VALIDACIÓN 🎯
  private validate(): void {
    if (!EntityStatus.VALID_STATUSES.includes(this.value as any)) {
      throw new Error(
        `Invalid status: ${this.value}. Must be one of: ${EntityStatus.VALID_STATUSES.join(', ')}`
      );
    }
  }

  // 🔍 MÉTODOS DE CONSULTA 🔍
  isActive(): boolean {
    return this.value === 'active';
  }

  isInactive(): boolean {
    return this.value === 'inactive';
  }

  isPending(): boolean {
    return this.value === 'pending';
  }

  isArchived(): boolean {
    return this.value === 'archived';
  }

  isOperational(): boolean {
    // Define qué estados permiten operaciones
    return this.isActive() || this.isPending();
  }

  // 📊 UTILIDADES 📊
  getDisplayName(): string {
    const displayNames = {
      active: 'Activo',
      inactive: 'Inactivo',
      pending: 'Pendiente',
      archived: 'Archivado',
    };
    return displayNames[this.value as keyof typeof displayNames];
  }

  getColorCode(): string {
    const colors = {
      active: '#4CAF50', // Verde
      inactive: '#9E9E9E', // Gris
      pending: '#FF9800', // Naranja
      archived: '#607D8B', // Azul gris
    };
    return colors[this.value as keyof typeof colors];
  }
}
```

### ¿Por qué usar Value Objects?

- **Validación automática**: No puedes crear estados inválidos
- **Encapsula comportamiento**: Los métodos `isActive()` son más legibles que comparar strings
- **Reutilizable**: Puedes usar `EntityStatus` en cualquier parte del código
- **Type Safety**: TypeScript te ayuda a detectar errores

## Paso 1.3: Definir la Interface del Repository

### ¿Qué es un Repository?

Es el "contrato" que define cómo guardar y recuperar datos, sin especificar si usas PostgreSQL, MySQL, archivos, etc.

### Estructura General de un Repository Interface

**Archivo**: `src/core/interfaces/repositories/IYourEntityRepository.ts`

```typescript
// 📋 CONTRATO para manejar tu entidad en la base de datos
// Cualquier implementación debe cumplir estas funciones

export interface IYourEntityRepository {
  // 🆕 CREAR - Guardar una nueva entidad
  create(entityData: CreateEntityData): Promise<YourEntity>;

  // 🔍 BUSCAR - Encontrar entidades
  findById(id: string): Promise<YourEntity | null>;
  findByOwnerId(ownerId: string): Promise<YourEntity[]>;
  findByStatus(status: string): Promise<YourEntity[]>;
  findActiveEntities(): Promise<YourEntity[]>;

  // ✏️ ACTUALIZAR - Modificar entidad existente
  update(id: string, updateData: UpdateEntityData): Promise<YourEntity | null>;

  // ❌ ELIMINAR - Borrar entidad
  delete(id: string): Promise<void>;

  // 📊 CONSULTAS ESPECIALES - Para reportes o estadísticas
  countEntitiesByOwner(ownerId: string): Promise<number>;
  findEntitiesCreatedAfter(date: Date): Promise<YourEntity[]>;
  findEntitiesWithStatus(statuses: string[]): Promise<YourEntity[]>;
}

// 📝 TIPOS DE DATOS para crear entidades
export interface CreateEntityData {
  name: string;
  description: string;
  status: string;
  ownerId: string;
  isActive?: boolean; // Opcional, por defecto true o false según tu lógica
}

// ✏️ TIPOS DE DATOS para actualizar entidades
export interface UpdateEntityData {
  name?: string; // Opcional
  description?: string; // Opcional
  status?: string; // Opcional
  isActive?: boolean; // Opcional
}
```

### ¿Por qué definir interfaces?

- **Flexibilidad**: Puedes cambiar de PostgreSQL a MySQL sin cambiar el código de negocio
- **Testing**: Puedes crear implementaciones falsas para pruebas
- **Claridad**: Define exactamente qué operaciones necesitas
- **Trabajo en equipo**: Diferentes personas pueden trabajar en la interfaz y la implementación

## Paso 1.4: Crear Tests de Contrato

### ¿Qué son los Tests de Contrato?

Los **Tests de Contrato** son pruebas que validan que cualquier implementación de tu interface cumple con el comportamiento esperado. Son como un "examen" que toda implementación debe pasar.

**En nuestro proyecto multi-BD:**

- **Un solo test** se ejecuta contra PostgreSQL y MySQL
- **Testcontainers** levanta contenedores efímeros automáticamente
- **Variable de entorno** determina qué BD usar
- **Misma implementación** debe pasar en ambas BDs

### Estructura General de Tests de Contrato

**Archivo**: `src/core/interfaces/repositories/__tests__/IYourEntityRepository.contract.test.ts`

```typescript
// 🧪 TESTS DE CONTRATO - Validan que cualquier implementación cumple la interface
// Estos tests se ejecutan contra TODAS las implementaciones (PostgreSQL, MySQL, etc.)

export function makeYourEntityRepositoryContractTest(
  description: string,
  setupRepository: () => {
    repository: IYourEntityRepository; // La implementación a probar
    cleanDatabase: () => Promise<void>; // Función para limpiar la BD entre tests
    verifyEntityInDatabase: (id: string) => Promise<boolean>; // Verificar que el dato existe en BD
  },
  teardownRepository: () => Promise<void> // Limpieza final
) {
  describe(description, () => {
    let repository: IYourEntityRepository;
    let cleanDatabase: () => Promise<void>;
    let verifyEntityInDatabase: (id: string) => Promise<boolean>;

    beforeAll(async () => {
      const setup = setupRepository();
      repository = setup.repository;
      cleanDatabase = setup.cleanDatabase;
      verifyEntityInDatabase = setup.verifyEntityInDatabase;
    });

    afterAll(async () => {
      await teardownRepository();
    });

    beforeEach(async () => {
      await cleanDatabase();
    });

    // 🧪 TEST: Crear entidad
    describe('create', () => {
      it('should create a new entity with valid data', async () => {
        // Arrange
        const entityData: CreateEntityData = {
          name: 'Test Entity',
          description: 'Test Description',
          status: 'active',
          ownerId: 'user-123',
          isActive: true,
        };

        // Act
        const createdEntity = await repository.create(entityData);

        // Assert
        expect(createdEntity).toBeDefined();
        expect(createdEntity.id).toBeDefined();
        expect(createdEntity.name).toBe(entityData.name);
        expect(createdEntity.description).toBe(entityData.description);
        expect(createdEntity.getStatusValue()).toBe(entityData.status);
        expect(createdEntity.ownerId).toBe(entityData.ownerId);
        expect(createdEntity.isActive).toBe(entityData.isActive);
        expect(createdEntity.createdAt).toBeInstanceOf(Date);
        expect(createdEntity.updatedAt).toBeInstanceOf(Date);

        // Verificar que realmente se guardó en la base de datos
        const existsInDb = await verifyEntityInDatabase(createdEntity.id);
        expect(existsInDb).toBe(true);
      });

      it('should throw error when creating entity with invalid data', async () => {
        // Arrange
        const invalidEntityData: CreateEntityData = {
          name: '', // Nombre vacío - debería fallar
          description: 'Test Description',
          status: 'active',
          ownerId: 'user-123',
        };

        // Act & Assert
        await expect(repository.create(invalidEntityData)).rejects.toThrow();
      });
    });

    // 🧪 TEST: Buscar por ID
    describe('findById', () => {
      it('should return entity when found', async () => {
        // Arrange
        const entityData: CreateEntityData = {
          name: 'Test Entity',
          description: 'Test Description',
          status: 'active',
          ownerId: 'user-123',
        };
        const createdEntity = await repository.create(entityData);

        // Act
        const foundEntity = await repository.findById(createdEntity.id);

        // Assert
        expect(foundEntity).toBeDefined();
        expect(foundEntity!.id).toBe(createdEntity.id);
        expect(foundEntity!.name).toBe(createdEntity.name);
      });

      it('should return null when entity not found', async () => {
        // Act
        const foundEntity = await repository.findById('non-existent-id');

        // Assert
        expect(foundEntity).toBeNull();
      });
    });

    // 🧪 TEST: Actualizar entidad
    describe('update', () => {
      it('should update entity with valid data', async () => {
        // Arrange
        const entityData: CreateEntityData = {
          name: 'Original Name',
          description: 'Original Description',
          status: 'active',
          ownerId: 'user-123',
        };
        const createdEntity = await repository.create(entityData);

        const updateData: UpdateEntityData = {
          name: 'Updated Name',
          description: 'Updated Description',
        };

        // Act
        const updatedEntity = await repository.update(
          createdEntity.id,
          updateData
        );

        // Assert
        expect(updatedEntity).toBeDefined();
        expect(updatedEntity!.name).toBe(updateData.name);
        expect(updatedEntity!.description).toBe(updateData.description);
        expect(updatedEntity!.updatedAt.getTime()).toBeGreaterThan(
          createdEntity.updatedAt.getTime()
        );
      });

      it('should return null when updating non-existent entity', async () => {
        // Arrange
        const updateData: UpdateEntityData = {
          name: 'Updated Name',
        };

        // Act
        const updatedEntity = await repository.update(
          'non-existent-id',
          updateData
        );

        // Assert
        expect(updatedEntity).toBeNull();
      });
    });

    // 🧪 TEST: Eliminar entidad
    describe('delete', () => {
      it('should delete existing entity', async () => {
        // Arrange
        const entityData: CreateEntityData = {
          name: 'Entity to Delete',
          description: 'Will be deleted',
          status: 'active',
          ownerId: 'user-123',
        };
        const createdEntity = await repository.create(entityData);

        // Act
        await repository.delete(createdEntity.id);

        // Assert
        const foundEntity = await repository.findById(createdEntity.id);
        expect(foundEntity).toBeNull();

        const existsInDb = await verifyEntityInDatabase(createdEntity.id);
        expect(existsInDb).toBe(false);
      });

      it('should not throw error when deleting non-existent entity', async () => {
        // Act & Assert
        await expect(
          repository.delete('non-existent-id')
        ).resolves.not.toThrow();
      });
    });

    // 🧪 TEST: Consultas especiales
    describe('findByOwnerId', () => {
      it('should return entities belonging to owner', async () => {
        // Arrange
        const ownerId = 'user-123';
        const entity1Data: CreateEntityData = {
          name: 'Entity 1',
          description: 'Description 1',
          status: 'active',
          ownerId: ownerId,
        };
        const entity2Data: CreateEntityData = {
          name: 'Entity 2',
          description: 'Description 2',
          status: 'inactive',
          ownerId: ownerId,
        };
        const entity3Data: CreateEntityData = {
          name: 'Entity 3',
          description: 'Description 3',
          status: 'active',
          ownerId: 'different-user',
        };

        await repository.create(entity1Data);
        await repository.create(entity2Data);
        await repository.create(entity3Data);

        // Act
        const ownerEntities = await repository.findByOwnerId(ownerId);

        // Assert
        expect(ownerEntities).toHaveLength(2);
        expect(
          ownerEntities.every((entity) => entity.ownerId === ownerId)
        ).toBe(true);
      });
    });
  });
}
```

### Cómo usar los Tests de Contrato

Una vez que tienes la función `makeYourEntityRepositoryContractTest`, creas **un solo archivo** que funciona para ambas bases de datos:

```typescript
// __tests__/integration/YourEntityRepository.test.ts
import { makeYourEntityRepositoryContractTest } from '@/core/interfaces/repositories/__tests__/IYourEntityRepository.contract.test';
import { YourEntityRepository } from '@/infrastructure/database/adapters/prisma/repositories/YourEntityRepository';
import { TestDatabaseUtils } from '../setup';

makeYourEntityRepositoryContractTest(
  'YourEntityRepository Integration Tests - Contract',
  () => ({
    repository: new YourEntityRepository(
      TestDatabaseUtils.createTestPrismaClient()
    ),
    cleanDatabase: () =>
      TestDatabaseUtils.cleanDatabase(
        TestDatabaseUtils.createTestPrismaClient()
      ),
    verifyEntityInDatabase: async (id: string) => {
      const prisma = TestDatabaseUtils.createTestPrismaClient();
      const entity = await prisma.yourEntity.findUnique({ where: { id } });
      return entity !== null;
    },
  }),
  async () => {
    const prisma = TestDatabaseUtils.createTestPrismaClient();
    await TestDatabaseUtils.disconnectPrismaClient(prisma);
  }
);
```

### Testing Multi-Base de Datos en Nuestro Proyecto

**Estrategia: Un Test, Múltiples Bases de Datos**

Usamos **Testcontainers** con configuración dinámica:

- **Un solo archivo de test** que funciona para ambas BDs
- **Variable de entorno** (`DATABASE_PROVIDER`) determina qué BD usar
- **Testcontainers** levanta contenedores efímeros automáticamente
- **Prisma** maneja ambas BDs con la misma implementación

**Comandos de testing:**

```bash
npm run test:integration:postgres  # Mismo test, contenedor PostgreSQL
npm run test:integration:mysql     # Mismo test, contenedor MySQL
npm run test:all-dbs              # Ejecuta ambos secuencialmente
```

**¿Por qué funciona?**

- **Tests de Contrato**: Validan comportamiento, no implementación específica
- **Setup dinámico**: `__tests__/setup.ts` configura la BD según `DATABASE_PROVIDER`
- **Una implementación**: Prisma + tests de contrato = garantía de consistencia

## Paso 1.5: Planificar la Estructura de Archivos

### Estructura Recomendada

```
src/
├── core/                          # 🧠 LÓGICA DE NEGOCIO
│   ├── domain/                    # Entidades y reglas de negocio
│   │   ├── entities/              # Las "cosas" principales del sistema
│   │   │   ├── YourEntity.ts      # ← Tu entidad principal
│   │   │   ├── User.ts
│   │   │   ├── AnotherEntity.ts
│   │   │   └── ThirdEntity.ts
│   │   └── value-objects/         # Objetos con validaciones específicas
│   │       ├── EntityStatus.ts    # ← Value Object genérico de estado
│   │       ├── Email.ts
│   │       └── CustomValueObject.ts
│   └── interfaces/                # 📋 CONTRATOS (qué debe hacer, no cómo)
│       └── repositories/          # Contratos para acceso a datos
│           ├── IYourEntityRepository.ts # ← Interface de tu entidad
│           ├── IUserRepository.ts
│           ├── IAnotherEntityRepository.ts
│           └── __tests__/         # Tests de contrato
│               ├── IYourEntityRepository.contract.test.ts # ← Tests de contrato
│               └── IUserRepository.contract.test.ts
├── infrastructure/                # 🔧 IMPLEMENTACIONES TÉCNICAS
│   └── database/                  # Implementaciones reales de repositories
│       └── adapters/
│           └── prisma/
│               └── repositories/
│                   ├── YourEntityRepository.ts # ← Implementación real (viene después)
│                   └── UserRepository.ts
├── modules/                       # 🌐 API y SERVICIOS
│   └── your-entities/             # Todo lo relacionado con tu entidad
│       ├── controllers/           # Controladores HTTP (REST API)
│       ├── services/              # Lógica de aplicación
│       └── dto/                   # Validación de datos de entrada
└── __tests__/                     # 🧪 TESTS DE INTEGRACIÓN
    ├── setup.ts                   # Configuración dinámica de Testcontainers
    └── integration/               # Tests con bases de datos reales
        └── YourEntityRepository.test.ts # Un solo test para ambas BDs
```

## Ejemplos de Adaptación para Diferentes Entidades

### Para un Sistema de Cursos:

- **Entidad**: `Course` con propiedades como `sourceLanguage`, `targetLanguage`, `name`
- **Value Objects**: `SourceLanguage`, `TargetLanguage`
- **Repository**: `ICourseRepository` con métodos como `findBySourceLanguage()`, `findByTargetLanguage()`

### Para un Sistema de Ejercicios:

- **Entidad**: `Exercise` con propiedades como `id`
- **Value Objects**: `ExerciseType`
- **Repository**: `IExerciseRepository` con métodos como `findByType()`

### Para un Sistema de Progreso:

- **Entidad**: `UserProgress` con propiedades como `userId`, `experiencePoints`, `livesCurrent`
- **Repository**: `IProgressRepository` con métodos como `findByUser()`

## ¿Qué sigue después de esta fase?

Una vez que tengas:

- ✅ Entidad definida (`YourEntity.ts`)
- ✅ Value Objects creados (`EntityStatus.ts`, etc.)
- ✅ Interface del Repository (`IYourEntityRepository.ts`)

Pasas a la **Fase 2**: Escribir las pruebas ANTES de implementar el código real.

---

## 🎯 Checklist para esta fase:

Para cualquier nueva funcionalidad (cursos, lecciones, progreso, ejercicios, etc.):

- [ ] ✏️ Crear la entidad en `src/core/domain/entities/YourEntity.ts`
- [ ] 🔧 Crear los value objects necesarios en `src/core/domain/value-objects/`
- [ ] 📋 Definir la interface del repository en `src/core/interfaces/repositories/IYourEntityRepository.ts`
- [ ] 🧪 Crear los tests de contrato en `src/core/interfaces/repositories/__tests__/IYourEntityRepository.contract.test.ts`
- [ ] � Planificaar la estructura de carpetas para el módulo
- [ ] 📝 Documentar las reglas de negocio en código

**Tiempo estimado**: 3-5 horas por entidad (dependiendo de la complejidad)

---

Una vez completada esta fase, tienes todo listo para **Fase 2: Escribir las pruebas ANTES de implementar el código real** y comenzar el verdadero ciclo TDD Red-Green-Refactor.

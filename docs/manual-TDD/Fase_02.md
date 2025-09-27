# Guía TDD: Fase 2 - Implementación y Validación Multi-Base de Datos

## ¿Qué vamos a hacer en esta fase?

En esta fase implementamos el **CÓMO** funciona nuestro sistema. Pasamos del estado **🔴 RED** (tests fallando) al estado **🟢 GREEN** (tests pasando) implementando el código real que cumple con los contratos definidos en Fase 1.

**Característica especial de nuestro proyecto:** Como soportamos múltiples bases de datos (PostgreSQL y MySQL), validamos que la misma implementación funcione en ambas durante esta fase.

## Ciclo TDD en esta Fase: 🔴 RED → 🟢 GREEN

1. **🔴 RED**: Ya tienes tests de contrato que fallan (de Fase 1)
2. **🟢 GREEN**: Implementas el código mínimo para que pasen
3. **✅ VALIDATE**: Verificas que funciona en ambas bases de datos
4. **🟡 REFACTOR**: Mejoras el código manteniendo los tests verdes

---

# Paso 2.1: Implementar el Repository

## ¿Qué es implementar el Repository?

Es crear la clase real que cumple con la interface definida en Fase 1. Esta clase se conecta a la base de datos y realiza las operaciones CRUD (Create, Read, Update, Delete).

### Estructura General de un Repository

**Archivo**: `src/infrastructure/database/adapters/prisma/repositories/YourEntityRepository.ts`

```typescript
// 🔧 IMPLEMENTACIÓN REAL del repository usando Prisma
// Esta clase debe cumplir con la interface IYourEntityRepository

import {
  PrismaClient, // Para interactuar con la base de datos
  Prisma, // Sobre todo para errores específicos de Prisma
  // Aquí también puedes importar para mapear tipos si es necesario, como "User as PrismaUser", "Role as PrismaRole" , etc.
} from '@/infrastructure/node_modules/.prisma/client'; // IMPORTANTE! Para este proyecto esta es la forma de importar el PrismaClient en los Repositiories
import { IYourEntityRepository, CreateEntityData, UpdateEntityData } from '@/core/interfaces/repositories/IYourEntityRepository';
import { YourEntity } from '@/core/domain/entities/YourEntity';
import { EntityStatus } from '@/core/domain/value-objects/EntityStatus';

export class YourEntityRepository implements IYourEntityRepository {
  constructor(private prisma: PrismaClient) {}

  // 🆕 CREAR - Implementación real
  async create(entityData: CreateEntityData): Promise<YourEntity> {
    // Validar los datos usando los Value Objects
    const status = new EntityStatus(entityData.status);
    
    // Crear en la base de datos usando Prisma
    const createdEntity = await this.prisma.yourEntity.create({
      data: {
        id: entityData.id || this.generateId(), // Generar ID si no se proporciona
        name: entityData.name,
        description: entityData.description,
        status: status.value,
        ownerId: entityData.ownerId,
        isActive: entityData.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Convertir el resultado de Prisma a nuestra entidad de dominio
    return this.toDomainEntity(createdEntity);
  }

  // 🔍 BUSCAR POR ID - Implementación real
  async findById(id: string): Promise<YourEntity | null> {
    const entity = await this.prisma.yourEntity.findUnique({
      where: { id },
    });

    return entity ? this.toDomainEntity(entity) : null;
  }

  // 🔍 BUSCAR POR OWNER - Implementación real
  async findByOwnerId(ownerId: string): Promise<YourEntity[]> {
    const entities = await this.prisma.yourEntity.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });

    return entities.map(entity => this.toDomainEntity(entity));
  }

  // 🔍 BUSCAR POR STATUS - Implementación real
  async findByStatus(status: string): Promise<YourEntity[]> {
    // Validar que el status sea válido
    new EntityStatus(status); // Esto lanzará error si es inválido

    const entities = await this.prisma.yourEntity.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });

    return entities.map(entity => this.toDomainEntity(entity));
  }

  // 🔍 BUSCAR ACTIVAS - Implementación real
  async findActiveEntities(): Promise<YourEntity[]> {
    const entities = await this.prisma.yourEntity.findMany({
      where: { 
        isActive: true,
        status: 'active' // Solo las que están activas Y tienen status activo
      },
      orderBy: { createdAt: 'desc' },
    });

    return entities.map(entity => this.toDomainEntity(entity));
  }

  // ✏️ ACTUALIZAR - Implementación real
  async update(id: string, updateData: UpdateEntityData): Promise<YourEntity | null> {
    // Verificar que la entidad existe
    const existingEntity = await this.prisma.yourEntity.findUnique({
      where: { id },
    });

    if (!existingEntity) {
      return null;
    }

    // Validar los nuevos datos si se proporcionan
    if (updateData.status) {
      new EntityStatus(updateData.status); // Validar status
    }

    // Actualizar en la base de datos
    const updatedEntity = await this.prisma.yourEntity.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    return this.toDomainEntity(updatedEntity);
  }

  // ❌ ELIMINAR - Implementación real
  async delete(id: string): Promise<void> {
    // Prisma no lanza error si el ID no existe, lo cual es perfecto
    // porque nuestro contrato especifica que no debe fallar
    await this.prisma.yourEntity.delete({
      where: { id },
    }).catch(() => {
      // Ignorar errores de "registro no encontrado"
      // Esto hace que el método sea idempotente
    });
  }

  // 📊 CONSULTAS ESPECIALES - Implementaciones reales
  async countEntitiesByOwner(ownerId: string): Promise<number> {
    return await this.prisma.yourEntity.count({
      where: { ownerId },
    });
  }

  async findEntitiesCreatedAfter(date: Date): Promise<YourEntity[]> {
    const entities = await this.prisma.yourEntity.findMany({
      where: {
        createdAt: {
          gte: date,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return entities.map(entity => this.toDomainEntity(entity));
  }

  async findEntitiesWithStatus(statuses: string[]): Promise<YourEntity[]> {
    // Validar todos los statuses
    statuses.forEach(status => new EntityStatus(status));

    const entities = await this.prisma.yourEntity.findMany({
      where: {
        status: {
          in: statuses,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return entities.map(entity => this.toDomainEntity(entity));
  }

  // 🔄 MÉTODOS AUXILIARES PRIVADOS

  /**
   * Convierte un registro de Prisma a nuestra entidad de dominio
   */
  private toDomainEntity(prismaEntity: any): YourEntity {
    return new YourEntity(
      prismaEntity.id,
      prismaEntity.name,
      prismaEntity.description,
      new EntityStatus(prismaEntity.status),
      prismaEntity.ownerId,
      prismaEntity.isActive,
      prismaEntity.createdAt,
      prismaEntity.updatedAt
    );
  }

  /**
   * Genera un ID único para nuevas entidades
   */
  private generateId(): string {
    // Puedes usar uuid, nanoid, o cualquier generador de IDs
    return require('crypto').randomUUID();
  }
}
```

### ¿Por qué esta estructura?

- **Implementa la interface**: Cumple exactamente con el contrato definido
- **Usa Value Objects**: Valida datos usando las clases de dominio
- **Maneja errores**: Gestiona casos edge como registros no encontrados
- **Convierte datos**: Transforma entre formato de BD y entidades de dominio
- **Es agnóstica de BD**: Prisma maneja PostgreSQL y MySQL transparentemente

## Paso 2.2: Ejecutar Tests de Contrato

### ¿Cómo ejecutar los tests?

Una vez implementado el repository, ejecutas los tests de contrato para verificar que funciona:

```bash
# Ejecutar tests contra PostgreSQL
npm run test:integration:postgres

# Ejecutar tests contra MySQL
npm run test:integration:mysql

# Ejecutar tests contra ambas bases de datos
npm run test:all-dbs
```

### ¿Qué esperar en la primera ejecución?

**🔴 Probablemente algunos tests fallarán** en la primera ejecución. Esto es normal y parte del proceso TDD:

```bash
FAIL __tests__/integration/YourEntityRepository.test.ts
  ✓ should create a new entity with valid data
  ✗ should throw error when creating entity with invalid data
  ✓ should return entity when found
  ✗ should return null when entity not found
```

### Proceso iterativo: Arreglar tests uno por uno

1. **Ejecutar tests** y ver cuál falla
2. **Leer el mensaje de error** cuidadosamente
3. **Arreglar el código** para que ese test pase
4. **Ejecutar tests nuevamente**
5. **Repetir** hasta que todos pasen

**Ejemplo de iteración:**

```typescript
// ❌ Test falla: "should throw error when creating entity with invalid data"
// Error: Expected function to throw, but it didn't

// 🔧 Arreglo en el repository:
async create(entityData: CreateEntityData): Promise<YourEntity> {
  // Agregar validación que faltaba
  if (!entityData.name || entityData.name.trim().length === 0) {
    throw new Error('Entity name cannot be empty');
  }
  
  const status = new EntityStatus(entityData.status); // Esto ya valida
  // ... resto del código
}
```

## Paso 2.3: Validación Multi-Base de Datos

### ¿Por qué validar en ambas bases de datos?

Aunque Prisma es agnóstico de base de datos, pueden existir diferencias sutiles:
- **Tipos de datos**: Algunos tipos se manejan diferente
- **Constraints**: Validaciones a nivel de BD
- **Performance**: Consultas pueden comportarse diferente
- **Transacciones**: Manejo de concurrencia

### Estrategia de validación

**1. Tests pasan en PostgreSQL:**
```bash
npm run test:integration:postgres
# ✅ All tests passed
```

**2. Tests pasan en MySQL:**
```bash
npm run test:integration:mysql
# ✅ All tests passed
```

**3. Tests pasan en ambas:**
```bash
npm run test:all-dbs
# ✅ PostgreSQL: All tests passed
# ✅ MySQL: All tests passed
```

### ¿Qué hacer si fallan en una BD pero no en otra?

**Ejemplo común:**
```bash
# PostgreSQL: ✅ All tests passed
# MySQL: ❌ Error: Data too long for column 'description'
```

**Solución:**
1. **Identificar la diferencia** entre las BDs
2. **Ajustar el código** para ser compatible con ambas
3. **Actualizar validaciones** si es necesario

```typescript
// Ejemplo de ajuste para compatibilidad
private validateDescription(description: string): void {
  if (description.length > 1000) { // MySQL tiene límite más estricto
    throw new Error('Description cannot exceed 1000 characters');
  }
}
```

## Paso 2.4: Refactoring con Tests Verdes

### ¿Cuándo refactorizar?

**Solo cuando todos los tests están en verde** ✅

Una vez que tu implementación pasa todos los tests en ambas bases de datos, puedes mejorar el código sin miedo a romper funcionalidad.

### Tipos de refactoring comunes

**1. Extraer métodos comunes:**
```typescript
// Antes: Código duplicado
async findByStatus(status: string): Promise<YourEntity[]> {
  new EntityStatus(status);
  const entities = await this.prisma.yourEntity.findMany({
    where: { status },
    orderBy: { createdAt: 'desc' },
  });
  return entities.map(entity => this.toDomainEntity(entity));
}

// Después: Método extraído
async findByStatus(status: string): Promise<YourEntity[]> {
  this.validateStatus(status);
  return this.findEntitiesWithCondition({ status });
}

private async findEntitiesWithCondition(where: any): Promise<YourEntity[]> {
  const entities = await this.prisma.yourEntity.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  return entities.map(entity => this.toDomainEntity(entity));
}
```

**2. Mejorar manejo de errores:**
```typescript
// Antes: Error genérico
catch (error) {
  throw error;
}

// Después: Errores específicos
catch (error) {
  if (error.code === 'P2002') { // Prisma unique constraint
    throw new Error('Entity with this name already exists');
  }
  throw new Error(`Database error: ${error.message}`);
}
```

**3. Optimizar consultas:**
```typescript
// Antes: Múltiples consultas
const entity = await this.findById(id);
const relatedEntities = await this.findRelated(id);

// Después: Una sola consulta con include
const entity = await this.prisma.yourEntity.findUnique({
  where: { id },
  include: { relatedEntities: true },
});
```

## Paso 2.5: Verificar Implementación Completa

### Checklist de validación

- [ ] Todos los métodos de la interface están implementados
- [ ] Tests de contrato pasan en PostgreSQL
- [ ] Tests de contrato pasan en MySQL
- [ ] Manejo de errores es consistente
- [ ] Validaciones usan Value Objects
- [ ] Código está refactorizado y limpio
- [ ] No hay duplicación de lógica

### Comandos de verificación final

```bash
# Verificar que todo funciona
npm run test:all-dbs

# Verificar linting
npm run lint

# Formatear con prettier
npm run format
```

---

## ¿Qué sigue después de esta fase?

Una vez que tengas:
- ✅ Repository implementado y funcionando
- ✅ Tests pasando en ambas bases de datos
- ✅ Código refactorizado y limpio

Pasas a la **Fase 3: Capa de Servicios** donde implementarás los casos de uso y la lógica de aplicación.

---

## 🎯 Checklist para esta fase:

- [ ] 🔧 Implementar YourEntityRepository en `src/infrastructure/database/adapters/prisma/repositories/YourEntityRepository.ts`
- [ ] 🧪 Ejecutar tests de contrato y arreglar errores iterativamente
- [ ] ✅ Validar que tests pasan en PostgreSQL
- [ ] ✅ Validar que tests pasan en MySQL
- [ ] 🔄 Refactorizar código manteniendo tests verdes
- [ ] 📋 Verificar que todos los métodos de la interface están implementados
- [ ] 🧹 Limpiar código y eliminar duplicaciones

**Tiempo estimado**: 4-8 horas por repository (dependiendo de la complejidad y cantidad de iteraciones necesarias)

**Resultado esperado**: Repository completamente funcional que pasa todos los tests de contrato en ambas bases de datos, listo para ser usado por la capa de servicios.
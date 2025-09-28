# WayrApp Backend

Backend para la aplicación de aprendizaje de idiomas WayrApp. Diseñado con una arquitectura agnóstica a la base de datos y completamente containerizado con Docker para un desarrollo rápido y consistente.

## Stack Tecnológico Principal

- **Runtime:** Node.js v22.19.0
- **Lenguaje:** TypeScript v5.9.2
- **Framework:** Express.js v5.1.0
- **ORM:** Prisma v6.16.2
- **Containerización:** Docker & Docker Compose
- **Bases de Datos:** PostgreSQL 17, MySQL 8.4 (agnóstico)
- **Testing:** Jest v29.7.0, Testcontainers v11.5.1, Supertest v7.1.4
- **Calidad de Código:** ESLint, Prettier, Husky, lint-staged

---

## 🚀 Comencemos!

Sigue estos pasos para levantar el entorno de desarrollo completo.

### 1. Clonar el Repositorio

```bash
git clone https://github.com/exetrujillo/wayrApp-back.git
cd wayrapp-back
```

### 2. Configurar Variables de Entorno

Crea tu archivo de entorno local a partir de la plantilla.

```bash
cp .env.example .env
```

### 3. Instalar Dependencias Locales

Este paso es crucial para que tu editor de código (VSCode, etc.) reconozca los módulos y te proporcione autocompletado y detección de errores. También para que no te llene de falsos errores por falta de dependencias.

```bash
npm install
```

### 4. Levantar el Entorno Docker

Este comando construirá las imágenes y levantará todos los servicios (la app y las 2 bases de datos) en segundo plano.

```bash
npm run docker:up
```

### 5. Verificar

Para confirmar que todo está funcionando:

1.  Revisa que todos los contenedores estén corriendo: `docker ps`
2.  Abre tu navegador y ve a **`http://localhost:3000`** (O al puerto que hayas puesto en tus variables de entorno!). Deberías ver un mensaje JSON de bienvenida.

---

## 🛠️ Flujo de Trabajo de Desarrollo

Utiliza estos scripts de `npm` para gestionar el entorno.

- **Ver los logs de la aplicación en tiempo real:**

  ```bash
  npm run docker:logs
  ```

- **Abrir una shell dentro del contenedor de la app:**
  (Úsalo para instalar dependencias o ejecutar comandos puntuales).

  ```bash
  npm run docker:shell
  ```

- **Detener y apagar todo el entorno:**
  ```bash
  npm run docker:down
  ```

---

## ✅ Calidad de Código y Contribuciones

Este proyecto utiliza ESLint y Prettier para mantener un código limpio y consistente.

- **Para formatear todo el código:**

  ```bash
  npm run format
  ```

- **Para analizar el código en busca de errores:**
  ```bash
  npm run lint
  ```

**¡Automatización!** Gracias a **Husky** y **lint-staged**, estos comandos se ejecutarán automáticamente en los archivos modificados antes de cada `commit`. Si tu código tiene errores de linting, el commit será bloqueado hasta que los soluciones.

Para más detalles sobre cómo contribuir, por favor revisa el archivo `CONTRIBUTING.md`.

---

## 🧪 Testing

Este proyecto implementa una estrategia de testing robusta con **TDD (Test-Driven Development)** y soporte multi-base de datos.

### Stack de Testing

- **Jest v29.7.0**: Framework principal de testing
- **Testcontainers v11.5.1**: Bases de datos efímeras para tests de integración
- **Supertest v7.1.4**: Testing de APIs HTTP
- **Tests de Contrato**: Garantizan consistencia entre implementaciones

### Comandos de Testing

```bash
# Tests unitarios (rápidos)
npm run test:unit

# Tests de integración con PostgreSQL
npm run test:integration:postgres

# Tests de integración con MySQL
npm run test:integration:mysql

# Ejecutar todos los tests de integración
npm run test:all-dbs

# Ejecutar todos los tests
npm test
```

### Arquitectura de Testing

- **`src/**/\*.test.ts`\*\* (Tests Unitarios):
  - Prueban unidades de código aisladas (funciones, clases)
  - No tocan bases de datos ni servicios externos
  - Usan mocks para dependencias externas
  - Ultra rápidos (milisegundos por test)
  - Ejemplo: Tests de value objects, entidades de dominio

- **`__tests__/integration/`** (Tests de Integración):
  - Prueban la interacción con bases de datos reales usando Testcontainers
  - Verifican que los repositorios funcionan correctamente
  - Usan **tests de contrato** para garantizar consistencia entre PostgreSQL y MySQL
  - Más lentos pero proporcionan alta confianza
  - Ejemplo: `UserRepository` funcionando contra ambas bases de datos

- **Tests de Contrato**:
  - Definen el comportamiento esperado que todas las implementaciones deben cumplir
  - Una sola implementación (Prisma) validada contra múltiples bases de datos
  - Garantizan que el cambio de BD no afecte la funcionalidad

### Hooks de Git

Los tests se ejecutan automáticamente:

- **pre-commit**: Tests unitarios en archivos modificados
- **pre-push**: Suite completa de tests de integración (PostgreSQL + MySQL)

### Estado Actual

✅ **Domain Layer**: User entity con value objects completamente testeado  
✅ **Repository Layer**: UserRepository con tests de integración en PostgreSQL y MySQL  
🔄 **Service Layer**: Próximo en implementar con TDD  
🔄 **API Layer**: Pendiente

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

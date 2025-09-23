# WayrApp Backend

Backend para la aplicación de aprendizaje de idiomas WayrApp. Diseñado con una arquitectura agnóstica a la base de datos y completamente containerizado con Docker para un desarrollo rápido y consistente.

## Stack Tecnológico Principal

- **Runtime:** Node.js v22.19.0
- **Lenguaje:** TypeScript v5.9.2
- **Framework:** Express.js v5.1.0
- **Containerización:** Docker & Docker Compose
- **Bases de Datos (Desarrollo):** PostgreSQL 17, MySQL 8.4, MongoDB 8.0
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

Este comando construirá las imágenes y levantará todos los servicios (la app y las 3 bases de datos) en segundo plano.

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

Este proyecto utiliza **Jest** para pruebas unitarias y de integración.
Además, se usa **Testcontainers** para levantar bases de datos efímeras durante las pruebas de integración, asegurando un entorno limpio y aislado.
Y **Supertest** para simular peticiones HTTP a la API.

Tenemos distintos lugares para los tests:

- `src/modules/.../__tests__/` y `src/shared/__tests__/` (Tests Unitarios y de Módulo):
  - Probar una única pieza de código (una función, una clase) de forma totalmente aislada.
  - No tocan la base de datos, no hacen peticiones de red.
  - Cualquier dependencia externa (como un repositorio de base de datos) se reemplaza con un "mock" (un objeto falso que simula el comportamiento).
  - Son ultra rápidos (milisegundos por test).
  - Ejemplo: Un test para una función en `src/shared/utils/` que formatea una fecha. O un test para un `UserService` donde el `UserRepository` es un mock.
- `__tests__/integration/` (Tests de Integración):
  - Probar cómo varias unidades de código trabajan juntas. En nuestro caso, el foco principal es probar la interacción con la base de datos real.
  - Sí tocan la base de datos (a través de Testcontainers).
  - Verifican que los adaptadores de base de datos (ej: PrismaUserRepository) funcionan correctamente contra una base de datos real.
  - Son más lentos que los tests unitarios.
  - Ejemplo: El test que ya tenemos (app.test.ts) es un test de integración ligero. Un ejemplo más profundo sería un test para PrismaUserRepository que crea un usuario y luego lo lee para verificar que se guardó correctamente. Las subcarpetas postgresql/, mysql/ son para organizar estos tests.
- `__tests__/e2e/` (Tests End-to-End):
  - Probar el flujo completo de la aplicación desde la perspectiva del usuario.
  - Simulan una petición HTTP externa (como la que haría un frontend).
  - Pasan por el controlador, el servicio, el repositorio, tocan la base de datos real y devuelven una respuesta HTTP.
  - Son los más lentos y los más frágiles, pero los que dan más confianza.
  - Ejemplo: Un test que hace un POST /api/v1/register con datos de usuario, y luego un POST /api/v1/login para verificar que el usuario puede autenticarse.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

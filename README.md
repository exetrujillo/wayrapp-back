# WayrApp Backend

Backend para la aplicación de aprendizaje de idiomas WayrApp. Diseñado con una arquitectura agnóstica a la base de datos y completamente containerizado con Docker para un desarrollo rápido y consistente.

## Stack Tecnológico Principal

*   **Runtime:** Node.js v22.19.0
*   **Lenguaje:** TypeScript v5.9.2
*   **Framework:** Express.js v5.1.0
*   **Containerización:** Docker & Docker Compose
*   **Bases de Datos (Desarrollo):** PostgreSQL 17, MySQL 8.4, MongoDB 8.0
*   **Calidad de Código:** ESLint, Prettier, Husky, lint-staged

---

## 🚀 Puesta en Marcha

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

**Importante:** El archivo `.env` contiene información sensible y está ignorado por Git. **Nunca lo subas al repositorio.**

### 3. Instalar Dependencias Locales

Este paso es crucial para que tu editor de código (VSCode, etc.) reconozca los módulos y te proporcione autocompletado y detección de errores.

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

*   **Ver los logs de la aplicación en tiempo real:**
    ```bash
    npm run docker:logs
    ```

*   **Abrir una shell dentro del contenedor de la app:**
    (Úsalo para instalar dependencias o ejecutar comandos puntuales).
    ```bash
    npm run docker:shell
    ```

*   **Detener y apagar todo el entorno:**
    ```bash
    npm run docker:down
    ```

---

## ✅ Calidad de Código y Contribuciones

Este proyecto utiliza ESLint y Prettier para mantener un código limpio y consistente.

*   **Para formatear todo el código:**
    ```bash
    npm run format
    ```

*   **Para analizar el código en busca de errores:**
    ```bash
    npm run lint
    ```

**¡Automatización!** Gracias a **Husky** y **lint-staged**, estos comandos se ejecutarán automáticamente en los archivos modificados antes de cada `commit`. Si tu código tiene errores de linting, el commit será bloqueado hasta que los soluciones.

Para más detalles sobre cómo contribuir, por favor revisa el archivo `CONTRIBUTING.md`.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
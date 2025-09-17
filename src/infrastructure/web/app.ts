// src/infrastructure/web/app.ts

/**
 * Módulo de configuración principal de la aplicación Express.
 *
 * Este archivo crea y configura la instancia principal de la aplicación Express.
 * Es responsable de definir middleware global, montar enrutadores y, en general,
 * ensamblar la lógica de la aplicación web.
 *
 * La instancia de la aplicación se exporta por defecto para que pueda ser utilizada
 * por el punto de entrada del servidor (/src/server.ts) para iniciarla, y por el entorno
 * de pruebas (con Supertest) para realizar tests de integración.
 *
 * Actualmente, solo define un endpoint raíz (GET /) que sirve como un health check
 * básico, devolviendo el estado y la versión de la API.
 *
 * @module App
 * @category Infrastructure/Web
 * @author Exequiel Trujillo
 * @since 1.0.0
 */

import express from 'express';

const app = express();

app.get('/', (_req, res) => {
  res.json({
    message: 'WayrApp Backend está vivo!',
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default app;

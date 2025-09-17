// src/server.ts

/**
 * Servidor básico de Express para la aplicación WayrApp.
 *
 * Este módulo implementa un servidor HTTP simple utilizando Express.js. El servidor
 * proporciona un endpoint básico de health check en la ruta raíz que devuelve
 * información sobre el estado del servidor.
 *
 * El servidor está configurado para usar el puerto definido en la variable de entorno
 * PORT y proporciona una respuesta JSON básica con el estado del servidor, un mensaje
 * de confirmación y un timestamp de la respuesta.
 *
 * Este es un servidor Express básico sin middleware adicional, sin rutas complejas
 * ni funcionalidades avanzadas como manejo de errores, logging o configuración
 * para diferentes entornos de despliegue. Solo está destinado a servir como un
 * punto de partida para el desarrollo de la aplicación WayrApp.
 *
 * Funcionalidades implementadas:
 * - Servidor Express básico en el puerto definido por PORT
 * - Endpoint GET en la ruta raíz (/) que devuelve estado del servidor
 * - Mensaje de confirmación en consola al iniciar el servidor
 * - Respuesta JSON con información básica del estado
 *
 * @module Server
 * @category Server
 * @author Exequiel Trujillo
 * @since 1.0.0
 *
 */

import express from 'express';

const app = express();
const port = process.env.PORT;

app.get('/', (_req, res) => {
  res.json({
    message: 'WayrApp Backend está vivo!',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
});

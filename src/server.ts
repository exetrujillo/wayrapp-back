// src/server.ts

/**
 * Punto de entrada principal para iniciar el servidor de la aplicación WayrApp.
 *
 * Este módulo importa la instancia de la aplicación Express configurada desde './infrastructure/web/app'
 * y la pone en marcha, escuchando en el puerto especificado por las variables de entorno.
 *
 * Su única responsabilidad es iniciar el servidor. Toda la configuración de la aplicación,
 * como middleware y rutas, se gestiona en el módulo 'app'.
 * @module Server
 * @category Server
 * @author Exequiel Trujillo
 * @since 1.0.0
 *
 */

import { config } from '@/infrastructure/config/environment.js';
import app from '@/infrastructure/web/app.js';

const port = config.PORT;

app.listen(port, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
});

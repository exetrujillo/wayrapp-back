#!/bin/bash
set -e

echo "--- Setting up Development Environment ---"

# 1. Construir la imagen y levantar los contenedores.
#    El Dockerfile ahora solo instala dependencias.
echo "Building image and starting containers..."
docker-compose up -d --build

# 2. Generar el cliente de Prisma.
#    Este es el paso CRÍTICO. Lo ejecutamos explícitamente DESPUÉS
#    de que el contenedor esté corriendo y tenga los node_modules.
echo "Generating Prisma client..."
npm run prisma:generate

# 3. Aplicar migraciones pendientes.
#    Ahora este comando funcionará, porque el cliente de Prisma ya existe.
echo "Applying pending database migrations..."
npm run db:migrate:deploy

echo "--- Development Environment is Ready! ---"
#!/bin/bash

# Script de configuración inicial para BSK Motorcycle Team Landing Page

echo "🏍️  Configuración inicial de BSK Motorcycle Team Landing Page"
echo ""

# Verificar si existe el archivo .env
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "✅ Archivo .env creado. Por favor, configura las variables de entorno necesarias."
    echo ""
    echo "🔧 Variables importantes a configurar:"
    echo "   - JWT_SECRET: Clave secreta para tokens JWT"
    echo "   - MONGODB_URI: URI de conexión a MongoDB"
    echo "   - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: API key de Google Maps (para SOS)"
    echo ""
else
    echo "⚠️  El archivo .env ya existe. No se realizaron cambios."
    echo ""
fi

# Verificar e instalar dependencias
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    echo "✅ Dependencias instaladas."
    echo ""
else
    echo "✅ Las dependencias ya están instaladas."
    echo ""
fi

# Verificar conexión a la base de datos
echo "🔍 Para verificar la configuración, puedes:"
echo "   1. Ejecutar 'npm run dev' para iniciar el servidor de desarrollo"
echo "   2. Acceder a http://localhost:3000/api/health para verificar el estado"
echo "   3. Verificar logs en la consola para confirmar la conexión a la base de datos"
echo ""

echo "🎉 Configuración inicial completada!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Edita el archivo .env con tus configuraciones específicas"
echo "   2. Ejecuta 'npm run dev' para iniciar el servidor de desarrollo"
echo "   3. Accede a http://localhost:3000 para ver la aplicación"

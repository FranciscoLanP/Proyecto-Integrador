#!/bin/bash
# Script de verificación rápida - verify-hydration.sh

echo "🚀 Verificación de Sistema de Temas y Hidratación"
echo "================================================="

echo "📡 Verificando servidor..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Servidor ejecutándose en http://localhost:3000"
else
    echo "❌ Servidor no encontrado. Ejecuta: npm run dev"
    exit 1
fi

echo "🔨 Verificando compilación..."
cd "$(dirname "$0")"
if npm run build > /dev/null 2>&1; then
    echo "✅ Compilación exitosa"
else
    echo "❌ Error en compilación"
    exit 1
fi

echo "🌐 Verificando páginas principales..."

pages=("/suplidores" "/empleadoinformacion" "/vehiculodatos" "/clientes")
for page in "${pages[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$page")
    if [ $response -eq 200 ]; then
        echo "✅ $page - Responde correctamente"
    else
        echo "❌ $page - Error $response"
    fi
done

echo "🔍 Verificando archivos clave..."

files=(
    "src/hooks/useHydration.ts"
    "src/app/context/ThemeContext.tsx"
    "src/components/HydrationWrapper.tsx"
    "HYDRATION_FIX_DOCUMENTATION.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - Existe"
    else
        echo "❌ $file - No encontrado"
    fi
done

echo ""
echo "🎉 Verificación completada!"
echo "📖 Consulta HYDRATION_FIX_DOCUMENTATION.md para más detalles"
echo ""
echo "🧪 Para pruebas manuales:"
echo "1. Abre http://localhost:3000/suplidores"
echo "2. Recarga la página (F5)"
echo "3. Verifica que no hay errores en la consola"
echo "4. Cambia de tema desde el perfil de usuario"
echo "5. Recarga nuevamente y verifica"

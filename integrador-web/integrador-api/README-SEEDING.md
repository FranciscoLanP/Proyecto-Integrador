# 🌱 Script de Población de Base de Datos - Taller Mecánico

Este script poblará tu base de datos MongoDB con datos realistas para un taller mecánico, incluyendo todo el flujo desde la recepción de vehículos hasta la facturación.

## 📋 Qué Incluye

El script creará **6 registros de cada modelo** (excepto usuarios: 2), con todas las relaciones correctas:

### 👥 Usuarios (2 registros)
- **Administrador**: `admin` / `admin123`
- **Empleado**: `empleado1` / `emp123`

### 🏢 Datos Base (6 registros cada uno)
- **Clientes**: Individuales, empresariales, aseguradoras y gobierno
- **Empleados**: Mecánicos, técnicos, pintores, soldadores
- **Marcas**: Toyota, Honda, Nissan, Hyundai, Kia, Mitsubishi
- **Modelos**: Corolla, Camry, Civic, Accord, Sentra, Elantra
- **Colores**: Blanco, Negro, Gris, Azul, Rojo, Plata
- **Suplidores**: AutoPartes Premium, Distribuidora Méndez, etc.

### 🚗 Vehículos y Servicios (6 registros cada uno)
- **Vehículos**: Asignados a clientes con modelos y colores específicos
- **Piezas de Inventario**: Filtros, pastillas, bujías, aceites, etc.
- **Recepciones**: Vehículos ingresados con problemas reportados
- **Recibos**: Documentación de recepción de vehículos
- **Inspecciones**: Diagnósticos técnicos con piezas sugeridas
- **Reparaciones**: Trabajos realizados por empleados
- **Facturas**: Facturación completa con métodos de pago

### 💳 Sistema de Pagos (4-12 registros)
- **Tipos de Pagos**: Efectivo, Tarjeta, Transferencia, Cheque
- **Métodos de Pago**: Combinaciones de tipos con modalidades (Contado/Crédito)
- **Pagos de Facturas**: Registro detallado de pagos realizados
- **Garantías**: Cobertura de trabajos y piezas

### 📊 Gestión de Inventario (6-12 registros)
- **Historial de Compras**: Compras de piezas a suplidores
- **Piezas Usadas**: Registro de consumo en reparaciones
- **Relaciones Suplidor-Pieza**: Qué suplidor provee cada pieza
- **Ubicaciones**: Ubicaciones geográficas de usuarios y servicios

## 🚀 Cómo Usar

### Opción 1: Script Interactivo (Recomendado)
```bash
cd integrador-api
npm run seed
```

Este comando:
1. Te pedirá confirmación antes de proceder
2. Limpiará la base de datos actual
3. Poblará con datos nuevos
4. Mostrará un resumen al final

### Opción 2: Ejecución Directa
```bash
cd integrador-api
npm run seed:direct
```

Ejecuta el script sin confirmación.

## ⚠️ Advertencias Importantes

- **El script BORRARÁ todos los datos existentes** en las siguientes colecciones:
  - clientes, usuarios, empleadoinformacions
  - marcavehiculos, modelosdatos, coloresdatos, vehiculodatos
  - suplidorpiezas, piezainventarios
  - recepcionvehiculos, recibovehiculos, inspeccionvehiculos
  - reparacionvehiculos, facturas, garantias
  - tipospagos, metodopagos, pagofacturas
  - historialcompras, piezausadas, suplidorpiezarelacions
  - ubicacions, counters

- **Asegúrate de tener un backup** si hay datos importantes

## 📊 Estructura de Datos Creados

### Flujo Completo del Taller:
1. **Cliente** trae su **Vehículo** al taller
2. **Empleado** realiza la **Recepción** del vehículo
3. Se genera un **Recibo** de recepción
4. **Técnico** realiza **Inspección** y sugiere **Piezas**
5. Se ejecuta la **Reparación** usando las piezas del **Inventario**
6. Se emite la **Factura** al cliente

### Datos Realistas:
- **Ubicaciones reales** de República Dominicana
- **Cédulas y RNC** en formato correcto
- **Chasis de vehículos** con formato VIN
- **Costos y precios** en pesos dominicanos
- **Fechas coherentes** de agosto 2024
- **Problemas automotrices** comunes

## 🔧 Personalización

Para modificar los datos, edita el archivo:
```
src/scripts/seedDatabase.ts
```

Cada función `seed*()` maneja un modelo específico. Puedes:
- Cambiar nombres, precios, fechas
- Agregar más registros
- Modificar las relaciones
- Ajustar los datos para tu región

## 🐛 Troubleshooting

### Error de conexión a MongoDB:
- Verifica que MongoDB esté ejecutándose
- Revisa tu archivo `.env` con la URL de conexión correcta

### Error de dependencias:
```bash
npm install
```

### Error de TypeScript:
```bash
npm run build
```

## 📈 Después del Seeding

Una vez poblada la base de datos, puedes:

1. **Iniciar el backend**:
   ```bash
   npm run dev
   ```

2. **Probar los endpoints** en: `http://localhost:3001`

3. **Ver la documentación Swagger** (si está configurada)

4. **Iniciar el frontend** para explorar los datos creados

## 💡 Casos de Uso

Este dataset es perfecto para:
- **Desarrollo y testing** de la aplicación
- **Demos y presentaciones** del sistema
- **Pruebas de rendimiento** con datos realistas
- **Entrenamiento de usuarios** finales

---

¡Disfruta explorando tu taller mecánico virtual! 🚗⚡

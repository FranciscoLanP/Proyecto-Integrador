# 🔧 Configuración de Puertos y CORS

## 📋 **Puertos Configurados**

El backend está configurado para permitir conexiones desde los siguientes puertos:

### **Frontend/Cliente (Next.js)**
- **Puerto 3000**: `http://localhost:3000` - Puerto por defecto de Next.js
- **Puerto 3002**: `http://localhost:3002` - Puerto alternativo para desarrollo
- **Puerto 3003**: `http://localhost:3003` - Puerto adicional para testing

### **Backend/API (Express + Node.js)**
- **Puerto 3001**: `http://localhost:3001` - Puerto del servidor API

## 🛡️ **Configuración de Seguridad CORS**

### **Archivo**: `integrador-api/src/app.ts`
```typescript
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3003'
];
```

### **Características de Seguridad**:
- ✅ **Origins Permitidos**: Solo los puertos especificados
- ✅ **Credentials**: Habilitado para cookies y autenticación
- ✅ **Métodos HTTP**: GET, POST, PUT, DELETE, OPTIONS, PATCH
- ✅ **Headers Permitidos**: Authorization, Content-Type, etc.
- ✅ **Cache Preflight**: 24 horas para optimizar performance
- ✅ **Headers de Seguridad**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection

## 🔐 **Autenticación JWT**

### **Configuración Mejorada**:
- ✅ **Validación de Token**: Verificación estricta del formato Bearer
- ✅ **Manejo de Expiración**: Detección automática de tokens expirados
- ✅ **Códigos de Error**: Respuestas específicas para diferentes tipos de error
- ✅ **Logging**: Registro de requests para debugging

### **Códigos de Error JWT**:
- `NO_TOKEN`: No se proporcionó token de autorización
- `INVALID_TOKEN_FORMAT`: Formato incorrecto (debe ser Bearer <token>)
- `EMPTY_TOKEN`: Token vacío o nulo
- `TOKEN_EXPIRED`: Token expirado
- `MALFORMED_TOKEN`: Token malformado
- `INVALID_TOKEN`: Token inválido genérico

## 🌐 **Cliente API (Frontend)**

### **Mejoras Implementadas**:
- ✅ **Interceptores**: Automáticamente agrega tokens a las requests
- ✅ **Manejo de Errores**: Redirección automática al login si el token expira
- ✅ **Timeout**: 10 segundos para evitar requests colgadas
- ✅ **Limpieza Automática**: Elimina tokens inválidos del localStorage
- ✅ **Detección CORS**: Mensajes específicos para errores de conexión

## 🚀 **Cómo Ejecutar**

### **Backend** (Puerto 3001):
```bash
cd integrador-api
npm run dev
```

### **Frontend** (Puerto 3000):
```bash
cd integrador-web
npm run dev
```

### **Puertos Alternativos**:
```bash
# Puerto 3002
cd integrador-web
PORT=3002 npm run dev

# Puerto 3003
cd integrador-web  
PORT=3003 npm run dev
```

## 🔍 **Debugging**

### **Logs del Backend**:
El backend ahora registra todas las requests con:
- Timestamp
- Método HTTP
- URL
- Origin del request

### **Verificar CORS**:
```bash
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:3001/api/auth/login
```

## ⚠️ **Notas Importantes**

1. **MongoDB**: Asegúrate de que MongoDB esté ejecutándose en `mongodb://localhost:27017`
2. **Variables de Entorno**: El archivo `.env` debe estar presente en `integrador-api/`
3. **Tokens**: Los tokens JWT tienen una duración de 24 horas por defecto
4. **CORS**: Si necesitas agregar más puertos, actualiza la variable `CORS_ORIGINS` en `.env`

## 🛠️ **Variables de Entorno**

### **integrador-api/.env**:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/integrador-api
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=24h
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003
```

¡La configuración está lista para manejar múltiples puertos sin problemas de CORS o autenticación! 🎉

# Manual de Instalación del Proyecto Integrador

## Requisitos Previos
Antes de comenzar, asegúrate de tener instalados los siguientes programas en tu computadora:

1. **Node.js**  
   - Descarga e instala Node.js desde [https://nodejs.org/](https://nodejs.org/).  
   - Asegúrate de instalar la versión LTS (Long Term Support).

2. **Git**  
   - Descarga e instala Git desde [https://git-scm.com/](https://git-scm.com/).  
   - Esto es necesario para clonar el repositorio y manejar el control de versiones.

3. **Editor de Código (Opcional)**  
   - Se recomienda instalar Visual Studio Code (VS Code) desde [https://code.visualstudio.com/](https://code.visualstudio.com/).

4. **Navegador Web**  
   - Cualquier navegador moderno como Google Chrome o Microsoft Edge.

---

## Pasos de Instalación

### 1. Copiar el Proyecto
- Copia la carpeta del proyecto desde la memoria USB a tu computadora.

### 2. Instalar Dependencias
1. Abre una terminal (puedes usar PowerShell en Windows).
2. Navega a la carpeta principal del proyecto. Por ejemplo:
   ```powershell
   cd C:\ruta\del\proyecto\integrador-web
   ```
3. Instala las dependencias del proyecto ejecutando:
   ```powershell
   npm install
   ```
   Esto instalará todas las bibliotecas necesarias para el proyecto.

4. Navega a la carpeta `integrador-api` y repite el proceso:
   ```powershell
   cd integrador-api
   npm install
   ```

---

### 3. Configurar el Proyecto
1. **Base de Datos**  
   - Este proyecto utiliza una base de datos. Asegúrate de tener MongoDB instalado en tu computadora.  
   - Descarga MongoDB desde [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community) e instálalo.  
   - Inicia el servicio de MongoDB antes de continuar.

2. **Variables de Entorno**  
   - Crea un archivo `.env` en la carpeta `integrador-api` con las configuraciones necesarias para el backend. Un ejemplo de archivo `.env` podría ser:
     ```
     PORT=3000
     MONGO_URI=mongodb://localhost:27017/nombre_base_datos
     JWT_SECRET=tu_secreto
     ```

---

### 4. Inicializar la Base de Datos
1. En la carpeta `integrador-api`, ejecuta el siguiente comando para poblar la base de datos con datos iniciales:
   ```powershell
   npm run seed
   ```
   Esto creará automáticamente dos usuarios con los siguientes roles y credenciales:
   - **Administrador**:
     - Usuario: `admin@example.com`
     - Contraseña: `admin123`
   - **Usuario Regular**:
     - Usuario: `user@example.com`
     - Contraseña: `user123`

---

### 5. Ejecutar el Proyecto
1. **Backend (API)**  
   - En la carpeta `integrador-api`, ejecuta:
     ```powershell
     npm run dev
     ```
   - Esto iniciará el servidor backend.

2. **Frontend (Web)**  
   - En la carpeta principal del proyecto (`integrador-web`), ejecuta:
     ```powershell
     npm run dev
     ```
   - Esto iniciará el servidor frontend. Abre tu navegador y ve a [http://localhost:3000](http://localhost:3000) para ver la aplicación.

---

## Notas Adicionales
- Si encuentras problemas, asegúrate de que MongoDB esté corriendo y que las dependencias estén instaladas correctamente.
- Si necesitas ayuda adicional, consulta los archivos `README.md` en las carpetas del proyecto.



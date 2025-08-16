// Script simple para verificar la conexión a MongoDB y los usuarios
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  activo: Boolean
});

const Usuario = mongoose.model('Usuario', userSchema);

async function checkDatabase() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/integrador-api');
    console.log('✅ Conectado a MongoDB');
    
    console.log('Buscando usuarios...');
    const users = await Usuario.find({});
    console.log('👥 Usuarios encontrados:', users.length);
    
    for (const user of users) {
      console.log(`📝 Usuario: ${user.username}, Role: ${user.role}, Activo: ${user.activo}`);
    }
    
    console.log('Buscando usuario admin específicamente...');
    const adminUser = await Usuario.findOne({ username: 'admin' });
    console.log('👤 Usuario admin:', adminUser ? 'ENCONTRADO' : 'NO ENCONTRADO');
    if (adminUser) {
      console.log('🔍 Detalles del admin:', {
        username: adminUser.username,
        role: adminUser.role,
        activo: adminUser.activo,
        passwordHash: adminUser.password ? 'EXISTS' : 'NO PASSWORD'
      });
    }
    
    await mongoose.disconnect();
    console.log('❌ Desconectado de MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDatabase();

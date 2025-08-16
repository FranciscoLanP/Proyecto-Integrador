#!/usr/bin/env node

/**
 * Script ejecutable para poblar la base de datos
 * Uso: npm run seed
 */

require('ts-node/register');
require('dotenv').config({ path: __dirname + '/../../.env' });

const seedDatabase = require('./seedDatabase').default;

console.log('🌱 Iniciando script de población de base de datos...');
console.log('📊 Este script creará datos de prueba para el taller mecánico');
console.log('⚠️  ADVERTENCIA: Esto borrará todos los datos existentes\n');

// Confirmar antes de proceder
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('¿Estás seguro de que quieres continuar? (s/N): ', (answer) => {
  if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'si') {
    rl.close();

    seedDatabase()
      .then(() => {
        console.log('\n🎊 ¡Proceso completado exitosamente!');
        console.log('🔗 La base de datos ahora contiene datos de prueba realistas');
        console.log('🚀 Puedes iniciar tu aplicación y explorar los datos');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Error durante la población:', error);
        process.exit(1);
      });
  } else {
    console.log('❌ Operación cancelada');
    rl.close();
    process.exit(0);
  }
});

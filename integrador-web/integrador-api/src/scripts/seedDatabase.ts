

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { connectDB } from '../utils/database';

dotenv.config();

import { Cliente } from '../models/cliente';
import { Usuario } from '../models/usuarios';
import { EmpleadoInformacion } from '../models/empleadoInformacion';
import { MarcaVehiculo } from '../models/marcaVehiculo';
import { ModelosDatos } from '../models/modelosDatos';
import { ColoresDatos } from '../models/coloresDatos';
import { VehiculoDatos } from '../models/vehiculoDatos';
import { SuplidorPieza } from '../models/suplidorPieza';
import { PiezaInventario } from '../models/piezaInventario';
import { RecepcionVehiculo } from '../models/recepcionVehiculo';
import { ReciboVehiculo } from '../models/reciboVehiculo';
import { InspeccionVehiculo } from '../models/inspeccionVehiculo';
import { ReparacionVehiculo } from '../models/reparacionVehiculo';
import { Factura } from '../models/factura';
import { Counter } from '../models/counter';
import { Garantia } from '../models/garantia';
import { TiposPagos } from '../models/tiposPagos';
import { MetodoPago } from '../models/metodoPago';
import { PagoFactura } from '../models/pagoFactura';
import { HistorialCompra } from '../models/historialCompra';
import { PiezaUsada } from '../models/piezaUsada';
import { SuplidorPiezaRelacion } from '../models/suplidorPiezaRelacion';
import { Ubicacion } from '../models/ubicacion';

async function clearDatabase() {
  console.log('🗑️ Limpiando base de datos...');

  await Cliente.deleteMany({});
  await Usuario.deleteMany({});
  await EmpleadoInformacion.deleteMany({});
  await MarcaVehiculo.deleteMany({});
  await ModelosDatos.deleteMany({});
  await ColoresDatos.deleteMany({});
  await VehiculoDatos.deleteMany({});
  await SuplidorPieza.deleteMany({});
  await PiezaInventario.deleteMany({});
  await RecepcionVehiculo.deleteMany({});
  await ReciboVehiculo.deleteMany({});
  await InspeccionVehiculo.deleteMany({});
  await ReparacionVehiculo.deleteMany({});
  await Factura.deleteMany({});
  await Garantia.deleteMany({});
  await TiposPagos.deleteMany({});
  await MetodoPago.deleteMany({});
  await PagoFactura.deleteMany({});
  await HistorialCompra.deleteMany({});
  await PiezaUsada.deleteMany({});
  await SuplidorPiezaRelacion.deleteMany({});
  await Ubicacion.deleteMany({});
  await Counter.deleteMany({});

  try {
    await Cliente.collection.dropIndexes();
    console.log('🔧 Índices de Cliente limpiados');
  } catch (error) {
  }

  console.log('✅ Base de datos limpiada');
}

async function seedUsuarios() {
  console.log('👥 Creando usuarios...');
  const usuarios = [
    {
      username: 'admin',
      password: 'admin123',
      role: 'administrador',
      activo: true,
      secretQuestion: '¿Cuál es el nombre de tu primera mascota?',
      secretAnswer: 'firulais'
    },
    {
      username: 'empleado1',
      password: 'emp123',
      role: 'empleado',
      activo: true,
      secretQuestion: '¿En qué ciudad naciste?',
      secretAnswer: 'santo domingo'
    }
  ];

  const createdUsuarios = [];
  for (const userData of usuarios) {
    const usuario = new Usuario({
      ...userData
    });
    const saved = await usuario.save();
    createdUsuarios.push(saved);
  }
  console.log('✅ Usuarios creados');
  return createdUsuarios;
}

async function seedClientes() {
  console.log('👤 Creando clientes...');
  const clientes = [
    {
      cedula: '001-1234567-8',
      nombre: 'Juan Carlos Pérez',
      numero_telefono: '809-555-0101',
      correo: 'juan.perez@email.com',
      tipo_cliente: 'Individual',
      location: { type: 'Point', coordinates: [-69.9312, 18.4861] },
      direccion: 'Av. 27 de Febrero #123, Santo Domingo',
      ubicacionLabel: 'Zona Colonial'
    },
    {
      cedula: '001-2345678-9',
      nombre: 'María Elena Rodríguez',
      numero_telefono: '809-555-0102',
      correo: 'maria.rodriguez@email.com',
      tipo_cliente: 'Individual',
      location: { type: 'Point', coordinates: [-69.9000, 18.5000] },
      direccion: 'Calle José Martí #456, Santiago',
      ubicacionLabel: 'Centro de Santiago'
    },
    {
      cedula: '001-3456789-0',
      rnc: '1-31-12345-6',
      nombre: 'Transportes Dominicanos S.A.',
      numero_telefono: '809-555-0103',
      correo: 'info@transportesdom.com',
      tipo_cliente: 'Empresarial',
      location: { type: 'Point', coordinates: [-69.8500, 18.4500] },
      direccion: 'Av. John F. Kennedy #789, Santo Domingo',
      ubicacionLabel: 'Piantini'
    },
    {
      cedula: '001-4567890-1',
      nombre: 'Ana Sofía Martínez',
      numero_telefono: '809-555-0104',
      correo: 'ana.martinez@email.com',
      tipo_cliente: 'Individual',
      location: { type: 'Point', coordinates: [-70.6500, 19.4500] },
      direccion: 'Calle Duarte #321, Puerto Plata',
      ubicacionLabel: 'Centro Puerto Plata'
    },
    {
      cedula: '001-5678901-2',
      rnc: '1-31-67890-1',
      nombre: 'Seguros Universales',
      numero_telefono: '809-555-0105',
      correo: 'seguros@universales.com',
      tipo_cliente: 'Aseguradora',
      location: { type: 'Point', coordinates: [-69.9500, 18.4700] },
      direccion: 'Torre Empresarial, Av. Winston Churchill',
      ubicacionLabel: 'Ensanche Piantini'
    },
    {
      cedula: '001-6789012-3',
      rnc: '4-01-00123-4',
      nombre: 'Ministerio de Obras Públicas',
      numero_telefono: '809-555-0106',
      correo: 'vehiculos@mopc.gob.do',
      tipo_cliente: 'Gobierno',
      location: { type: 'Point', coordinates: [-69.9200, 18.4900] },
      direccion: 'Centro de los Héroes, Av. George Washington',
      ubicacionLabel: 'Gazcue'
    }
  ];

  const createdClientes = await Cliente.insertMany(clientes);
  console.log('✅ Clientes creados');
  return createdClientes;
}

async function seedEmpleados() {
  console.log('👷 Creando empleados...');
  const empleados = [
    {
      tipo_empleado: 'Empleado Asalariado',
      nombre: 'Carlos Méndez - Mecánico Senior',
      telefono: '809-555-1001',
      correo: 'carlos.mendez@taller.com',
      location: { type: 'Point', coordinates: [-69.9100, 18.4800] },
      direccion: 'Calle Mercedes #45, Santo Domingo',
      ubicacionLabel: 'Zona Universitaria'
    },
    {
      tipo_empleado: 'Empleado Asalariado',
      nombre: 'Roberto Silva - Técnico Eléctrico',
      telefono: '809-555-1002',
      correo: 'roberto.silva@taller.com',
      location: { type: 'Point', coordinates: [-69.9000, 18.4900] },
      direccion: 'Av. Máximo Gómez #678, Santo Domingo',
      ubicacionLabel: 'Gazcue'
    },
    {
      tipo_empleado: 'Empleado por Trabajo',
      nombre: 'Pedro González - Soldador',
      telefono: '809-555-1003',
      correo: 'pedro.gonzalez@taller.com',
      location: { type: 'Point', coordinates: [-69.8800, 18.5100] },
      direccion: 'Calle San Juan Bosco #234, Santiago',
      ubicacionLabel: 'Los Jardines'
    },
    {
      tipo_empleado: 'Empleado Asalariado',
      nombre: 'Miguel Ángel Reyes - Jefe de Taller',
      telefono: '809-555-1004',
      correo: 'miguel.reyes@taller.com',
      location: { type: 'Point', coordinates: [-69.9300, 18.4600] },
      direccion: 'Av. Abraham Lincoln #567, Santo Domingo',
      ubicacionLabel: 'Piantini'
    },
    {
      tipo_empleado: 'Empleado por Trabajo',
      nombre: 'José Luis Herrera - Pintor Automotriz',
      telefono: '809-555-1005',
      correo: 'jose.herrera@taller.com',
      location: { type: 'Point', coordinates: [-69.9400, 18.4700] },
      direccion: 'Calle Rafael Augusto Sánchez #890, Santo Domingo',
      ubicacionLabel: 'Bella Vista'
    },
    {
      tipo_empleado: 'Empleado Asalariado',
      nombre: 'Francisco Jiménez - Técnico en Transmisiones',
      telefono: '809-555-1006',
      correo: 'francisco.jimenez@taller.com',
      location: { type: 'Point', coordinates: [-69.9150, 18.4850] },
      direccion: 'Calle Dr. Delgado #123, Santo Domingo',
      ubicacionLabel: 'Mirador Sur'
    }
  ];

  const createdEmpleados = await EmpleadoInformacion.insertMany(empleados);
  console.log('✅ Empleados creados');
  return createdEmpleados;
}

async function seedMarcasVehiculos() {
  console.log('🚗 Creando marcas de vehículos...');
  const marcas = [
    { nombre_marca: 'Toyota' },
    { nombre_marca: 'Honda' },
    { nombre_marca: 'Nissan' },
    { nombre_marca: 'Hyundai' },
    { nombre_marca: 'Kia' },
    { nombre_marca: 'Mitsubishi' }
  ];

  const createdMarcas = await MarcaVehiculo.insertMany(marcas);
  console.log('✅ Marcas de vehículos creadas');
  return createdMarcas;
}

async function seedModelos(marcas: any[]) {
  console.log('🚙 Creando modelos de vehículos...');
  const modelos = [
    { nombre_modelo: 'Corolla', id_marca: marcas[0]._id },
    { nombre_modelo: 'Camry', id_marca: marcas[0]._id },
    { nombre_modelo: 'Civic', id_marca: marcas[1]._id },
    { nombre_modelo: 'Accord', id_marca: marcas[1]._id },
    { nombre_modelo: 'Sentra', id_marca: marcas[2]._id },
    { nombre_modelo: 'Elantra', id_marca: marcas[3]._id }
  ];

  const createdModelos = await ModelosDatos.insertMany(modelos);
  console.log('✅ Modelos de vehículos creados');
  return createdModelos;
}

async function seedColores() {
  console.log('🎨 Creando colores...');
  const colores = [
    { nombre_color: 'Blanco' },
    { nombre_color: 'Negro' },
    { nombre_color: 'Gris' },
    { nombre_color: 'Azul' },
    { nombre_color: 'Rojo' },
    { nombre_color: 'Plata' }
  ];

  const createdColores = await ColoresDatos.insertMany(colores);
  console.log('✅ Colores creados');
  return createdColores;
}

async function seedVehiculos(clientes: any[], modelos: any[], colores: any[]) {
  console.log('🚗 Creando vehículos...');
  const vehiculos = [
    {
      chasis: 'JTD12345678901234',
      id_cliente: clientes[0]._id,
      id_modelo: modelos[0]._id,
      id_color: colores[0]._id,
      anio: 2020,
      activo: true
    },
    {
      chasis: 'JHM12345678901235',
      id_cliente: clientes[1]._id,
      id_modelo: modelos[2]._id,
      id_color: colores[1]._id,
      anio: 2019,
      activo: true
    },
    {
      chasis: 'JN112345678901236',
      id_cliente: clientes[2]._id,
      id_modelo: modelos[4]._id,
      id_color: colores[2]._id,
      anio: 2021,
      activo: true
    },
    {
      chasis: 'KMH12345678901237',
      id_cliente: clientes[3]._id,
      id_modelo: modelos[5]._id,
      id_color: colores[3]._id,
      anio: 2022,
      activo: true
    },
    {
      chasis: 'JTD12345678901238',
      id_cliente: clientes[4]._id,
      id_modelo: modelos[1]._id,
      id_color: colores[4]._id,
      anio: 2018,
      activo: true
    },
    {
      chasis: 'JHM12345678901239',
      id_cliente: clientes[5]._id,
      id_modelo: modelos[3]._id,
      id_color: colores[5]._id,
      anio: 2023,
      activo: true
    }
  ];

  const createdVehiculos = await VehiculoDatos.insertMany(vehiculos);
  console.log('✅ Vehículos creados');
  return createdVehiculos;
}

async function seedSuplidores() {
  console.log('🏭 Creando suplidores...');
  const suplidores = [
    {
      rnc: '1-31-55555-1',
      nombre: 'AutoPartes Premium S.R.L.',
      numero_telefono: '809-555-2001',
      correo: 'ventas@autopartespremium.com',
      location: { type: 'Point', coordinates: [-69.9400, 18.4800] },
      direccion: 'Zona Franca Industrial, Santo Domingo Este',
      ubicacionLabel: 'Zona Industrial'
    },
    {
      rnc: '1-31-55555-2',
      nombre: 'Distribuidora Méndez',
      numero_telefono: '809-555-2002',
      correo: 'info@distmendez.com',
      location: { type: 'Point', coordinates: [-69.9200, 18.4900] },
      direccion: 'Av. Duarte #1234, Santiago',
      ubicacionLabel: 'Zona Comercial Santiago'
    },
    {
      rnc: '1-31-55555-3',
      nombre: 'Repuestos González',
      numero_telefono: '809-555-2003',
      correo: 'repuestos@gonzalez.com',
      location: { type: 'Point', coordinates: [-69.9100, 18.5000] },
      direccion: 'Calle Beller #567, Santo Domingo',
      ubicacionLabel: 'Villa Consuelo'
    },
    {
      rnc: '1-31-55555-4',
      nombre: 'Importadora Central',
      numero_telefono: '809-555-2004',
      correo: 'central@importadora.com',
      location: { type: 'Point', coordinates: [-69.9000, 18.4700] },
      direccion: 'Av. 27 de Febrero #2345, Santo Domingo',
      ubicacionLabel: 'Ensanche Esperilla'
    },
    {
      rnc: '1-31-55555-5',
      nombre: 'Lubricantes del Caribe',
      numero_telefono: '809-555-2005',
      correo: 'ventas@lubricaribe.com',
      location: { type: 'Point', coordinates: [-69.8900, 18.4600] },
      direccion: 'Km 15 Autopista Duarte, Santo Domingo Norte',
      ubicacionLabel: 'Zona Industrial Norte'
    },
    {
      rnc: '1-31-55555-6',
      nombre: 'Neumáticos RD',
      numero_telefono: '809-555-2006',
      correo: 'info@neumaticosrd.com',
      location: { type: 'Point', coordinates: [-69.9300, 18.4500] },
      direccion: 'Av. Independencia #678, Santo Domingo',
      ubicacionLabel: 'Villa Francisca'
    }
  ];

  const createdSuplidores = await SuplidorPieza.insertMany(suplidores);
  console.log('✅ Suplidores creados');
  return createdSuplidores;
}

async function seedPiezasInventario() {
  console.log('🔧 Creando piezas de inventario...');

  await Counter.findOneAndUpdate(
    { id: 'pieza_inventario' },
    { $setOnInsert: { seq: 0 } },
    { upsert: true, new: true }
  );

  const piezas = [
    {
      nombre_pieza: 'Filtro de Aceite Toyota',
      cantidad_disponible: 23,
      costo_promedio: 450.00,
      historial: [
        { cantidad: 50, costo_unitario: 400.00, fecha: new Date('2024-01-15') },
        { cantidad: -25, costo_unitario: 450.00, fecha: new Date('2024-07-20') },
        { cantidad: -2, costo_unitario: 450.00, fecha: new Date('2024-08-02') }
      ]
    },
    {
      nombre_pieza: 'Pastillas de Freno Honda',
      cantidad_disponible: 14,
      costo_promedio: 1200.00,
      historial: [
        { cantidad: 30, costo_unitario: 1150.00, fecha: new Date('2024-02-10') },
        { cantidad: -15, costo_unitario: 1200.00, fecha: new Date('2024-08-05') },
        { cantidad: -1, costo_unitario: 1200.00, fecha: new Date('2024-08-05') }
      ]
    },
    {
      nombre_pieza: 'Bujías NGK',
      cantidad_disponible: 32,
      costo_promedio: 280.00,
      historial: [
        { cantidad: 60, costo_unitario: 250.00, fecha: new Date('2024-03-05') },
        { cantidad: -20, costo_unitario: 280.00, fecha: new Date('2024-07-15') },
        { cantidad: -8, costo_unitario: 280.00, fecha: new Date('2024-08-03') }
      ]
    },
    {
      nombre_pieza: 'Correa de Distribución',
      cantidad_disponible: 7,
      costo_promedio: 2800.00,
      historial: [
        { cantidad: 20, costo_unitario: 2650.00, fecha: new Date('2024-01-20') },
        { cantidad: -12, costo_unitario: 2800.00, fecha: new Date('2024-06-10') },
        { cantidad: -1, costo_unitario: 2800.00, fecha: new Date('2024-08-07') }
      ]
    },
    {
      nombre_pieza: 'Amortiguadores Delanteros',
      cantidad_disponible: 10,
      costo_promedio: 3500.00,
      historial: [
        { cantidad: 20, costo_unitario: 3200.00, fecha: new Date('2024-02-25') },
        { cantidad: -8, costo_unitario: 3500.00, fecha: new Date('2024-08-01') },
        { cantidad: -2, costo_unitario: 3500.00, fecha: new Date('2024-08-07') }
      ]
    },
    {
      nombre_pieza: 'Aceite Motor 5W-30',
      cantidad_disponible: 26,
      costo_promedio: 680.00,
      historial: [
        { cantidad: 50, costo_unitario: 650.00, fecha: new Date('2024-04-01') },
        { cantidad: -20, costo_unitario: 680.00, fecha: new Date('2024-07-30') },
        { cantidad: -4, costo_unitario: 680.00, fecha: new Date('2024-08-04') }
      ]
    }
  ];

  const createdPiezas = [];
  for (const piezaData of piezas) {
    const pieza = new PiezaInventario(piezaData);
    const saved = await pieza.save();
    createdPiezas.push(saved);
  }

  console.log('✅ Piezas de inventario creadas');
  return createdPiezas;
}

async function seedRecepcionVehiculos(empleados: any[], vehiculos: any[]) {
  console.log('📝 Creando recepciones de vehículos...');
  const recepciones = [
    {
      id_empleadoInformacion: empleados[0]._id,
      id_vehiculo: vehiculos[0]._id,
      comentario: 'Cliente reporta ruidos extraños en el motor',
      fecha: new Date('2024-08-01'),
      problema_reportado: 'Ruido en motor al acelerar'
    },
    {
      id_empleadoInformacion: empleados[1]._id,
      id_vehiculo: vehiculos[1]._id,
      comentario: 'Vehículo no enciende, posible problema eléctrico',
      fecha: new Date('2024-08-02'),
      problema_reportado: 'No enciende el motor'
    },
    {
      id_empleadoInformacion: empleados[2]._id,
      id_vehiculo: vehiculos[2]._id,
      comentario: 'Mantenimiento preventivo programado',
      fecha: new Date('2024-08-03'),
      problema_reportado: 'Mantenimiento general'
    },
    {
      id_empleadoInformacion: empleados[3]._id,
      id_vehiculo: vehiculos[3]._id,
      comentario: 'Vibración en volante al frenar',
      fecha: new Date('2024-08-04'),
      problema_reportado: 'Problemas con frenos'
    },
    {
      id_empleadoInformacion: empleados[4]._id,
      id_vehiculo: vehiculos[4]._id,
      comentario: 'Rayones en carrocería para pintura',
      fecha: new Date('2024-08-05'),
      problema_reportado: 'Reparación de pintura'
    },
    {
      id_empleadoInformacion: empleados[5]._id,
      id_vehiculo: vehiculos[5]._id,
      comentario: 'Transmisión automática patina',
      fecha: new Date('2024-08-06'),
      problema_reportado: 'Problemas de transmisión'
    }
  ];

  const createdRecepciones = await RecepcionVehiculo.insertMany(recepciones);
  console.log('✅ Recepciones de vehículos creadas');
  return createdRecepciones;
}

async function seedRecibos(recepciones: any[]) {
  console.log('🧾 Creando recibos...');
  const recibos = [
    {
      id_recepcion: recepciones[0]._id,
      observaciones: 'Vehículo ingresado en buenas condiciones externas'
    },
    {
      id_recepcion: recepciones[1]._id,
      observaciones: 'Batería aparentemente descargada'
    },
    {
      id_recepcion: recepciones[2]._id,
      observaciones: 'Vehículo para mantenimiento según manual'
    },
    {
      id_recepcion: recepciones[3]._id,
      observaciones: 'Discos de freno visiblemente desgastados'
    },
    {
      id_recepcion: recepciones[4]._id,
      observaciones: 'Rayones menores en puerta lateral derecha'
    },
    {
      id_recepcion: recepciones[5]._id,
      observaciones: 'Nivel de aceite de transmisión bajo'
    }
  ];

  const createdRecibos = await ReciboVehiculo.insertMany(recibos);
  console.log('✅ Recibos creados');
  return createdRecibos;
}

async function seedInspecciones(recibos: any[], empleados: any[], piezas: any[]) {
  console.log('🔍 Creando inspecciones...');
  const inspecciones = [
    {
      id_recibo: recibos[0]._id,
      id_empleadoInformacion: empleados[0]._id,
      comentario: 'Filtro de aceite obstruido, necesita cambio',
      tiempo_estimado: 2,
      costo_mano_obra: 800.00,
      costo_aproximado: 1250.00,
      resultado: 'Requiere cambio de filtro de aceite',
      piezas_sugeridas: [
        {
          id_pieza: piezas[0]._id,
          nombre_pieza: 'Filtro de Aceite Toyota',
          cantidad: 1,
          precio_unitario: 450.00
        }
      ]
    },
    {
      id_recibo: recibos[1]._id,
      id_empleadoInformacion: empleados[1]._id,
      comentario: 'Sistema eléctrico revisado, bujías defectuosas',
      tiempo_estimado: 3,
      costo_mano_obra: 1200.00,
      costo_aproximado: 1480.00,
      resultado: 'Cambio de bujías necesario',
      piezas_sugeridas: [
        {
          id_pieza: piezas[2]._id,
          nombre_pieza: 'Bujías NGK',
          cantidad: 4,
          precio_unitario: 280.00
        }
      ]
    },
    {
      id_recibo: recibos[2]._id,
      id_empleadoInformacion: empleados[2]._id,
      comentario: 'Mantenimiento completo requerido',
      tiempo_estimado: 4,
      costo_mano_obra: 1600.00,
      costo_aproximado: 2280.00,
      resultado: 'Cambio de aceite y filtro',
      piezas_sugeridas: [
        {
          id_pieza: piezas[0]._id,
          nombre_pieza: 'Filtro de Aceite Toyota',
          cantidad: 1,
          precio_unitario: 450.00
        },
        {
          id_pieza: piezas[5]._id,
          nombre_pieza: 'Aceite Motor 5W-30',
          cantidad: 4,
          precio_unitario: 680.00
        }
      ]
    },
    {
      id_recibo: recibos[3]._id,
      id_empleadoInformacion: empleados[3]._id,
      comentario: 'Pastillas de freno completamente gastadas',
      tiempo_estimado: 3,
      costo_mano_obra: 1200.00,
      costo_aproximado: 2400.00,
      resultado: 'Cambio urgente de pastillas de freno',
      piezas_sugeridas: [
        {
          id_pieza: piezas[1]._id,
          nombre_pieza: 'Pastillas de Freno Honda',
          cantidad: 1,
          precio_unitario: 1200.00
        }
      ]
    },
    {
      id_recibo: recibos[4]._id,
      id_empleadoInformacion: empleados[4]._id,
      comentario: 'Evaluación para trabajo de pintura',
      tiempo_estimado: 6,
      costo_mano_obra: 2400.00,
      costo_aproximado: 2400.00,
      resultado: 'Preparación y pintura de puerta lateral',
      piezas_sugeridas: []
    },
    {
      id_recibo: recibos[5]._id,
      id_empleadoInformacion: empleados[5]._id,
      comentario: 'Transmisión requiere reparación mayor',
      tiempo_estimado: 8,
      costo_mano_obra: 3200.00,
      costo_aproximado: 6000.00,
      resultado: 'Cambio de correa de distribución y ajustes',
      piezas_sugeridas: [
        {
          id_pieza: piezas[3]._id,
          nombre_pieza: 'Correa de Distribución',
          cantidad: 1,
          precio_unitario: 2800.00
        }
      ]
    }
  ];

  const createdInspecciones = await InspeccionVehiculo.insertMany(inspecciones);
  console.log('✅ Inspecciones creadas');
  return createdInspecciones;
}

async function seedReparaciones(inspecciones: any[], empleados: any[], piezas: any[]) {
  console.log('🔧 Creando reparaciones...');

  const piezasUsadasIds: any[] = [];

  const reparaciones = [
    {
      id_inspeccion: inspecciones[0]._id,
      empleados_trabajos: [
        {
          id_empleado: empleados[0]._id,
          descripcion_trabajo: 'Cambio de filtro de aceite y revisión general'
        }
      ],
      descripcion: 'Reemplazo de filtro de aceite obstruido',
      costo_total: 1250.00,
      id_empleadoInformacion: empleados[0]._id
    },
    {
      id_inspeccion: inspecciones[1]._id,
      empleados_trabajos: [
        {
          id_empleado: empleados[1]._id,
          descripcion_trabajo: 'Cambio de bujías y prueba del sistema eléctrico'
        }
      ],
      descripcion: 'Sustitución de bujías defectuosas',
      costo_total: 1480.00,
      id_empleadoInformacion: empleados[1]._id
    },
    {
      id_inspeccion: inspecciones[2]._id,
      empleados_trabajos: [
        {
          id_empleado: empleados[2]._id,
          descripcion_trabajo: 'Mantenimiento preventivo completo'
        }
      ],
      descripcion: 'Cambio de aceite, filtro y revisión general',
      costo_total: 3400.00,
      id_empleadoInformacion: empleados[2]._id
    },
    {
      id_inspeccion: inspecciones[3]._id,
      empleados_trabajos: [
        {
          id_empleado: empleados[3]._id,
          descripcion_trabajo: 'Cambio de pastillas de freno delanteras'
        }
      ],
      descripcion: 'Reemplazo de pastillas de freno gastadas',
      costo_total: 2400.00,
      id_empleadoInformacion: empleados[3]._id
    },
    {
      id_inspeccion: inspecciones[4]._id,
      empleados_trabajos: [
        {
          id_empleado: empleados[4]._id,
          descripcion_trabajo: 'Preparación, masillado y pintura de puerta'
        }
      ],
      descripcion: 'Reparación de rayones en carrocería',
      costo_total: 2400.00,
      id_empleadoInformacion: empleados[4]._id
    },
    {
      id_inspeccion: inspecciones[5]._id,
      empleados_trabajos: [
        {
          id_empleado: empleados[5]._id,
          descripcion_trabajo: 'Cambio de correa de distribución y sincronización'
        }
      ],
      descripcion: 'Reparación mayor de sistema de transmisión',
      costo_total: 9300.00,
      id_empleadoInformacion: empleados[5]._id
    }
  ];

  const createdReparaciones = await ReparacionVehiculo.insertMany(reparaciones);
  console.log('✅ Reparaciones creadas');
  return createdReparaciones;
}

async function seedFacturas(reparaciones: any[]) {
  console.log('💰 Creando facturas...');
  const facturas = [
    {
      id_reparacion: reparaciones[0]._id,
      total: 1250.00,
      tipo_factura: 'Contado',
      metodos_pago: [
        { tipo: 'Efectivo', monto: 1250.00 }
      ],
      detalles: 'Cambio de filtro de aceite Toyota Corolla',
      emitida: true,
      descuento_porcentaje: 0,
      estado: 'Pagado',
      fecha_pago_completo: new Date('2024-08-02'),
      metodo_pago: 'Efectivo'
    },
    {
      id_reparacion: reparaciones[1]._id,
      total: 1480.00,
      tipo_factura: 'Contado',
      metodos_pago: [
        { tipo: 'Tarjeta', monto: 1480.00, referencia: 'TXN-123456' }
      ],
      detalles: 'Cambio de bujías Honda Civic',
      emitida: true,
      descuento_porcentaje: 0,
      estado: 'Pagado',
      fecha_pago_completo: new Date('2024-08-03'),
      metodo_pago: 'Tarjeta'
    },
    {
      id_reparacion: reparaciones[2]._id,
      total: 3400.00,
      tipo_factura: 'Contado',
      metodos_pago: [
        { tipo: 'Transferencia', monto: 3400.00, referencia: 'TRANS-789012' }
      ],
      detalles: 'Mantenimiento preventivo completo Nissan Sentra - Filtro, aceite y bujías',
      emitida: true,
      descuento_porcentaje: 5,
      estado: 'Pagado',
      fecha_pago_completo: new Date('2024-08-04'),
      metodo_pago: 'Transferencia'
    },
    {
      id_reparacion: reparaciones[3]._id,
      total: 2400.00,
      tipo_factura: 'Credito',
      metodos_pago: [
        { tipo: 'Efectivo', monto: 1200.00 }
      ],
      detalles: 'Cambio de pastillas de freno Hyundai Elantra',
      emitida: true,
      descuento_porcentaje: 0,
      estado: 'Parcial',
      metodo_pago: 'Efectivo'
    },
    {
      id_reparacion: reparaciones[4]._id,
      total: 2400.00,
      tipo_factura: 'Contado',
      metodos_pago: [
        { tipo: 'Tarjeta', monto: 2400.00, referencia: 'TXN-345678' }
      ],
      detalles: 'Reparación de pintura Toyota Camry',
      emitida: true,
      descuento_porcentaje: 0,
      estado: 'Pagado',
      fecha_pago_completo: new Date('2024-08-06'),
      metodo_pago: 'Tarjeta'
    },
    {
      id_reparacion: reparaciones[5]._id,
      total: 9300.00,
      tipo_factura: 'Credito',
      metodos_pago: [
        { tipo: 'Efectivo', monto: 4650.00 },
        { tipo: 'Cheque', monto: 4650.00, referencia: 'CHQ-567890' }
      ],
      detalles: 'Reparación mayor de transmisión Honda Accord - Correa y amortiguadores',
      emitida: true,
      descuento_porcentaje: 0,
      estado: 'Pagado',
      fecha_pago_completo: new Date('2024-08-07'),
      metodo_pago: 'Mixto'
    }
  ];

  const createdFacturas = await Factura.insertMany(facturas);
  console.log('✅ Facturas creadas');
  return createdFacturas;
}

async function seedTiposPagos() {
  console.log('💳 Creando tipos de pagos...');
  const tiposPagos = [
    { nombre_tipo: 'Efectivo' },
    { nombre_tipo: 'Tarjeta' },
    { nombre_tipo: 'Transferencia' },
    { nombre_tipo: 'Cheque' }
  ];

  const createdTipos = await TiposPagos.insertMany(tiposPagos);
  console.log('✅ Tipos de pagos creados');
  return createdTipos;
}

async function seedMetodosPago(tiposPagos: any[]) {
  console.log('💰 Creando métodos de pago...');
  const metodos = [
    { id_tipo_pago: tiposPagos[0]._id, nombre_metodo: 'Contado' },
    { id_tipo_pago: tiposPagos[1]._id, nombre_metodo: 'Contado' },
    { id_tipo_pago: tiposPagos[2]._id, nombre_metodo: 'Credito' },
    { id_tipo_pago: tiposPagos[3]._id, nombre_metodo: 'Credito' },
    { id_tipo_pago: tiposPagos[0]._id, nombre_metodo: 'Credito' },
    { id_tipo_pago: tiposPagos[1]._id, nombre_metodo: 'Credito' }
  ];

  const createdMetodos = await MetodoPago.insertMany(metodos);
  console.log('✅ Métodos de pago creados');
  return createdMetodos;
}

async function seedPagosFactura(facturas: any[]) {
  console.log('🧾 Creando pagos de facturas...');
  const pagos = [
    {
      factura: facturas[0]._id,
      monto: 1250.00,
      metodoPago: 'efectivo',
      fechaPago: new Date('2024-08-02'),
      observaciones: 'Pago completo en efectivo'
    },
    {
      factura: facturas[1]._id,
      monto: 1480.00,
      metodoPago: 'tarjeta',
      referenciaMetodo: 'TXN-123456',
      fechaPago: new Date('2024-08-03'),
      observaciones: 'Pago con tarjeta de crédito'
    },
    {
      factura: facturas[2]._id,
      monto: 3400.00,
      metodoPago: 'transferencia',
      referenciaMetodo: 'TRANS-789012',
      fechaPago: new Date('2024-08-04'),
      observaciones: 'Transferencia bancaria - mantenimiento completo'
    },
    {
      factura: facturas[3]._id,
      monto: 1200.00,
      metodoPago: 'efectivo',
      fechaPago: new Date('2024-08-05'),
      observaciones: 'Pago parcial - primer abono'
    },
    {
      factura: facturas[4]._id,
      monto: 2400.00,
      metodoPago: 'tarjeta',
      referenciaMetodo: 'TXN-345678',
      fechaPago: new Date('2024-08-06'),
      observaciones: 'Pago completo con tarjeta'
    },
    {
      factura: facturas[5]._id,
      monto: 9300.00,
      metodoPago: 'cheque',
      referenciaMetodo: 'CHQ-567890',
      fechaPago: new Date('2024-08-07'),
      observaciones: 'Pago con cheque empresarial - reparación mayor'
    }
  ];

  const createdPagos = await PagoFactura.insertMany(pagos);
  console.log('✅ Pagos de facturas creados');
  return createdPagos;
}

async function seedGarantias(reparaciones: any[], empleados: any[]) {
  console.log('🛡️ Creando garantías...');
  const garantias = [
    {
      id_reparacion: reparaciones[0]._id,
      id_empleadoInformacion: empleados[0]._id,
      fecha_inicio: new Date('2024-08-02'),
      fecha_expiracion: new Date('2024-11-02'),
      tipo_garantia: 'Mano de Obra',
      descripcion: 'Garantía de 3 meses en cambio de filtro de aceite'
    },
    {
      id_reparacion: reparaciones[1]._id,
      id_empleadoInformacion: empleados[1]._id,
      fecha_inicio: new Date('2024-08-03'),
      fecha_expiracion: new Date('2025-02-03'),
      tipo_garantia: 'Piezas y Mano de Obra',
      descripcion: 'Garantía de 6 meses en cambio de bujías'
    },
    {
      id_reparacion: reparaciones[2]._id,
      id_empleadoInformacion: empleados[2]._id,
      fecha_inicio: new Date('2024-08-04'),
      fecha_expiracion: new Date('2024-11-04'),
      tipo_garantia: 'Mano de Obra',
      descripcion: 'Garantía de 3 meses en mantenimiento preventivo'
    },
    {
      id_reparacion: reparaciones[3]._id,
      id_empleadoInformacion: empleados[3]._id,
      fecha_inicio: new Date('2024-08-05'),
      fecha_expiracion: new Date('2025-08-05'),
      tipo_garantia: 'Piezas y Mano de Obra',
      descripcion: 'Garantía de 1 año en cambio de pastillas de freno'
    },
    {
      id_reparacion: reparaciones[4]._id,
      id_empleadoInformacion: empleados[4]._id,
      fecha_inicio: new Date('2024-08-06'),
      fecha_expiracion: new Date('2025-02-06'),
      tipo_garantia: 'Pintura',
      descripcion: 'Garantía de 6 meses en trabajo de pintura'
    },
    {
      id_reparacion: reparaciones[5]._id,
      id_empleadoInformacion: empleados[5]._id,
      fecha_inicio: new Date('2024-08-07'),
      fecha_expiracion: new Date('2025-08-07'),
      tipo_garantia: 'Piezas y Mano de Obra',
      descripcion: 'Garantía de 1 año en reparación de transmisión'
    }
  ];

  const createdGarantias = await Garantia.insertMany(garantias);
  console.log('✅ Garantías creadas');
  return createdGarantias;
}

async function seedHistorialCompras(piezas: any[], suplidores: any[]) {
  console.log('📈 Creando historial de compras...');
  const historial = [
    {
      id_pieza: piezas[0]._id,
      id_suplidor: suplidores[0]._id,
      cantidad: 50,
      costo_unitario: 400.00,
      fecha_compra: new Date('2024-01-15')
    },
    {
      id_pieza: piezas[1]._id,
      id_suplidor: suplidores[1]._id,
      cantidad: 30,
      costo_unitario: 1150.00,
      fecha_compra: new Date('2024-02-10')
    },
    {
      id_pieza: piezas[2]._id,
      id_suplidor: suplidores[2]._id,
      cantidad: 60,
      costo_unitario: 250.00,
      fecha_compra: new Date('2024-03-05')
    },
    {
      id_pieza: piezas[3]._id,
      id_suplidor: suplidores[3]._id,
      cantidad: 20,
      costo_unitario: 2650.00,
      fecha_compra: new Date('2024-01-20')
    },
    {
      id_pieza: piezas[4]._id,
      id_suplidor: suplidores[4]._id,
      cantidad: 20,
      costo_unitario: 3200.00,
      fecha_compra: new Date('2024-02-25')
    },
    {
      id_pieza: piezas[5]._id,
      id_suplidor: suplidores[5]._id,
      cantidad: 50,
      costo_unitario: 650.00,
      fecha_compra: new Date('2024-04-01')
    }
  ];

  const createdHistorial = await HistorialCompra.insertMany(historial);
  console.log('✅ Historial de compras creado');
  return createdHistorial;
}

async function seedPiezasUsadas(piezas: any[], inspecciones: any[], reparaciones: any[]) {
  console.log('🔧 Creando registro de piezas usadas...');


  const piezasUsadas = [

    {
      id_pieza: piezas[0]._id,
      cantidad: 1,
      origen: 'reparacion',
      referencia: reparaciones[0]._id,
      precio_utilizado: 450.00
    },
    {
      id_pieza: piezas[2]._id,
      cantidad: 4,
      origen: 'reparacion',
      referencia: reparaciones[1]._id,
      precio_utilizado: 280.00
    },
    {
      id_pieza: piezas[0]._id,
      cantidad: 1,
      origen: 'reparacion',
      referencia: reparaciones[2]._id,
      precio_utilizado: 450.00
    },
    {
      id_pieza: piezas[5]._id,
      cantidad: 4,
      origen: 'reparacion',
      referencia: reparaciones[2]._id,
      precio_utilizado: 680.00
    },
    {
      id_pieza: piezas[2]._id,
      cantidad: 4,
      origen: 'reparacion',
      referencia: reparaciones[2]._id,
      precio_utilizado: 280.00
    },
    {
      id_pieza: piezas[1]._id,
      cantidad: 1,
      origen: 'reparacion',
      referencia: reparaciones[3]._id,
      precio_utilizado: 1200.00
    },
    {
      id_pieza: piezas[3]._id,
      cantidad: 1,
      origen: 'reparacion',
      referencia: reparaciones[5]._id,
      precio_utilizado: 2800.00
    },
    {
      id_pieza: piezas[4]._id,
      cantidad: 2,
      origen: 'reparacion',
      referencia: reparaciones[5]._id,
      precio_utilizado: 3500.00
    }
  ];

  const createdPiezasUsadas = await PiezaUsada.insertMany(piezasUsadas);
  console.log(`✅ ${createdPiezasUsadas.length} piezas usadas registradas`);

  console.log('🔗 Vinculando piezas usadas con reparaciones...');

  const piezasPorReparacion: { [key: string]: any[] } = {};
  createdPiezasUsadas.forEach(pieza => {
    const reparacionId = pieza.referencia.toString();
    if (!piezasPorReparacion[reparacionId]) {
      piezasPorReparacion[reparacionId] = [];
    }
    piezasPorReparacion[reparacionId].push(pieza._id);
  });

  for (const reparacion of reparaciones) {
    const reparacionId = reparacion._id.toString();
    if (piezasPorReparacion[reparacionId]) {
      await ReparacionVehiculo.findByIdAndUpdate(
        reparacion._id,
        { piezas_usadas: piezasPorReparacion[reparacionId] }
      );
    }
  }

  console.log('✅ Reparaciones actualizadas con piezas usadas');
  return createdPiezasUsadas;
}

async function seedSuplidorPiezaRelaciones(suplidores: any[], piezas: any[]) {
  console.log('🔗 Creando relaciones suplidor-pieza...');
  const relaciones = [
    { id_suplidor: suplidores[0]._id, id_pieza: piezas[0]._id },
    { id_suplidor: suplidores[0]._id, id_pieza: piezas[2]._id },
    { id_suplidor: suplidores[1]._id, id_pieza: piezas[1]._id },
    { id_suplidor: suplidores[1]._id, id_pieza: piezas[3]._id },
    { id_suplidor: suplidores[2]._id, id_pieza: piezas[2]._id },
    { id_suplidor: suplidores[2]._id, id_pieza: piezas[4]._id },
    { id_suplidor: suplidores[3]._id, id_pieza: piezas[3]._id },
    { id_suplidor: suplidores[3]._id, id_pieza: piezas[5]._id },
    { id_suplidor: suplidores[4]._id, id_pieza: piezas[4]._id },
    { id_suplidor: suplidores[4]._id, id_pieza: piezas[5]._id },
    { id_suplidor: suplidores[5]._id, id_pieza: piezas[0]._id },
    { id_suplidor: suplidores[5]._id, id_pieza: piezas[1]._id }
  ];

  const createdRelaciones = await SuplidorPiezaRelacion.insertMany(relaciones);
  console.log('✅ Relaciones suplidor-pieza creadas');
  return createdRelaciones;
}

async function seedUbicaciones(usuarios: any[]) {
  console.log('📍 Creando ubicaciones...');
  const ubicaciones = [
    {
      userId: usuarios[0]._id,
      location: { type: 'Point', coordinates: [-69.9312, 18.4861] },
      direccion: 'Oficina Central - Zona Colonial, Santo Domingo'
    },
    {
      userId: usuarios[1]._id,
      location: { type: 'Point', coordinates: [-69.9100, 18.4800] },
      direccion: 'Taller Principal - Zona Universitaria, Santo Domingo'
    },
    {
      userId: usuarios[0]._id,
      location: { type: 'Point', coordinates: [-69.9000, 18.5000] },
      direccion: 'Sucursal Santiago - Centro de Santiago'
    },
    {
      userId: usuarios[1]._id,
      location: { type: 'Point', coordinates: [-69.8500, 18.4500] },
      direccion: 'Almacén de Repuestos - Piantini, Santo Domingo'
    },
    {
      userId: usuarios[0]._id,
      location: { type: 'Point', coordinates: [-70.6500, 19.4500] },
      direccion: 'Oficina Regional - Puerto Plata'
    },
    {
      userId: usuarios[1]._id,
      location: { type: 'Point', coordinates: [-69.9500, 18.4700] },
      direccion: 'Centro de Servicio - Ensanche Piantini'
    }
  ];

  const createdUbicaciones = await Ubicacion.insertMany(ubicaciones);
  console.log('✅ Ubicaciones creadas');
  return createdUbicaciones;
}

async function seedDatabase() {
  try {
    console.log('🚀 Iniciando población de base de datos...');


    await connectDB();
    console.log('📡 Conectado a MongoDB');

    await clearDatabase();


    const usuarios = await seedUsuarios();
    const clientes = await seedClientes();
    const empleados = await seedEmpleados();
    const marcas = await seedMarcasVehiculos();
    const colores = await seedColores();
    const suplidores = await seedSuplidores();
    const tiposPagos = await seedTiposPagos();

    const modelos = await seedModelos(marcas);
    const vehiculos = await seedVehiculos(clientes, modelos, colores);
    const piezas = await seedPiezasInventario();
    const metodosPago = await seedMetodosPago(tiposPagos);
    const ubicaciones = await seedUbicaciones(usuarios);

    const recepciones = await seedRecepcionVehiculos(empleados, vehiculos);
    const recibos = await seedRecibos(recepciones);
    const historialCompras = await seedHistorialCompras(piezas, suplidores);
    const suplidorRelaciones = await seedSuplidorPiezaRelaciones(suplidores, piezas);

    const inspecciones = await seedInspecciones(recibos, empleados, piezas);
    const reparaciones = await seedReparaciones(inspecciones, empleados, piezas);

    const facturas = await seedFacturas(reparaciones);
    const pagosFactura = await seedPagosFactura(facturas);
    const garantias = await seedGarantias(reparaciones, empleados);
    const piezasUsadas = await seedPiezasUsadas(piezas, inspecciones, reparaciones);

    console.log('\n🎉 ¡Base de datos poblada exitosamente!');
    console.log('📊 Resumen de datos creados:');
    console.log(`   👥 Usuarios: ${usuarios.length}`);
    console.log(`   👤 Clientes: ${clientes.length}`);
    console.log(`   👷 Empleados: ${empleados.length}`);
    console.log(`   🚗 Marcas: ${marcas.length}`);
    console.log(`   🚙 Modelos: ${modelos.length}`);
    console.log(`   🎨 Colores: ${colores.length}`);
    console.log(`   🚗 Vehículos: ${vehiculos.length}`);
    console.log(`   🏭 Suplidores: ${suplidores.length}`);
    console.log(`   🔧 Piezas: ${piezas.length}`);
    console.log(`   📝 Recepciones: ${recepciones.length}`);
    console.log(`   🧾 Recibos: ${recibos.length}`);
    console.log(`   🔍 Inspecciones: ${inspecciones.length}`);
    console.log(`   🔧 Reparaciones: ${reparaciones.length}`);
    console.log(`   💰 Facturas: ${facturas.length}`);
    console.log(`   💳 Tipos de Pago: ${tiposPagos.length}`);
    console.log(`   💰 Métodos de Pago: ${metodosPago.length}`);
    console.log(`   🧾 Pagos de Facturas: ${pagosFactura.length}`);
    console.log(`   🛡️ Garantías: ${garantias.length}`);
    console.log(`   📈 Historial Compras: ${historialCompras.length}`);
    console.log(`   🔧 Piezas Usadas: ${piezasUsadas.length}`);
    console.log(`   🔗 Relaciones Suplidor-Pieza: ${suplidorRelaciones.length}`);
    console.log(`   📍 Ubicaciones: ${ubicaciones.length}`);

    console.log('\n✨ La base de datos está lista para usar!');

  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('📡 Desconectado de MongoDB');
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

export default seedDatabase;

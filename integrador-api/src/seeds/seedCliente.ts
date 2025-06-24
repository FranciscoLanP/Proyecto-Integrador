import type { ICliente } from '../models/cliente'
import { Cliente } from '../models/cliente'
import type { SeedContext } from './seedContext'

export const seedCliente = async (context: SeedContext): Promise<void> => {
  try {
    await Cliente.deleteMany({})

    const clientesData: Partial<ICliente>[] = [
      {
        cedula: '001-1234567-8',
        rnc: '131-1234567-8',
        nombre: 'Juan Pérez',
        numero_telefono: '809-555-1234',
        correo: 'juan.perez@example.com',
        tipo_cliente: 'Individual',
        id_barrio: context.barrio!._id
      },
      {
        cedula: '002-7654321-0',
        nombre: 'María García',
        numero_telefono: '809-555-5678',
        correo: 'maria.garcia@example.com',
        tipo_cliente: 'Empresarial',
        id_barrio: context.barrio!._id
      },
      {
        cedula: '003-2468101-2',
        nombre: 'Seguros Unidas',
        numero_telefono: '809-555-9012',
        correo: 'contacto@segurosunidas.com',
        tipo_cliente: 'Aseguradora',
        id_barrio: context.barrio!._id
      },
      {
        cedula: '004-1357913-4',
        nombre: 'Gobierno Provincial',
        numero_telefono: '809-555-3456',
        correo: 'info@gobprov.gov.do',
        tipo_cliente: 'Gobierno',
        id_barrio: context.barrio!._id
      }
    ]

    const clientes = await Cliente.insertMany(clientesData)
    console.log('Clientes creados:', clientes.map(c => c._id.toString()))
    context.cliente = clientes[0] as ICliente

  } catch (error) {
    console.error('Error al sembrar clientes:', error)
    throw error
  }
}

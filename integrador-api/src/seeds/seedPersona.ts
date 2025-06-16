
import { ICliente, Cliente } from '../models/cliente'
import type { SeedContext } from './seedContext'

export const seedPersona = async (context: SeedContext): Promise<void> => {
  try {
    await Cliente.deleteMany({})

    const personasData: Partial<ICliente>[] = [
      {
        cedula: '001-1234567-8',
        rnc: '131-1234567-8',
        nombre: 'Juan Pérez',
        numero_telefono: '809-555-1234',
        correo: 'juan.perez@example.com',
        id_barrio: context.barrio!._id
      },
      {
        cedula: '002-7654321-0',
        nombre: 'María García',
        numero_telefono: '809-555-5678',
        correo: 'maria.garcia@example.com',
        id_barrio: context.barrio!._id
      }
    ]
    const clientes = await Cliente.insertMany(personasData)
    console.log('Personas created:', clientes.map((p) => p._id))
    context.cliente = clientes[0] as ICliente
  } catch (error) {
    console.error('Error seeding Cliente:', error)
    throw error
  }
}

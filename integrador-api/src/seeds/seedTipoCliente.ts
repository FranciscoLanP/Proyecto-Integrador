import { TipoCliente, type ITipoCliente } from '../models/clienteTipo'
import type { SeedContext } from './seedContext'

export const seedTipoCliente = async (context: SeedContext): Promise<void> => {
  try {
    const tiposData: Partial<ITipoCliente>[] = [
      { nombre_tipo_cliente: 'Particular' },
      { nombre_tipo_cliente: 'Empresa' }
    ]
    const tipos = await TipoCliente.insertMany(tiposData)
    console.log('TipoCliente created:', tipos.map((t) => t._id))
    context.tipoCliente = tipos[0] as ITipoCliente
  } catch (error) {
    console.error('Error seeding TipoCliente:', error)
    throw error
  }
}

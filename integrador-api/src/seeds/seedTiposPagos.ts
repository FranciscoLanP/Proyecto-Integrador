
import {TiposPagos,  type ITiposPagos } from '../models/tiposPagos'
import type { SeedContext } from './seedContext'

export const seedTiposPagos = async (context: SeedContext): Promise<void> => {
  try {
    const tiposData: Partial<ITiposPagos>[] = [
      { nombre_tipo: 'Efectivo' },
      { nombre_tipo: 'Tarjeta' },
      { nombre_tipo: 'Transferencia' }
    ]
    const tipos = await TiposPagos.insertMany(tiposData)
    console.log('TiposPagos created:', tipos.map((t) => t._id))
    context.tiposPagos = tipos[0] as ITiposPagos
  } catch (error) {
    console.error('Error seeding TiposPagos:', error)
    throw error
  }
}

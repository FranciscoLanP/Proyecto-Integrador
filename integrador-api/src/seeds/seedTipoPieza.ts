import  {TipoPieza, type ITipoPieza } from '../models/tipoPieza'
import type { SeedContext } from './seedContext'

export const seedTipoPieza = async (context: SeedContext): Promise<void> => {
  try {
    const tiposData: Partial<ITipoPieza>[] = [
      { nombre_tipo: 'Filtro' },
      { nombre_tipo: 'Aceite' },
      { nombre_tipo: 'Pastillas de freno' }
    ]
    const tipos = await TipoPieza.insertMany(tiposData)
    console.log('TipoPieza created:', tipos.map((t) => t._id))
    context.tipoPieza = tipos[0] as ITipoPieza
  } catch (error) {
    console.error('Error seeding TipoPieza:', error)
    throw error
  }
}

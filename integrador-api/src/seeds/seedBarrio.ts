import { Barrio, type IBarrio } from '../models/barrio'
import type { SeedContext } from './seedContext'

export const seedBarrio = async (context: SeedContext): Promise<void> => {
  try {
    const barriosData: Partial<IBarrio>[] = [
      { nombre_barrio: 'Barrio El Progreso', id_distrito: context.distrito!._id },
      { nombre_barrio: 'Barrio Santa María', id_distrito: context.distrito!._id }
    ]
    const barrios = await Barrio.insertMany(barriosData)
    console.log('Barrios created:', barrios.map((b) => b._id))
    context.barrio = barrios[0] as IBarrio
  } catch (error) {
    console.error('Error seeding Barrio:', error)
    throw error
  }
}

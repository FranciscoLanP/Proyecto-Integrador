import  { Sector, type ISector } from '../models/sector'
import type { SeedContext } from './seedContext'

export const seedSector = async (context: SeedContext): Promise<void> => {
  try {
    const sectoresData: Partial<ISector>[] = [
      { nombre_sector: 'Sector Norte', id_municipio: context.municipio!._id },
      { nombre_sector: 'Sector Sur', id_municipio: context.municipio!._id }
    ]
    const sectores = await Sector.insertMany(sectoresData)
    console.log('Sectores created:', sectores.map((s) => s._id))
    context.sector = sectores[0] as ISector
  } catch (error) {
    console.error('Error seeding Sector:', error)
    throw error
  }
}

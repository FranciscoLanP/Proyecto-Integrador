import  { Distrito, type IDistrito } from '../models/distrito'
import type { SeedContext } from './seedContext'

export const seedDistrito = async (context: SeedContext): Promise<void> => {
  try {
    const distritosData: Partial<IDistrito>[] = [
      { nombre_distrito: 'Distrito Centro', id_sector: context.sector!._id }
    ]
    const [distrito] = await Distrito.insertMany(distritosData)
    console.log('Distrito created:', distrito._id)
    context.distrito = distrito as IDistrito
  } catch (error) {
    console.error('Error seeding Distrito:', error)
    throw error
  }
}

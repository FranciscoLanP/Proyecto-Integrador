import  { Municipio, type IMunicipio } from '../models/municipio'
import type { SeedContext } from './seedContext'

export const seedMunicipio = async (context: SeedContext): Promise<void> => {
  try {
    const municipiosData: Partial<IMunicipio>[] = [
      {
        nombre_municipio: 'Moca',
        id_provincia: context.provincia!._id
      }
    ]
    const [municipio] = await Municipio.insertMany(municipiosData)
    console.log('Municipio created:', municipio._id)
    context.municipio = municipio as IMunicipio
  } catch (error) {
    console.error('Error seeding Municipio:', error)
    throw error
  }
}

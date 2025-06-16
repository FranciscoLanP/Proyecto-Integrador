import  { ColoresDatos, type IColoresDatos } from '../models/coloresDatos'
import type { SeedContext } from './seedContext'

export const seedColoresDatos = async (context: SeedContext): Promise<void> => {
  try {
    const coloresData: Partial<IColoresDatos>[] = [
      { nombre_color: 'Rojo' },
      { nombre_color: 'Azul' },
      { nombre_color: 'Negro' },
      { nombre_color: 'Blanco' }
    ]
    const colores = await ColoresDatos.insertMany(coloresData)
    console.log('ColoresDatos created:', colores.map((c) => c._id))
    context.coloresDatos = colores[0] as IColoresDatos
  } catch (error) {
    console.error('Error seeding ColoresDatos:', error)
    throw error
  }
}

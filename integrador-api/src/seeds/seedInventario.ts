import  {Inventario, type IInventario } from '../models/inventario'
import type { SeedContext } from './seedContext'

export const seedInventario = async (context: SeedContext): Promise<void> => {
  try {
    const inventariosData: Partial<IInventario>[] = [
      {
        id_pieza: context.piezaInventario!._id,
        cantidad_disponible: 20,
        costo_promedio: 150
      }
    ]
    const [inv] = await Inventario.insertMany(inventariosData)
    console.log('Inventario created:', inv._id)
    context.inventario = inv as IInventario
  } catch (error) {
    console.error('Error seeding Inventario:', error)
    throw error
  }
}

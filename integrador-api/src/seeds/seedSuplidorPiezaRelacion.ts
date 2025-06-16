import  { SuplidorPiezaRelacion, type ISuplidorPiezaRelacion } from '../models/suplidorPiezaRelacion'
import type { SeedContext } from './seedContext'

export const seedSuplidorPiezaRelacion = async (context: SeedContext): Promise<void> => {
  try {
    const relacionesData: Partial<ISuplidorPiezaRelacion>[] = [
      {
        id_suplidor: context.suplidorPieza!._id,
        id_pieza: context.piezaInventario!._id
      }
    ]
    const [rel] = await SuplidorPiezaRelacion.insertMany(relacionesData)
    console.log('SuplidorPiezaRelacion created:', rel._id)
    context.suplidorPiezaRelacion = rel as ISuplidorPiezaRelacion
  } catch (error) {
    console.error('Error seeding SuplidorPiezaRelacion:', error)
    throw error
  }
}

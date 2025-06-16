import { SuplidorPieza, type ISuplidorPieza } from '../models/suplidorPieza'
import type { SeedContext } from './seedContext'

export const seedSuplidorPieza = async (context: SeedContext): Promise<void> => {
  try {
    const suplidoresData: Partial<ISuplidorPieza>[] = [
      { id_cliente: context.cliente!._id }
    ]
    const [suplidor] = await SuplidorPieza.insertMany(suplidoresData)
    console.log('SuplidorPieza created:', suplidor._id)
    context.suplidorPieza = suplidor as ISuplidorPieza
  } catch (error) {
    console.error('Error seeding SuplidorPieza:', error)
    throw error
  }
}

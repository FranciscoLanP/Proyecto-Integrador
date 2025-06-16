import { PiezaInventario, type IPiezaInventario } from '../models/piezaInventario'
import type { SeedContext } from './seedContext'

export const seedPiezaInventario = async (context: SeedContext): Promise<void> => {
  try {
    const piezasData: Partial<IPiezaInventario>[] = [
      {
        serial: 'PIEZA-0001',
        nombre_pieza: 'Filtro de aceite',
        id_tipo_pieza: context.tipoPieza!._id,
        costo: 150,
        id_suplidor: context.cliente!._id
      }
    ]
    const [pieza] = await PiezaInventario.insertMany(piezasData)
    console.log('PiezaInventario created:', pieza._id)
    context.piezaInventario = pieza as IPiezaInventario
  } catch (error) {
    console.error('Error seeding PiezaInventario:', error)
    throw error
  }
}

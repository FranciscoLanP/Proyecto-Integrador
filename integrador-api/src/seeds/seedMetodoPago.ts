
import  {MetodoPago, type IMetodoPago } from '../models/metodoPago'
import type { SeedContext } from './seedContext'

export const seedMetodoPago = async (context: SeedContext): Promise<void> => {
  try {
    const metodosData: Partial<IMetodoPago>[] = [
      { id_metodo_pago: 1, nombre_metodo: 'Pago en efectivo', id_tipo_pago: context.tiposPagos!._id },
      { id_metodo_pago: 2, nombre_metodo: 'Pago con tarjeta', id_tipo_pago: context.tiposPagos!._id }
    ]
    const metodos = await MetodoPago.insertMany(metodosData)
    console.log('MetodoPago created:', metodos.map((m) => m._id))
    context.metodoPago = metodos[0] as IMetodoPago
  } catch (error) {
    console.error('Error seeding MetodoPago:', error)
    throw error
  }
}

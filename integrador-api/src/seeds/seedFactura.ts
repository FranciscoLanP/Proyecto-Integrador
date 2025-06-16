import  { Factura,type IFactura } from '../models/factura'
import type { SeedContext } from './seedContext'

export const seedFactura = async (context: SeedContext): Promise<void> => {
  try {
    if (!context.metodoPago) {
      throw new Error('Método de pago no encontrado en el contexto de seed')
    }

    const facturasData: Partial<IFactura>[] = [
      {
        id_reparacion:   context.reparacionVehiculo!._id,
        id_empleado:     context.empleadoInformacion!._id,
        sub_total:       2500,
        descuento:       0,
        total:           2500,
        id_metodo_pago:  context.metodoPago!._id as any
      }
    ]

    const [fac] = await Factura.insertMany(facturasData)
    console.log('Factura created:', fac._id)
    context.factura = fac as IFactura
  } catch (error) {
    console.error('Error seeding Factura:', error)
    throw error
  }
}

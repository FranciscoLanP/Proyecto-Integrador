import  {Garantia, type IGarantia } from '../models/garantia'
import type { SeedContext } from './seedContext'

export const seedGarantia = async (context: SeedContext): Promise<void> => {
  try {
    const garantiasData: Partial<IGarantia>[] = [
      {
        id_reparacion: context.reparacionVehiculo!._id,
        id_empleado: context.empleadoInformacion!._id,
        fecha_expiracion: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180), 
        tipo_garantia: 'Garantía mecánica',
        descripcion: 'Cobertura de reparaciones bajo condiciones normales'
      }
    ]
    const [gar] = await Garantia.insertMany(garantiasData)
    console.log('Garantia created:', gar._id)
    context.garantia = gar as IGarantia
  } catch (error) {
    console.error('Error seeding Garantia:', error)
    throw error
  }
}

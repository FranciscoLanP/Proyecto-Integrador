import  {InspeccionVehiculo, type IInspeccionVehiculo } from '../models/inspeccionVehiculo'
import type { SeedContext } from './seedContext'

export const seedInspeccionVehiculo = async (context: SeedContext): Promise<void> => {
  try {
    const inspeccionesData: Partial<IInspeccionVehiculo>[] = [
      {
        id_recibo: context.reciboVehiculo!._id,
        id_empleado: context.empleadoInformacion!._id,
        comentario: 'Inspección inicial completa',
        tiempo_estimado: 2,
        costo_mano_obra: 500,
        costo_aproximado: 2000,
        resultado: 'Frenos y aceite requeridos'
      }
    ]
    const [insp] = await InspeccionVehiculo.insertMany(inspeccionesData)
    console.log('InspeccionVehiculo created:', insp._id)
    context.inspeccionVehiculo = insp as IInspeccionVehiculo
  } catch (error) {
    console.error('Error seeding InspeccionVehiculo:', error)
    throw error
  }
}

import { ReparacionVehiculo, type IReparacionVehiculo } from '../models/reparacionVehiculo'
import type { SeedContext } from './seedContext'

export const seedReparacionVehiculo = async (context: SeedContext): Promise<void> => {
  try {
    const reparacionesData: Partial<IReparacionVehiculo>[] = [
      {
        id_inspeccion: context.inspeccionVehiculo!._id,
        id_empleadoInformacion: context.empleadoInformacion!._id,
        descripcion: 'Cambio de pastillas y aceite',
        costo_total: 2500
      }
    ]
    const [rep] = await ReparacionVehiculo.insertMany(reparacionesData)
    console.log('ReparacionVehiculo created:', rep._id)
    context.reparacionVehiculo = rep as IReparacionVehiculo
  } catch (error) {
    console.error('Error seeding ReparacionVehiculo:', error)
    throw error
  }
}

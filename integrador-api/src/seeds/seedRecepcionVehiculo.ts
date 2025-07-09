import { RecepcionVehiculo, type IRecepcionVehiculo } from '../models/recepcionVehiculo'
import type { SeedContext } from './seedContext'

export const seedRecepcionVehiculo = async (context: SeedContext): Promise<void> => {
  try {
    const recepcionesData: Partial<IRecepcionVehiculo>[] = [
      {
        id_empleadoInformacion: context.empleadoInformacion!._id,
        id_vehiculo: context.vehiculoDatos!._id,
        comentario: 'Vehículo ingresado con problema en frenos',
        problema_reportado: 'Frenos desgastados'
      }
    ]
    const [recepcion] = await RecepcionVehiculo.insertMany(recepcionesData)
    console.log('RecepcionVehiculo created:', recepcion._id)
    context.recepcionVehiculo = recepcion as IRecepcionVehiculo
  } catch (error) {
    console.error('Error seeding RecepcionVehiculo:', error)
    throw error
  }
}

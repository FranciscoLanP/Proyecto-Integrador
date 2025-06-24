import  {VehiculoDatos, type IVehiculoDatos } from '../models/vehiculoDatos'
import type { SeedContext } from './seedContext'

export const seedVehiculoDatos = async (context: SeedContext): Promise<void> => {
  try {
    const vehiculosData: Partial<IVehiculoDatos>[] = [
      {
        chasis: 'XYZ1234567890',
        id_cliente: context.cliente!._id,
        id_modelo: context.modelosDatos!._id,
        id_color: context.coloresDatos!._id
      }
    ]
    const [vehiculo] = await VehiculoDatos.insertMany(vehiculosData)
    console.log('VehiculoDatos created:', vehiculo._id)
    context.vehiculoDatos = vehiculo as IVehiculoDatos
  } catch (error) {
    console.error('Error seeding VehiculoDatos:', error)
    throw error
  }
}

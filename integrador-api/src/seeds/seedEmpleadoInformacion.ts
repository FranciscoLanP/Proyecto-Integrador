import { EmpleadoInformacion, type IEmpleadoInformacion } from '../models/empleadoInformacion'
import type { SeedContext } from './seedContext'

export const seedEmpleadoInformacion = async (context: SeedContext): Promise<void> => {
  try {
    const empleadosData: Partial<IEmpleadoInformacion>[] = [
      {
        id_cliente: context.cliente!._id,
        id_tipo_empleado: context.tipoEmpleado!._id
      }
    ]
    const [empleado] = await EmpleadoInformacion.insertMany(empleadosData)
    console.log('EmpleadoInformacion created:', empleado._id)
    context.empleadoInformacion = empleado as IEmpleadoInformacion
  } catch (error) {
    console.error('Error seeding EmpleadoInformacion:', error)
    throw error
  }
}

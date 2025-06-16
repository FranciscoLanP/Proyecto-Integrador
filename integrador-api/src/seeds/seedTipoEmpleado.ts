import { TipoEmpleado,  type ITipoEmpleado } from '../models/tipoEmpleado'
import type { SeedContext } from './seedContext'

export const seedTipoEmpleado = async (context: SeedContext): Promise<void> => {
  try {
    const tiposData: Partial<ITipoEmpleado>[] = [
      { nombre_tipo_empleado: 'Mecánico' },
      { nombre_tipo_empleado: 'Administrador' }
    ]
    const tipos = await TipoEmpleado.insertMany(tiposData)
    console.log('TipoEmpleado created:', tipos.map((t) => t._id))
    context.tipoEmpleado = tipos[0] as ITipoEmpleado
  } catch (error) {
    console.error('Error seeding TipoEmpleado:', error)
    throw error
  }
}

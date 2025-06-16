import { ModelosDatos,  type IModelosDatos } from '../models/modelosDatos'
import type { SeedContext } from './seedContext'

export const seedModelosDatos = async (context: SeedContext): Promise<void> => {
  try {
    const modelosData: Partial<IModelosDatos>[] = [
      { nombre_modelo: 'Corolla', id_marca: context.marcaVehiculo!._id },
      { nombre_modelo: 'Camaro', id_marca: context.marcaVehiculo!._id }
    ]
    const modelos = await ModelosDatos.insertMany(modelosData)
    console.log('ModelosDatos created:', modelos.map((m) => m._id))
    context.modelosDatos = modelos[0] as IModelosDatos
  } catch (error) {
    console.error('Error seeding ModelosDatos:', error)
    throw error
  }
}

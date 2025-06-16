import { ClienteInformacion, type IClienteInformacion } from '../models/clienteInformacion'
import type { SeedContext } from './seedContext'

export const seedClienteInformacion = async (context: SeedContext): Promise<void> => {
  try {
    const clientesData: Partial<IClienteInformacion>[] = [
      { id_cliente: context.cliente!._id, id_tipo_cliente: context.tipoCliente!._id }
    ]
    const [cliente] = await ClienteInformacion.insertMany(clientesData)
    console.log('ClienteInformacion created:', cliente._id)
    context.clienteInformacion = cliente as IClienteInformacion
  } catch (error) {
    console.error('Error seeding ClienteInformacion:', error)
    throw error
  }
}

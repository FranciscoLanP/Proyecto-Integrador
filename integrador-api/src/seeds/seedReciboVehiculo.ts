import { ReciboVehiculo, type IReciboVehiculo } from '../models/reciboVehiculo'
import type { SeedContext } from './seedContext'

export const seedReciboVehiculo = async (context: SeedContext): Promise<void> => {
    try {
        const recibosData: Partial<IReciboVehiculo>[] = [
            {
                id_recepcion: context.recepcionVehiculo!._id,
                observaciones: 'Cliente espera factura y seguimiento'
            }
        ]
        const [recibo] = await ReciboVehiculo.insertMany(recibosData)
        console.log('ReciboVehiculo created:', recibo._id)
        context.reciboVehiculo = recibo as IReciboVehiculo
    } catch (error) {
        console.error('Error seeding ReciboVehiculo:', error)
        throw error
    }
}

import { MarcaVehiculo, type IMarcaVehiculo } from '../models/marcaVehiculo'
import type { SeedContext } from './seedContext'

export const seedMarcaVehiculo = async (context: SeedContext): Promise<void> => {
    try {
        const marcasData: Partial<IMarcaVehiculo>[] = [
            { nombre_marca: 'Toyota' },
            { nombre_marca: 'Chevrolet' },
            { nombre_marca: 'Ford' }
        ]
        const marcas = await MarcaVehiculo.insertMany(marcasData)
        console.log('MarcaVehiculo created:', marcas.map((m) => m._id))
        context.marcaVehiculo = marcas[0] as IMarcaVehiculo
    } catch (error) {
        console.error('Error seeding MarcaVehiculo:', error)
        throw error
    }
}

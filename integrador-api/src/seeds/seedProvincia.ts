import  { Provincia, type IProvincia } from '../models/provincia'
import type { SeedContext } from './seedContext'

export const seedProvincia = async (context: SeedContext): Promise<void> => {
    try {
        const provinciasData: Partial<IProvincia>[] = [
            { nombre_provincia: 'Espaillat' }
        ]
        const [provincia] = await Provincia.insertMany(provinciasData)
        console.log('Provincia created:', provincia._id)
        context.provincia = provincia as IProvincia
    } catch (error) {
        console.error('Error seeding Provincia:', error)
        throw error
    }
}

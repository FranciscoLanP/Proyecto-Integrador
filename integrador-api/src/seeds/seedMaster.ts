import mongoose from 'mongoose'
import type { SeedContext } from './seedContext'
import { seedProvincia } from './seedProvincia'
import { seedMunicipio } from './seedMunicipio'
import { seedSector } from './seedSector'
import { seedDistrito } from './seedDistrito'
import { seedBarrio } from './seedBarrio'
import { seedColoresDatos } from './seedColoresDatos'
import { seedMarcaVehiculo } from './seedMarcaVehiculo'
import { seedModelosDatos } from './seedModelosDatos'
import { seedVehiculoDatos } from './seedVehiculoDatos'
import { seedTipoEmpleado } from './seedTipoEmpleado'
import { seedEmpleadoInformacion } from './seedEmpleadoInformacion'
import { seedUsuarios } from './seedUsuarios'
import { seedTipoPieza } from './seedTipoPieza'
import { seedPiezaInventario } from './seedPiezaInventario'
import { seedSuplidorPieza } from './seedSuplidorPieza'
import { seedSuplidorPiezaRelacion } from './seedSuplidorPiezaRelacion'
import { seedInventario } from './seedInventario'
import { seedTiposPagos } from './seedTiposPagos'
import { seedMetodoPago } from './seedMetodoPago'
import { seedRecepcionVehiculo } from './seedRecepcionVehiculo'
import { seedReciboVehiculo } from './seedReciboVehiculo'
import { seedInspeccionVehiculo } from './seedInspeccionVehiculo'
import { seedReparacionVehiculo } from './seedReparacionVehiculo'
import { seedGarantia } from './seedGarantia'
import { seedFactura } from './seedFactura'
import { seedCliente } from './seedCliente'

const runSeeds = async (): Promise<void> => {
  await mongoose.connect('mongodb://localhost:27017/test')

  const context: SeedContext = {}

  try {
    await seedProvincia(context)
    await seedMunicipio(context)
    await seedSector(context)
    await seedDistrito(context)
    await seedBarrio(context)
    await seedCliente(context)
    await seedColoresDatos(context)
    await seedMarcaVehiculo(context)
    await seedModelosDatos(context)
    await seedVehiculoDatos(context)
    await seedTipoEmpleado(context)
    await seedEmpleadoInformacion(context)
    await seedUsuarios(context)
    await seedTipoPieza(context)
    await seedPiezaInventario(context)
    await seedSuplidorPieza(context)
    await seedSuplidorPiezaRelacion(context)
    await seedInventario(context)
    await seedTiposPagos(context)
    await seedMetodoPago(context)
    await seedRecepcionVehiculo(context)
    await seedReciboVehiculo(context)
    await seedInspeccionVehiculo(context)
    await seedReparacionVehiculo(context)
    await seedGarantia(context)
    await seedFactura(context)

    console.log('All seeds executed successfully.')
  } catch (error) {
    console.error('Error running seed scripts:', error)
  } finally {
    await mongoose.disconnect()
  }
}

runSeeds()

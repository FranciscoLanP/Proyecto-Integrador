import type { IProvincia } from '../models/provincia'
import type { IMunicipio } from '../models/municipio'
import type { ISector } from '../models/sector'
import type { IDistrito } from '../models/distrito'
import type { IBarrio } from '../models/barrio'
import type { IColoresDatos } from '../models/coloresDatos'
import type { IMarcaVehiculo } from '../models/marcaVehiculo'
import type { IModelosDatos } from '../models/modelosDatos'
import type { IVehiculoDatos } from '../models/vehiculoDatos'
import type { ITipoEmpleado } from '../models/tipoEmpleado'
import type { IEmpleadoInformacion } from '../models/empleadoInformacion'
import type { IUsuarios } from '../models/usuarios'
import type { ITipoPieza } from '../models/tipoPieza'
import type { IPiezaInventario } from '../models/piezaInventario'
import type { ISuplidorPieza } from '../models/suplidorPieza'
import type { ISuplidorPiezaRelacion } from '../models/suplidorPiezaRelacion'
import type { IInventario } from '../models/inventario'
import type { ITiposPagos } from '../models/tiposPagos'
import type { IMetodoPago } from '../models/metodoPago'
import type { IRecepcionVehiculo } from '../models/recepcionVehiculo'
import type { IReciboVehiculo } from '../models/reciboVehiculo'
import type { IInspeccionVehiculo } from '../models/inspeccionVehiculo'
import type { IReparacionVehiculo } from '../models/reparacionVehiculo'
import type { IGarantia } from '../models/garantia'
import type { IFactura } from '../models/factura'
import { ICliente } from '../models/cliente'

export interface SeedContext {
  provincia?: IProvincia
  municipio?: IMunicipio
  sector?: ISector
  distrito?: IDistrito
  barrio?: IBarrio
  cliente?: ICliente
  coloresDatos?: IColoresDatos
  marcaVehiculo?: IMarcaVehiculo
  modelosDatos?: IModelosDatos
  vehiculoDatos?: IVehiculoDatos
  tipoEmpleado?: ITipoEmpleado
  empleadoInformacion?: IEmpleadoInformacion
  usuarios?: IUsuarios
  tipoPieza?: ITipoPieza
  piezaInventario?: IPiezaInventario
  suplidorPieza?: ISuplidorPieza
  suplidorPiezaRelacion?: ISuplidorPiezaRelacion
  inventario?: IInventario
  tiposPagos?: ITiposPagos
  metodoPago?: IMetodoPago
  recepcionVehiculo?: IRecepcionVehiculo
  reciboVehiculo?: IReciboVehiculo
  inspeccionVehiculo?: IInspeccionVehiculo
  reparacionVehiculo?: IReparacionVehiculo
  garantia?: IGarantia
  factura?: IFactura
}

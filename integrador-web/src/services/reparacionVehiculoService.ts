import { createCrudService } from './crudService';

export interface ReparacionVehiculo {
  _id?: string;
  id_inspeccion: string;
  id_empleadoInformacion: string;
  fecha_inicio: string;
  fecha_fin?: string;
  descripcion: string;
  costo_total?: number;
  piezas_usadas?: Array<{
    id_pieza: string;
    cantidad: number;
  }>;
}

export const reparacionVehiculoService = createCrudService<ReparacionVehiculo>('reparacionvehiculos');

// Servicios adicionales para los dropdowns
export const inspeccionVehiculoService = createCrudService<any>('inspeccionvehiculos');
export const empleadoInformacionService = createCrudService<any>('empleadoinformaciones');
export const piezaInventarioService = createCrudService<any>('piezasinventario');
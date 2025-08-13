import { createCrudService } from './crudService';

export interface EmpleadoTrabajo {
  id_empleado: string;
  descripcion_trabajo: string;
}

export interface ReparacionVehiculo {
  _id?: string;
  id_inspeccion: string;
  empleados_trabajos?: EmpleadoTrabajo[];
  fecha_inicio: string;
  fecha_fin?: string;
  descripcion: string;
  costo_total?: number;
  piezas_usadas?: Array<{
    id_pieza: string;
    cantidad: number;
  }>;
  id_empleadoInformacion?: string;
}

export const reparacionVehiculoService = createCrudService<ReparacionVehiculo>('reparacionvehiculos');

export const inspeccionVehiculoService = createCrudService<any>('inspeccionvehiculos');
export const empleadoInformacionService = createCrudService<any>('empleadoinformaciones');
export const piezaInventarioService = createCrudService<any>('piezasinventario');
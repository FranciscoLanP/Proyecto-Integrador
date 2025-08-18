import { createCrudService } from './crudService';

export interface EmpleadoTrabajo {
  id_empleado: string;
  descripcion_trabajo: string;
}

export interface ReparacionVehiculo {
  _id?: string;
  id_inspeccion: string;
  empleados_trabajos?: EmpleadoTrabajo[];
  fecha_inicio?: string;
  fecha_fin?: string;
  descripcion: string;
  piezas_usadas?: Array<{
    _id: string;
    id_pieza: {
      _id: string;
      nombre_pieza: string;
      costo_promedio: number;
      precio?: number;
    };
    cantidad: number;
    origen: 'inspeccion' | 'reparacion';
    referencia: string;
    precio_utilizado?: number;
  }>;
  id_empleadoInformacion?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export const reparacionVehiculoService = createCrudService<ReparacionVehiculo>('reparacionvehiculos');

export const inspeccionVehiculoService = createCrudService<any>('inspeccionvehiculos');
export const empleadoInformacionService = createCrudService<any>('empleadoinformaciones');
export const piezaInventarioService = createCrudService<any>('piezasinventario');
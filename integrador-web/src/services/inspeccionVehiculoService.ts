import { createCrudService } from './crudService';

export interface PiezaSugerida {
  id_pieza: string;
  nombre_pieza: string;
  cantidad: number;
  precio_unitario: number;
}

export interface InspeccionVehiculo {
  _id?: string;
  id_recibo: string;
  id_empleadoInformacion: string;
  fecha_inspeccion: string;
  comentario?: string;
  tiempo_estimado?: number;
  costo_mano_obra?: number;
  costo_aproximado?: number;
  resultado?: string;
  piezas_sugeridas?: PiezaSugerida[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export const inspeccionVehiculoService = createCrudService<InspeccionVehiculo>('inspeccionvehiculos');

export const reciboVehiculoService = createCrudService<any>('recibosvehiculos');
export const empleadoInformacionService = createCrudService<any>('empleadoinformaciones');
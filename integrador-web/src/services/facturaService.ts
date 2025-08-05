import { createCrudService } from './crudService';

export interface Factura {
  _id?: string;
  id_reparacion: string;
  fecha_emision: string;
  total: number;
  metodo_pago: string;
  detalles?: string;
  emitida?: boolean;
  descuento_porcentaje?: number;
}

export const facturaService = createCrudService<Factura>('facturas');

// Servicios adicionales para los dropdowns
export const reparacionVehiculoService = createCrudService<any>('reparacionvehiculos');
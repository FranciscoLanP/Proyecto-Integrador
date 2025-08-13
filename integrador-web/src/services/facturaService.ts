import { createCrudService } from './crudService';

export interface MetodoPago {
  tipo: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Cheque';
  monto: number;
  referencia?: string;
}

export interface Factura {
  _id?: string;
  id_reparacion: string;
  fecha_emision: string;
  total: number;
  tipo_factura: 'Contado' | 'Credito';
  metodos_pago: MetodoPago[];
  detalles?: string;
  emitida?: boolean;
  descuento_porcentaje?: number;
  metodo_pago?: string;
}

export const facturaService = createCrudService<Factura>('facturas');

export const reparacionVehiculoService = createCrudService<any>('reparacionvehiculos');
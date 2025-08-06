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
  // Campo de compatibilidad
  metodo_pago?: string;
}

export const facturaService = createCrudService<Factura>('facturas');

// Servicios adicionales para los dropdowns
export const reparacionVehiculoService = createCrudService<any>('reparacionvehiculos');
import { Schema, model, Document } from 'mongoose';

interface IMetodoPago {
  tipo: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Cheque';
  monto: number;
  referencia?: string; // Para transferencias, cheques, etc.
}

export interface IFactura extends Document {
  _id: Schema.Types.ObjectId;
  id_reparacion: Schema.Types.ObjectId;
  fecha_emision: Date;
  total: number;
  tipo_factura: 'Contado' | 'Credito';
  metodos_pago: IMetodoPago[];
  detalles?: string;
  emitida: boolean;
  descuento_porcentaje?: number;
  // Campos de compatibilidad
  metodo_pago?: string;
}

const MetodoPagoSchema = new Schema({
  tipo: {
    type: String,
    enum: ['Efectivo', 'Tarjeta', 'Transferencia', 'Cheque'],
    required: true
  },
  monto: { type: Number, required: true, min: 0 },
  referencia: { type: String, trim: true }
}, { _id: false });

const FacturaSchema = new Schema<IFactura>({
  id_reparacion: { type: Schema.Types.ObjectId, ref: 'ReparacionVehiculo', required: true },
  fecha_emision: { type: Date, required: true },
  total: { type: Number, required: true },
  tipo_factura: {
    type: String,
    enum: ['Contado', 'Credito'],
    required: true,
    default: 'Contado'
  },
  metodos_pago: [MetodoPagoSchema],
  detalles: { type: String },
  emitida: { type: Boolean, default: false },
  descuento_porcentaje: { type: Number, default: 0, min: 0, max: 100 },
  // Campo de compatibilidad
  metodo_pago: { type: String }
});

export const Factura = model<IFactura>('Factura', FacturaSchema);

import { Schema, model, Document } from 'mongoose';

interface IMetodoPago {
  tipo: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Cheque';
  monto: number;
  referencia?: string; 
}

export interface IFactura extends Document {
  _id: Schema.Types.ObjectId;
  id_reparacion: Schema.Types.ObjectId;
  total: number;
  tipo_factura: 'Contado' | 'Credito';
  metodos_pago: IMetodoPago[];
  detalles?: string;
  emitida: boolean;
  descuento_porcentaje?: number;
  estado?: string;
  fecha_pago_completo?: Date;
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
  estado: { type: String, default: 'Pendiente' },
  fecha_pago_completo: { type: Date },
  metodo_pago: { type: String }
}, { timestamps: true });

export const Factura = model<IFactura>('Factura', FacturaSchema);

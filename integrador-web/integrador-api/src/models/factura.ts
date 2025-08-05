import { Schema, model, Document } from 'mongoose';

export interface IFactura extends Document {
  _id: Schema.Types.ObjectId;
  id_reparacion: Schema.Types.ObjectId;
  fecha_emision: Date;
  total: number;
  metodo_pago: string;
  detalles?: string;
  emitida: boolean;
  descuento_porcentaje?: number;
}

const FacturaSchema = new Schema<IFactura>({
  id_reparacion: { type: Schema.Types.ObjectId, ref: 'ReparacionVehiculo', required: true },
  fecha_emision: { type: Date, required: true },
  total: { type: Number, required: true },
  metodo_pago: { type: String, required: true },
  detalles: { type: String },
  emitida: { type: Boolean, default: false },
  descuento_porcentaje: { type: Number, default: 0, min: 0, max: 100 }
});

export const Factura = model<IFactura>('Factura', FacturaSchema);

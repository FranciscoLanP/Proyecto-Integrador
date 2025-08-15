// src/models/metodoPago.ts
import { Schema, model, Document } from 'mongoose';

export interface IMetodoPago extends Document {
  _id: Schema.Types.ObjectId;
  id_tipo_pago: Schema.Types.ObjectId;
  nombre_metodo: 'Contado' | 'Credito';
}

const MetodoPagoSchema = new Schema<IMetodoPago>({
  id_tipo_pago: {
    type: Schema.Types.ObjectId,
    ref: 'TiposPagos',
    required: true,
  },
  nombre_metodo: {
    type: String,
    required: true,
    enum: ['Contado', 'Credito'],
    default: 'Contado',
  },
}, { timestamps: true });

export const MetodoPago = model<IMetodoPago>('MetodoPago', MetodoPagoSchema);

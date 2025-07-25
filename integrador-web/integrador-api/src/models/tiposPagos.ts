// src/models/tiposPagos.ts
import { Schema, model, Document } from 'mongoose';

export interface ITiposPagos extends Document {
  _id: Schema.Types.ObjectId;
  nombre_tipo: 'Cheque' | 'Transferencia' | 'Efectivo' | 'Tarjeta';
}

const TiposPagosSchema = new Schema<ITiposPagos>({
  nombre_tipo: {
    type: String,
    required: true,
    enum: ['Cheque', 'Transferencia', 'Efectivo', 'Tarjeta'],
    default: 'Efectivo',
  },
});

export const TiposPagos = model<ITiposPagos>('TiposPagos', TiposPagosSchema);

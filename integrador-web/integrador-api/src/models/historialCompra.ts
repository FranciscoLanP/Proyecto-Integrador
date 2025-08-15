import { Schema, model, Document } from 'mongoose';

export interface IHistorialCompra extends Document {
  id_pieza: Schema.Types.ObjectId;
  id_suplidor: Schema.Types.ObjectId;
  cantidad: number;
  costo_unitario: number;
  fecha_compra: Date;
}

const HistorialCompraSchema = new Schema<IHistorialCompra>({
  id_pieza: { type: Schema.Types.ObjectId, ref: 'PiezaInventario', required: true },
  id_suplidor: { type: Schema.Types.ObjectId, ref: 'SuplidorPieza', required: true },
  cantidad: { type: Number, required: true },
  costo_unitario: { type: Number, required: true },
  fecha_compra: { type: Date, default: Date.now }
}, { timestamps: true });

export const HistorialCompra = model<IHistorialCompra>('HistorialCompra', HistorialCompraSchema);

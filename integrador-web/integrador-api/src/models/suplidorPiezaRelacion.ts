import { Schema, model, Document } from 'mongoose';

export interface ISuplidorPiezaRelacion extends Document {
    _id: Schema.Types.ObjectId;
    id_suplidor: Schema.Types.ObjectId;
    id_pieza: Schema.Types.ObjectId;
}

const SuplidorPiezaRelacionSchema = new Schema<ISuplidorPiezaRelacion>({
    id_suplidor: { type: Schema.Types.ObjectId, ref: 'SuplidorPieza', required: true },
    id_pieza: { type: Schema.Types.ObjectId, ref: 'PiezaInventario', required: true }
}, { timestamps: true });

export const SuplidorPiezaRelacion = model<ISuplidorPiezaRelacion>(
    'SuplidorPiezaRelacion',
    SuplidorPiezaRelacionSchema
);

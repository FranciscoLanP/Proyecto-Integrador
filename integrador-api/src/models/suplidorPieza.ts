import { Schema, model, Document } from 'mongoose';

export interface ISuplidorPieza extends Document {
    _id: Schema.Types.ObjectId;
    id_cliente: Schema.Types.ObjectId;
}

const SuplidorPiezaSchema = new Schema<ISuplidorPieza>({
    id_cliente: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true }
});

export const SuplidorPieza = model<ISuplidorPieza>(
    'SuplidorPieza',
    SuplidorPiezaSchema
);

import { Schema, model, Document } from 'mongoose';

export interface ISuplidorPieza extends Document {
    _id: Schema.Types.ObjectId;
    id_persona: Schema.Types.ObjectId;
}

const SuplidorPiezaSchema = new Schema<ISuplidorPieza>({
    id_persona: { type: Schema.Types.ObjectId, ref: 'Persona', required: true }
});

export const SuplidorPieza = model<ISuplidorPieza>(
    'SuplidorPieza',
    SuplidorPiezaSchema
);

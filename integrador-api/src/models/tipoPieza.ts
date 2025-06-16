import { Schema, model, Document } from 'mongoose';

export interface ITipoPieza extends Document {
    _id: Schema.Types.ObjectId;
    nombre_tipo: string;
}

const TipoPiezaSchema = new Schema<ITipoPieza>({
    nombre_tipo: { type: String, required: true }
});

export const TipoPieza = model<ITipoPieza>('TipoPieza', TipoPiezaSchema);

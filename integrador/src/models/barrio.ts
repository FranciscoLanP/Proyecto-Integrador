import { Schema, model, Document } from 'mongoose';

export interface IBarrio extends Document {
    _id: Schema.Types.ObjectId;
    nombre_barrio: string;
    id_distrito: Schema.Types.ObjectId;
}

const BarrioSchema = new Schema<IBarrio>({
    nombre_barrio: { type: String, required: true },
    id_distrito: { type: Schema.Types.ObjectId, ref: 'Distrito', required: true }
});

export const Barrio = model<IBarrio>('Barrio', BarrioSchema);

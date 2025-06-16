import { Schema, model, Document } from 'mongoose';

export interface IDistrito extends Document {
    _id: Schema.Types.ObjectId;
    nombre_distrito: string;
    id_sector: Schema.Types.ObjectId;
}

const DistritoSchema = new Schema<IDistrito>({
    nombre_distrito: { type: String, required: true },
    id_sector: { type: Schema.Types.ObjectId, ref: 'Sector', required: true }
});

export const Distrito = model<IDistrito>('Distrito', DistritoSchema);

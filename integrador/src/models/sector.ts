import { Schema, model, Document } from 'mongoose';

export interface ISector extends Document {
    _id: Schema.Types.ObjectId;
    nombre_sector: string;
    id_municipio: Schema.Types.ObjectId;
}

const SectorSchema = new Schema<ISector>({
    nombre_sector: { type: String, required: true },
    id_municipio: { type: Schema.Types.ObjectId, ref: 'Municipio', required: true }
});

export const Sector = model<ISector>('Sector', SectorSchema);

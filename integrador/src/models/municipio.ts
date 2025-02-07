import { Schema, model, Document } from 'mongoose';

export interface IMunicipio extends Document {
    _id: Schema.Types.ObjectId;
    nombre_municipio: string;
    id_provincia: Schema.Types.ObjectId;
}

const MunicipioSchema = new Schema<IMunicipio>({
    nombre_municipio: { type: String, required: true },
    id_provincia: { type: Schema.Types.ObjectId, ref: 'Provincia', required: true }
});

export const Municipio = model<IMunicipio>('Municipio', MunicipioSchema);

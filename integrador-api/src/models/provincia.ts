import { Schema, model, Document } from 'mongoose';

export interface IProvincia extends Document {
    _id: Schema.Types.ObjectId;
    nombre_provincia: string;
}

const ProvinciaSchema = new Schema<IProvincia>({
    nombre_provincia: { type: String, required: true }
});

export const Provincia = model<IProvincia>('Provincia', ProvinciaSchema);

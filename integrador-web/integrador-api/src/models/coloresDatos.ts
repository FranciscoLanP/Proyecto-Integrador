import { Schema, model, Document } from 'mongoose';

export interface IColoresDatos extends Document {
    _id: Schema.Types.ObjectId;
    nombre_color: string;
}

const ColoresDatosSchema = new Schema<IColoresDatos>({
    nombre_color: { type: String, required: true }
}, { timestamps: true });

export const ColoresDatos = model<IColoresDatos>('ColoresDatos', ColoresDatosSchema);

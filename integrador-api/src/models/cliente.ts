import { Schema, model, Document } from 'mongoose';

export interface ICliente extends Document {
    _id: Schema.Types.ObjectId;
    cedula: string;
    rnc?: string;
    nombre: string;
    numero_telefono: string;
    correo: string;
    id_barrio?: Schema.Types.ObjectId;
}

const PersonaSchema = new Schema<ICliente>({
    cedula: { type: String, unique: true, required: false },
    rnc: { type: String, required: false },
    nombre: { type: String, required: true },
    numero_telefono: { type: String, required: true },
    correo: { type: String, required: true },
    id_barrio: { type: Schema.Types.ObjectId, ref: 'Barrio', required: false }
});

export const Cliente = model<ICliente>('Cliente', PersonaSchema);

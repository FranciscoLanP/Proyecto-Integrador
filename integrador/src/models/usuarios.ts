import { Schema, model, Document } from 'mongoose';

export interface IUsuarios extends Document {
    _id: Schema.Types.ObjectId;
    nombre_usuario: string;
    contrasena: string;
    id_persona: Schema.Types.ObjectId;
    rol: string;
    estado: string;
}

const UsuariosSchema = new Schema<IUsuarios>({
    nombre_usuario: { type: String, required: true },
    contrasena: { type: String, required: true },
    id_persona: { type: Schema.Types.ObjectId, ref: 'Persona', required: true },
    rol: { type: String, required: true },
    estado: { type: String, required: true }
});

export const Usuarios = model<IUsuarios>('Usuarios', UsuariosSchema);


import { Schema, model, Document, Types } from 'mongoose';


export type Role = 'administrador' | 'empleado';

export interface IUsuario extends Document {
  _id: Types.ObjectId;
  username: string;
  password: string;
  role: Role;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UsuarioSchema = new Schema<IUsuario>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ['administrador', 'empleado'] 
  },
  activo: { type: Boolean, required: true, default: true }
}, {
  timestamps: true
});

export const Usuario = model<IUsuario>('Usuario', UsuarioSchema);

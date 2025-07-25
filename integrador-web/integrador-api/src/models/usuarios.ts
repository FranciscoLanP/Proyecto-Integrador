import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';

export type Role = 'administrador' | 'empleado';

export interface IUsuario extends Document {
  username: string;
  password: string;
  role: Role;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UsuarioSchema = new Schema<IUsuario>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['administrador', 'empleado'] },
  activo: { type: Boolean, required: true, default: true }
}, { timestamps: true });

UsuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UsuarioSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const Usuario = model<IUsuario>('Usuario', UsuarioSchema);

import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';

export type Role = 'administrador' | 'empleado';

export interface IUsuario extends Document {
  username: string;
  password: string;
  role: Role;
  activo: boolean;
  secretQuestion: string;
  secretAnswer: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
  compareSecretAnswer(candidate: string): Promise<boolean>;
}

const UsuarioSchema = new Schema<IUsuario>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['administrador', 'empleado'] },
  activo: { type: Boolean, required: true, default: true },
  secretQuestion: {
    type: String,
    required: false, // Cambiado a false para usuarios existentes
    enum: [
      '¿Cuál es el nombre de tu primera mascota?',
      '¿En qué ciudad naciste?',
      '¿Cuál es el nombre de tu escuela primaria?',
      '¿Cuál es tu comida favorita?',
      '¿Cuál es el nombre de tu mejor amigo de la infancia?'
    ]
  },
  secretAnswer: { type: String, required: false } // Cambiado a false para usuarios existentes
}, { timestamps: true });

UsuarioSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (this.isModified('secretAnswer')) {
    const salt = await bcrypt.genSalt(10);
    this.secretAnswer = await bcrypt.hash(this.secretAnswer.toLowerCase().trim(), salt);
  }

  next();
});

UsuarioSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

UsuarioSchema.methods.compareSecretAnswer = function (candidate: string) {
  return bcrypt.compare(candidate.toLowerCase().trim(), this.secretAnswer);
};

export const Usuario = model<IUsuario>('Usuario', UsuarioSchema);

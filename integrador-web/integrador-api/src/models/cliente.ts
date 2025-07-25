import { Schema, model, Document } from 'mongoose';

export interface ICliente extends Document {
  _id: Schema.Types.ObjectId;
  cedula: string;
  rnc?: string;
  nombre: string;
  numero_telefono: string;
  correo: string;
  tipo_cliente: 'Individual' | 'Empresarial' | 'Aseguradora' | 'Gobierno';
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  direccion?: string;
  ubicacionLabel?: string;
}

const ClienteSchema = new Schema<ICliente>(
  {
    cedula: { type: String, unique: true, required: false },
    rnc: { type: String, required: false },
    nombre: { type: String, required: true },
    numero_telefono: { type: String, required: true },
    correo: { type: String, required: true },
    tipo_cliente: {
      type: String,
      required: true,
      enum: ['Individual', 'Empresarial', 'Aseguradora', 'Gobierno'],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'] as const,
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    direccion: { type: String, required: false },
    ubicacionLabel: { type: String, required: false },
  },
  { timestamps: true }
);

ClienteSchema.index({ location: '2dsphere' });

export const Cliente = model<ICliente>('Cliente', ClienteSchema);

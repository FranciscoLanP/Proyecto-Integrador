
import { Schema, model, Document } from 'mongoose';

export interface IEmpleadoInformacion extends Document {
  _id: Schema.Types.ObjectId;
  id_cliente?: Schema.Types.ObjectId;
  tipo_empleado: 'Empleado Asalariado' | 'Empleado por Trabajo';
  nombre: string;
  telefono: string;
  correo: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  direccion?: string;
  ubicacionLabel?: string;
}

const EmpleadoInformacionSchema = new Schema<IEmpleadoInformacion>(
  {
    id_cliente: { type: Schema.Types.ObjectId, ref: 'Cliente', required: false },
    tipo_empleado: {
      type: String,
      required: true,
      enum: ['Empleado Asalariado', 'Empleado por Trabajo'],
      default: 'Empleado Asalariado',
    },
    nombre: { type: String, required: true },
    telefono: { type: String, required: true },
    correo: { type: String, required: true },
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

EmpleadoInformacionSchema.index({ location: '2dsphere' });

export const EmpleadoInformacion = model<IEmpleadoInformacion>(
  'EmpleadoInformacion',
  EmpleadoInformacionSchema
);

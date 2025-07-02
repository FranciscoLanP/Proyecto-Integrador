import { Schema, model, Document } from 'mongoose';

export interface ITipoEmpleado extends Document {
  _id: Schema.Types.ObjectId;
  nombre_tipo_empleado: 'Empleado Asalariado' | 'Empleado por Trabajo';
}

const TipoEmpleadoSchema = new Schema<ITipoEmpleado>({
  nombre_tipo_empleado: {
    type: String,
    required: true,
    enum: ['Empleado Asalariado', 'Empleado por Trabajo'],
    default: 'Empleado Asalariado',
  },
});

export const TipoEmpleado = model<ITipoEmpleado>('TipoEmpleado', TipoEmpleadoSchema);

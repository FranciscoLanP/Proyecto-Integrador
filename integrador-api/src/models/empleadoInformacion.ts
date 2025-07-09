import { Schema, model, Document } from 'mongoose';

export interface IEmpleadoInformacion extends Document {
  _id: Schema.Types.ObjectId;
  id_cliente: Schema.Types.ObjectId;
  id_tipo_empleado: Schema.Types.ObjectId;
  nombre: string;
  telefono: string;
  correo: string;
}

const EmpleadoInformacionSchema = new Schema<IEmpleadoInformacion>({
  id_cliente: { type: Schema.Types.ObjectId, ref: 'Cliente', required: false },
  id_tipo_empleado: { type: Schema.Types.ObjectId, ref: 'TipoEmpleado', required: true },
  nombre: { type: String, required: true },
  telefono: { type: String, required: true },
  correo: { type: String, required: true },
});

export const EmpleadoInformacion = model<IEmpleadoInformacion>(
  'EmpleadoInformacion',
  EmpleadoInformacionSchema
);

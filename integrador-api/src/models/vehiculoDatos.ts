import { Schema, model, Document } from 'mongoose';

export interface IVehiculoDatos extends Document {
  _id: Schema.Types.ObjectId;
  chasis: string;
  id_cliente: Schema.Types.ObjectId;
  id_modelo: Schema.Types.ObjectId;
  id_color: Schema.Types.ObjectId;
  anio: number;
  activo: boolean;
}

const VehiculoDatosSchema = new Schema<IVehiculoDatos>({
  chasis: { type: String, unique: true, required: true },
  id_cliente: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
  id_modelo: { type: Schema.Types.ObjectId, ref: 'ModelosDatos', required: true },
  id_color: { type: Schema.Types.ObjectId, ref: 'ColoresDatos', required: true },
  anio: { type: Number, required: true },
  activo: { type: Boolean, default: true }
});

export const VehiculoDatos = model<IVehiculoDatos>(
  'VehiculoDatos',
  VehiculoDatosSchema
);

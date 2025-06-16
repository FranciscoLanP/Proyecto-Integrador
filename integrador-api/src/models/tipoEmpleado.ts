import { Schema, model, Document } from 'mongoose';

export interface ITipoEmpleado extends Document {
    _id: Schema.Types.ObjectId;
    nombre_tipo_empleado: string;
}

const TipoEmpleadoSchema = new Schema<ITipoEmpleado>({
    nombre_tipo_empleado: { type: String, required: true }
});

export const TipoEmpleado = model<ITipoEmpleado>('TipoEmpleado', TipoEmpleadoSchema);
    
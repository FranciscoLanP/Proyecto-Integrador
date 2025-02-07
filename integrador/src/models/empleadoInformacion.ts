import { Schema, model, Document } from 'mongoose';

export interface IEmpleadoInformacion extends Document {
    _id: Schema.Types.ObjectId;
    id_persona: Schema.Types.ObjectId;
    id_tipo_empleado: Schema.Types.ObjectId;
}

const EmpleadoInformacionSchema = new Schema<IEmpleadoInformacion>({
    id_persona: { type: Schema.Types.ObjectId, ref: 'Persona', required: true },
    id_tipo_empleado: { type: Schema.Types.ObjectId, ref: 'TipoEmpleado', required: true }
});

export const EmpleadoInformacion = model<IEmpleadoInformacion>(
    'EmpleadoInformacion',
    EmpleadoInformacionSchema
);

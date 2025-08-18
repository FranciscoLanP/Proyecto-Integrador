import { Schema, model, Document } from 'mongoose';

export interface IRecepcionVehiculo extends Document {
    _id: Schema.Types.ObjectId;
    id_empleadoInformacion: Schema.Types.ObjectId;
    id_vehiculo: Schema.Types.ObjectId;
    comentario?: string;
    problema_reportado?: string;
}

const RecepcionVehiculoSchema = new Schema<IRecepcionVehiculo>({
    id_empleadoInformacion: { type: Schema.Types.ObjectId, ref: 'EmpleadoInformacion', required: true },
    id_vehiculo: { type: Schema.Types.ObjectId, ref: 'VehiculoDatos', required: true },
    comentario: { type: String, required: false },
    problema_reportado: { type: String, required: false }
}, { timestamps: true });

export const RecepcionVehiculo = model<IRecepcionVehiculo>(
    'RecepcionVehiculo',
    RecepcionVehiculoSchema
);

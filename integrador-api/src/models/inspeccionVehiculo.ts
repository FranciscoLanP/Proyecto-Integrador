import { Schema, model, Document } from 'mongoose';

export interface IInspeccionVehiculo extends Document {
    _id: Schema.Types.ObjectId;
    id_recibo: Schema.Types.ObjectId;
    id_empleado: Schema.Types.ObjectId;
    fecha_inspeccion: Date;
    comentario?: string;
    tiempo_estimado?: number;
    costo_mano_obra?: number;
    costo_aproximado?: number;
    resultado?: string;
}

const InspeccionVehiculoSchema = new Schema<IInspeccionVehiculo>({
    id_recibo: { type: Schema.Types.ObjectId, ref: 'ReciboVehiculo', required: true },
    id_empleado: { type: Schema.Types.ObjectId, ref: 'EmpleadoInformacion', required: true },
    fecha_inspeccion: { type: Date, required: true, default: Date.now },
    comentario: { type: String, required: false },
    tiempo_estimado: { type: Number, required: false },
    costo_mano_obra: { type: Number, required: false },
    costo_aproximado: { type: Number, required: false },
    resultado: { type: String, required: false }
});

export const InspeccionVehiculo = model<IInspeccionVehiculo>(
    'InspeccionVehiculo',
    InspeccionVehiculoSchema
);

import { Schema, model, Document } from 'mongoose';

export interface IReparacionVehiculo extends Document {
    _id: Schema.Types.ObjectId;
    id_inspeccion: Schema.Types.ObjectId;
    id_empleado: Schema.Types.ObjectId;
    fecha_inicio: Date;
    fecha_fin?: Date;
    descripcion: string;
    costo_total?: number;
}

const ReparacionVehiculoSchema = new Schema<IReparacionVehiculo>({

    id_inspeccion: { type: Schema.Types.ObjectId, ref: 'InspeccionVehiculo', required: true },
    id_empleado: { type: Schema.Types.ObjectId, ref: 'EmpleadoInformacion', required: true },
    fecha_inicio: { type: Date, required: true, default: Date.now },
    fecha_fin: { type: Date, required: false },
    descripcion: { type: String, required: true },
    costo_total: { type: Number, required: false }  
});

export const ReparacionVehiculo = model<IReparacionVehiculo>(
    'ReparacionVehiculo',
    ReparacionVehiculoSchema
);

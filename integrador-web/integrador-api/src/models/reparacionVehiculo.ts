import { Schema, model, Document } from 'mongoose';

interface IEmpleadoTrabajo {
    id_empleado: Schema.Types.ObjectId;
    descripcion_trabajo: string;
}

export interface IReparacionVehiculo extends Document {
    _id: Schema.Types.ObjectId;
    id_inspeccion: Schema.Types.ObjectId;
    empleados_trabajos: IEmpleadoTrabajo[];
    fecha_inicio?: Date;
    fecha_fin?: Date;
    descripcion: string;
    costo_total?: number;
    piezas_usadas?: Schema.Types.ObjectId[];
    id_empleadoInformacion?: Schema.Types.ObjectId;
}

const EmpleadoTrabajoSchema = new Schema({
    id_empleado: { type: Schema.Types.ObjectId, ref: 'EmpleadoInformacion', required: true },
    descripcion_trabajo: { type: String, required: true, trim: true }
}, { _id: false });

const ReparacionVehiculoSchema = new Schema<IReparacionVehiculo>({
    id_inspeccion: { type: Schema.Types.ObjectId, ref: 'InspeccionVehiculo', required: true },
    empleados_trabajos: [EmpleadoTrabajoSchema],
    fecha_inicio: { type: Date, required: false },
    fecha_fin: { type: Date, required: false },
    descripcion: { type: String, required: true },
    costo_total: { type: Number, required: false },
    piezas_usadas: [{ type: Schema.Types.ObjectId, ref: 'PiezaUsada', required: false }],
    // Campo de compatibilidad (deprecated)
    id_empleadoInformacion: { type: Schema.Types.ObjectId, ref: 'EmpleadoInformacion', required: false }
}, { timestamps: true });

export const ReparacionVehiculo = model<IReparacionVehiculo>(
    'ReparacionVehiculo',
    ReparacionVehiculoSchema
);

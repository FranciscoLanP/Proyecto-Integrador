import { Schema, model, Document } from 'mongoose';

export interface IGarantia extends Document {
    _id: Schema.Types.ObjectId;
    id_reparacion: Schema.Types.ObjectId;
    id_empleadoInformacion: Schema.Types.ObjectId;
    fecha_inicio: Date;
    fecha_expiracion: Date;
    tipo_garantia: string;
    descripcion?: string;
}

const GarantiaSchema = new Schema<IGarantia>({
    id_reparacion: { type: Schema.Types.ObjectId, ref: 'ReparacionVehiculo', required: true },
    id_empleadoInformacion: { type: Schema.Types.ObjectId, ref: 'EmpleadoInformacion', required: true },
    fecha_inicio: { type: Date, required: true, default: Date.now },
    fecha_expiracion: { type: Date, required: true },
    tipo_garantia: { type: String, required: true },
    descripcion: { type: String, required: false }
}, { timestamps: true });

export const Garantia = model<IGarantia>('Garantia', GarantiaSchema);

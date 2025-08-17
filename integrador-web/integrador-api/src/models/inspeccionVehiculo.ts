import { Schema, model, Document } from 'mongoose';

export interface IInspeccionVehiculo extends Document {
    _id: Schema.Types.ObjectId;
    id_recibo: Schema.Types.ObjectId;
    id_empleadoInformacion: Schema.Types.ObjectId;
    comentario?: string;
    tiempo_estimado?: number;
    costo_mano_obra?: number;
    costo_aproximado?: number;
    resultado?: string;
    piezas_sugeridas?: Array<{
        id_pieza: Schema.Types.ObjectId;
        nombre_pieza: string;
        cantidad: number;
        precio_unitario: number;
    }>;
}

const InspeccionVehiculoSchema = new Schema<IInspeccionVehiculo>({
    id_recibo: { type: Schema.Types.ObjectId, ref: 'ReciboVehiculo', required: true },
    id_empleadoInformacion: { type: Schema.Types.ObjectId, ref: 'EmpleadoInformacion', required: true },
    comentario: { type: String, required: false },
    tiempo_estimado: { type: Number, required: false },
    costo_mano_obra: { type: Number, required: false },
    costo_aproximado: { type: Number, required: false },
    resultado: { type: String, required: false },
    piezas_sugeridas: [{
        id_pieza: { type: Schema.Types.ObjectId, ref: 'PiezaInventario', required: false },
        nombre_pieza: { type: String, required: false },
        cantidad: { type: Number, required: false },
        precio_unitario: { type: Number, required: false }
    }]
}, { timestamps: true });

export const InspeccionVehiculo = model<IInspeccionVehiculo>(
    'InspeccionVehiculo',
    InspeccionVehiculoSchema
);

import { Schema, model, Document } from 'mongoose';

export interface IReciboVehiculo extends Document {
    _id: Schema.Types.ObjectId;
    id_recepcion: Schema.Types.ObjectId;
    observaciones?: string;
}

const ReciboVehiculoSchema = new Schema<IReciboVehiculo>({
    id_recepcion: { type: Schema.Types.ObjectId, ref: 'RecepcionVehiculo', required: true },
    observaciones: { type: String, required: false }
}, { timestamps: true });

export const ReciboVehiculo = model<IReciboVehiculo>(
    'ReciboVehiculo',
    ReciboVehiculoSchema
);

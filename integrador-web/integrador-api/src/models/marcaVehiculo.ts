import { Schema, model, Document } from 'mongoose';

export interface IMarcaVehiculo extends Document {
    _id: Schema.Types.ObjectId;
    nombre_marca: string;
}

const MarcaVehiculoSchema = new Schema<IMarcaVehiculo>({
    nombre_marca: { type: String, required: true }
}, { timestamps: true });

export const MarcaVehiculo = model<IMarcaVehiculo>(
    'MarcaVehiculo',
    MarcaVehiculoSchema
);

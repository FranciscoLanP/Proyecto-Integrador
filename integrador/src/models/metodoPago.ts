import { Schema, model, Document } from 'mongoose';

export interface IMetodoPago extends Document {
    id_metodo_pago: number;
    nombre_metodo: string;
    id_tipo_pago?: Schema.Types.ObjectId;
}

const MetodoPagoSchema = new Schema<IMetodoPago>({
    id_metodo_pago: { type: Number, unique: true, required: true },
    nombre_metodo: { type: String, required: true },
    id_tipo_pago: { type: Schema.Types.ObjectId, ref: 'TiposPagos', required: false }
});

export const MetodoPago = model<IMetodoPago>('MetodoPago', MetodoPagoSchema);

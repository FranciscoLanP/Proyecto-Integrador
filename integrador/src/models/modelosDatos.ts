import { Schema, model, Document } from 'mongoose';

export interface IModelosDatos extends Document {
    _id: Schema.Types.ObjectId;
    nombre_modelo: string;
    id_marca: Schema.Types.ObjectId;
}

const ModelosDatosSchema = new Schema<IModelosDatos>({
    nombre_modelo: { type: String, required: true },
    id_marca: { type: Schema.Types.ObjectId, ref: 'MarcaVehiculo', required: true }
});

export const ModelosDatos = model<IModelosDatos>('ModelosDatos', ModelosDatosSchema);

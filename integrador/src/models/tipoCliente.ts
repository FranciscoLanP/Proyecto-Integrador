import { Schema, model, Document } from 'mongoose';

export interface ITipoCliente extends Document {
    _id: Schema.Types.ObjectId;
    nombre_tipo_cliente: string;
}

const TipoClienteSchema = new Schema<ITipoCliente>({
    nombre_tipo_cliente: { type: String, required: true }
});

export const TipoCliente = model<ITipoCliente>('TipoCliente', TipoClienteSchema);

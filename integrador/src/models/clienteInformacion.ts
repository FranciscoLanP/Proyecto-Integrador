import { Schema, model, Document } from 'mongoose';

export interface IClienteInformacion extends Document {
    _id: Schema.Types.ObjectId;
    id_persona: Schema.Types.ObjectId;
    id_tipo_cliente: Schema.Types.ObjectId;
}

const ClienteInformacionSchema = new Schema<IClienteInformacion>({
    id_persona: { type: Schema.Types.ObjectId, ref: 'Persona', required: true },
    id_tipo_cliente: { type: Schema.Types.ObjectId, ref: 'TipoCliente', required: true }
});

export const ClienteInformacion = model<IClienteInformacion>(
    'ClienteInformacion',
    ClienteInformacionSchema
);

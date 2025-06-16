import { Schema, model, Document } from 'mongoose';

export interface ITipoCliente extends Document {
  _id: Schema.Types.ObjectId;
  nombre_tipo_cliente: 'Individual' | 'Empresarial' | 'Aseguradora' | 'Gobierno';
}

const TipoClienteSchema = new Schema<ITipoCliente>({
  nombre_tipo_cliente: {
    type: String,
    required: true,
    enum: ['Individual', 'Empresarial', 'Aseguradora', 'Gobierno'],
    trim: true,
  },
});

export const TipoCliente = model<ITipoCliente>('TipoCliente', TipoClienteSchema);

import { Schema, model, Document } from 'mongoose';

export interface ITiposPagos extends Document {
  _id: Schema.Types.ObjectId;
  nombre_tipo: string;
}

const TiposPagosSchema = new Schema<ITiposPagos>({
  nombre_tipo: { type: String, required: true }
});

export const TiposPagos = model<ITiposPagos>('TiposPagos', TiposPagosSchema);

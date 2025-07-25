import { Schema, model, Document } from 'mongoose'

export interface IPiezaUsada extends Document {
  id_pieza: Schema.Types.ObjectId
  cantidad: number
  origen: 'inspeccion' | 'reparacion'
  referencia: Schema.Types.ObjectId 
}

const PiezaUsadaSchema = new Schema<IPiezaUsada>({
  id_pieza: { type: Schema.Types.ObjectId, ref: 'PiezaInventario', required: true },
  cantidad: { type: Number, required: true },
  origen: { type: String, enum: ['inspeccion', 'reparacion'], required: true },
  referencia: { type: Schema.Types.ObjectId, required: true }
})

export const PiezaUsada = model<IPiezaUsada>('PiezaUsada', PiezaUsadaSchema)

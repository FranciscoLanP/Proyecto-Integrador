import { Schema, model, Document } from 'mongoose';

export interface IPiezaInventario extends Document {
    _id: Schema.Types.ObjectId;
    serial: string;
    nombre_pieza: string;
    id_tipo_pieza: Schema.Types.ObjectId;
    costo: number;
    id_suplidor: Schema.Types.ObjectId;
}

const PiezaInventarioSchema = new Schema<IPiezaInventario>({
    serial: { type: String, unique: true, required: true },
    nombre_pieza: { type: String, required: true },
    id_tipo_pieza: { type: Schema.Types.ObjectId, ref: 'TipoPieza', required: true },
    costo: { type: Number, required: true },
    id_suplidor: { type: Schema.Types.ObjectId, ref: 'SuplidorPieza', required: false }
});

export const PiezaInventario = model<IPiezaInventario>(
    'PiezaInventario',
    PiezaInventarioSchema
);

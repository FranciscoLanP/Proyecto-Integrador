import { Schema, model, Document } from 'mongoose';

export interface IInventario extends Document {
    
    id_pieza: Schema.Types.ObjectId;
    cantidad_disponible: number;
    costo_promedio: number;
    fecha_actualizacion: Date;
}

const InventarioSchema = new Schema<IInventario>({
    id_pieza: { type: Schema.Types.ObjectId, ref: 'PiezaInventario', required: true },
    cantidad_disponible: { type: Number, required: true },
    costo_promedio: { type: Number, required: false },
    fecha_actualizacion: { type: Date, required: false, default: Date.now }
});

export const Inventario = model<IInventario>('Inventario', InventarioSchema);

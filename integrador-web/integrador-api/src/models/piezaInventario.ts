// src/models/piezaInventario.ts

import { Schema, model, Document } from 'mongoose';
import { Counter } from './counter';

export interface IEventoHistorico {
  cantidad: number;
  costo_unitario: number;
  fecha: Date;
}

export interface IPiezaInventario extends Document {
  serial: string;
  nombre_pieza: string;
  cantidad_disponible: number;
  costo_promedio: number;
  historial: IEventoHistorico[];
}

const EventoSchema = new Schema<IEventoHistorico>({
  cantidad: { type: Number, required: true },
  costo_unitario: { type: Number, required: true },
  fecha: { type: Date, default: Date.now }
}, { _id: false });

const PiezaInventarioSchema = new Schema<IPiezaInventario>({
  serial: { type: String, unique: true, required: true },
  nombre_pieza: { type: String, required: true },
  cantidad_disponible: { type: Number, default: 0 },
  costo_promedio: { type: Number, default: 0 },
  historial: { type: [EventoSchema], default: [] }
}, {
  timestamps: true
});


PiezaInventarioSchema.pre<IPiezaInventario>('validate', async function () {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { id: 'pieza_inventario' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.serial = counter.seq.toString();
  }
});

export const PiezaInventario = model<IPiezaInventario>(
  'PiezaInventario',
  PiezaInventarioSchema
);

import { Schema, model, Document } from 'mongoose';

export interface IFactura extends Document {
    _id: Schema.Types.ObjectId;
  id_reparacion: Schema.Types.ObjectId;
  id_empleado: Schema.Types.ObjectId;
  fecha: Date;
  sub_total: number;
  descuento: number;
  total: number;
  id_metodo_pago: Schema.Types.ObjectId;
}

const FacturaSchema = new Schema<IFactura>({
  id_reparacion: { type: Schema.Types.ObjectId, ref: 'ReparacionVehiculo', required: true },
  id_empleado: { type: Schema.Types.ObjectId, ref: 'EmpleadoInformacion', required: true },
  fecha: { type: Date, default: Date.now },
  sub_total: { type: Number, required: true },
  descuento: { type: Number, required: true },
  total: { type: Number, required: true },
  id_metodo_pago: { type: Schema.Types.ObjectId, ref: 'MetodoPago', required: true }
});

export const Factura = model<IFactura>('Factura', FacturaSchema);

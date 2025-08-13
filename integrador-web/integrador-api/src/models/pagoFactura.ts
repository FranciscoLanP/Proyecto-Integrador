import { Schema, model, Document } from 'mongoose';

export interface IPagoFactura extends Document {
  _id: Schema.Types.ObjectId;
  factura: Schema.Types.ObjectId;
  monto: number;
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque';
  referenciaMetodo?: string; // Para transferencias, cheques, etc.
  fechaPago: Date;
  observaciones?: string;
}

const PagoFacturaSchema = new Schema({
  factura: {
    type: Schema.Types.ObjectId,
    ref: 'Factura',
    required: [true, 'La factura es requerida']
  },
  monto: {
    type: Number,
    required: [true, 'El monto es requerido'],
    min: [0.01, 'El monto debe ser mayor que 0']
  },
  metodoPago: {
    type: String,
    enum: ['efectivo', 'tarjeta', 'transferencia', 'cheque'],
    required: [true, 'El método de pago es requerido']
  },
  referenciaMetodo: {
    type: String,
    required: function(this: IPagoFactura) {
      return ['tarjeta', 'transferencia', 'cheque'].includes(this.metodoPago);
    }
  },
  fechaPago: {
    type: Date,
    default: Date.now
  },
  observaciones: {
    type: String,
    maxlength: [500, 'Las observaciones no pueden exceder 500 caracteres']
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// Middleware para validar que el monto no exceda el saldo de la factura
PagoFacturaSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Factura = model('Factura');
    const factura = await Factura.findById(this.factura);
    
    if (!factura) {
      throw new Error('Factura no encontrada');
    }

    // Calcular total ya pagado
    const pagosExistentes = await PagoFactura.find({ factura: this.factura });
    const totalPagado = pagosExistentes.reduce((total, pago) => total + pago.monto, 0);
    
    if (totalPagado + this.monto > factura.total) {
      throw new Error(`El pago excede el saldo pendiente. Saldo disponible: $${(factura.total - totalPagado).toFixed(2)}`);
    }
  }
  next();
});

export const PagoFactura = model<IPagoFactura>('PagoFactura', PagoFacturaSchema);

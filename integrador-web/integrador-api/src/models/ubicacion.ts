
import { Schema, model, Document, Types } from 'mongoose';

export interface IUbicacion extends Document {
  userId: Types.ObjectId;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  direccion?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UbicacionSchema = new Schema<IUbicacion>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'] as const,
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    direccion: {
      type: String,
    },
  },
  { timestamps: true }
);

UbicacionSchema.index({ location: '2dsphere' });

export const Ubicacion = model<IUbicacion>('Ubicacion', UbicacionSchema);

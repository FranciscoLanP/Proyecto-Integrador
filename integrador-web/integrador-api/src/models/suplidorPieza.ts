import { Schema, model, Document } from 'mongoose';

export interface ISuplidorPieza extends Document {
    _id: Schema.Types.ObjectId;
    rnc?: string;
    nombre: string;
    numero_telefono: string;
    correo: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    direccion?: string;
    ubicacionLabel?: string;
}


const SuplidorPiezaSchema = new Schema<ISuplidorPieza>({
    rnc: { type: String, unique: true, required: false },
    nombre: { type: String, required: true },
    numero_telefono: { type: String, required: true },
    correo: { type: String, required: true },
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
    direccion: { type: String, required: false },
    ubicacionLabel: { type: String, required: false },
},
    { timestamps: true });

export const SuplidorPieza = model<ISuplidorPieza>(
    'SuplidorPieza',
    SuplidorPiezaSchema
);

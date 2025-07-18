import type { RequestHandler } from 'express';
import { Types } from 'mongoose';
import { Ubicacion } from '../models/ubicacion';


export const createUbicacion: RequestHandler = async (
  req,
  res
): Promise<void> => {
  const { userId, latitude, longitude, direccion } = req.body as {
    userId: string;
    latitude: number;
    longitude: number;
    direccion?: string;
  };

  try {
    await Ubicacion.create({
      userId: new Types.ObjectId(userId),
      location: { type: 'Point', coordinates: [longitude, latitude] },
      direccion,
    });
    res.status(201).json({ message: 'Ubicación creada correctamente' });
  } catch {
    res.status(500).json({ message: 'Error al guardar la ubicación' });
  }
};


export const updateUbicacion: RequestHandler = async (
  req,
  res
): Promise<void> => {
  const { id } = req.params;
  const { latitude, longitude, direccion } = req.body as {
    latitude?: number;
    longitude?: number;
    direccion?: string;
  };

  const updateData: Partial<{
    location: { type: 'Point'; coordinates: [number, number] };
    direccion?: string;
  }> = {};

  if (latitude !== undefined && longitude !== undefined) {
    updateData.location = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };
  }
  if (direccion !== undefined) {
    updateData.direccion = direccion;
  }

  try {
    const updated = await Ubicacion.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      res.status(404).json({ message: 'Ubicación no encontrada' });
      return;
    }

    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Error al actualizar la ubicación' });
  }
};

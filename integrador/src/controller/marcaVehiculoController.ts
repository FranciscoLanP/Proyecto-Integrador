import { Request, Response } from 'express';
import { MarcaVehiculo } from '../models';

export const getMarcaVehiculoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const marca = await MarcaVehiculo.findById(id);

    if (!marca) {
      return res.status(404).json({ message: 'Marca de vehículo no encontrada' });
    }

    return res.json(marca);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener la marca de vehículo', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getAllMarcaVehiculo = async (_req: Request, res: Response) => {
  try {
    const marcas = await MarcaVehiculo.find();
    return res.json(marcas);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener las marcas de vehículos', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getPaginatedMarcaVehiculo = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [total, marcas] = await Promise.all([
      MarcaVehiculo.countDocuments(),
      MarcaVehiculo.find().skip(skip).limit(limit),
    ]);

    return res.json({ total, page, limit, data: marcas });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener las marcas de vehículos paginadas', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const createMarcaVehiculo = async (req: Request, res: Response) => {
  try {
    const marca = await MarcaVehiculo.create(req.body);
    return res.status(201).json(marca);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al crear la marca de vehículo', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const updateMarcaVehiculo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const marcaActualizada = await MarcaVehiculo.findByIdAndUpdate(id, req.body, { new: true });

    if (!marcaActualizada) {
      return res.status(404).json({ message: 'Marca de vehículo no encontrada' });
    }

    return res.json(marcaActualizada);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al actualizar la marca de vehículo', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

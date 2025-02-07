import { Request, Response } from 'express';
import { Barrio } from '../models';

export const getBarrioById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const barrio = await Barrio.findById(id);

    if (!barrio) {
      return res.status(404).json({ message: 'Barrio no encontrado' });
    }

    return res.json(barrio);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener el barrio', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getAllBarrio = async (_req: Request, res: Response) => {
  try {
    const barrios = await Barrio.find();
    return res.json(barrios);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener los barrios', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getPaginatedBarrio = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [total, barrios] = await Promise.all([
      Barrio.countDocuments(),
      Barrio.find().skip(skip).limit(limit),
    ]);

    return res.json({ total, page, limit, data: barrios });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener los barrios paginados', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const createBarrio = async (req: Request, res: Response) => {
  try {
    const barrio = await Barrio.create(req.body);
    return res.status(201).json(barrio);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al crear el barrio', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const updateBarrio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const barrioActualizado = await Barrio.findByIdAndUpdate(id, req.body, { new: true });

    if (!barrioActualizado) {
      return res.status(404).json({ message: 'Barrio no encontrado' });
    }

    return res.json(barrioActualizado);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al actualizar el barrio', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

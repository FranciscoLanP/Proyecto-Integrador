import { Request, Response } from 'express';
import { Garantia } from '../models';

export const getGarantiaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const garantia = await Garantia.findById(id);

    if (!garantia) {
      return res.status(404).json({ message: 'Garantía no encontrada' });
    }

    return res.json(garantia);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener la garantía', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getAllGarantia = async (_req: Request, res: Response) => {
  try {
    const garantias = await Garantia.find();
    return res.json(garantias);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener las garantías', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getPaginatedGarantia = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [total, garantias] = await Promise.all([
      Garantia.countDocuments(),
      Garantia.find().skip(skip).limit(limit),
    ]);

    return res.json({ total, page, limit, data: garantias });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener las garantías paginadas', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const createGarantia = async (req: Request, res: Response) => {
  try {
    const garantia = await Garantia.create(req.body);
    return res.status(201).json(garantia);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al crear la garantía', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const updateGarantia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const garantiaActualizada = await Garantia.findByIdAndUpdate(id, req.body, { new: true });

    if (!garantiaActualizada) {
      return res.status(404).json({ message: 'Garantía no encontrada' });
    }

    return res.json(garantiaActualizada);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al actualizar la garantía', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

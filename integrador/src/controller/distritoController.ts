import { Request, Response } from 'express';
import { Distrito } from '../models';

export const getDistritoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const distrito = await Distrito.findById(id);

    if (!distrito) {
      return res.status(404).json({ message: 'Distrito no encontrado' });
    }

    return res.json(distrito);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener el distrito', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getAllDistrito = async (_req: Request, res: Response) => {
  try {
    const distritos = await Distrito.find();
    return res.json(distritos);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener los distritos', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getPaginatedDistrito = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [total, distritos] = await Promise.all([
      Distrito.countDocuments(),
      Distrito.find().skip(skip).limit(limit),
    ]);

    return res.json({ total, page, limit, data: distritos });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener los distritos paginados', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const createDistrito = async (req: Request, res: Response) => {
  try {
    const distrito = await Distrito.create(req.body);
    return res.status(201).json(distrito);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al crear el distrito', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const updateDistrito = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const distritoActualizado = await Distrito.findByIdAndUpdate(id, req.body, { new: true });

    if (!distritoActualizado) {
      return res.status(404).json({ message: 'Distrito no encontrado' });
    }

    return res.json(distritoActualizado);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al actualizar el distrito', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

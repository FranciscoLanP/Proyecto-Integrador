import { Request, Response } from 'express';
import { ColoresDatos } from '../models';

export const getColoresDatosById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const color = await ColoresDatos.findById(id);

    if (!color) {
      return res.status(404).json({ message: 'Color no encontrado' });
    }

    return res.json(color);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener el color', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getAllColoresDatos = async (_req: Request, res: Response) => {
  try {
    const colores = await ColoresDatos.find();
    return res.json(colores);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener los colores', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getPaginatedColoresDatos = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [total, colores] = await Promise.all([
      ColoresDatos.countDocuments(),
      ColoresDatos.find().skip(skip).limit(limit),
    ]);

    return res.json({ total, page, limit, data: colores });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener los colores paginados', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const createColoresDatos = async (req: Request, res: Response) => {
  try {
    const color = await ColoresDatos.create(req.body);
    return res.status(201).json(color);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al crear el color', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const updateColoresDatos = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const colorActualizado = await ColoresDatos.findByIdAndUpdate(id, req.body, { new: true });

    if (!colorActualizado) {
      return res.status(404).json({ message: 'Color no encontrado' });
    }

    return res.json(colorActualizado);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al actualizar el color', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

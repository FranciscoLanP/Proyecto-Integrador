import { Request, Response } from 'express';
import { Inventario } from '../models';

export const getInventarioById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const inventario = await Inventario.findById(id);

    if (!inventario) {
      return res.status(404).json({ message: 'Inventario no encontrado' });
    }

    return res.json(inventario);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener el inventario', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getAllInventario = async (_req: Request, res: Response) => {
  try {
    const inventarios = await Inventario.find();
    return res.json(inventarios);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener los inventarios', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getPaginatedInventario = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [total, inventarios] = await Promise.all([
      Inventario.countDocuments(),
      Inventario.find().skip(skip).limit(limit),
    ]);

    return res.json({ total, page, limit, data: inventarios });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener los inventarios paginados', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const createInventario = async (req: Request, res: Response) => {
  try {
    const inventario = await Inventario.create(req.body);
    return res.status(201).json(inventario);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al crear el inventario', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const updateInventario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const inventarioActualizado = await Inventario.findByIdAndUpdate(id, req.body, { new: true });

    if (!inventarioActualizado) {
      return res.status(404).json({ message: 'Inventario no encontrado' });
    }

    return res.json(inventarioActualizado);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al actualizar el inventario', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

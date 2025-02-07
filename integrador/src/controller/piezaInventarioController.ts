import { Request, Response } from 'express';
import { PiezaInventario } from '../models';

export const getPiezaInventarioById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pieza = await PiezaInventario.findById(id);

    if (!pieza) {
      return res.status(404).json({ message: 'Pieza de inventario no encontrada' });
    }

    return res.json(pieza);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener la pieza de inventario', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getAllPiezaInventario = async (_req: Request, res: Response) => {
  try {
    const piezas = await PiezaInventario.find();
    return res.json(piezas);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener las piezas de inventario', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getPaginatedPiezaInventario = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [total, piezas] = await Promise.all([
      PiezaInventario.countDocuments(),
      PiezaInventario.find().skip(skip).limit(limit),
    ]);

    return res.json({ total, page, limit, data: piezas });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener las piezas de inventario paginadas', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const createPiezaInventario = async (req: Request, res: Response) => {
  try {
    const pieza = await PiezaInventario.create(req.body);
    return res.status(201).json(pieza);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al crear la pieza de inventario', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const updatePiezaInventario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const piezaActualizada = await PiezaInventario.findByIdAndUpdate(id, req.body, { new: true });

    if (!piezaActualizada) {
      return res.status(404).json({ message: 'Pieza de inventario no encontrada' });
    }

    return res.json(piezaActualizada);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al actualizar la pieza de inventario', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

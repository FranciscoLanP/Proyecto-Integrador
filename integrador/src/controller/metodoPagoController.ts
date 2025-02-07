import { Request, Response } from 'express';
import { MetodoPago } from '../models';

export const getMetodoPagoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const metodo = await MetodoPago.findById(id);

    if (!metodo) {
      return res.status(404).json({ message: 'Método de pago no encontrado' });
    }

    return res.json(metodo);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener el método de pago', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getAllMetodoPago = async (_req: Request, res: Response) => {
  try {
    const metodos = await MetodoPago.find();
    return res.json(metodos);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener los métodos de pago', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getPaginatedMetodoPago = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [total, metodos] = await Promise.all([
      MetodoPago.countDocuments(),
      MetodoPago.find().skip(skip).limit(limit),
    ]);

    return res.json({ total, page, limit, data: metodos });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener los métodos de pago paginados', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const createMetodoPago = async (req: Request, res: Response) => {
  try {
    const metodo = await MetodoPago.create(req.body);
    return res.status(201).json(metodo);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al crear el método de pago', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const updateMetodoPago = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const metodoActualizado = await MetodoPago.findByIdAndUpdate(id, req.body, { new: true });

    if (!metodoActualizado) {
      return res.status(404).json({ message: 'Método de pago no encontrado' });
    }

    return res.json(metodoActualizado);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al actualizar el método de pago', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

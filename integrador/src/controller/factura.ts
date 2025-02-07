import { Request, Response } from 'express';
import { Factura } from '../models';

export const getFacturaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const factura = await Factura.findById(id);

    if (!factura) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }

    return res.json(factura);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener la factura', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getAllFactura = async (_req: Request, res: Response) => {
  try {
    const facturas = await Factura.find();
    return res.json(facturas);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener las facturas', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getPaginatedFactura = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [total, facturas] = await Promise.all([
      Factura.countDocuments(),
      Factura.find().skip(skip).limit(limit),
    ]);

    return res.json({ total, page, limit, data: facturas });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener las facturas paginadas', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const createFactura = async (req: Request, res: Response) => {
  try {
    const factura = await Factura.create(req.body);
    return res.status(201).json(factura);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al crear la factura', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const updateFactura = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const facturaActualizada = await Factura.findByIdAndUpdate(id, req.body, { new: true });

    if (!facturaActualizada) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }

    return res.json(facturaActualizada);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al actualizar la factura', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

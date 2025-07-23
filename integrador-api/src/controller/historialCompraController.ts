import { Request, Response } from 'express';
import { HistorialCompra } from '../models/historialCompra';

export const getAllHistorialCompra = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = await HistorialCompra.find()
      .populate('id_pieza')
      .populate('id_suplidor');
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener historial de compras', error });
  }
};

export const getPaginatedHistorialCompra = async (
  req: Request,
  res: Response
): Promise<void> => {
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '10', 10);

  try {
    const [data, total] = await Promise.all([
      HistorialCompra.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('id_pieza')
        .populate('id_suplidor'),
      HistorialCompra.countDocuments()
    ]);

    res.json({ data, total, page, limit });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener historial paginado', error });
  }
};

export const getHistorialCompraById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = await HistorialCompra.findById(req.params.id)
      .populate('id_pieza')
      .populate('id_suplidor');

    if (!data) {
      res.status(404).json({ message: 'Historial no encontrado' });
      return;
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener historial por ID', error });
  }
};

export const createHistorialCompra = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const newRecord = new HistorialCompra(req.body);
    const saved = await newRecord.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear historial de compra', error });
  }
};

export const updateHistorialCompra = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updated = await HistorialCompra.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ message: 'Historial no encontrado' });
      return;
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar historial', error });
  }
};

export const deleteHistorialCompra = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deleted = await HistorialCompra.findByIdAndDelete(req.params.id);

    if (!deleted) {
      res.status(404).json({ message: 'Historial no encontrado' });
      return;
    }

    res.json({ message: 'Historial eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar historial', error });
  }
};

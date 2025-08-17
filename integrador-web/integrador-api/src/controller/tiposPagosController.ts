import { Request, Response, NextFunction } from 'express';
import { TiposPagos } from '../models/tiposPagos';

export const getAllTiposPagos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search } = req.query as { search?: string };
    const filter = search
      ? { nombre_tipo: { $regex: search, $options: 'i' } }
      : {};
    const items = await TiposPagos.find(filter);
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

export const getPaginatedTiposPagos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page       = parseInt((req.query.page  as string) ?? '1', 10);
    const limit      = parseInt((req.query.limit as string) ?? '10',10);
    const { search } = req.query as { search?: string };
    const filter = search
      ? { nombre_tipo: { $regex: search, $options: 'i' } }
      : {};
    const totalCount = await TiposPagos.countDocuments(filter);
    const data       = await TiposPagos.find(filter)
                          .skip((page - 1) * limit)
                          .limit(limit);
    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({ data, page, totalPages, totalCount });
  } catch (error) {
    next(error);
  }
};

export const getTiposPagosById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const item = await TiposPagos.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'TiposPagos no encontrado' });
      return;
    }
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

export const createTiposPagos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { nombre_tipo } = req.body;
    const newItem = new TiposPagos({ nombre_tipo });
    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

export const updateTiposPagos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updated = await TiposPagos.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ message: 'TiposPagos no encontrado' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteTiposPagos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await TiposPagos.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'TiposPagos no encontrado' });
      return;
    }
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

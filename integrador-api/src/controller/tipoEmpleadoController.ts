import { Request, Response, NextFunction } from 'express';
import { TipoEmpleado } from '../models/tipoEmpleado';

export const getAllTipoEmpleado = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search } = req.query as { search?: string };
    const filter = search
      ? { nombre_tipo_empleado: { $regex: search, $options: 'i' } }
      : {};
    const items = await TipoEmpleado.find(filter);
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

export const getPaginatedTipoEmpleado = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10);
    const limit = parseInt((req.query.limit as string) ?? '10', 10);
    const { search } = req.query as { search?: string };
    const filter = search
      ? { nombre_tipo_empleado: { $regex: search, $options: 'i' } }
      : {};
    const totalCount = await TipoEmpleado.countDocuments(filter);
    const data = await TipoEmpleado.find(filter)
      .skip((page - 1) * limit)
      .limit(limit);
    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({ data, page, totalPages, totalCount });
  } catch (error) {
    next(error);
  }
};

export const getTipoEmpleadoById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const item = await TipoEmpleado.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'TipoEmpleado no encontrado' });
      return;
    }
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

export const createTipoEmpleado = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { nombre_tipo_empleado } = req.body;
    const newItem = new TipoEmpleado({ nombre_tipo_empleado });
    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

export const updateTipoEmpleado = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updated = await TipoEmpleado.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ message: 'TipoEmpleado no encontrado' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteTipoEmpleado = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await TipoEmpleado.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'TipoEmpleado no encontrado' });
      return;
    }
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

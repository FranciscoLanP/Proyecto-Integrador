import type { Request, Response, NextFunction } from 'express';
import { Barrio, IBarrio } from '../models/barrio';

export const getAllBarrio = async (
  req: Request,
  res: Response<IBarrio[]>,
  next: NextFunction
): Promise<void> => {
  try {
    const { search } = req.query as { search?: string };
    const filter = search
      ? { nombre_barrio: { $regex: search, $options: 'i' } }
      : {};
    const barrios = await Barrio.find(filter);
    res.status(200).json(barrios);
  } catch (error) {
    next(error);
  }
};

export const getPaginatedBarrio = async (
  req: Request,
  res: Response<{
    data: IBarrio[];
    page: number;
    totalPages: number;
    totalCount: number;
  }>,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10);
    const limit = parseInt((req.query.limit as string) ?? '10', 10);
    const { search } = req.query as { search?: string };
    const filter = search
      ? { nombre_barrio: { $regex: search, $options: 'i' } }
      : {};

    const totalCount = await Barrio.countDocuments(filter);
    const barrios = await Barrio.find(filter)
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({ data: barrios, page, totalPages, totalCount });
  } catch (error) {
    next(error);
  }
};

export const getBarrioById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const barrio = await Barrio.findById(req.params.id);
    if (!barrio) {
      res.status(404).json({ message: 'Barrio no encontrado' });
      return;
    }
    res.status(200).json(barrio);
  } catch (error) {
    next(error);
  }
};

export const createBarrio = async (
  req: Request,
  res: Response<IBarrio>,
  next: NextFunction
): Promise<void> => {
  try {
    const { nombre_barrio, id_distrito } = req.body;
    const newBarrio = new Barrio({ nombre_barrio, id_distrito });
    const saved = await newBarrio.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

export const updateBarrio = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updated = await Barrio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ message: 'Barrio no encontrado' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteBarrio = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await Barrio.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'Barrio no encontrado' });
      return;
    }
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

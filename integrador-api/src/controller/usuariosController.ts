import { Request, Response, NextFunction } from 'express';
import { Usuario, IUsuario } from '../models/usuarios';
import type { FilterQuery } from 'mongoose';

export const getAllUsuarios = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, activo } = req.query as {
      search?: string;
      activo?: string;
    };
    const filter: FilterQuery<IUsuario> = {};

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { role:     { $regex: search, $options: 'i' } }
      ];
    }

    if (activo !== undefined) {
      filter.activo = activo === 'true';
    }

    const items = await Usuario.find(filter);
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

export const getPaginatedUsuarios = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page  = parseInt((req.query.page  as string) ?? '1',  10);
    const limit = parseInt((req.query.limit as string) ?? '10', 10);
    const { search, activo } = req.query as {
      search?: string;
      activo?: string;
    };
    const filter: FilterQuery<IUsuario> = {};

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { role:     { $regex: search, $options: 'i' } }
      ];
    }

    if (activo !== undefined) {
      filter.activo = activo === 'true';
    }

    const totalCount = await Usuario.countDocuments(filter);
    const data       = await Usuario.find(filter)
                                    .skip((page - 1) * limit)
                                    .limit(limit);
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({ data, page, totalPages, totalCount });
  } catch (error) {
    next(error);
  }
};

export const getUsuarioById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const item = await Usuario.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

export const createUsuario = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, password, role, activo } = req.body;
    const newUsuario = new Usuario({ username, password, role, activo });
    const saved      = await newUsuario.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

export const updateUsuario = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updated = await Usuario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteUsuario = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await Usuario.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

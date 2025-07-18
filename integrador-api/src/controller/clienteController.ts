import type { Request, Response, NextFunction } from 'express';
import { Cliente } from '../models/cliente';

export const getAllClientes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, tipo_cliente } = req.query as {
      search?: string;
      tipo_cliente?: string;
    };
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { cedula: { $regex: search, $options: 'i' } },
        { correo: { $regex: search, $options: 'i' } },
        { numero_telefono: { $regex: search, $options: 'i' } },
      ];
    }
    if (tipo_cliente) {
      filter.tipo_cliente = tipo_cliente;
    }

    const items = await Cliente.find(filter);
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

export const getPaginatedClientes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10);
    const limit = parseInt((req.query.limit as string) ?? '10', 10);
    const { search, tipo_cliente } = req.query as {
      search?: string;
      tipo_cliente?: string;
    };
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { cedula: { $regex: search, $options: 'i' } },
        { correo: { $regex: search, $options: 'i' } },
        { numero_telefono: { $regex: search, $options: 'i' } },
      ];
    }
    if (tipo_cliente) {
      filter.tipo_cliente = tipo_cliente;
    }

    const totalCount = await Cliente.countDocuments(filter);
    const data = await Cliente.find(filter)
      .skip((page - 1) * limit)
      .limit(limit);
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({ data, page, totalPages, totalCount });
  } catch (error) {
    next(error);
  }
};

export const getClienteById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const item = await Cliente.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Cliente no encontrada' });
      return;
    }
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

export const createCliente = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      cedula,
      rnc,
      nombre,
      numero_telefono,
      correo,
      tipo_cliente,
      latitude,
      longitude,
      direccion,
    } = req.body as {
      cedula: string;
      rnc?: string;
      nombre: string;
      numero_telefono: string;
      correo: string;
      tipo_cliente: 'Individual' | 'Empresarial' | 'Aseguradora' | 'Gobierno';
      latitude: number;
      longitude: number;
      direccion?: string;
    };

    const newCliente = new Cliente({
      cedula,
      rnc,
      nombre,
      numero_telefono,
      correo,
      tipo_cliente,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      direccion,
    });

    const saved = await newCliente.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

export const updateCliente = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    type Body = Partial<{
      cedula: string;
      rnc: string;
      nombre: string;
      numero_telefono: string;
      correo: string;
      tipo_cliente: 'Individual' | 'Empresarial' | 'Aseguradora' | 'Gobierno';
      latitude: number;
      longitude: number;
      direccion: string;
    }>;

    const body = req.body as Body;
    const { latitude, longitude, direccion, ...rest } = body;

    const updateData: Record<string, unknown> = { ...rest };

    if (latitude !== undefined && longitude !== undefined) {
      updateData.location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
    }

    if (direccion !== undefined) {
      updateData.direccion = direccion;
    }

    const updated = await Cliente.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ message: 'Cliente no encontrada' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteCliente = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await Cliente.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'Cliente no encontrada' });
      return;
    }
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

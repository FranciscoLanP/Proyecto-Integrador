import { Request, Response, NextFunction } from 'express';
import { EmpleadoInformacion } from '../models/empleadoInformacion';

export const getAllEmpleadoInformacion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search } = req.query as { search?: string };
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { telefono: { $regex: search, $options: 'i' } },
        { correo: { $regex: search, $options: 'i' } },
        { tipo_empleado: search },
      ];
    }

    const items = await EmpleadoInformacion.find(filter);
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

export const getPaginatedEmpleadoInformacion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10);
    const limit = parseInt((req.query.limit as string) ?? '10', 10);
    const { search } = req.query as { search?: string };
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { telefono: { $regex: search, $options: 'i' } },
        { correo: { $regex: search, $options: 'i' } },
        { tipo_empleado: search },
      ];
    }

    const totalCount = await EmpleadoInformacion.countDocuments(filter);
    const data = await EmpleadoInformacion.find(filter)
      .skip((page - 1) * limit)
      .limit(limit);
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({ data, page, totalPages, totalCount });
  } catch (error) {
    next(error);
  }
};

export const getEmpleadoInformacionById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const item = await EmpleadoInformacion.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Empleado no encontrado' });
      return;
    }
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

export const createEmpleadoInformacion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      id_cliente,
      tipo_empleado,
      nombre,
      telefono,
      correo,
      latitude,
      longitude,
      direccion,
      ubicacionLabel,
    } = req.body as {
      id_cliente?: string;
      tipo_empleado: 'Empleado Asalariado' | 'Empleado por Trabajo';
      nombre: string;
      telefono: string;
      correo: string;
      latitude: number;
      longitude: number;
      direccion?: string;
      ubicacionLabel?: string;
    };

    const newEmpleado = new EmpleadoInformacion({
      id_cliente,
      tipo_empleado,
      nombre,
      telefono,
      correo,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      direccion,
      ubicacionLabel,
    });

    const saved = await newEmpleado.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

export const updateEmpleadoInformacion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    type Body = Partial<{
      id_cliente: string;
      tipo_empleado: 'Empleado Asalariado' | 'Empleado por Trabajo';
      nombre: string;
      telefono: string;
      correo: string;
      latitude: number;
      longitude: number;
      direccion: string;
      ubicacionLabel: string;
    }>;

    const body = req.body as Body;
    const {
      latitude,
      longitude,
      direccion,
      ubicacionLabel,
      ...rest
    } = body;

    const updateData: Record<string, unknown> = { ...rest };
    if (latitude !== undefined && longitude !== undefined) {
      updateData.location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
    }
    if (direccion !== undefined) updateData.direccion = direccion;
    if (ubicacionLabel !== undefined) updateData.ubicacionLabel = ubicacionLabel;

    const updated = await EmpleadoInformacion.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ message: 'Empleado no encontrado' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteEmpleadoInformacion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await EmpleadoInformacion.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'Empleado no encontrado' });
      return;
    }
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

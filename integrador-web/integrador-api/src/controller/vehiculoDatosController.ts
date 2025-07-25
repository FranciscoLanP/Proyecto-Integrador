// src/controllers/vehiculoDatosController.ts
import { Request, Response, NextFunction } from 'express';
import { VehiculoDatos } from '../models/vehiculoDatos';

export const getAllVehiculoDatos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string };
    const filter = search
      ? {
          $or: [
            { chasis:  { $regex: search, $options: 'i' } },
            { id_cliente: search },
            { id_modelo:  search },
            { id_color:   search },
            { anio:       parseInt(search, 10) }
          ]
        }
      : {};

    const items = await VehiculoDatos.find(filter)
      .populate('id_cliente')
      .populate('id_modelo')
      .populate('id_color');

    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};



export const getPaginatedVehiculoDatos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page  = parseInt((req.query.page  as string) ?? '1',  10);
    const limit = parseInt((req.query.limit as string) ?? '10', 10);
    const { search } = req.query as { search?: string };
    const filter = search
      ? {
          $or: [
            { chasis:  { $regex: search, $options: 'i' } },
            { id_cliente: search },
            { id_modelo:  search },
            { id_color:   search },
            { anio:       parseInt(search, 10) }
          ]
        }
      : {};

    const totalCount  = await VehiculoDatos.countDocuments(filter);
    const data        = await VehiculoDatos.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('id_cliente')
      .populate('id_modelo')
      .populate('id_color');
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({ data, page, totalPages, totalCount });
  } catch (error) {
    next(error);
  }
};

export const getVehiculoDatosById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await VehiculoDatos.findById(req.params.id)
      .populate('id_cliente')
      .populate('id_modelo')
      .populate('id_color');

    if (!item) {
      res.status(404).json({ message: 'VehiculoDatos no encontrado' });
      return;
    }
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

export const createVehiculoDatos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { chasis, id_cliente, id_modelo, id_color, anio } = req.body;
    const newItem = new VehiculoDatos({ chasis, id_cliente, id_modelo, id_color, anio });
    const saved   = await newItem.save();

    const populated = await VehiculoDatos.findById(saved._id)
      .populate('id_cliente')
      .populate('id_modelo')
      .populate('id_color')
      .exec();

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const updateVehiculoDatos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await VehiculoDatos.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('id_cliente')
      .populate('id_modelo')
      .populate('id_color')
      .exec();

    if (!updated) {
      res.status(404).json({ message: 'VehiculoDatos no encontrado' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteVehiculoDatos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await VehiculoDatos.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'VehiculoDatos no encontrado' });
      return;
    }
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export const getVehiculosByCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const vehiculos = await VehiculoDatos.find({ id_cliente: id })
      .populate({
        path: 'id_modelo',
        populate: {
          path: 'id_marca',
          model: 'MarcaVehiculo'
        }
      })
      .populate('id_color')
      .populate('id_cliente');

    res.status(200).json(vehiculos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener vehículos', error });
  }
};

export const toggleActivoVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id     = req.params.id;
    const { activo } = req.body as { activo: boolean };
    const updated = await VehiculoDatos.findByIdAndUpdate(id, { activo }, { new: true })
      .populate('id_cliente')
      .populate('id_modelo')
      .populate('id_color')
      .exec();

    if (!updated) {
      res.status(404).json({ message: 'No encontrado' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import { InspeccionVehiculo } from '../models/inspeccionVehiculo';
import { ReparacionVehiculo } from '../models/reparacionVehiculo';

export const getAllInspeccionVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string };
    const filter = search
      ? {
        $or: [
          { id_recibo: search },
          { id_empleadoInformacion: search },
          { comentario: { $regex: search, $options: 'i' } },
          { resultado: { $regex: search, $options: 'i' } }
        ]
      }
      : {};
    const items = await InspeccionVehiculo.find(filter)
      .populate({
        path: 'id_recibo',
        populate: {
          path: 'id_recepcion',
          populate: [
            {
              path: 'id_vehiculo',
              populate: [
                {
                  path: 'id_cliente',
                  select: 'nombre cedula numero_telefono tipo_cliente'
                },
                {
                  path: 'id_modelo',
                  select: 'nombre_modelo',
                  populate: {
                    path: 'id_marca',
                    select: 'nombre_marca'
                  }
                },
                {
                  path: 'id_color',
                  select: 'nombre_color'
                }
              ]
            },
            {
              path: 'id_empleadoInformacion',
              select: 'nombre telefono tipo_empleado'
            }
          ]
        }
      })
      .populate('id_empleadoInformacion', 'nombre telefono tipo_empleado');
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

export const getPaginatedInspeccionVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10);
    const limit = parseInt((req.query.limit as string) ?? '10', 10);
    const { search } = req.query as { search?: string };
    const filter = search
      ? {
        $or: [
          { id_recibo: search },
          { id_empleadoInformacion: search },
          { comentario: { $regex: search, $options: 'i' } },
          { resultado: { $regex: search, $options: 'i' } }
        ]
      }
      : {};
    const totalCount = await InspeccionVehiculo.countDocuments(filter);
    const data = await InspeccionVehiculo.find(filter)
      .populate({
        path: 'id_recibo',
        populate: {
          path: 'id_recepcion',
          populate: [
            {
              path: 'id_vehiculo',
              populate: [
                {
                  path: 'id_cliente',
                  select: 'nombre cedula numero_telefono tipo_cliente'
                },
                {
                  path: 'id_modelo',
                  select: 'nombre_modelo',
                  populate: {
                    path: 'id_marca',
                    select: 'nombre_marca'
                  }
                },
                {
                  path: 'id_color',
                  select: 'nombre_color'
                }
              ]
            },
            {
              path: 'id_empleadoInformacion',
              select: 'nombre telefono tipo_empleado'
            }
          ]
        }
      })
      .populate('id_empleadoInformacion', 'nombre telefono tipo_empleado')
      .skip((page - 1) * limit)
      .limit(limit);
    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({ data, page, totalPages, totalCount });
  } catch (error) {
    next(error);
  }
};

export const getInspeccionVehiculoById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await InspeccionVehiculo.findById(req.params.id)
      .populate({
        path: 'id_recibo',
        populate: {
          path: 'id_recepcion',
          populate: [
            {
              path: 'id_vehiculo',
              populate: [
                {
                  path: 'id_cliente',
                  select: 'nombre cedula numero_telefono tipo_cliente'
                },
                {
                  path: 'id_modelo',
                  select: 'nombre_modelo',
                  populate: {
                    path: 'id_marca',
                    select: 'nombre_marca'
                  }
                },
                {
                  path: 'id_color',
                  select: 'nombre_color'
                }
              ]
            },
            {
              path: 'id_empleadoInformacion',
              select: 'nombre telefono tipo_empleado'
            }
          ]
        }
      })
      .populate('id_empleadoInformacion', 'nombre telefono tipo_empleado');
    if (!item) {
      res.status(404).json({ message: 'Inspección no encontrada' });
      return;
    }
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

export const createInspeccionVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      id_recibo,
      id_empleadoInformacion,
      comentario,
      tiempo_estimado,
      costo_mano_obra,
      costo_aproximado,
      resultado,
      piezas_sugeridas
    } = req.body;

    if (!id_recibo || !id_empleadoInformacion) {
      res.status(400).json({ message: 'id_recibo e id_empleadoInformacion son requeridos' });
      return;
    }

    const newItem = new InspeccionVehiculo({
      id_recibo,
      id_empleadoInformacion,
      comentario,
      tiempo_estimado,
      costo_mano_obra,
      costo_aproximado,
      resultado,
      piezas_sugeridas
    });

    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

export const updateInspeccionVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await InspeccionVehiculo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ message: 'Inspección no encontrada' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteInspeccionVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const inspeccion = await InspeccionVehiculo.findById(req.params.id);
    if (!inspeccion) {
      res.status(404).json({ message: 'Inspección no encontrada' });
      return;
    }

    const reparacionAsociada = await ReparacionVehiculo.findOne({ id_inspeccion: req.params.id });
    if (reparacionAsociada) {
      res.status(400).json({
        message: 'No se puede eliminar esta inspección porque ya tiene una relación con una reparación',
        details: 'Para eliminar esta inspección, primero debe eliminar la reparación asociada'
      });
      return;
    }

    const deleted = await InspeccionVehiculo.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

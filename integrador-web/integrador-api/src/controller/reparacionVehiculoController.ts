import { Request, Response, NextFunction } from 'express';
import { ReparacionVehiculo } from '../models/reparacionVehiculo';
import { PiezaUsada } from '../models/piezaUsada';
import { PiezaInventario } from '../models/piezaInventario';

export const getAllReparacionVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
          $or: [
            { id_inspeccion: search },
            { id_empleado: search },
            { descripcion: { $regex: search, $options: 'i' } }
          ]
        }
      : {}
    const items = await ReparacionVehiculo.find(filter)
    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedReparacionVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
          $or: [
            { id_inspeccion: search },
            { id_empleado: search },
            { descripcion: { $regex: search, $options: 'i' } }
          ]
        }
      : {}
    const totalCount = await ReparacionVehiculo.countDocuments(filter)
    const data = await ReparacionVehiculo.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getReparacionVehiculoById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await ReparacionVehiculo.findById(req.params.id)
    if (!item) {
      res.status(404).json({ message: 'Reparación no encontrada' })
      return
    }
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const createReparacionVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      id_inspeccion,
      id_empleadoInformacion,
      fecha_inicio,
      fecha_fin,
      descripcion,
      costo_total,
      piezas_usadas // [{ id_pieza, cantidad }]
    } = req.body;

    if (!id_inspeccion || !id_empleadoInformacion || !descripcion) {
      res.status(400).json({ message: 'id_inspeccion, id_empleadoInformacion y descripcion son requeridos' });
      return;
    }

    // Registrar piezas usadas y descontar inventario
    let piezasUsadasIds: any[] = [];
    if (Array.isArray(piezas_usadas)) {
      for (const pieza of piezas_usadas) {
        const piezaUsada = await PiezaUsada.create({
          id_pieza: pieza.id_pieza,
          cantidad: pieza.cantidad,
          origen: 'reparacion',
          referencia: null // Se actualizará luego con el id de la reparación
        });
        piezasUsadasIds.push(piezaUsada._id);

        // Descontar inventario
        await PiezaInventario.findByIdAndUpdate(
          pieza.id_pieza,
          { $inc: { cantidad_disponible: -pieza.cantidad } }
        );
      }
    }

    // Crear la reparación
    const reparacion = new ReparacionVehiculo({
      id_inspeccion,
      id_empleadoInformacion,
      fecha_inicio,
      fecha_fin,
      descripcion,
      costo_total,
      piezas_usadas: piezasUsadasIds
    });

    const saved = await reparacion.save();

    // Actualizar referencia en piezas usadas
    await PiezaUsada.updateMany(
      { _id: { $in: piezasUsadasIds } },
      { referencia: saved._id }
    );

    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
}

export const updateReparacionVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await ReparacionVehiculo.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) {
      res.status(404).json({ message: 'Reparación no encontrada' })
      return
    }
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const deleteReparacionVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await ReparacionVehiculo.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'Reparación no encontrada' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

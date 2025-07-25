import { Request, Response, NextFunction } from 'express'
import { ReparacionVehiculo } from '../models/reparacionVehiculo'

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
    const { id_inspeccion, id_empleado, descripcion, fecha_fin, costo_total } = req.body
    const newItem = new ReparacionVehiculo({ id_inspeccion, id_empleado, descripcion, fecha_fin, costo_total })
    const saved = await newItem.save()
    res.status(201).json(saved)
  } catch (error) {
    next(error)
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

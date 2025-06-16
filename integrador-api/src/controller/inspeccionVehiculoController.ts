import { Request, Response, NextFunction } from 'express'
import { InspeccionVehiculo } from '../models/inspeccionVehiculo'

export const getAllInspeccionVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
          $or: [
            { id_recibo: search },
            { id_empleado: search },
            { comentario: { $regex: search, $options: 'i' } },
            { resultado: { $regex: search, $options: 'i' } }
          ]
        }
      : {}
    const items = await InspeccionVehiculo.find(filter)
    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedInspeccionVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
          $or: [
            { id_recibo: search },
            { id_empleado: search },
            { comentario: { $regex: search, $options: 'i' } },
            { resultado: { $regex: search, $options: 'i' } }
          ]
        }
      : {}
    const totalCount = await InspeccionVehiculo.countDocuments(filter)
    const data = await InspeccionVehiculo.find(filter).skip((page - 1) * limit).limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getInspeccionVehiculoById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await InspeccionVehiculo.findById(req.params.id)
    if (!item) {
      res.status(404).json({ message: 'Inspección no encontrada' })
      return
    }
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const createInspeccionVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id_recibo, id_empleado, fecha_inspeccion, comentario, tiempo_estimado, costo_mano_obra, costo_aproximado, resultado } = req.body
    const newItem = new InspeccionVehiculo({ id_recibo, id_empleado, fecha_inspeccion, comentario, tiempo_estimado, costo_mano_obra, costo_aproximado, resultado })
    const saved = await newItem.save()
    res.status(201).json(saved)
  } catch (error) {
    next(error)
  }
}

export const updateInspeccionVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await InspeccionVehiculo.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) {
      res.status(404).json({ message: 'Inspección no encontrada' })
      return
    }
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const deleteInspeccionVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await InspeccionVehiculo.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'Inspección no encontrada' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

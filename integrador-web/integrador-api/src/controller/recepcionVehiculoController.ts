
import { Request, Response, NextFunction } from 'express'
import { RecepcionVehiculo } from '../models/recepcionVehiculo'

export const getAllRecepcionVehiculo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
          $or: [
            { id_empleadoInformacion: search },
            { id_vehiculo: search },
            { comentario: { $regex: search, $options: 'i' } },
            { problema_reportado: { $regex: search, $options: 'i' } }
          ]
        }
      : {}
    const items = await RecepcionVehiculo.find(filter)
    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedRecepcionVehiculo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
          $or: [
            { id_empleadoInformacion: search },
            { id_vehiculo: search },
            { comentario: { $regex: search, $options: 'i' } },
            { problema_reportado: { $regex: search, $options: 'i' } }
          ]
        }
      : {}
    const totalCount = await RecepcionVehiculo.countDocuments(filter)
    const data = await RecepcionVehiculo.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getRecepcionVehiculoById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const item = await RecepcionVehiculo.findById(req.params.id)
    if (!item) {
      res.status(404).json({ message: 'Recepción no encontrada' })
      return
    }
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const createRecepcionVehiculo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      id_empleadoInformacion,
      id_vehiculo,
      comentario,
      problema_reportado
    } = req.body

    const newItem = new RecepcionVehiculo({
      id_empleadoInformacion,
      id_vehiculo,
      comentario,
      problema_reportado
    })
    const saved = await newItem.save()
    res.status(201).json(saved)
  } catch (error) {
    next(error)
  }
}

export const updateRecepcionVehiculo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updated = await RecepcionVehiculo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    if (!updated) {
      res.status(404).json({ message: 'Recepción no encontrada' })
      return
    }
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const deleteRecepcionVehiculo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await RecepcionVehiculo.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'Recepción no encontrada' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

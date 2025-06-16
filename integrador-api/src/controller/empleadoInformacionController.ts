import { Request, Response, NextFunction } from 'express'
import { EmpleadoInformacion } from '../models/empleadoInformacion'
export const getAllEmpleadoInformacion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
        $or: [
          { id_cliente: search },
          { id_tipo_empleado: search }
        ]
      }
      : {}
    const items = await EmpleadoInformacion.find(filter)
    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedEmpleadoInformacion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
        $or: [
          { id_cliente: search },
          { id_tipo_empleado: search }
        ]
      }
      : {}
    const totalCount = await EmpleadoInformacion.countDocuments(filter)
    const data = await EmpleadoInformacion.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getEmpleadoInformacionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await EmpleadoInformacion.findById(req.params.id)
    if (!item) {
      res.status(404).json({ message: 'EmpleadoInformacion no encontrada' })
      return
    }
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const createEmpleadoInformacion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id_cliente, id_tipo_empleado } = req.body
    const newItem = new EmpleadoInformacion({ id_cliente, id_tipo_empleado })
    const saved = await newItem.save()
    res.status(201).json(saved)
  } catch (error) {
    next(error)
  }
}

export const updateEmpleadoInformacion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await EmpleadoInformacion.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) {
      res.status(404).json({ message: 'EmpleadoInformacion no encontrada' })
      return
    }
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const deleteEmpleadoInformacion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await EmpleadoInformacion.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'EmpleadoInformacion no encontrada' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

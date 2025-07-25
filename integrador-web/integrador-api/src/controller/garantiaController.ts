import { Request, Response, NextFunction } from 'express'
import { Garantia } from '../models/garantia'

export const getAllGarantia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
          $or: [
            { id_reparacion: search },
            { id_empleado: search },
            { tipo_garantia: { $regex: search, $options: 'i' } }
          ]
        }
      : {}
    const items = await Garantia.find(filter)
    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedGarantia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
          $or: [
            { id_reparacion: search },
            { id_empleado: search },
            { tipo_garantia: { $regex: search, $options: 'i' } }
          ]
        }
      : {}
    const totalCount = await Garantia.countDocuments(filter)
    const data = await Garantia.find(filter).skip((page - 1) * limit).limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getGarantiaById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Garantia.findById(req.params.id)
    if (!item) {
      res.status(404).json({ message: 'Garantía no encontrada' })
      return
    }
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const createGarantia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id_reparacion, id_empleado, fecha_expiracion, tipo_garantia, descripcion } = req.body
    const newItem = new Garantia({ id_reparacion, id_empleado, fecha_expiracion, tipo_garantia, descripcion })
    const saved = await newItem.save()
    res.status(201).json(saved)
  } catch (error) {
    next(error)
  }
}

export const updateGarantia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await Garantia.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) {
      res.status(404).json({ message: 'Garantía no encontrada' })
      return
    }
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const deleteGarantia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await Garantia.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'Garantía no encontrada' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

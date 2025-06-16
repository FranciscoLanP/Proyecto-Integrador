import { Request, Response, NextFunction } from 'express'
import { VehiculoDatos } from '../models/vehiculoDatos'

export const getAllVehiculoDatos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
          $or: [
            { chasis: { $regex: search, $options: 'i' } },
            { id_cliente: search },
            { id_modelo: search },
            { id_color: search }
          ]
        }
      : {}
    const items = await VehiculoDatos.find(filter)
    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedVehiculoDatos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
          $or: [
            { chasis: { $regex: search, $options: 'i' } },
            { id_cliente: search },
            { id_modelo: search },
            { id_color: search }
          ]
        }
      : {}
    const totalCount = await VehiculoDatos.countDocuments(filter)
    const data = await VehiculoDatos.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getVehiculoDatosById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await VehiculoDatos.findById(req.params.id)
    if (!item) {
      res.status(404).json({ message: 'VehiculoDatos no encontrado' })
      return
    }
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const createVehiculoDatos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { chasis, id_cliente, id_modelo, id_color } = req.body
    const newItem = new VehiculoDatos({ chasis, id_cliente, id_modelo, id_color })
    const saved = await newItem.save()
    res.status(201).json(saved)
  } catch (error) {
    next(error)
  }
}

export const updateVehiculoDatos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await VehiculoDatos.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) {
      res.status(404).json({ message: 'VehiculoDatos no encontrado' })
      return
    }
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const deleteVehiculoDatos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await VehiculoDatos.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'VehiculoDatos no encontrado' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

import { Request, Response, NextFunction } from 'express'
import { ReciboVehiculo } from '../models/reciboVehiculo'

export const getAllReciboVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
          $or: [
            { id_recepcion: search },
            { observaciones: { $regex: search, $options: 'i' } }
          ]
        }
      : {}
    const items = await ReciboVehiculo.find(filter)
    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedReciboVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
          $or: [
            { id_recepcion: search },
            { observaciones: { $regex: search, $options: 'i' } }
          ]
        }
      : {}
    const totalCount = await ReciboVehiculo.countDocuments(filter)
    const data = await ReciboVehiculo.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getReciboVehiculoById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await ReciboVehiculo.findById(req.params.id)
    if (!item) {
      res.status(404).json({ message: 'ReciboVehiculo no encontrado' })
      return
    }
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const createReciboVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id_recepcion, observaciones } = req.body
    const newItem = new ReciboVehiculo({ id_recepcion, observaciones })
    const saved = await newItem.save()
    res.status(201).json(saved)
  } catch (error) {
    next(error)
  }
}

export const updateReciboVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await ReciboVehiculo.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) {
      res.status(404).json({ message: 'ReciboVehiculo no encontrado' })
      return
    }
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const deleteReciboVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await ReciboVehiculo.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'ReciboVehiculo no encontrado' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

import { Request, Response, NextFunction } from 'express'
import { MetodoPago } from '../models/metodoPago'

export const getAllMetodoPago = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
          $or: [
            { nombre_metodo: { $regex: search, $options: 'i' } },
            { id_metodo_pago: Number(search) }
          ]
        }
      : {}
    const items = await MetodoPago.find(filter)
    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedMetodoPago = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
          $or: [
            { nombre_metodo: { $regex: search, $options: 'i' } },
            { id_metodo_pago: Number(search) }
          ]
        }
      : {}
    const totalCount = await MetodoPago.countDocuments(filter)
    const data = await MetodoPago.find(filter).skip((page - 1) * limit).limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getMetodoPagoById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await MetodoPago.findById(req.params.id)
    if (!item) {
      res.status(404).json({ message: 'Método de pago no encontrado' })
      return
    }
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const createMetodoPago = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id_metodo_pago, nombre_metodo, id_tipo_pago } = req.body
    const newItem = new MetodoPago({ id_metodo_pago, nombre_metodo, id_tipo_pago })
    const saved = await newItem.save()
    res.status(201).json(saved)
  } catch (error) {
    next(error)
  }
}

export const updateMetodoPago = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await MetodoPago.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) {
      res.status(404).json({ message: 'Método de pago no encontrado' })
      return
    }
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const deleteMetodoPago = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await MetodoPago.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'Método de pago no encontrado' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

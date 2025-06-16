import { Request, Response, NextFunction } from 'express'
import { PiezaInventario } from '../models/piezaInventario'

export const getAllPiezaInventario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
          $or: [
            { serial: { $regex: search, $options: 'i' } },
            { nombre_pieza: { $regex: search, $options: 'i' } }
          ]
        }
      : {}
    const items = await PiezaInventario.find(filter)
    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedPiezaInventario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
          $or: [
            { serial: { $regex: search, $options: 'i' } },
            { nombre_pieza: { $regex: search, $options: 'i' } }
          ]
        }
      : {}
    const totalCount = await PiezaInventario.countDocuments(filter)
    const data = await PiezaInventario.find(filter).skip((page - 1) * limit).limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getPiezaInventarioById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await PiezaInventario.findById(req.params.id)
    if (!item) {
      res.status(404).json({ message: 'PiezaInventario no encontrada' })
      return
    }
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const createPiezaInventario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { serial, nombre_pieza, id_tipo_pieza, costo, id_suplidor } = req.body
    const newItem = new PiezaInventario({ serial, nombre_pieza, id_tipo_pieza, costo, id_suplidor })
    const saved = await newItem.save()
    res.status(201).json(saved)
  } catch (error) {
    next(error)
  }
}

export const updatePiezaInventario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await PiezaInventario.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) {
      res.status(404).json({ message: 'PiezaInventario no encontrada' })
      return
    }
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const deletePiezaInventario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await PiezaInventario.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'PiezaInventario no encontrada' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

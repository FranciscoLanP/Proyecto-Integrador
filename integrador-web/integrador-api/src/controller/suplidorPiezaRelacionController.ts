import { Request, Response, NextFunction } from 'express'
import { SuplidorPiezaRelacion } from '../models/suplidorPiezaRelacion'

export const getAllSuplidorPiezaRelacion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
        $or: [
          { id_suplidor: search },
          { id_pieza: search }
        ]
      }
      : {}
    const items = await SuplidorPiezaRelacion.find(filter)
    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedSuplidorPiezaRelacion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
        $or: [
          { id_suplidor: search },
          { id_pieza: search }
        ]
      }
      : {}
    const totalCount = await SuplidorPiezaRelacion.countDocuments(filter)
    const data = await SuplidorPiezaRelacion.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getSuplidorPiezaRelacionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await SuplidorPiezaRelacion.findById(req.params.id)
    if (!item) {
      res.status(404).json({ message: 'SuplidorPiezaRelacion no encontrada' })
      return
    }
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const createSuplidorPiezaRelacion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id_suplidor, id_pieza } = req.body
    const newItem = new SuplidorPiezaRelacion({ id_suplidor, id_pieza })
    const saved = await newItem.save()
    res.status(201).json(saved)
  } catch (error) {
    next(error)
  }
}

export const updateSuplidorPiezaRelacion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await SuplidorPiezaRelacion.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) {
      res.status(404).json({ message: 'SuplidorPiezaRelacion no encontrada' })
      return
    }
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const deleteSuplidorPiezaRelacion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await SuplidorPiezaRelacion.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'SuplidorPiezaRelacion no encontrada' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

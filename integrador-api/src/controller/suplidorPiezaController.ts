import { Request, Response, NextFunction } from 'express'
import { SuplidorPieza } from '../models/suplidorPieza'

export const getAllSuplidorPieza = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search ? { id_cliente: search } : {}
    const items = await SuplidorPieza.find(filter)
    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedSuplidorPieza = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search ? { id_cliente: search } : {}
    const totalCount = await SuplidorPieza.countDocuments(filter)
    const data = await SuplidorPieza.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getSuplidorPiezaById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await SuplidorPieza.findById(req.params.id)
    if (!item) {
      res.status(404).json({ message: 'SuplidorPieza no encontrada' })
      return
    }
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const createSuplidorPieza = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id_cliente } = req.body
    const newItem = new SuplidorPieza({ id_cliente })
    const saved = await newItem.save()
    res.status(201).json(saved)
  } catch (error) {
    next(error)
  }
}

export const updateSuplidorPieza = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await SuplidorPieza.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) {
      res.status(404).json({ message: 'SuplidorPieza no encontrada' })
      return
    }
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const deleteSuplidorPieza = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await SuplidorPieza.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'SuplidorPieza no encontrada' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

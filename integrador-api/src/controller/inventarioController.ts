import { Request, Response, NextFunction } from 'express'
import { Inventario } from '../models/inventario'

export const getAllInventario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search ? { id_pieza: search } : {}
    const inventarios = await Inventario.find(filter)
    res.status(200).json(inventarios)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedInventario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search ? { id_pieza: search } : {}
    const totalCount = await Inventario.countDocuments(filter)
    const data = await Inventario.find(filter).skip((page - 1) * limit).limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getInventarioById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const inv = await Inventario.findById(req.params.id)
    if (!inv) {
      res.status(404).json({ message: 'Inventario no encontrado' })
      return
    }
    res.status(200).json(inv)
  } catch (error) {
    next(error)
  }
}

export const createInventario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id_pieza, cantidad_disponible, costo_promedio } = req.body
    const newInv = new Inventario({ id_pieza, cantidad_disponible, costo_promedio })
    const saved = await newInv.save()
    res.status(201).json(saved)
  } catch (error) {
    next(error)
  }
}

export const updateInventario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await Inventario.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) {
      res.status(404).json({ message: 'Inventario no encontrado' })
      return
    }
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const deleteInventario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await Inventario.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'Inventario no encontrado' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

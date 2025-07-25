import { Request, Response, NextFunction } from 'express'
import { Provincia } from '../models/provincia'

export const getAllProvincia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search
      ? { nombre_provincia: { $regex: search, $options: 'i' } }
      : {}
    const items = await Provincia.find(filter)
    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedProvincia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search
      ? { nombre_provincia: { $regex: search, $options: 'i' } }
      : {}
    const totalCount = await Provincia.countDocuments(filter)
    const data = await Provincia.find(filter).skip((page - 1) * limit).limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getProvinciaById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Provincia.findById(req.params.id)
    if (!item) {
      res.status(404).json({ message: 'Provincia no encontrada' })
      return
    }
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const createProvincia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { nombre_provincia } = req.body
    const newItem = new Provincia({ nombre_provincia })
    const saved = await newItem.save()
    res.status(201).json(saved)
  } catch (error) {
    next(error)
  }
}

export const updateProvincia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await Provincia.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) {
      res.status(404).json({ message: 'Provincia no encontrada' })
      return
    }
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const deleteProvincia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await Provincia.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'Provincia no encontrada' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

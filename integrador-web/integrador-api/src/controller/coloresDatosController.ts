import { Request, Response, NextFunction } from 'express'
import { ColoresDatos } from '../models/coloresDatos'

export const getAllColoresDatos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search ? { nombre_color: { $regex: search, $options: 'i' } } : {}
    const items = await ColoresDatos.find(filter)
    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedColoresDatos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search ? { nombre_color: { $regex: search, $options: 'i' } } : {}
    const totalCount = await ColoresDatos.countDocuments(filter)
    const data = await ColoresDatos.find(filter).skip((page - 1) * limit).limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getColoresDatosById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await ColoresDatos.findById(req.params.id)
    if (!item) {
      res.status(404).json({ message: 'ColoresDatos no encontrada' })
      return
    }
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const createColoresDatos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { nombre_color } = req.body
    const newItem = new ColoresDatos({ nombre_color })
    const saved = await newItem.save()
    res.status(201).json(saved)
  } catch (error) {
    next(error)
  }
}

export const updateColoresDatos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await ColoresDatos.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) {
      res.status(404).json({ message: 'ColoresDatos no encontrada' })
      return
    }
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const deleteColoresDatos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await ColoresDatos.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'ColoresDatos no encontrada' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

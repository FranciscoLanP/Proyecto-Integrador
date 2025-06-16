
import { Request, Response, NextFunction } from 'express'
import { Distrito } from '../models/distrito'

export const getAllDistrito = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search ? { nombre_distrito: { $regex: search, $options: 'i' } } : {}
    const items = await Distrito.find(filter)
    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedDistrito = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search ? { nombre_distrito: { $regex: search, $options: 'i' } } : {}
    const totalCount = await Distrito.countDocuments(filter)
    const data = await Distrito.find(filter).skip((page - 1) * limit).limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getDistritoById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Distrito.findById(req.params.id)
    if (!item) {
      res.status(404).json({ message: 'Distrito no encontrado' })
      return
    }
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const createDistrito = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { nombre_distrito, id_sector } = req.body
    const newItem = new Distrito({ nombre_distrito, id_sector })
    const saved = await newItem.save()
    res.status(201).json(saved)
  } catch (error) {
    next(error)
  }
}

export const updateDistrito = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await Distrito.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) {
      res.status(404).json({ message: 'Distrito no encontrado' })
      return
    }
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const deleteDistrito = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await Distrito.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'Distrito no encontrado' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

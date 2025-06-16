import { Request, Response, NextFunction } from 'express'
import { Sector } from '../models/sector'

export const getAllSector = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
        $or: [
          { nombre_sector: { $regex: search, $options: 'i' } },
          { id_municipio: search }
        ]
      }
      : {}
    const items = await Sector.find(filter)
    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedSector = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
        $or: [
          { nombre_sector: { $regex: search, $options: 'i' } },
          { id_municipio: search }
        ]
      }
      : {}
    const totalCount = await Sector.countDocuments(filter)
    const data = await Sector.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getSectorById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Sector.findById(req.params.id)
    if (!item) {
      res.status(404).json({ message: 'Sector no encontrado' })
      return
    }
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const createSector = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { nombre_sector, id_municipio } = req.body
    const newItem = new Sector({ nombre_sector, id_municipio })
    const saved = await newItem.save()
    res.status(201).json(saved)
  } catch (error) {
    next(error)
  }
}

export const updateSector = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await Sector.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) {
      res.status(404).json({ message: 'Sector no encontrado' })
      return
    }
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const deleteSector = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await Sector.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'Sector no encontrado' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

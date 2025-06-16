import { Request, Response, NextFunction } from 'express'
import { MarcaVehiculo } from '../models/marcaVehiculo'

export const getAllMarcaVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search
      ? { nombre_marca: { $regex: search, $options: 'i' } }
      : {}
    const items = await MarcaVehiculo.find(filter)
    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedMarcaVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search
      ? { nombre_marca: { $regex: search, $options: 'i' } }
      : {}
    const totalCount = await MarcaVehiculo.countDocuments(filter)
    const data = await MarcaVehiculo.find(filter).skip((page - 1) * limit).limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getMarcaVehiculoById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await MarcaVehiculo.findById(req.params.id)
    if (!item) {
      res.status(404).json({ message: 'MarcaVehiculo no encontrada' })
      return
    }
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const createMarcaVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { nombre_marca } = req.body
    const newItem = new MarcaVehiculo({ nombre_marca })
    const saved = await newItem.save()
    res.status(201).json(saved)
  } catch (error) {
    next(error)
  }
}

export const updateMarcaVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await MarcaVehiculo.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) {
      res.status(404).json({ message: 'MarcaVehiculo no encontrada' })
      return
    }
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const deleteMarcaVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await MarcaVehiculo.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'MarcaVehiculo no encontrada' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

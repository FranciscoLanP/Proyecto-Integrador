import { Request, Response, NextFunction } from 'express'
import { Municipio } from '../models/municipio'

export const getAllMunicipio = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search
      ? { nombre_municipio: { $regex: search, $options: 'i' } }
      : {}
    const items = await Municipio.find(filter)
    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedMunicipio = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search
      ? { nombre_municipio: { $regex: search, $options: 'i' } }
      : {}
    const totalCount = await Municipio.countDocuments(filter)
    const data = await Municipio.find(filter).skip((page - 1) * limit).limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getMunicipioById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Municipio.findById(req.params.id)
    if (!item) {
      res.status(404).json({ message: 'Municipio no encontrado' })
      return
    }
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const createMunicipio = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { nombre_municipio, id_provincia } = req.body
    const newItem = new Municipio({ nombre_municipio, id_provincia })
    const saved = await newItem.save()
    res.status(201).json(saved)
  } catch (error) {
    next(error)
  }
}

export const updateMunicipio = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await Municipio.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) {
      res.status(404).json({ message: 'Municipio no encontrado' })
      return
    }
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const deleteMunicipio = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await Municipio.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'Municipio no encontrado' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

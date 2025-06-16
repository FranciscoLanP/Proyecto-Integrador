import { Request, Response, NextFunction } from 'express'
import { Cliente } from '../models/cliente'

export const getAllPersona = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
        $or: [
          { nombre: { $regex: search, $options: 'i' } },
          { cedula: { $regex: search, $options: 'i' } },
          { correo: { $regex: search, $options: 'i' } },
          { numero_telefono: { $regex: search, $options: 'i' } }
        ]
      }
      : {}
    const items = await Cliente.find(filter)
    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedPersona = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
        $or: [
          { nombre: { $regex: search, $options: 'i' } },
          { cedula: { $regex: search, $options: 'i' } },
          { correo: { $regex: search, $options: 'i' } },
          { numero_telefono: { $regex: search, $options: 'i' } }
        ]
      }
      : {}
    const totalCount = await Cliente.countDocuments(filter)
    const data = await Cliente.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getPersonaById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Cliente.findById(req.params.id)
    if (!item) {
      res.status(404).json({ message: 'Cliente no encontrada' })
      return
    }
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const createPersona = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { cedula, rnc, nombre, numero_telefono, correo, id_barrio } = req.body
    const newItem = new Cliente({ cedula, rnc, nombre, numero_telefono, correo, id_barrio })
    const saved = await newItem.save()
    res.status(201).json(saved)
  } catch (error) {
    next(error)
  }
}

export const updatePersona = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) {
      res.status(404).json({ message: 'Cliente no encontrada' })
      return
    }
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const deletePersona = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await Cliente.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'Cliente no encontrada' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

import { Request, Response, NextFunction } from 'express'
import { ClienteInformacion } from '../models/clienteInformacion'

export const getAllClienteInformacion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
        $or: [
          { id_cliente: search },
          { id_tipo_cliente: search }
        ]
      }
      : {}
    const items = await ClienteInformacion.find(filter)
    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedClienteInformacion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
        $or: [
          { id_cliente: search },
          { id_tipo_cliente: search }
        ]
      }
      : {}
    const totalCount = await ClienteInformacion.countDocuments(filter)
    const data = await ClienteInformacion.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getClienteInformacionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await ClienteInformacion.findById(req.params.id)
    if (!item) {
      res.status(404).json({ message: 'ClienteInformacion no encontrada' })
      return
    }
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const createClienteInformacion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id_cliente, id_tipo_cliente } = req.body
    const newItem = new ClienteInformacion({ id_cliente, id_tipo_cliente })
    const saved = await newItem.save()
    res.status(201).json(saved)
  } catch (error) {
    next(error)
  }
}

export const updateClienteInformacion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await ClienteInformacion.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) {
      res.status(404).json({ message: 'ClienteInformacion no encontrada' })
      return
    }
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const deleteClienteInformacion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await ClienteInformacion.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'ClienteInformacion no encontrada' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

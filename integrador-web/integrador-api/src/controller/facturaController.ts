import { Request, Response, NextFunction } from 'express'
import { Factura } from '../models/factura'
export const getAllFactura = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
        $or: [
          { id_reparacion: search },
          { id_empleado: search },
          { id_metodo_pago: search }
        ]
      }
      : {}
    const items = await Factura.find(filter)
    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedFactura = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
        $or: [
          { id_reparacion: search },
          { id_empleado: search },
          { id_metodo_pago: search }
        ]
      }
      : {}
    const totalCount = await Factura.countDocuments(filter)
    const data = await Factura.find(filter).skip((page - 1) * limit).limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getFacturaById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Factura.findById(req.params.id)
    if (!item) {
      res.status(404).json({ message: 'Factura no encontrada' })
      return
    }
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const createFactura = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id_reparacion, id_empleado, sub_total, descuento, total, id_metodo_pago } = req.body
    const newItem = new Factura({ id_reparacion, id_empleado, sub_total, descuento, total, id_metodo_pago })
    const saved = await newItem.save()
    res.status(201).json(saved)
  } catch (error) {
    next(error)
  }
}

export const updateFactura = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await Factura.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) {
      res.status(404).json({ message: 'Factura no encontrada' })
      return
    }
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const deleteFactura = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await Factura.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'Factura no encontrada' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

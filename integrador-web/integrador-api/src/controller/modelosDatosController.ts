import { Request, Response, NextFunction } from 'express'
import { ModelosDatos } from '../models/modelosDatos'

export const getAllModelosDatos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, id_marca } = req.query as { search?: string; id_marca?: string };
    const filter: any = {};

    if (search) {
      filter.nombre_modelo = { $regex: search, $options: 'i' };
    }
    if (id_marca) {
      filter.id_marca = id_marca;
    }

    const items = await ModelosDatos.find(filter);
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

export const getPaginatedModelosDatos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search
      ? { nombre_modelo: { $regex: search, $options: 'i' } }
      : {}
    const totalCount = await ModelosDatos.countDocuments(filter)
    const data = await ModelosDatos.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getModelosDatosById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await ModelosDatos.findById(req.params.id)
    if (!item) {
      res.status(404).json({ message: 'ModelosDatos no encontrado' })
      return
    }
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const createModelosDatos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { nombre_modelo, id_marca } = req.body
    const newItem = new ModelosDatos({ nombre_modelo, id_marca })
    const saved = await newItem.save()
    res.status(201).json(saved)
  } catch (error) {
    next(error)
  }
}

export const updateModelosDatos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await ModelosDatos.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) {
      res.status(404).json({ message: 'ModelosDatos no encontrado' })
      return
    }
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const deleteModelosDatos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await ModelosDatos.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'ModelosDatos no encontrado' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

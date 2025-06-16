import { Request, Response, NextFunction } from 'express'
import { TipoCliente } from '../models/clienteTipo'

export const getAllTipoCliente = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search
      ? { nombre_tipo_cliente: { $regex: search, $options: 'i' } }
      : {}
    const items = await TipoCliente.find(filter)
    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedTipoCliente = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search
      ? { nombre_tipo_cliente: { $regex: search, $options: 'i' } }
      : {}
    const totalCount = await TipoCliente.countDocuments(filter)
    const data = await TipoCliente.find(filter).skip((page - 1) * limit).limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getTipoClienteById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await TipoCliente.findById(req.params.id)
    if (!item) {
      res.status(404).json({ message: 'TipoCliente no encontrado' })
      return
    }
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const createTipoCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre_tipo_cliente } = req.body;
    const nuevo = new TipoCliente({ nombre_tipo_cliente });
    const guardado = await nuevo.save();
    res.status(201).json(guardado);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateTipoCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre_tipo_cliente } = req.body;

    const actualizado = await TipoCliente.findByIdAndUpdate(
      id,
      { nombre_tipo_cliente },
      { new: true, runValidators: true }
    );

    if (!actualizado) {
      res.status(404).json({ message: 'Tipo de cliente no encontrado' });
      return;
    }

    res.status(200).json(actualizado);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteTipoCliente = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await TipoCliente.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'TipoCliente no encontrado' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

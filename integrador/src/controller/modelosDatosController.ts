import { Request, Response } from 'express';
import { ModelosDatos } from '../models';

export const getModelosDatosById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const modelo = await ModelosDatos.findById(id);

    if (!modelo) {
      return res.status(404).json({ message: 'Modelo no encontrado' });
    }

    return res.json(modelo);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener el modelo', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getAllModelosDatos = async (_req: Request, res: Response) => {
  try {
    const modelos = await ModelosDatos.find();
    return res.json(modelos);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener los modelos', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getPaginatedModelosDatos = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [total, modelos] = await Promise.all([
      ModelosDatos.countDocuments(),
      ModelosDatos.find().skip(skip).limit(limit),
    ]);

    return res.json({ total, page, limit, data: modelos });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener los modelos paginados', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const createModelosDatos = async (req: Request, res: Response) => {
  try {
    const modelo = await ModelosDatos.create(req.body);
    return res.status(201).json(modelo);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al crear el modelo', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const updateModelosDatos = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const modeloActualizado = await ModelosDatos.findByIdAndUpdate(id, req.body, { new: true });

    if (!modeloActualizado) {
      return res.status(404).json({ message: 'Modelo no encontrado' });
    }

    return res.json(modeloActualizado);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al actualizar el modelo', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

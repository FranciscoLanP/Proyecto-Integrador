import { Request, Response } from 'express';
import { Municipio } from '../models';

export const getMunicipioById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const municipio = await Municipio.findById(id);

    if (!municipio) {
      return res.status(404).json({ message: 'Municipio no encontrado' });
    }

    return res.json(municipio);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener el municipio', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getAllMunicipio = async (_req: Request, res: Response) => {
  try {
    const municipios = await Municipio.find();
    return res.json(municipios);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener los municipios', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getPaginatedMunicipio = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [total, municipios] = await Promise.all([
      Municipio.countDocuments(),
      Municipio.find().skip(skip).limit(limit),
    ]);

    return res.json({ total, page, limit, data: municipios });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener los municipios paginados', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const createMunicipio = async (req: Request, res: Response) => {
  try {
    const municipio = await Municipio.create(req.body);
    return res.status(201).json(municipio);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al crear el municipio', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const updateMunicipio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const municipioActualizado = await Municipio.findByIdAndUpdate(id, req.body, { new: true });

    if (!municipioActualizado) {
      return res.status(404).json({ message: 'Municipio no encontrado' });
    }

    return res.json(municipioActualizado);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al actualizar el municipio', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

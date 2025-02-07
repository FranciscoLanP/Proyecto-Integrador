import { Request, Response } from 'express';
import { Persona } from '../models';

export const getPersonaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const persona = await Persona.findById(id);

    if (!persona) {
      return res.status(404).json({ message: 'Persona no encontrada' });
    }

    return res.json(persona);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener la persona', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getAllPersonas = async (_req: Request, res: Response) => {
  try {
    const personas = await Persona.find();
    return res.json(personas);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener las personas', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getPaginatedPersonas = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [total, personas] = await Promise.all([
      Persona.countDocuments(),
      Persona.find().skip(skip).limit(limit),
    ]);

    return res.json({ total, page, limit, data: personas });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener las personas paginadas', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const createPersona = async (req: Request, res: Response) => {
  try {
    const persona = await Persona.create(req.body);
    return res.status(201).json(persona);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al crear la persona', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const updatePersona = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const personaActualizada = await Persona.findByIdAndUpdate(id, req.body, { new: true });

    if (!personaActualizada) {
      return res.status(404).json({ message: 'Persona no encontrada' });
    }

    return res.json(personaActualizada);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al actualizar la persona', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

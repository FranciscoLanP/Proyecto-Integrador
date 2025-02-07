import { Request, Response } from 'express';
import { EmpleadoInformacion } from '../models';

export const getEmpleadoInformacionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const empleado = await EmpleadoInformacion.findById(id);

    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    return res.json(empleado);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener el empleado', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getAllEmpleadoInformacion = async (_req: Request, res: Response) => {
  try {
    const empleados = await EmpleadoInformacion.find();
    return res.json(empleados);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener los empleados', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getPaginatedEmpleadoInformacion = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [total, empleados] = await Promise.all([
      EmpleadoInformacion.countDocuments(),
      EmpleadoInformacion.find().skip(skip).limit(limit),
    ]);

    return res.json({ total, page, limit, data: empleados });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener los empleados paginados', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const createEmpleadoInformacion = async (req: Request, res: Response) => {
  try {
    const empleado = await EmpleadoInformacion.create(req.body);
    return res.status(201).json(empleado);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al crear el empleado', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const updateEmpleadoInformacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const empleadoActualizado = await EmpleadoInformacion.findByIdAndUpdate(id, req.body, { new: true });

    if (!empleadoActualizado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    return res.json(empleadoActualizado);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al actualizar el empleado', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

import { Request, Response } from 'express';
import { InspeccionVehiculo } from '../models';

export const getInspeccionVehiculoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const inspeccion = await InspeccionVehiculo.findById(id).populate('id_recibo').populate('id_empleado');

    if (!inspeccion) {
      return res.status(404).json({ message: 'Inspección no encontrada' });
    }

    return res.json(inspeccion);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener la inspección', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getAllInspeccionVehiculo = async (_req: Request, res: Response) => {
  try {
    const inspecciones = await InspeccionVehiculo.find().populate('id_recibo').populate('id_empleado');
    return res.json(inspecciones);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener las inspecciones', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getPaginatedInspeccionVehiculo = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [total, inspecciones] = await Promise.all([
      InspeccionVehiculo.countDocuments(),
      InspeccionVehiculo.find().populate('id_recibo').populate('id_empleado').skip(skip).limit(limit),
    ]);

    return res.json({ total, page, limit, data: inspecciones });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener las inspecciones paginadas', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const createInspeccionVehiculo = async (req: Request, res: Response) => {
  try {
    const inspeccion = await InspeccionVehiculo.create(req.body);
    return res.status(201).json(inspeccion);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al crear la inspección', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const updateInspeccionVehiculo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const inspeccionActualizada = await InspeccionVehiculo.findByIdAndUpdate(id, req.body, { new: true })
      .populate('id_recibo')
      .populate('id_empleado');

    if (!inspeccionActualizada) {
      return res.status(404).json({ message: 'Inspección no encontrada' });
    }

    return res.json(inspeccionActualizada);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al actualizar la inspección', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

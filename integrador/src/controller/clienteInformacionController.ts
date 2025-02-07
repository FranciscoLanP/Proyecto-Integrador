import { Request, Response } from 'express';
import { ClienteInformacion } from '../models';

export const getClienteInformacionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cliente = await ClienteInformacion.findById(id);

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    return res.json(cliente);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener el cliente', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getAllClienteInformacion = async (_req: Request, res: Response) => {
  try {
    const clientes = await ClienteInformacion.find();
    return res.json(clientes);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener los clientes', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getPaginatedClienteInformacion = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [total, clientes] = await Promise.all([
      ClienteInformacion.countDocuments(),
      ClienteInformacion.find().skip(skip).limit(limit),
    ]);

    return res.json({ total, page, limit, data: clientes });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener los clientes paginados', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const createClienteInformacion = async (req: Request, res: Response) => {
  try {
    const cliente = await ClienteInformacion.create(req.body);
    return res.status(201).json(cliente);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al crear el cliente', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const updateClienteInformacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clienteActualizado = await ClienteInformacion.findByIdAndUpdate(id, req.body, { new: true });

    if (!clienteActualizado) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    return res.json(clienteActualizado);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al actualizar el cliente', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

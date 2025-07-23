import { Request, Response, NextFunction } from 'express'
import { SuplidorPieza } from '../models/suplidorPieza'

export const getAllSuplidorPieza = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search ? { nombre: search } : {}
    const items = await SuplidorPieza.find(filter)
    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedSuplidorPieza = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search ? { nombre: search } : {}
    const totalCount = await SuplidorPieza.countDocuments(filter)
    const data = await SuplidorPieza.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getSuplidorPiezaById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await SuplidorPieza.findById(req.params.id)
    if (!item) {
      res.status(404).json({ message: 'SuplidorPieza no encontrada' })
      return
    }
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const createSuplidorPieza = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
 try {
    const {
      cedula,
      rnc,
      nombre,
      numero_telefono,
      correo,
      latitude,
      longitude,
      direccion,
      ubicacionLabel
    } = req.body as {
      cedula: string;
      rnc?: string;
      nombre: string;
      numero_telefono: string;
      correo: string;
      latitude: number;
      longitude: number;
      direccion?: string;
      ubicacionLabel?: string;
    };

    const newCliente = new SuplidorPieza({
      cedula,
      rnc,
      nombre,
      numero_telefono,
      correo,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      direccion,
      ubicacionLabel,
    });

    const saved = await newCliente.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
}

export const updateSuplidorPieza = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
   try {
     type Body = Partial<{
       cedula: string;
       rnc: string;
       nombre: string;
       numero_telefono: string;
       correo: string;
       latitude: number;
       longitude: number;
       direccion: string;
       ubicacionLabel: string;
     }>;
 
     const body = req.body as Body;
     const { latitude, longitude, direccion, ubicacionLabel, ...rest } = body;
     const updateData: Record<string, unknown> = { ...rest };
 
     if (latitude !== undefined && longitude !== undefined) {
       updateData.location = {
         type: 'Point',
         coordinates: [longitude, latitude],
       };
     }
     if (direccion !== undefined) {
       updateData.direccion = direccion;
     }
     if (ubicacionLabel !== undefined) {
       updateData.ubicacionLabel = ubicacionLabel;
     }
 
     const updated = await SuplidorPieza.findByIdAndUpdate(
       req.params.id,
       updateData,
       { new: true }
     );
     if (!updated) {
       res.status(404).json({ message: 'Cliente no encontrado' });
       return;
     }
     res.status(200).json(updated);
   } catch (error) {
     next(error);
   }
}

export const deleteSuplidorPieza = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await SuplidorPieza.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'SuplidorPieza no encontrada' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

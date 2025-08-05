import { Request, Response, NextFunction } from 'express'
import { PiezaUsada } from '../models/piezaUsada'
export const getPiezaUsadaById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pieza = await PiezaUsada.findById(req.params.id);
    if (!pieza) {
      res.status(404).json({ message: 'Pieza usada no encontrada' });
      return;
    }
    res.status(200).json(pieza);
  } catch (error) {
    next(error);
  }
};


export const getAllPiezasUsadas = async (req: Request, res: Response): Promise<void> => {
  try {
    const piezas = await PiezaUsada.find().populate('id_pieza')
    res.status(200).json(piezas)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las piezas usadas.' })
  }
}

export const getPiezasPorReferencia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { origen, referencia } = req.params
    const piezas = await PiezaUsada.find({ origen, referencia }).populate('id_pieza')
    res.status(200).json(piezas)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las piezas para la referencia.' })
  }
}

// export const createPiezaUsada = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id_pieza, cantidad, origen, referencia } = req.body

//     if (origen === 'reparacion') {
//       const inventario = await Inventario.findOne({ id_pieza })

//       if (!inventario) {
//         res.status(404).json({ error: 'La pieza no se encuentra en el inventario.' })
//         return
//       }

//       if (inventario.cantidad_disponible < cantidad) {
//         res.status(400).json({
//           error: `Stock insuficiente. Disponible: ${inventario.cantidad_disponible}, solicitado: ${cantidad}`
//         })
//         return
//       }

//       inventario.cantidad_disponible -= cantidad
//       inventario.fecha_actualizacion = new Date()
//       await inventario.save()
//     }

//     const nuevaPieza = new PiezaUsada({ id_pieza, cantidad, origen, referencia })
//     const piezaGuardada = await nuevaPieza.save()

//     res.status(201).json(piezaGuardada)
//   } catch (error) {
//     res.status(400).json({ error: 'Error al crear la pieza usada.' })
//   }
// }

export const updatePiezaUsada = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const piezaActualizada = await PiezaUsada.findByIdAndUpdate(id, req.body, { new: true })
    res.status(200).json(piezaActualizada)
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar la pieza usada.' })
  }
}

export const deletePiezaUsada = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    await PiezaUsada.findByIdAndDelete(id)
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: 'Error al eliminar la pieza usada.' })
  }
}

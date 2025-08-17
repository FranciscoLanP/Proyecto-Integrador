import { Request, Response, NextFunction } from 'express';
import { ReparacionVehiculo } from '../models/reparacionVehiculo';
import { PiezaUsada } from '../models/piezaUsada';
import { PiezaInventario } from '../models/piezaInventario';
import { Factura } from '../models/factura';

export const getAllReparacionVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
        $or: [
          { id_inspeccion: search },
          { id_empleado: search },
          { descripcion: { $regex: search, $options: 'i' } }
        ]
      }
      : {}
    const items = await ReparacionVehiculo.find(filter)
      .populate({
        path: 'piezas_usadas',
        populate: {
          path: 'id_pieza',
          select: 'nombre_pieza costo_promedio precio'
        }
      })
      .populate({
        path: 'id_inspeccion',
        populate: {
          path: 'id_recibo',
          populate: {
            path: 'id_recepcion',
            populate: [
              {
                path: 'id_vehiculo',
                populate: [
                  {
                    path: 'id_cliente',
                    select: 'nombre cedula numero_telefono tipo_cliente'
                  },
                  {
                    path: 'id_modelo',
                    select: 'nombre_modelo',
                    populate: {
                      path: 'id_marca',
                      select: 'nombre_marca'
                    }
                  },
                  {
                    path: 'id_color',
                    select: 'nombre_color'
                  }
                ]
              },
              {
                path: 'id_empleadoInformacion',
                select: 'nombre telefono tipo_empleado'
              }
            ]
          }
        }
      })
      .populate({
        path: 'empleados_trabajos.id_empleado',
        select: 'nombre telefono tipo_empleado'
      })
      .populate('id_empleadoInformacion', 'nombre telefono tipo_empleado')
    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedReparacionVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
        $or: [
          { id_inspeccion: search },
          { id_empleado: search },
          { descripcion: { $regex: search, $options: 'i' } }
        ]
      }
      : {}
    const totalCount = await ReparacionVehiculo.countDocuments(filter)
    const data = await ReparacionVehiculo.find(filter)
      .populate({
        path: 'piezas_usadas',
        populate: {
          path: 'id_pieza',
          select: 'nombre_pieza costo_promedio precio'
        }
      })
      .populate({
        path: 'id_inspeccion',
        populate: {
          path: 'id_recibo',
          populate: {
            path: 'id_recepcion',
            populate: [
              {
                path: 'id_vehiculo',
                populate: [
                  {
                    path: 'id_cliente',
                    select: 'nombre cedula numero_telefono tipo_cliente'
                  },
                  {
                    path: 'id_modelo',
                    select: 'nombre_modelo',
                    populate: {
                      path: 'id_marca',
                      select: 'nombre_marca'
                    }
                  },
                  {
                    path: 'id_color',
                    select: 'nombre_color'
                  }
                ]
              },
              {
                path: 'id_empleadoInformacion',
                select: 'nombre telefono tipo_empleado'
              }
            ]
          }
        }
      })
      .populate('id_empleadoInformacion', 'nombre telefono tipo_empleado')
      .skip((page - 1) * limit)
      .limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getReparacionVehiculoById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await ReparacionVehiculo.findById(req.params.id)
      .populate({
        path: 'piezas_usadas',
        populate: {
          path: 'id_pieza',
          select: 'nombre_pieza costo_promedio precio'
        }
      })
      .populate({
        path: 'id_inspeccion',
        populate: {
          path: 'id_recibo',
          populate: {
            path: 'id_recepcion',
            populate: [
              {
                path: 'id_vehiculo',
                populate: [
                  {
                    path: 'id_cliente',
                    select: 'nombre cedula numero_telefono tipo_cliente'
                  },
                  {
                    path: 'id_modelo',
                    select: 'nombre_modelo',
                    populate: {
                      path: 'id_marca',
                      select: 'nombre_marca'
                    }
                  },
                  {
                    path: 'id_color',
                    select: 'nombre_color'
                  }
                ]
              },
              {
                path: 'id_empleadoInformacion',
                select: 'nombre telefono tipo_empleado'
              }
            ]
          }
        }
      })
      .populate('id_empleadoInformacion', 'nombre telefono tipo_empleado')
    if (!item) {
      res.status(404).json({ message: 'Reparación no encontrada' })
      return
    }
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

export const createReparacionVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      id_inspeccion,
      empleados_trabajos,
      fecha_inicio,
      fecha_fin,
      descripcion,
      costo_total,
      piezas_usadas,
      id_empleadoInformacion
    } = req.body;

    if (!id_inspeccion || !descripcion) {
      res.status(400).json({ message: 'id_inspeccion y descripcion son requeridos' });
      return;
    }

    if ((!empleados_trabajos || empleados_trabajos.length === 0) && !id_empleadoInformacion) {
      res.status(400).json({ message: 'Se requiere al menos un empleado' });
      return;
    }

    let empleadosFinales = empleados_trabajos || [];
    if (id_empleadoInformacion && empleadosFinales.length === 0) {
      empleadosFinales = [{
        id_empleado: id_empleadoInformacion,
        descripcion_trabajo: 'Trabajo general de reparación'
      }];
    }

    const reparacion = new ReparacionVehiculo({
      id_inspeccion,
      empleados_trabajos: empleadosFinales,
      fecha_inicio,
      fecha_fin,
      descripcion,
      costo_total,
      piezas_usadas: [],
      id_empleadoInformacion: id_empleadoInformacion || empleadosFinales[0]?.id_empleado
    });
    const savedReparacion = await reparacion.save();

    let piezasUsadasIds: any[] = [];
    if (Array.isArray(piezas_usadas)) {
      for (const pieza of piezas_usadas) {
        const piezaUsada = await PiezaUsada.create({
          id_pieza: pieza.id_pieza,
          cantidad: pieza.cantidad,
          origen: 'reparacion',
          referencia: savedReparacion._id
        });
        piezasUsadasIds.push(piezaUsada._id);

        await PiezaInventario.findByIdAndUpdate(
          pieza.id_pieza,
          { $inc: { cantidad_disponible: -pieza.cantidad } }
        );
      }
    }

    savedReparacion.piezas_usadas = piezasUsadasIds;
    await savedReparacion.save();

    res.status(201).json(savedReparacion);
  } catch (error) {
    next(error);
  }
};

export const updateReparacionVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      id_inspeccion,
      empleados_trabajos,
      fecha_inicio,
      fecha_fin,
      descripcion,
      costo_total,
      piezas_usadas,

      id_empleadoInformacion
    } = req.body;

    const reparacionActual = await ReparacionVehiculo.findById(req.params.id)
      .populate('piezas_usadas')
      .populate({
        path: 'id_inspeccion',
        populate: {
          path: 'id_recibo',
          populate: {
            path: 'id_cliente'
          }
        }
      })
      .populate('id_empleadoInformacion')
      .populate('empleados_trabajos.id_empleado');
    if (!reparacionActual) {
      res.status(404).json({ message: 'Reparación no encontrada' });
      return;
    }

    if ((!empleados_trabajos || empleados_trabajos.length === 0) && !id_empleadoInformacion) {
      res.status(400).json({ message: 'Se requiere al menos un empleado' });
      return;
    }

    let empleadosFinales = empleados_trabajos || [];
    if (id_empleadoInformacion && empleadosFinales.length === 0) {
      empleadosFinales = [{
        id_empleado: id_empleadoInformacion,
        descripcion_trabajo: 'Trabajo general de reparación'
      }];
    }

    if (reparacionActual.piezas_usadas && reparacionActual.piezas_usadas.length > 0) {
      for (const piezaUsadaId of reparacionActual.piezas_usadas) {
        const piezaUsada = await PiezaUsada.findById(piezaUsadaId);
        if (piezaUsada) {
          await PiezaInventario.findByIdAndUpdate(
            piezaUsada.id_pieza,
            { $inc: { cantidad_disponible: piezaUsada.cantidad } }
          );
          await PiezaUsada.findByIdAndDelete(piezaUsadaId);
        }
      }
    }

    let piezasUsadasIds: any[] = [];
    if (Array.isArray(piezas_usadas)) {
      for (const pieza of piezas_usadas) {
        const piezaUsada = await PiezaUsada.create({
          id_pieza: pieza.id_pieza,
          cantidad: pieza.cantidad,
          origen: 'reparacion',
          referencia: req.params.id
        });
        piezasUsadasIds.push(piezaUsada._id);

        await PiezaInventario.findByIdAndUpdate(
          pieza.id_pieza,
          { $inc: { cantidad_disponible: -pieza.cantidad } }
        );
      }
    }

    const updated = await ReparacionVehiculo.findByIdAndUpdate(
      req.params.id,
      {
        id_inspeccion,
        empleados_trabajos: empleadosFinales,
        fecha_inicio,
        fecha_fin,
        descripcion,
        costo_total,
        piezas_usadas: piezasUsadasIds,
        id_empleadoInformacion: id_empleadoInformacion || empleadosFinales[0]?.id_empleado
      },
      { new: true }
    ).populate('piezas_usadas')
      .populate({
        path: 'id_inspeccion',
        populate: {
          path: 'id_recibo',
          populate: {
            path: 'id_recepcion',
            populate: [
              {
                path: 'id_vehiculo',
                populate: [
                  {
                    path: 'id_cliente',
                    select: 'nombre cedula numero_telefono tipo_cliente'
                  },
                  {
                    path: 'id_modelo',
                    select: 'nombre_modelo',
                    populate: {
                      path: 'id_marca',
                      select: 'nombre_marca'
                    }
                  },
                  {
                    path: 'id_color',
                    select: 'nombre_color'
                  }
                ]
              },
              {
                path: 'id_empleadoInformacion',
                select: 'nombre telefono tipo_empleado'
              }
            ]
          }
        }
      })
      .populate({
        path: 'empleados_trabajos.id_empleado',
        select: 'nombre telefono tipo_empleado'
      })
      .populate('id_empleadoInformacion', 'nombre telefono tipo_empleado');

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
}

export const deleteReparacionVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Verificar si la reparación existe
    const reparacion = await ReparacionVehiculo.findById(req.params.id)
      .populate('piezas_usadas')
      .populate({
        path: 'id_inspeccion',
        populate: {
          path: 'id_recibo',
          populate: {
            path: 'id_recepcion',
            populate: [
              {
                path: 'id_vehiculo',
                populate: [
                  {
                    path: 'id_cliente',
                    select: 'nombre cedula numero_telefono tipo_cliente'
                  },
                  {
                    path: 'id_modelo',
                    select: 'nombre_modelo',
                    populate: {
                      path: 'id_marca',
                      select: 'nombre_marca'
                    }
                  },
                  {
                    path: 'id_color',
                    select: 'nombre_color'
                  }
                ]
              },
              {
                path: 'id_empleadoInformacion',
                select: 'nombre telefono tipo_empleado'
              }
            ]
          }
        }
      })
      .populate('id_empleadoInformacion', 'nombre telefono tipo_empleado');

    if (!reparacion) {
      res.status(404).json({ message: 'Reparación no encontrada' });
      return;
    }

    const facturaAsociada = await Factura.findOne({ id_reparacion: req.params.id });
    if (facturaAsociada) {
      res.status(400).json({
        message: 'No se puede eliminar esta reparación porque ya tiene una relación con una factura',
        details: 'Para eliminar esta reparación, primero debe eliminar la factura asociada'
      });
      return;
    }

    if (reparacion.piezas_usadas && reparacion.piezas_usadas.length > 0) {
      for (const piezaUsadaId of reparacion.piezas_usadas) {
        const piezaUsada = await PiezaUsada.findById(piezaUsadaId);
        if (piezaUsada) {
          await PiezaInventario.findByIdAndUpdate(
            piezaUsada.id_pieza,
            { $inc: { cantidad_disponible: piezaUsada.cantidad } }
          );
          await PiezaUsada.findByIdAndDelete(piezaUsadaId);
        }
      }
    }

    await ReparacionVehiculo.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}

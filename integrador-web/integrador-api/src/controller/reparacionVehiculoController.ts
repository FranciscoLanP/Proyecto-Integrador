import { Request, Response, NextFunction } from 'express';
import { ReparacionVehiculo } from '../models/reparacionVehiculo';
import { PiezaUsada } from '../models/piezaUsada';
import { PiezaInventario } from '../models/piezaInventario';

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
      // Poblar los empleados en el nuevo campo empleados_trabajos
      .populate({
        path: 'empleados_trabajos.id_empleado',
        select: 'nombre telefono tipo_empleado'
      })
      // Mantener compatibilidad con el campo anterior
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
      empleados_trabajos, // [{ id_empleado, descripcion_trabajo }]
      fecha_inicio,
      fecha_fin,
      descripcion,
      costo_total,
      piezas_usadas, // [{ id_pieza, cantidad }]
      // Compatibilidad con campo anterior
      id_empleadoInformacion
    } = req.body;

    if (!id_inspeccion || !descripcion) {
      res.status(400).json({ message: 'id_inspeccion y descripcion son requeridos' });
      return;
    }

    // Verificar que hay al menos un empleado (nuevo campo o campo anterior)
    if ((!empleados_trabajos || empleados_trabajos.length === 0) && !id_empleadoInformacion) {
      res.status(400).json({ message: 'Se requiere al menos un empleado' });
      return;
    }

    // Si viene el campo anterior, convertirlo al nuevo formato
    let empleadosFinales = empleados_trabajos || [];
    if (id_empleadoInformacion && empleadosFinales.length === 0) {
      empleadosFinales = [{
        id_empleado: id_empleadoInformacion,
        descripcion_trabajo: 'Trabajo general de reparación'
      }];
    }

    // 1. Crear la reparación SIN piezas_usadas
    const reparacion = new ReparacionVehiculo({
      id_inspeccion,
      empleados_trabajos: empleadosFinales,
      fecha_inicio,
      fecha_fin,
      descripcion,
      costo_total,
      piezas_usadas: [],
      // Mantener compatibilidad
      id_empleadoInformacion: id_empleadoInformacion || empleadosFinales[0]?.id_empleado
    });
    const savedReparacion = await reparacion.save();

    // 2. Crear las piezas usadas con referencia al id de la reparación
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

        // Descontar inventario
        await PiezaInventario.findByIdAndUpdate(
          pieza.id_pieza,
          { $inc: { cantidad_disponible: -pieza.cantidad } }
        );
      }
    }

    // 3. Actualizar la reparación con los ids de las piezas usadas
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
      empleados_trabajos, // [{ id_empleado, descripcion_trabajo }]
      fecha_inicio,
      fecha_fin,
      descripcion,
      costo_total,
      piezas_usadas, // [{ id_pieza, cantidad }]
      // Compatibilidad con campo anterior
      id_empleadoInformacion
    } = req.body;

    // 1. Obtener la reparación actual para restaurar inventario de piezas anteriores
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

    // Verificar que hay al menos un empleado (nuevo campo o campo anterior)
    if ((!empleados_trabajos || empleados_trabajos.length === 0) && !id_empleadoInformacion) {
      res.status(400).json({ message: 'Se requiere al menos un empleado' });
      return;
    }

    // Si viene el campo anterior, convertirlo al nuevo formato
    let empleadosFinales = empleados_trabajos || [];
    if (id_empleadoInformacion && empleadosFinales.length === 0) {
      empleadosFinales = [{
        id_empleado: id_empleadoInformacion,
        descripcion_trabajo: 'Trabajo general de reparación'
      }];
    }

    // 2. Restaurar inventario de las piezas usadas anteriores
    if (reparacionActual.piezas_usadas && reparacionActual.piezas_usadas.length > 0) {
      for (const piezaUsadaId of reparacionActual.piezas_usadas) {
        const piezaUsada = await PiezaUsada.findById(piezaUsadaId);
        if (piezaUsada) {
          // Restaurar cantidad al inventario
          await PiezaInventario.findByIdAndUpdate(
            piezaUsada.id_pieza,
            { $inc: { cantidad_disponible: piezaUsada.cantidad } }
          );
          // Eliminar la pieza usada
          await PiezaUsada.findByIdAndDelete(piezaUsadaId);
        }
      }
    }

    // 3. Crear las nuevas piezas usadas
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

        // Descontar inventario
        await PiezaInventario.findByIdAndUpdate(
          pieza.id_pieza,
          { $inc: { cantidad_disponible: -pieza.cantidad } }
        );
      }
    }

    // 4. Actualizar la reparación
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
        // Mantener compatibilidad
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
      // Poblar los empleados en el nuevo campo empleados_trabajos
      .populate({
        path: 'empleados_trabajos.id_empleado',
        select: 'nombre telefono tipo_empleado'
      })
      // Mantener compatibilidad con el campo anterior
      .populate('id_empleadoInformacion', 'nombre telefono tipo_empleado');

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
}

export const deleteReparacionVehiculo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Obtener la reparación con sus piezas usadas
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

    // 2. Restaurar inventario de las piezas usadas
    if (reparacion.piezas_usadas && reparacion.piezas_usadas.length > 0) {
      for (const piezaUsadaId of reparacion.piezas_usadas) {
        const piezaUsada = await PiezaUsada.findById(piezaUsadaId);
        if (piezaUsada) {
          // Restaurar cantidad al inventario
          await PiezaInventario.findByIdAndUpdate(
            piezaUsada.id_pieza,
            { $inc: { cantidad_disponible: piezaUsada.cantidad } }
          );
          // Eliminar la pieza usada
          await PiezaUsada.findByIdAndDelete(piezaUsadaId);
        }
      }
    }

    // 3. Eliminar la reparación
    await ReparacionVehiculo.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}

import { Request, Response, NextFunction } from 'express'
import { Factura } from '../models/factura'
export const getAllFactura = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
        $or: [
          { id_reparacion: search },
          { metodo_pago: { $regex: search, $options: 'i' } },
          { detalles: { $regex: search, $options: 'i' } }
        ]
      }
      : {}
    const items = await Factura.find(filter)
      .populate({
        path: 'id_reparacion',
        populate: [
          {
            path: 'id_empleadoInformacion',
            model: 'EmpleadoInformacion'
            // Traer todos los campos del empleado
          },
          {
            path: 'piezas_usadas',
            populate: {
              path: 'id_pieza',
              model: 'PiezaInventario'
              // Traer todos los campos de la pieza
            }
          },
          {
            path: 'id_inspeccion',
            populate: {
              path: 'id_recibo',
              model: 'ReciboVehiculo',
              populate: {
                path: 'id_recepcion',
                model: 'RecepcionVehiculo',
                populate: [
                  {
                    path: 'id_empleadoInformacion',
                    model: 'EmpleadoInformacion'
                    // Traer todos los campos del empleado de recepción
                  },
                  {
                    path: 'id_vehiculo',
                    model: 'VehiculoDatos',
                    populate: [
                      {
                        path: 'id_cliente',
                        model: 'Cliente'
                        // Traer todos los campos del cliente
                      },
                      {
                        path: 'id_modelo',
                        model: 'ModelosDatos',
                        populate: {
                          path: 'id_marca',
                          model: 'MarcaVehiculo'
                          // Traer todos los campos de la marca
                        }
                        // Traer todos los campos del modelo
                      },
                      {
                        path: 'id_color',
                        model: 'ColoresDatos'
                        // Traer todos los campos del color
                      }
                    ]
                    // Traer todos los campos del vehículo
                  }
                ]
              }
            }
          }
        ]
        // Traer todos los campos de la reparación
      })
    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

export const getPaginatedFactura = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10)
    const limit = parseInt((req.query.limit as string) ?? '10', 10)
    const { search } = req.query as { search?: string }
    const filter = search
      ? {
        $or: [
          { id_reparacion: search },
          { metodo_pago: { $regex: search, $options: 'i' } },
          { detalles: { $regex: search, $options: 'i' } }
        ]
      }
      : {}
    const totalCount = await Factura.countDocuments(filter)
    const data = await Factura.find(filter)
      .populate({
        path: 'id_reparacion',
        populate: [
          {
            path: 'id_empleadoInformacion',
            model: 'EmpleadoInformacion'
          },
          {
            path: 'piezas_usadas',
            populate: {
              path: 'id_pieza',
              model: 'PiezaInventario'
            }
          },
          {
            path: 'id_inspeccion',
            populate: {
              path: 'id_recibo',
              model: 'ReciboVehiculo',
              populate: {
                path: 'id_recepcion',
                model: 'RecepcionVehiculo',
                populate: [
                  {
                    path: 'id_empleadoInformacion',
                    model: 'EmpleadoInformacion'
                  },
                  {
                    path: 'id_vehiculo',
                    model: 'VehiculoDatos',
                    populate: [
                      {
                        path: 'id_cliente',
                        model: 'Cliente'
                      },
                      {
                        path: 'id_modelo',
                        model: 'ModelosDatos',
                        populate: {
                          path: 'id_marca',
                          model: 'MarcaVehiculo'
                        }
                      },
                      {
                        path: 'id_color',
                        model: 'ColoresDatos'
                      }
                    ]
                  }
                ]
              }
            }
          }
        ]
      })
      .skip((page - 1) * limit)
      .limit(limit)
    const totalPages = Math.ceil(totalCount / limit)
    res.status(200).json({ data, page, totalPages, totalCount })
  } catch (error) {
    next(error)
  }
}

export const getFacturaById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Factura.findById(req.params.id)
      .populate({
        path: 'id_reparacion',
        populate: [
          {
            path: 'id_empleadoInformacion',
            model: 'EmpleadoInformacion'
          },
          {
            path: 'piezas_usadas',
            populate: {
              path: 'id_pieza',
              model: 'PiezaInventario'
            }
          },
          {
            path: 'id_inspeccion',
            populate: {
              path: 'id_recibo',
              model: 'ReciboVehiculo',
              populate: {
                path: 'id_recepcion',
                model: 'RecepcionVehiculo',
                populate: [
                  {
                    path: 'id_empleadoInformacion',
                    model: 'EmpleadoInformacion'
                  },
                  {
                    path: 'id_vehiculo',
                    model: 'VehiculoDatos',
                    populate: [
                      {
                        path: 'id_cliente',
                        model: 'Cliente'
                      },
                      {
                        path: 'id_modelo',
                        model: 'ModelosDatos',
                        populate: {
                          path: 'id_marca',
                          model: 'MarcaVehiculo'
                        }
                      },
                      {
                        path: 'id_color',
                        model: 'ColoresDatos'
                      }
                    ]
                  }
                ]
              }
            }
          }
        ]
      })
    if (!item) {
      res.status(404).json({ message: 'Factura no encontrada' })
      return
    }

    // Enriquecer la factura con información adicional si está poblada
    const enrichedItem: any = item.toObject()

    // Extraer información del cliente si está disponible
    try {
      const reparacion = enrichedItem.id_reparacion as any
      if (reparacion && typeof reparacion === 'object') {
        const inspeccion = reparacion.id_inspeccion
        if (inspeccion && typeof inspeccion === 'object') {
          const cliente = inspeccion.id_recibo?.id_recepcion?.id_vehiculo?.id_cliente
          if (cliente && typeof cliente === 'object') {
            enrichedItem.nombre_cliente = cliente.nombre || cliente.primer_nombre || 'Cliente N/A'
          }
        }
      }
    } catch (error) {
      console.warn('No se pudo extraer información del cliente:', error)
    }

    res.status(200).json(enrichedItem)
  } catch (error) {
    next(error)
  }
}

export const createFactura = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id_reparacion, fecha_emision, total, metodo_pago, tipo_factura, detalles, emitida, descuento_porcentaje } = req.body

    if (!id_reparacion || !fecha_emision || !total || !metodo_pago) {
      res.status(400).json({ message: 'Campos requeridos: id_reparacion, fecha_emision, total, metodo_pago' })
      return
    }

    const newItem = new Factura({
      id_reparacion,
      fecha_emision,
      total,
      metodo_pago,
      tipo_factura: tipo_factura || 'Contado',
      detalles: detalles || '',
      emitida: emitida || false,
      descuento_porcentaje: descuento_porcentaje || 0
    })
    const saved = await newItem.save()
    res.status(201).json(saved)
  } catch (error) {
    next(error)
  }
}

export const updateFactura = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await Factura.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) {
      res.status(404).json({ message: 'Factura no encontrada' })
      return
    }
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const deleteFactura = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await Factura.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'Factura no encontrada' })
      return
    }
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

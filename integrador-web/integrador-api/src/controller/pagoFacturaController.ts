import { Request, Response, NextFunction } from 'express'
import { PagoFactura } from '../models/pagoFactura'
import { Factura } from '../models/factura'
import mongoose from 'mongoose'

export const getAllPagosFactura = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { search } = req.query as { search?: string }
        const filter = search
            ? {
                $or: [
                    { metodoPago: { $regex: search, $options: 'i' } },
                    { referenciaMetodo: { $regex: search, $options: 'i' } },
                    { observaciones: { $regex: search, $options: 'i' } }
                ]
            }
            : {}
        const items = await PagoFactura.find(filter)
            .populate('factura')
            .sort({ fechaPago: -1 })
        res.json(items)
    } catch (error) {
        next(error)
    }
}

export const getPagoFacturaById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'ID inválido' })
            return
        }
        const item = await PagoFactura.findById(id).populate('factura')
        if (!item) {
            res.status(404).json({ message: 'Pago no encontrado' })
            return
        }
        res.json(item)
    } catch (error) {
        next(error)
    }
}

export const getPagosByFactura = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'ID de factura inválido' })
            return
        }

        const pagos = await PagoFactura.find({ factura: id })
            .populate('factura')
            .sort({ fechaPago: -1 })

        const factura = await Factura.findById(id)
        if (!factura) {
            res.status(404).json({ message: 'Factura no encontrada' })
            return
        }

        const totalPagado = pagos.reduce((total: number, pago: any) => total + pago.monto, 0)
        const saldoPendiente = factura.total - totalPagado

        res.json({
            factura: {
                _id: factura._id,
                numero: `FAC-${factura._id.toString().slice(-6)}`,
                montoTotal: factura.total
            },
            pagos,
            resumen: {
                totalPagado,
                saldoPendiente,
                porcentajePagado: (totalPagado / factura.total) * 100
            }
        })
    } catch (error) {
        next(error)
    }
}

export const createPagoFactura = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { facturaId, monto, metodoPago, referenciaMetodo, observaciones, fecha_pago } = req.body

        if (!mongoose.Types.ObjectId.isValid(facturaId)) {
            res.status(400).json({ message: 'ID de factura inválido' })
            return
        }

        const factura = await Factura.findById(facturaId)
        if (!factura) {
            res.status(404).json({ message: 'Factura no encontrada' })
            return
        }

        if (!monto || monto <= 0) {
            res.status(400).json({ message: 'El monto debe ser mayor que 0' })
            return
        }

        const pagoData: any = {
            factura: facturaId,
            monto,
            metodoPago,
            referenciaMetodo,
            observaciones
        }

        if (fecha_pago) {
            pagoData.fechaPago = new Date(fecha_pago)
        }

        const newItem = new PagoFactura(pagoData)

        const savedItem = await newItem.save()
        await savedItem.populate('factura')

        res.status(201).json({
            message: 'Pago registrado exitosamente',
            data: savedItem
        })
    } catch (error) {
        if (error instanceof Error && error.message.includes('excede el saldo')) {
            res.status(400).json({ message: error.message })
            return
        }
        next(error)
    }
}

export const updatePagoFactura = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params
        const { monto, metodoPago, referenciaMetodo, observaciones } = req.body

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'ID inválido' })
            return
        }

        const updatedItem = await PagoFactura.findByIdAndUpdate(
            id,
            { monto, metodoPago, referenciaMetodo, observaciones },
            { new: true, runValidators: true }
        ).populate('factura')

        if (!updatedItem) {
            res.status(404).json({ message: 'Pago no encontrado' })
            return
        }

        res.json({
            message: 'Pago actualizado exitosamente',
            data: updatedItem
        })
    } catch (error) {
        next(error)
    }
}

export const deletePagoFactura = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'ID inválido' })
            return
        }

        const deletedItem = await PagoFactura.findByIdAndDelete(id)
        if (!deletedItem) {
            res.status(404).json({ message: 'Pago no encontrado' })
            return
        }

        res.json({ message: 'Pago eliminado exitosamente' })
    } catch (error) {
        next(error)
    }
}
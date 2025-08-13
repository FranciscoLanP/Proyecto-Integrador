import { Router } from 'express'
import {
    getAllPagosFactura,
    getPagoFacturaById,
    getPagosByFactura,
    createPagoFactura,
    updatePagoFactura,
    deletePagoFactura
} from '../controller/pagoFacturaController'

const router = Router()

router.get('/pagos-facturas/factura/:id', getPagosByFactura)
router.get('/pagos-facturas/:id', getPagoFacturaById)
router.get('/pagos-facturas', getAllPagosFactura)
router.post('/pagos-facturas', createPagoFactura)
router.put('/pagos-facturas/:id', updatePagoFactura)
router.delete('/pagos-facturas/:id', deletePagoFactura)

export default router
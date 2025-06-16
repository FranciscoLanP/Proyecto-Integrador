import { Router } from 'express'
import {
  getAllFactura,
  getPaginatedFactura,
  getFacturaById,
  createFactura,
  updateFactura,
  deleteFactura
} from '../controller/facturaController'

const router = Router()

router.get('/facturas/paginado', getPaginatedFactura)
router.get('/facturas/:id', getFacturaById)
router.get('/facturas', getAllFactura)
router.post('/facturas', createFactura)
router.put('/facturas/:id', updateFactura)
router.delete('/facturas/:id', deleteFactura)

export default router

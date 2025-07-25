import { Router } from 'express'
import {
  getAllMetodoPago,
  getPaginatedMetodoPago,
  getMetodoPagoById,
  createMetodoPago,
  updateMetodoPago,
  deleteMetodoPago
} from '../controller/metodoPagoController'

const router = Router()

router.get('/metodospagos/paginado', getPaginatedMetodoPago)
router.get('/metodospagos/:id', getMetodoPagoById)
router.get('/metodospagos', getAllMetodoPago)
router.post('/metodospagos', createMetodoPago)
router.put('/metodospagos/:id', updateMetodoPago)
router.delete('/metodospagos/:id', deleteMetodoPago)

export default router

import { Router } from 'express'
import {
  getAllGarantia,
  getPaginatedGarantia,
  getGarantiaById,
  createGarantia,
  updateGarantia,
  deleteGarantia
} from '../controller/garantiaController'

const router = Router()

router.get('/garantias/paginado', getPaginatedGarantia)
router.get('/garantias/:id', getGarantiaById)
router.get('/garantias', getAllGarantia)
router.post('/garantias', createGarantia)
router.put('/garantias/:id', updateGarantia)
router.delete('/garantias/:id', deleteGarantia)

export default router

import { Router } from 'express'
import {
  getAllSuplidorPiezaRelacion,
  getPaginatedSuplidorPiezaRelacion,
  getSuplidorPiezaRelacionById,
  createSuplidorPiezaRelacion,
  updateSuplidorPiezaRelacion,
  deleteSuplidorPiezaRelacion
} from '../controller/suplidorPiezaRelacionController'

const router = Router()

router.get('/suplidorpiezasrelaciones/paginado', getPaginatedSuplidorPiezaRelacion)
router.get('/suplidorpiezasrelaciones/:id', getSuplidorPiezaRelacionById)
router.get('/suplidorpiezasrelaciones', getAllSuplidorPiezaRelacion)
router.post('/suplidorpiezasrelaciones', createSuplidorPiezaRelacion)
router.put('/suplidorpiezasrelaciones/:id', updateSuplidorPiezaRelacion)
router.delete('/suplidorpiezasrelaciones/:id', deleteSuplidorPiezaRelacion)

export default router

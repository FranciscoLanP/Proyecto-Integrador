import { Router } from 'express'
import {
  getAllSuplidorPieza,
  getPaginatedSuplidorPieza,
  getSuplidorPiezaById,
  createSuplidorPieza,
  updateSuplidorPieza,
  deleteSuplidorPieza
} from '../controller/suplidorPiezaController'

const router = Router()

router.get('/suplidorpiezas/paginado', getPaginatedSuplidorPieza)
router.get('/suplidorpiezas/:id', getSuplidorPiezaById)
router.get('/suplidorpiezas', getAllSuplidorPieza)
router.post('/suplidorpiezas', createSuplidorPieza)
router.put('/suplidorpiezas/:id', updateSuplidorPieza)
router.delete('/suplidorpiezas/:id', deleteSuplidorPieza)

export default router

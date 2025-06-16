import { Router } from 'express'
import {
  getAllTipoPieza,
  getPaginatedTipoPieza,
  getTipoPiezaById,
  createTipoPieza,
  updateTipoPieza,
  deleteTipoPieza
} from '../controller/tipoPiezaController'

const router = Router()

router.get('/tipospiezas/paginado', getPaginatedTipoPieza)
router.get('/tipospiezas/:id', getTipoPiezaById)
router.get('/tipospiezas', getAllTipoPieza)
router.post('/tipospiezas', createTipoPieza)
router.put('/tipospiezas/:id', updateTipoPieza)
router.delete('/tipospiezas/:id', deleteTipoPieza)

export default router



import { Router } from 'express'
import {
  getAllPiezasUsadas,
  getPiezasPorReferencia,
  // createPiezaUsada,
  updatePiezaUsada,
  deletePiezaUsada
} from '../controller/piezaUsadaController'

const router = Router()

router.get('/piezas-usadas', getAllPiezasUsadas)
router.get('/piezas-usadas/:origen/:referencia', getPiezasPorReferencia)
// router.post('/piezas-usadas', createPiezaUsada)
router.put('/piezas-usadas/:id', updatePiezaUsada)
router.delete('/piezas-usadas/:id', deletePiezaUsada)

export default router

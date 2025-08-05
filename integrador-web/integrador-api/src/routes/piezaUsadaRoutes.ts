

import { Router } from 'express'
import {
  getAllPiezasUsadas,
  getPiezasPorReferencia,
  updatePiezaUsada,
  deletePiezaUsada,
  getPiezaUsadaById
} from '../controller/piezaUsadaController'

const router = Router()

router.get('/piezas-usadas', getAllPiezasUsadas)
router.get('/piezas-usadas/:origen/:referencia', getPiezasPorReferencia)
router.get('/piezas-usadas/:id', getPiezaUsadaById)
router.put('/piezas-usadas/:id', updatePiezaUsada)
router.delete('/piezas-usadas/:id', deletePiezaUsada)

export default router

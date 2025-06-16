import { Router } from 'express'
import {
  getAllTipoCliente,
  getPaginatedTipoCliente,
  getTipoClienteById,
  createTipoCliente,
  updateTipoCliente,
  deleteTipoCliente
} from '../controller/tipoClienteController'

const router = Router()

router.get('/tiposclientes/paginado', getPaginatedTipoCliente)
router.get('/tiposclientes/:id', getTipoClienteById)
router.get('/tiposclientes', getAllTipoCliente)
router.post('/tiposclientes', createTipoCliente)
router.put('/tiposclientes/:id', updateTipoCliente)
router.delete('/tiposclientes/:id', deleteTipoCliente)

export default router

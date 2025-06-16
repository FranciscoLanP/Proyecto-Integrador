import { Router } from 'express'
import {
  getAllProvincia,
  getPaginatedProvincia,
  getProvinciaById,
  createProvincia,
  updateProvincia,
  deleteProvincia
} from '../controller/provinciaController'

const router = Router()

router.get('/provincias/paginado', getPaginatedProvincia)
router.get('/provincias/:id', getProvinciaById)
router.get('/provincias', getAllProvincia)
router.post('/provincias', createProvincia)
router.put('/provincias/:id', updateProvincia)
router.delete('/provincias/:id', deleteProvincia)

export default router

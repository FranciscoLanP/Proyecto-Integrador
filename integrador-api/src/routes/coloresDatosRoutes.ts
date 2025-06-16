import { Router } from 'express'
import {
  getAllColoresDatos,
  getPaginatedColoresDatos,
  getColoresDatosById,
  createColoresDatos,
  updateColoresDatos,
  deleteColoresDatos
} from '../controller/coloresDatosController'

const router = Router()

router.get('/coloresdatos/paginado', getPaginatedColoresDatos)
router.get('/coloresdatos/:id', getColoresDatosById)
router.get('/coloresdatos', getAllColoresDatos)
router.post('/coloresdatos', createColoresDatos)
router.put('/coloresdatos/:id', updateColoresDatos)
router.delete('/coloresdatos/:id', deleteColoresDatos)

export default router

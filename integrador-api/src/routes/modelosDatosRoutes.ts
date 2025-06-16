import { Router } from 'express'
import {
  getAllModelosDatos,
  getPaginatedModelosDatos,
  getModelosDatosById,
  createModelosDatos,
  updateModelosDatos,
  deleteModelosDatos
} from '../controller/modelosDatosController'

const router = Router()

router.get('/modelosdatos/paginado', getPaginatedModelosDatos)
router.get('/modelosdatos/:id', getModelosDatosById)
router.get('/modelosdatos', getAllModelosDatos)
router.post('/modelosdatos', createModelosDatos)
router.put('/modelosdatos/:id', updateModelosDatos)
router.delete('/modelosdatos/:id', deleteModelosDatos)

export default router

import { Router } from 'express'
import {
  getAllTipoEmpleado,
  getPaginatedTipoEmpleado,
  getTipoEmpleadoById,
  createTipoEmpleado,
  updateTipoEmpleado,
  deleteTipoEmpleado
} from '../controller/tipoEmpleadoController'

const router = Router()

router.get('/tiposempleados/paginado', getPaginatedTipoEmpleado)
router.get('/tiposempleados/:id', getTipoEmpleadoById)
router.get('/tiposempleados', getAllTipoEmpleado)
router.post('/tiposempleados', createTipoEmpleado)
router.put('/tiposempleados/:id', updateTipoEmpleado)
router.delete('/tiposempleados/:id', deleteTipoEmpleado)

export default router

import { Router } from 'express'
import {
  getAllEmpleadoInformacion,
  getPaginatedEmpleadoInformacion,
  getEmpleadoInformacionById,
  createEmpleadoInformacion,
  updateEmpleadoInformacion,
  deleteEmpleadoInformacion
} from '../controller/empleadoInformacionController'

const router = Router()

router.get('/empleadoinformaciones/paginado', getPaginatedEmpleadoInformacion)
router.get('/empleadoinformaciones/:id', getEmpleadoInformacionById)
router.get('/empleadoinformaciones', getAllEmpleadoInformacion)
router.post('/empleadoinformaciones', createEmpleadoInformacion)
router.put('/empleadoinformaciones/:id', updateEmpleadoInformacion)
router.delete('/empleadoinformaciones/:id', deleteEmpleadoInformacion)

export default router

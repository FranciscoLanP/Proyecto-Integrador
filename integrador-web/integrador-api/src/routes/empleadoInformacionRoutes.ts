import { Router } from 'express'
import {
  getAllEmpleadoInformacion,
  getPaginatedEmpleadoInformacion,
  getEmpleadoInformacionById,
  createEmpleadoInformacion,
  updateEmpleadoInformacion,
  deleteEmpleadoInformacion
} from '../controller/empleadoInformacionController'
import { authorizeAdmin } from '../middleware/authorize'
import { checkJwt } from '../middleware/checkJwt'

const router = Router()

router.get('/empleadoinformaciones/paginado', checkJwt, authorizeAdmin, getPaginatedEmpleadoInformacion)
router.get('/empleadoinformaciones/:id', checkJwt, authorizeAdmin, getEmpleadoInformacionById)
router.get('/empleadoinformaciones', checkJwt, authorizeAdmin, getAllEmpleadoInformacion)
router.post('/empleadoinformaciones', checkJwt, authorizeAdmin, createEmpleadoInformacion)
router.put('/empleadoinformaciones/:id', checkJwt, authorizeAdmin, updateEmpleadoInformacion)
router.delete('/empleadoinformaciones/:id', checkJwt, authorizeAdmin, deleteEmpleadoInformacion)

export default router

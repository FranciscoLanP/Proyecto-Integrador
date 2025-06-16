import { Router } from 'express'
import {
  getAllPersona,
  getPaginatedPersona,
  getPersonaById,
  createPersona,
  updatePersona,
  deletePersona
} from '../controller/clienteController'

const router = Router()

router.get('/clientes/paginado', getPaginatedPersona)
router.get('/clientes/:id', getPersonaById)
router.get('/clientes', getAllPersona)
router.post('/clientes', createPersona)
router.put('/clientes/:id', updatePersona)
router.delete('/clientes/:id', deletePersona)

export default router

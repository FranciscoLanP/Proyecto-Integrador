import { Router } from 'express'
import { createBarrio, deleteBarrio, getAllBarrio, getBarrioById, getPaginatedBarrio, updateBarrio } from '../controller/barrioController'

const router = Router()

router.get('/barrios/paginado', getPaginatedBarrio)
router.get('/barrios/:id', getBarrioById)
router.get('/barrios', getAllBarrio)
router.post('/barrios', createBarrio)
router.put('/barrios/:id', updateBarrio)
router.delete('/barrios/:id', deleteBarrio)

export default router

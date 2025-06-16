import { Router } from 'express'
import { createClienteInformacion, deleteClienteInformacion, getAllClienteInformacion, getClienteInformacionById, getPaginatedClienteInformacion, updateClienteInformacion } from '../controller/clienteInformacionController'


const router = Router()

router.get('/clienteinformaciones/paginado', getPaginatedClienteInformacion)
router.get('/clienteinformaciones/:id', getClienteInformacionById)
router.get('/clienteinformaciones', getAllClienteInformacion)
router.post('/clienteinformaciones', createClienteInformacion)
router.put('/clienteinformaciones/:id', updateClienteInformacion)
router.delete('/clienteinformaciones/:id', deleteClienteInformacion)

export default router

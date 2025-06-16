import { Router } from 'express'
import {
    getAllUsuarios,
    getPaginatedUsuarios,
    getUsuarioById,
    createUsuario,
    updateUsuario,
    deleteUsuario
} from '../controller/usuariosController'

const router = Router()

router.get('/usuarios/paginado', getPaginatedUsuarios)
router.get('/usuarios/:id', getUsuarioById)
router.get('/usuarios', getAllUsuarios)
router.post('/usuarios', createUsuario)
router.put('/usuarios/:id', updateUsuario)
router.delete('/usuarios/:id', deleteUsuario)

export default router

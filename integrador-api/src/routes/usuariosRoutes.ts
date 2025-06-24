import { Router } from 'express';
import { createUsuario, deleteUsuario, getAllUsuarios, getPaginatedUsuarios, getUsuarioById, updateUsuario } from '../controller/usuariosController';
import { authorizeAdmin } from '../middleware/authorize';


const router = Router();

router.get('/usuarios', getAllUsuarios);
router.get('/usuarios/paginado', getPaginatedUsuarios);
router.get('/usuarios/:id', getUsuarioById);
router.post('/usuarios', createUsuario);
router.put('/usuarios/:id', updateUsuario);
router.delete(
    '/usuarios/:id',
    authorizeAdmin,
    deleteUsuario
);

export default router;

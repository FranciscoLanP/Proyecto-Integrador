import { Router } from 'express';
import { createUsuario, deleteUsuario, getAllUsuarios, getPaginatedUsuarios, getUsuarioById, updateUsuario } from '../controller/usuariosController';
import { authorizeAdmin } from '../middleware/authorize';
import { checkJwt } from '../middleware/checkJwt';


const router = Router();

router.get('/usuarios', checkJwt, authorizeAdmin, getAllUsuarios);
router.get('/usuarios/paginado', checkJwt, authorizeAdmin, getPaginatedUsuarios);
router.get('/usuarios/:id', checkJwt, authorizeAdmin, getUsuarioById);
router.post('/usuarios', checkJwt, authorizeAdmin, createUsuario);
router.put('/usuarios/:id', checkJwt, authorizeAdmin, updateUsuario);
router.delete('/usuarios/:id', checkJwt, authorizeAdmin, deleteUsuario);

export default router;

import { Router } from 'express';
import { createUbicacion, updateUbicacion } from '../controller/ubicacionController';

const router = Router();

router.post('/', createUbicacion);    
router.put('/:id', updateUbicacion);
export default router;
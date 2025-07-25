import { Router } from 'express';
import {
  getAllHistorialCompra,
  getPaginatedHistorialCompra,
  getHistorialCompraById,
  createHistorialCompra,
  updateHistorialCompra,
  deleteHistorialCompra
} from '../controller/historialCompraController';

const router = Router();

router.get('/historialcompra/paginado', getPaginatedHistorialCompra);
router.get('/historialcompra/:id', getHistorialCompraById);
router.get('/historialcompra', getAllHistorialCompra);
router.post('/historialcompra', createHistorialCompra);
router.put('/historialcompra/:id', updateHistorialCompra);
router.delete('/historialcompra/:id', deleteHistorialCompra);

export default router;

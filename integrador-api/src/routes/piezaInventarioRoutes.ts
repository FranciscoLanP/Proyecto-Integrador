// src/routes/piezaInventario.routes.ts

import { Router } from 'express';
import {
  getAllPiezaInventario,
  getPaginatedPiezaInventario,
  getPiezaInventarioById,
  createPiezaInventario,
  addStockPieza,              
  updatePiezaInventario,
  deletePiezaInventario
} from '../controller/piezaInventarioController';

const router = Router();

router.get('/piezasinventario/paginado', getPaginatedPiezaInventario);
router.get('/piezasinventario/:id',    getPiezaInventarioById);
router.get('/piezasinventario',         getAllPiezaInventario);

router.post('/piezasinventario',        createPiezaInventario);

router.post(
  '/piezasinventario/:id/stock',     
  addStockPieza
);

// Actualizar datos generales de la pieza (nombre)
router.put('/piezasinventario/:id',     updatePiezaInventario);

// Eliminar pieza
router.delete('/piezasinventario/:id',  deletePiezaInventario);

export default router;


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
router.get('/piezasinventario/:id', getPiezaInventarioById);
router.get('/piezasinventario', getAllPiezaInventario);
router.post('/piezasinventario', createPiezaInventario);
router.post('/piezasinventario/:id/stock', addStockPieza);
router.put('/piezasinventario/:id', updatePiezaInventario);
router.delete('/piezasinventario/:id', deletePiezaInventario);

export default router;

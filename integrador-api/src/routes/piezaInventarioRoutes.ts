import { Router } from 'express'
import {
  getAllPiezaInventario,
  getPaginatedPiezaInventario,
  getPiezaInventarioById,
  createPiezaInventario,
  updatePiezaInventario,
  deletePiezaInventario
} from '../controller/piezaInventarioController'

const router = Router()

router.get('/piezasinventarios/paginado', getPaginatedPiezaInventario)
router.get('/piezasinventarios/:id', getPiezaInventarioById)
router.get('/piezasinventarios', getAllPiezaInventario)
router.post('/piezasinventarios', createPiezaInventario)
router.put('/piezasinventarios/:id', updatePiezaInventario)
router.delete('/piezasinventarios/:id', deletePiezaInventario)

export default router

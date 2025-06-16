import { Router } from 'express'
import { createInventario, 
    deleteInventario, 
    getAllInventario, 
    getInventarioById, 
    getPaginatedInventario, 
    updateInventario } 
    from '../controller/inventarioController'

const router = Router()

router.get('/inventarios/paginado', getPaginatedInventario)
router.get('/inventarios/:id', getInventarioById)
router.get('/inventarios', getAllInventario)
router.post('/inventarios', createInventario)
router.put('/inventarios/:id', updateInventario)
router.delete('/inventarios/:id', deleteInventario)

export default router

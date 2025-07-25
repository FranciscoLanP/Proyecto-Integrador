import { Router } from 'express'
import { createTiposPagos,
     deleteTiposPagos,
      getAllTiposPagos, 
      getPaginatedTiposPagos,
       getTiposPagosById,
        updateTiposPagos } 
        from '../controller/tiposPagosController'


const router = Router()

router.get('/tipospagos/paginado', getPaginatedTiposPagos)
router.get('/tipospagos/:id', getTiposPagosById)
router.get('/tipospagos', getAllTiposPagos)
router.post('/tipospagos', createTiposPagos)
router.put('/tipospagos/:id', updateTiposPagos)
router.delete('/tipospagos/:id', deleteTiposPagos)

export default router

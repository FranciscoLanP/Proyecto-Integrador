import { Router } from 'express'
import {
    getAllVehiculoDatos,
    getPaginatedVehiculoDatos,
    getVehiculoDatosById,
    createVehiculoDatos,
    updateVehiculoDatos,
    deleteVehiculoDatos
} from '../controller/vehiculoDatosController'

const router = Router()

router.get('/vehiculodatos/paginado', getPaginatedVehiculoDatos)
router.get('/vehiculodatos/:id', getVehiculoDatosById)
router.get('/vehiculodatos', getAllVehiculoDatos)
router.post('/vehiculodatos', createVehiculoDatos)
router.put('/vehiculodatos/:id', updateVehiculoDatos)
router.delete('/vehiculodatos/:id', deleteVehiculoDatos)

export default router

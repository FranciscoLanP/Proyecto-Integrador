import { Router } from 'express'
import {
    getAllVehiculoDatos,
    getPaginatedVehiculoDatos,
    getVehiculoDatosById,
    createVehiculoDatos,
    updateVehiculoDatos,
    deleteVehiculoDatos,
    getVehiculosByCliente,
    toggleActivoVehiculo      
} from '../controller/vehiculoDatosController'

const router = Router()

router.get('/vehiculodatos/paginado', getPaginatedVehiculoDatos)
router.get('/vehiculodatos/:id', getVehiculoDatosById)
router.get('/vehiculodatos', getAllVehiculoDatos)
router.get('/vehiculodatos/cliente/:id', getVehiculosByCliente) 
router.post('/vehiculodatos', createVehiculoDatos)
router.put('/vehiculodatos/:id', updateVehiculoDatos)
router.patch('/vehiculodatos/:id/activo', toggleActivoVehiculo);
router.delete('/vehiculodatos/:id', deleteVehiculoDatos)

export default router

import { Router } from 'express'
import {
  getAllRecepcionVehiculo,
  getPaginatedRecepcionVehiculo,
  getRecepcionVehiculoById,
  createRecepcionVehiculo,
  updateRecepcionVehiculo,
  deleteRecepcionVehiculo
} from '../controller/recepcionVehiculoController'

const router = Router()

router.get('/recepcionvehiculos/paginado', getPaginatedRecepcionVehiculo)
router.get('/recepcionvehiculos/:id', getRecepcionVehiculoById)
router.get('/recepcionvehiculos', getAllRecepcionVehiculo)
router.post('/recepcionvehiculos', createRecepcionVehiculo)
router.put('/recepcionvehiculos/:id', updateRecepcionVehiculo)
router.delete('/recepcionvehiculos/:id', deleteRecepcionVehiculo)

export default router

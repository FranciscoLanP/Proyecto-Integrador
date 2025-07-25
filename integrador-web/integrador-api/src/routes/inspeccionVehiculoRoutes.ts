import { Router } from 'express'
import {
  getAllInspeccionVehiculo,
  getPaginatedInspeccionVehiculo,
  getInspeccionVehiculoById,
  createInspeccionVehiculo,
  updateInspeccionVehiculo,
  deleteInspeccionVehiculo
} from '../controller/inspeccionVehiculoController'

const router = Router()

router.get('/inspeccionvehiculos/paginado', getPaginatedInspeccionVehiculo)
router.get('/inspeccionvehiculos/:id', getInspeccionVehiculoById)
router.get('/inspeccionvehiculos', getAllInspeccionVehiculo)
router.post('/inspeccionvehiculos', createInspeccionVehiculo)
router.put('/inspeccionvehiculos/:id', updateInspeccionVehiculo)
router.delete('/inspeccionvehiculos/:id', deleteInspeccionVehiculo)

export default router

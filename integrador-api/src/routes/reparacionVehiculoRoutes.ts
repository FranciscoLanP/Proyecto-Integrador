import { Router } from 'express'
import {
  getAllReparacionVehiculo,
  getPaginatedReparacionVehiculo,
  getReparacionVehiculoById,
  createReparacionVehiculo,
  updateReparacionVehiculo,
  deleteReparacionVehiculo
} from '../controller/reparacionVehiculoController'

const router = Router()

router.get('/reparacionvehiculos/paginado', getPaginatedReparacionVehiculo)
router.get('/reparacionvehiculos/:id', getReparacionVehiculoById)
router.get('/reparacionvehiculos', getAllReparacionVehiculo)
router.post('/reparacionvehiculos', createReparacionVehiculo)
router.put('/reparacionvehiculos/:id', updateReparacionVehiculo)
router.delete('/reparacionvehiculos/:id', deleteReparacionVehiculo)

export default router

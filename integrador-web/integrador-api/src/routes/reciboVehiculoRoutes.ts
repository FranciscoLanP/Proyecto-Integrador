import { Router } from 'express'
import {
  getAllReciboVehiculo,
  getPaginatedReciboVehiculo,
  getReciboVehiculoById,
  createReciboVehiculo,
  updateReciboVehiculo,
  deleteReciboVehiculo
} from '../controller/reciboVehiculoController'

const router = Router()

router.get('/recibosvehiculos/paginado', getPaginatedReciboVehiculo)
router.get('/recibosvehiculos/:id', getReciboVehiculoById)
router.get('/recibosvehiculos', getAllReciboVehiculo)
router.post('/recibosvehiculos', createReciboVehiculo)
router.put('/recibosvehiculos/:id', updateReciboVehiculo)
router.delete('/recibosvehiculos/:id', deleteReciboVehiculo)

export default router

import { Router } from 'express'
import {
  getAllMarcaVehiculo,
  getPaginatedMarcaVehiculo,
  getMarcaVehiculoById,
  createMarcaVehiculo,
  updateMarcaVehiculo,
  deleteMarcaVehiculo
} from '../controller/marcaVehiculoController'

const router = Router()

router.get('/marcasvehiculos/paginado', getPaginatedMarcaVehiculo)
router.get('/marcasvehiculos/:id', getMarcaVehiculoById)
router.get('/marcasvehiculos', getAllMarcaVehiculo)
router.post('/marcasvehiculos', createMarcaVehiculo)
router.put('/marcasvehiculos/:id', updateMarcaVehiculo)
router.delete('/marcasvehiculos/:id', deleteMarcaVehiculo)

export default router

import { Router } from 'express'
import {
  getAllMunicipio,
  getPaginatedMunicipio,
  getMunicipioById,
  createMunicipio,
  updateMunicipio,
  deleteMunicipio
} from '../controller/municipioController'

const router = Router()

router.get('/municipios/paginado', getPaginatedMunicipio)
router.get('/municipios/:id', getMunicipioById)
router.get('/municipios', getAllMunicipio)
router.post('/municipios', createMunicipio)
router.put('/municipios/:id', updateMunicipio)
router.delete('/municipios/:id', deleteMunicipio)

export default router

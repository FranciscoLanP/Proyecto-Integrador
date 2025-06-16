import { Router } from 'express'
import {
  getAllSector,
  getPaginatedSector,
  getSectorById,
  createSector,
  updateSector,
  deleteSector
} from '../controller/sectorController'

const router = Router()

router.get('/sectores/paginado', getPaginatedSector)
router.get('/sectores/:id', getSectorById)
router.get('/sectores', getAllSector)
router.post('/sectores', createSector)
router.put('/sectores/:id', updateSector)
router.delete('/sectores/:id', deleteSector)

export default router

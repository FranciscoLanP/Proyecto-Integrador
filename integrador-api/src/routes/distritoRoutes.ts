import { Router } from 'express'
import {
  getAllDistrito,
  getPaginatedDistrito,
  getDistritoById,
  createDistrito,
  updateDistrito,
  deleteDistrito
} from '../controller/distritoCotroller'

const router = Router()

router.get('/distritos/paginado', getPaginatedDistrito)
router.get('/distritos/:id', getDistritoById)
router.get('/distritos', getAllDistrito)
router.post('/distritos', createDistrito)
router.put('/distritos/:id', updateDistrito)
router.delete('/distritos/:id', deleteDistrito)

export default router

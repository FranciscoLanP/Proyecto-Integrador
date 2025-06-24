import { Router } from 'express';
import { createCliente, deleteCliente, getAllClientes, getClienteById, getPaginatedClientes, updateCliente } from '../controller/clienteController';

const router = Router();

router.get('/clientes', getAllClientes);
router.get('/clientes/paginado', getPaginatedClientes);
router.get('/clientes/:id', getClienteById);
router.post('/clientes', createCliente);
router.put('/clientes/:id', updateCliente);
router.delete('/clientes/:id', deleteCliente);

export default router;

import { Router } from 'express';
import { login } from '../controller/authController';

const router = Router();

router.post('/login', (req, res, next) => {
    login(req, res, next).catch(next);
});

export default router;
import { Router } from 'express';
import { login, updateProfile, getSecretQuestion, resetPassword, setupSecretQuestion } from '../controller/authController';
import { checkJwt } from '../middleware/checkJwt';

const router = Router();

router.post('/login', (req, res, next) => {
    login(req, res, next).catch(next);
});

router.put('/profile', checkJwt, (req, res, next) => {
    updateProfile(req, res, next).catch(next);
});

router.post('/secret-question', (req, res, next) => {
    getSecretQuestion(req, res, next).catch(next);
});

router.post('/reset-password', (req, res, next) => {
    resetPassword(req, res, next).catch(next);
});

router.post('/setup-secret-question', checkJwt, (req, res, next) => {
    setupSecretQuestion(req, res, next).catch(next);
});

export default router;
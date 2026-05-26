import express from 'express';
import { getProfile, login, register, updateProfile } from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';
import { validateLogin, validateProfile, validateRegister } from '../middleware/validateRequest.js';

const authRouter = express.Router();

authRouter.post('/register', validateRegister, register);
authRouter.post('/login', validateLogin, login);
authRouter.get('/me', authMiddleware, getProfile);
authRouter.put('/profile', authMiddleware, validateProfile, updateProfile);

export default authRouter;

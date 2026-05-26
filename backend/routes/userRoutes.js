import express from 'express';
import { login, register } from '../controllers/userController.js';
import { validateLogin, validateRegister } from '../middleware/validateRequest.js';

const userRouter = express.Router();

userRouter.post('/register', validateRegister, register); 
userRouter.post('/login', validateLogin, login);

export default userRouter;

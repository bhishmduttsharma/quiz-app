import express from 'express'
import authMiddleware from '../middleware/auth.js'
import {
  createResult,
  getAnalytics,
  getLeaderboard,
  getTopPerformers,
  listResults,
} from '../controllers/resultController.js';
import { validateResult } from '../middleware/validateRequest.js';

const resultRouter = express.Router();

resultRouter.get('/top-performers', getTopPerformers);
resultRouter.get('/analytics', authMiddleware, getAnalytics);
resultRouter.get('/leaderboard', authMiddleware, getLeaderboard);
resultRouter.post('/', authMiddleware, validateResult, createResult);
resultRouter.get('/', authMiddleware, listResults);

export default resultRouter;

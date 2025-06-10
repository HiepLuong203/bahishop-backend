// src/routes/revenueRoutes.ts
import { Router } from 'express';
import RevenueController from '../controllers/revenue';
import authenticateToken from '../middlewares/authentication'; 

const router = Router();

router.get('/summary', authenticateToken, RevenueController.getOverallSummary);

router.get('/trend', authenticateToken, RevenueController.getRevenueTrend);

router.get('/top-selling', authenticateToken, RevenueController.getTopSellingProducts);

export default router;
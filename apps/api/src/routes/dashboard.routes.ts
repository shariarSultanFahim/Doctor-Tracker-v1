import { Router, Request, Response } from 'express';
import { DashboardRepository } from '../repositories/dashboard.repository.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const dashboardRepo = new DashboardRepository();

router.use(authMiddleware);

router.get('/summary', async (req: Request, res: Response): Promise<void> => {
  const summary = await dashboardRepo.getSummary();
  res.json({ success: true, data: summary });
});

router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  const { from, to, bucket } = req.query;
  const stats = await dashboardRepo.getStats(
    from as string,
    to as string,
    bucket as 'day' | 'week' | 'month'
  );
  res.json({ success: true, data: stats });
});

export default router;

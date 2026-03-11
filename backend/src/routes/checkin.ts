import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { CheckinModel } from '../models/Checkin';

const router = Router();

/**
 * @swagger
 * /checkin:
 *   post:
 *     summary: 每日签到
 *     tags: [签到]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 description: 签到备注
 *     responses:
 *       201:
 *         description: 签到成功
 *       409:
 *         description: 今日已签到
 */
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { note } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // 检查今日是否已签到
    const existingCheckin = await CheckinModel.findByUserIdAndDate(userId, today);
    if (existingCheckin) {
      return res.status(409).json({ error: '今日已签到' });
    }

    // 创建签到记录
    const checkin = await CheckinModel.create({
      user_id: userId,
      note,
    });

    res.status(201).json({
      message: '签到成功',
      checkin: {
        id: checkin.id,
        checkin_date: checkin.checkin_date,
        note: checkin.note,
      },
    });
  } catch (error: any) {
    console.error('签到失败:', error);
    res.status(500).json({ error: '签到失败' });
  }
});

/**
 * @swagger
 * /checkin:
 *   get:
 *     summary: 获取签到记录
 *     tags: [签到]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: 签到记录列表
 */
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string, 10) || 30;
    const offset = parseInt(req.query.offset as string, 10) || 0;

    const checkins = await CheckinModel.findByUserId(userId, limit, offset);

    res.json({
      checkins: checkins.map((c) => ({
        id: c.id,
        checkin_date: c.checkin_date,
        note: c.note,
        created_at: c.created_at,
      })),
      pagination: {
        limit,
        offset,
      },
    });
  } catch (error: any) {
    console.error('获取签到记录失败:', error);
    res.status(500).json({ error: '获取签到记录失败' });
  }
});

/**
 * @swagger
 * /checkin/stats:
 *   get:
 *     summary: 获取签到统计
 *     tags: [签到]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 签到统计信息
 */
router.get('/stats', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const stats = await CheckinModel.getStats(userId);

    res.json({
      stats: {
        total_count: stats.total_count,
        current_streak: stats.current_streak,
        longest_streak: stats.longest_streak,
        last_checkin_date: stats.last_checkin_date,
      },
    });
  } catch (error: any) {
    console.error('获取签到统计失败:', error);
    res.status(500).json({ error: '获取签到统计失败' });
  }
});

export default router;

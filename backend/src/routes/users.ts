import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { UserModel } from '../models/User';

const router = Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: 获取当前用户信息
 *     tags: [用户]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 用户信息
 */
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await UserModel.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
    });
  } catch (error: any) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: 更新用户信息
 *     tags: [用户]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *               avatar_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新成功
 */
router.put('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const { nickname, avatar_url } = req.body;
    
    const user = await UserModel.update(req.user!.id, {
      nickname,
      avatar_url,
    });

    res.json({
      message: '更新成功',
      user,
    });
  } catch (error: any) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ error: '更新用户信息失败' });
  }
});

export default router;

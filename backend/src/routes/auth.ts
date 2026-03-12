import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { config } from '../config/index';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: 用户注册
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               nickname:
 *                 type: string
 *     responses:
 *       201:
 *         description: 注册成功
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname } = req.body;

    // 验证必填字段
    if (!email || !password || !nickname) {
      return res.status(400).json({ error: '邮箱、密码和昵称为必填项' });
    }

    // 检查邮箱是否已存在
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: '该邮箱已被注册' });
    }

    // 密码加密
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await UserModel.create({
      email,
      password_hash: passwordHash,
      nickname,
    });

    res.status(201).json({
      message: '注册成功',
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      },
    });
  } catch (error: any) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 用户登录
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 登录成功
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 验证必填字段
    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码为必填项' });
    }

    // 查找用户
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 生成 JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as SignOptions
    );

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      },
    });
  } catch (error: any) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

export default router;

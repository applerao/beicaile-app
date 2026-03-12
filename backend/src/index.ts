import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/index';
import { connectDatabase } from './config/database';
import { initDatabaseTables } from './config/init-database';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import checkinRoutes from './routes/checkin';
import { swaggerSpec } from './config/swagger';

dotenv.config();

const app = express();
const PORT = config.port;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API 文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/checkin', checkinRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 启动服务器
const startServer = async () => {
  try {
    // 连接数据库
    await connectDatabase();
    console.log('✅ 数据库连接成功');

    // 初始化数据库表
    await initDatabaseTables();

    // 启动 HTTP 服务
    app.listen(PORT, () => {
      console.log(`🚀 服务器启动在 http://localhost:${PORT}`);
      console.log(`📚 API 文档：http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

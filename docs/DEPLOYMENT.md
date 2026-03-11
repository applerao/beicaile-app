# 部署指南

## 开发环境部署

### 前置要求

- Node.js 20+
- PostgreSQL 15+
- Docker & Docker Compose (可选)

### 方式一：Docker Compose（推荐）

```bash
# 1. 克隆项目
git clone <repository-url>
cd beicaile-app

# 2. 启动所有服务
docker-compose -f docker/docker-compose.yml up -d

# 3. 查看日志
docker-compose -f docker/docker-compose.yml logs -f

# 4. 访问应用
# 前端：http://localhost:3000
# 后端：http://localhost:8000
# API 文档：http://localhost:8000/api-docs
```

### 方式二：本地部署

#### 1. 数据库初始化

```bash
# 安装 PostgreSQL 后执行
psql -U postgres -f database/init.sql
```

#### 2. 后端部署

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件配置数据库连接

# 开发模式运行
npm run dev

# 或生产模式
npm run build
npm start
```

#### 3. 前端部署

```bash
cd frontend

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 或生产构建
npm run build
# 构建产物在 dist/ 目录
```

## 生产环境部署

### Docker 部署

```bash
# 1. 构建生产镜像
docker-compose -f docker/docker-compose.prod.yml build

# 2. 启动服务
docker-compose -f docker/docker-compose.prod.yml up -d

# 3. 查看运行状态
docker-compose -f docker/docker-compose.prod.yml ps
```

### Kubernetes 部署（可选）

创建 Kubernetes 配置文件：

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: beicaile-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: beicaile-backend
  template:
    metadata:
      labels:
        app: beicaile-backend
    spec:
      containers:
      - name: backend
        image: your-registry/beicaile-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: NODE_ENV
          value: "production"
        # 其他环境变量...
```

## 环境变量配置

### 后端环境变量

```bash
# .env
PORT=8000
NODE_ENV=production

# 数据库
DB_HOST=localhost
DB_PORT=5432
DB_NAME=beicaile
DB_USER=postgres
DB_PASSWORD=your-secure-password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

### 前端环境变量

```bash
# .env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

## 数据库备份

```bash
# 备份数据库
pg_dump -U postgres beicaile > backup_$(date +%Y%m%d).sql

# 恢复数据库
psql -U postgres beicaile < backup_20240101.sql
```

## 监控和日志

### 查看日志

```bash
# Docker 日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 系统日志
journalctl -u beicaile-backend -f
```

### 健康检查

```bash
# 后端健康检查
curl http://localhost:8000/health

# 预期响应
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

## 常见问题

### 数据库连接失败

1. 检查 PostgreSQL 是否运行
2. 验证数据库凭据
3. 确认防火墙设置

### 端口冲突

修改 `docker-compose.yml` 或 `.env` 中的端口配置。

### 前端无法连接后端

1. 检查 `VITE_API_BASE_URL` 配置
2. 确认 CORS 设置
3. 验证后端服务是否正常运行

# 快速开始指南

## 5 分钟启动项目

### 步骤 1: 初始化项目（1 分钟）

```bash
cd /home/admin/.openclaw/workspace-secretary/projects/beicaile-app
chmod +x init-project.sh
./init-project.sh
```

### 步骤 2: 启动 Docker 服务（2 分钟）

```bash
cd docker
docker-compose up -d
```

等待服务启动：
```bash
# 查看启动日志
docker-compose logs -f

# 检查服务状态
docker-compose ps
```

### 步骤 3: 访问应用（1 分钟）

打开浏览器访问：
- 🌐 **前端**: http://localhost:3000
- 🔌 **API**: http://localhost:8000
- 📚 **API 文档**: http://localhost:8000/api-docs
- 💾 **数据库**: localhost:5432

### 步骤 4: 测试功能（1 分钟）

1. 点击"立即注册"创建账号
2. 使用新账号登录
3. 进入"签到"页面进行签到
4. 查看"首页"的统计数据

## 常用命令

### Docker 相关

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 查看日志
docker-compose logs -f

# 重启某个服务
docker-compose restart backend

# 重新构建
docker-compose build --no-cache

# 清理所有资源
docker-compose down -v
```

### 开发相关

```bash
# 后端开发模式
cd backend
npm run dev

# 前端开发模式
cd frontend
npm run dev

# 后端构建
cd backend
npm run build

# 前端构建
cd frontend
npm run build
```

### 数据库相关

```bash
# 连接数据库
docker-compose exec db psql -U postgres -d beicaile

# 执行 SQL 文件
docker-compose exec db psql -U postgres -d beicaile -f /docker-entrypoint-initdb.d/init.sql

# 备份数据库
docker-compose exec db pg_dump -U postgres beicaile > backup.sql

# 恢复数据库
docker-compose exec -T db psql -U postgres beicaile < backup.sql
```

## 默认账号

注册一个新账号进行测试，或使用以下测试数据（如果已插入）：

```
邮箱：test@example.com
密码：123456
```

## 故障排查

### 端口被占用

```bash
# 查看端口占用
lsof -i :3000
lsof -i :8000
lsof -i :5432

# 停止占用端口的进程
kill -9 <PID>
```

### Docker 容器启动失败

```bash
# 查看详细日志
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# 重新构建并启动
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 数据库连接失败

```bash
# 检查数据库是否运行
docker-compose ps db

# 测试数据库连接
docker-compose exec db pg_isready -U postgres

# 查看数据库日志
docker-compose logs db
```

### 前端无法连接后端

1. 检查后端是否运行：`docker-compose ps backend`
2. 检查后端日志：`docker-compose logs backend`
3. 确认 API 地址配置正确

## 下一步

- 📖 阅读 `docs/DEVELOPMENT.md` 了解开发指南
- 📖 阅读 `docs/API.md` 了解 API 接口
- 📖 阅读 `docs/DEPLOYMENT.md` 了解部署流程
- 📖 阅读 `IMPLEMENTATION_SUMMARY.md` 了解完整实现

## 获取帮助

遇到问题？

1. 查看日志文件
2. 检查 `.env` 配置
3. 确认所有依赖已安装
4. 重启 Docker 服务

---

**提示**: 建议首次使用时完整阅读所有文档，以获得最佳开发体验。

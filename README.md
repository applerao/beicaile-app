# 被裁了吗 App

一个帮助职场人士记录和管理裁员信息的平台。

## 项目结构

```
beicaile-app/
├── frontend/          # React 前端应用
├── backend/           # Node.js + Express 后端 API
├── database/          # 数据库初始化和迁移脚本
├── docker/            # Docker 配置文件
├── .github/workflows/ # CI/CD 配置
└── docs/              # 项目文档
```

## 技术栈

### 前端
- React 18
- TypeScript
- Ant Design
- Axios
- React Router

### 后端
- Node.js 20
- Express
- TypeScript
- PostgreSQL
- JWT 认证

### 基础设施
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- PostgreSQL 数据库

## 快速开始

```bash
# 初始化项目
./init-project.sh

# 启动开发环境
docker-compose up -d

# 访问应用
# 前端：http://localhost:3000
# 后端 API: http://localhost:8000
# API 文档：http://localhost:8000/api-docs
```

## 核心功能

1. **用户系统** - 注册、登录、个人信息管理
2. **签到功能** - 每日签到记录
3. **裁员信息记录** - 记录和分析裁员情况
4. **数据统计** - 个人签到统计和信息分析

## 开发文档

详细开发文档请参考 `docs/` 目录。

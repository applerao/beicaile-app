# 被裁了吗 - Python 后端

基于 **FastAPI** 的高性能异步后端服务

---

## 🚀 快速开始

### 1. 安装依赖

```bash
# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate  # Linux/macOS
# venv\Scripts\activate   # Windows

# 安装依赖
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
# 复制环境变量示例
cp .env.example .env

# 编辑 .env 文件，修改 JWT_SECRET 等配置
```

### 3. 启动服务

```bash
# 方式 1：使用启动脚本（推荐）
./scripts/start.sh

# 方式 2：直接运行
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 方式 3：开发模式
python -m uvicorn app.main:app --reload
```

### 4. 访问服务

- **API 文档：** http://localhost:8000/api-docs
- **ReDoc 文档：** http://localhost:8000/redoc
- **健康检查：** http://localhost:8000/health

---

## 📁 项目结构

```
backend-python/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 应用入口
│   ├── config.py            # 配置管理
│   ├── database.py          # 数据库连接
│   ├── models/              # SQLAlchemy 模型
│   │   ├── __init__.py
│   │   ├── user.py         # 用户模型
│   │   ├── checkin.py      # 签到模型
│   │   └── layoff.py       # 裁员信息模型
│   ├── schemas/             # Pydantic 模型
│   │   ├── __init__.py
│   │   ├── user.py         # 用户 Schema
│   │   ├── checkin.py      # 签到 Schema
│   │   └── layoff.py       # 裁员信息 Schema
│   ├── routes/              # API 路由
│   │   ├── __init__.py
│   │   ├── auth.py         # 认证路由
│   │   ├── users.py        # 用户路由
│   │   ├── checkin.py      # 签到路由
│   │   └── layoff.py       # 裁员信息路由
│   └── middleware/          # 中间件
│       └── auth.py         # JWT 认证中间件
├── scripts/
│   ├── start.sh            # 启动脚本
│   ├── stop.sh             # 停止脚本
│   └── restart.sh          # 重启脚本
├── data/                   # 数据目录（SQLite 数据库）
├── requirements.txt        # Python 依赖
├── .env                    # 环境变量
├── .env.example           # 环境变量示例
└── README.md              # 本文档
```

---

## 🔧 服务管理

### 启动服务

```bash
./scripts/start.sh
```

输出示例：
```
📦 创建虚拟环境...
🔧 激活虚拟环境...
📦 安装依赖...
🚀 启动服务...
✅ 服务启动成功!
   PID: 12345
   日志：app.log
   API 文档：http://localhost:8000/api-docs
```

### 停止服务

```bash
./scripts/stop.sh
```

### 重启服务

```bash
./scripts/restart.sh
```

### 查看日志

```bash
tail -f app.log
```

### 查看运行状态

```bash
# 查看 PID
cat app.pid

# 检查进程
ps aux | grep uvicorn
```

---

## 📡 API 接口

### 认证接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | ❌ |
| POST | `/api/auth/login` | 用户登录 | ❌ |
| GET | `/api/auth/me` | 获取当前用户 | ✅ |

### 用户接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/api/users/me` | 获取用户信息 | ✅ |
| PUT | `/api/users/me` | 更新用户信息 | ✅ |

### 签到接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/api/checkin/` | 每日签到 | ✅ |
| GET | `/api/checkin/` | 获取签到记录 | ✅ |
| GET | `/api/checkin/stats` | 签到统计 | ✅ |

### 裁员信息接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/api/layoff/` | 创建裁员记录 | ✅ |
| GET | `/api/layoff/` | 获取裁员记录列表 | ✅ |
| GET | `/api/layoff/{id}` | 获取单条记录 | ✅ |

---

## 🗄️ 数据库配置

### SQLite（默认）

```env
DB_TYPE=sqlite
DATABASE_URL=sqlite+aiosqlite:///./data/beicaile.db
```

### PostgreSQL（可选）

```env
DB_TYPE=postgres
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/beicaile
```

---

## 🔐 安全配置

### JWT 配置

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRES_IN=7  # 天
```

**生产环境务必修改 `JWT_SECRET`！**

---

## 🧪 测试

```bash
# 安装测试依赖
pip install pytest pytest-asyncio httpx

# 运行测试
pytest
```

---

## 📦 依赖说明

| 依赖 | 用途 |
|------|------|
| **fastapi** | Web 框架 |
| **uvicorn** | ASGI 服务器 |
| **sqlalchemy** | ORM 框架 |
| **aiosqlite** | SQLite 异步驱动 |
| **python-jose** | JWT 编解码 |
| **passlib** | 密码加密 |
| **pydantic** | 数据验证 |

---

## 🚨 常见问题

### 端口被占用

```bash
# 查看占用端口的进程
lsof -i :8000

# 杀死进程
kill -9 <PID>
```

### 虚拟环境问题

```bash
# 删除虚拟环境
rm -rf venv

# 重新创建
python3 -m venv venv
```

### 依赖安装失败

```bash
# 升级 pip
pip install --upgrade pip

# 重新安装
pip install -r requirements.txt --force-reinstall
```

---

## 📝 开发笔记

### 添加新接口

1. 在 `app/routes/` 创建新的路由文件
2. 在 `app/routes/__init__.py` 中注册路由
3. 在 `app/schemas/` 创建对应的 Schema
4. 在 `app/models/` 创建对应的模型（如需要）

### 数据库迁移

目前使用 SQLAlchemy 的 `metadata.create_all()` 自动创建表。

生产环境建议使用 Alembic 进行数据库迁移管理。

---

## 📄 许可证

MIT License

---

**最后更新：** 2026-03-12  
**维护者：** 被裁了吗团队

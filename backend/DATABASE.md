# 数据库配置说明

## 双数据库模式支持

项目现在支持 **SQLite** 和 **PostgreSQL** 两种数据库模式，**默认使用 SQLite**。

### 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 配置方式

通过环境变量 `DB_TYPE` 切换数据库模式：

#### SQLite 模式（默认）

```bash
DB_TYPE=sqlite
DB_SQLITE_PATH=./data/beicaile.db
```

SQLite 数据库文件会自动创建在项目根目录的 `data/` 文件夹下。

#### PostgreSQL 模式

```bash
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=beicaile
DB_USER=postgres
DB_PASSWORD=postgres
```

### 环境变量配置

复制 `.env.example` 为 `.env` 并根据需要修改：

```bash
cp .env.example .env
```

### 完整环境变量列表

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 服务器端口 | `8000` |
| `NODE_ENV` | 运行环境 | `development` |
| `DB_TYPE` | 数据库类型 | `sqlite` |
| `DB_SQLITE_PATH` | SQLite 数据库路径 | `./data/beicaile.db` |
| `DB_HOST` | PostgreSQL 主机 | `localhost` |
| `DB_PORT` | PostgreSQL 端口 | `5432` |
| `DB_NAME` | PostgreSQL 数据库名 | `beicaile` |
| `DB_USER` | PostgreSQL 用户名 | `postgres` |
| `DB_PASSWORD` | PostgreSQL 密码 | `postgres` |
| `JWT_SECRET` | JWT 密钥 | - |
| `JWT_EXPIRES_IN` | JWT 过期时间 | `7d` |

### 注意事项

1. **SQLite 模式** 适合开发、测试和小规模部署
2. **PostgreSQL 模式** 适合生产环境和高并发场景
3. 切换数据库模式后需要重启服务
4. SQLite 模式下会自动创建 `data/` 目录

### 迁移指南

如果从 PostgreSQL 迁移到 SQLite：

1. 修改 `.env` 中的 `DB_TYPE=sqlite`
2. 确保数据导出并导入到 SQLite（可使用工具如 `pg_dump` + `sqlite3`）
3. 重启服务

如果从 SQLite 迁移到 PostgreSQL：

1. 配置 PostgreSQL 连接信息
2. 修改 `.env` 中的 `DB_TYPE=postgres`
3. 迁移数据
4. 重启服务

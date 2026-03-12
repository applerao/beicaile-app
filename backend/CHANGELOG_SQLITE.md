# SQLite 模式支持 - 变更记录

## 概述

为「被裁了吗」后端项目添加了 **SQLite** 数据库模式支持，默认使用 SQLite，同时保留 PostgreSQL 支持。

## 变更内容

### 1. 配置文件更新

#### `src/config/index.ts`
- 新增 `database.type` 配置项（默认：`sqlite`）
- 新增 `database.sqlitePath` 配置项（默认：`./data/beicaile.db`）

#### `src/config/database.ts`
- 重构为双数据库模式支持
- 新增 `better-sqlite3` 集成
- 新增 `initDatabase()` 初始化函数
- 修改 `query()` 函数支持两种数据库
- 新增 `getSqliteDb()` 辅助函数
- 新增 `closeDatabase()` 优雅关闭函数
- 自动创建 `data/` 目录

### 2. 依赖更新

#### `package.json`
```json
// 新增依赖
"better-sqlite3": "^11.6.0"

// 新增开发依赖
"@types/better-sqlite3": "^7.6.11"
"@types/pg": "^8.x.x"
"@types/swagger-ui-express": "^4.x.x"
"swagger-jsdoc": "^6.x.x"
```

### 3. 环境配置

#### 新增 `.env` (默认配置)
```bash
DB_TYPE=sqlite
DB_SQLITE_PATH=./data/beicaile.db
```

#### 新增 `.env.example` (完整示例)
包含所有配置项的完整示例

### 4. 文档

#### 新增 `DATABASE.md`
完整的数据库配置说明文档，包括：
- 快速开始指南
- SQLite 和 PostgreSQL 配置方式
- 环境变量列表
- 迁移指南

## 使用方式

### 默认使用 SQLite（推荐开发环境）

```bash
# 安装依赖
npm install

# 启动服务
npm run dev
```

数据库文件自动创建在 `./data/beicaile.db`

### 切换到 PostgreSQL（生产环境）

```bash
# 修改 .env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=beicaile
DB_USER=postgres
DB_PASSWORD=postgres

# 重启服务
npm run dev
```

## 兼容性说明

### SQL 语法差异处理

`query()` 函数自动处理以下差异：

1. **参数占位符**: PostgreSQL `$1, $2` → SQLite `?`
2. **DDL 语句**: CREATE/DROP/ALTER 使用 `run()` 而非 `all()`
3. **返回格式**: 统一返回 `{ rows, rowCount }` 格式

### 已知限制

- SQLite 不支持 PostgreSQL 的所有高级特性（如存储过程、复杂类型等）
- 高并发场景建议使用 PostgreSQL
- 切换数据库模式需要手动迁移数据

## 测试验证

✅ SQLite 连接测试通过  
✅ 表创建/删除测试通过  
✅ 插入/查询测试通过  
✅ 参数化查询测试通过  

## 后续工作

- [ ] 数据库迁移脚本（从 PostgreSQL 到 SQLite）
- [ ] 单元测试覆盖
- [ ] 性能基准测试
- [ ] 生产环境部署文档

---

**变更日期:** 2026-03-12  
**变更原因:** 简化开发环境配置，降低部署门槛

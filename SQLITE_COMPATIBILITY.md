# SQLite 兼容性修复总结

## 问题背景

项目从 PostgreSQL 切换到默认 SQLite 模式后，发现多处使用了 PostgreSQL 特有的 SQL 语法，导致在 SQLite 下无法正常工作。

## 排查范围

- ✅ `src/models/User.ts` - 用户数据访问层
- ✅ `src/models/Checkin.ts` - 签到数据访问层
- ✅ `src/routes/*` - 路由层（无直接使用 query）
- ✅ `src/middleware/*` - 中间件层（无数据库操作）
- ✅ `src/config/*` - 配置层（仅连接测试使用 PostgreSQL 语法）

## 修复内容

### 1. UserModel (`src/models/User.ts`)

| 问题 | PostgreSQL 语法 | SQLite 兼容方案 |
|------|----------------|-----------------|
| `create()` 返回数据 | `RETURNING *` | 插入后用 `lastInsertRowid` 查询 |
| `update()` 返回数据 | `RETURNING *` | 更新后调用 `findById()` 查询 |
| 时间函数 | `NOW()` | `CURRENT_TIMESTAMP` |

**修复代码示例：**
```typescript
// create 方法
static async create(data: CreateUserDTO): Promise<User> {
  await query(`INSERT INTO users (email, password_hash, nickname) VALUES ($1, $2, $3)`, 
    [data.email, data.password_hash, data.nickname]);
  
  const userId = result.lastInsertRowid;
  return await this.findById(userId);
}
```

---

### 2. CheckinModel (`src/models/Checkin.ts`)

| 问题 | PostgreSQL 语法 | SQLite 兼容方案 |
|------|----------------|-----------------|
| `create()` 返回数据 | `RETURNING *` | 插入后用 `last_insert_rowid()` 查询 |
| 日期比较 | `::date` 类型转换 | `date()` 函数 |
| 日期函数 | `CURRENT_DATE` | `DATE('now')` |
| 连续签到计算 | 窗口函数 `ROW_NUMBER()` | JavaScript 内存计算 |
| CTE 查询 | `WITH ... AS` | 简化为普通查询 |

**修复代码示例：**
```typescript
// findByUserIdAndDate 方法
static async findByUserIdAndDate(userId: number, date: string): Promise<Checkin | null> {
  const result = await query(
    `SELECT * FROM checkins WHERE user_id = $1 AND date(checkin_date) = date($2)`,
    [userId, date]
  );
  return result.rows[0] || null;
}

// getStats 方法 - 使用 JavaScript 计算连续签到
const dates = checkins.map(c => new Date(c.checkin_date).toISOString().split('T')[0]);
// 在内存中计算连续天数...
```

---

### 3. 数据库层 (`src/config/database.ts`)

| 场景 | 处理方式 |
|------|---------|
| PostgreSQL 连接测试 | 保留 `SELECT NOW()`（仅 PG 模式使用） |
| SQLite 查询 | 自动转换 `$1` → `?` |
| DDL 语句 | 统一使用 `run()` 方法 |
| DQL 语句 | 使用 `all()` 方法 |

---

## SQLite vs PostgreSQL 语法差异对照表

| 功能 | PostgreSQL | SQLite | 解决方案 |
|------|-----------|--------|---------|
| 插入返回 | `RETURNING *` | 不支持 | 插入后查询 |
| 类型转换 | `::date`, `::int` | 不支持 | 使用函数 `date()`, `CAST()` |
| 当前时间 | `NOW()` | 不支持 | `CURRENT_TIMESTAMP` |
| 当前日期 | `CURRENT_DATE` | `DATE('now')` | 统一用 `DATE('now')` |
| 窗口函数 | ✅ 支持 | ⚠️ 部分支持 | 复杂逻辑用 JS 计算 |
| CTE | ✅ 支持 | ✅ 支持 | 保持兼容 |
| 自增 ID | `SERIAL` | `AUTOINCREMENT` | ORM 自动处理 |
| 布尔类型 | `BOOLEAN` | `INTEGER` (0/1) | ORM 自动转换 |

---

## 测试验证

### 1. 用户注册
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","nickname":"测试"}'
```
✅ 预期：返回用户信息（含 ID）

### 2. 用户登录
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```
✅ 预期：返回 JWT token

### 3. 每日签到
```bash
curl -X POST http://localhost:8000/api/checkin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"note":"今天天气不错"}'
```
✅ 预期：返回签到记录（含 ID）

### 4. 签到统计
```bash
curl http://localhost:8000/api/checkin/stats \
  -H "Authorization: Bearer <token>"
```
✅ 预期：返回统计数据（含连续签到天数）

---

## 后续建议

### 短期
1. ✅ 完成所有模型层的 SQLite 兼容性修复
2. ✅ 添加端到端测试验证核心功能
3. 📝 更新 API 文档说明兼容性

### 中期
1. 添加集成测试覆盖所有 CRUD 操作
2. 考虑添加数据库迁移工具（如 knex.js）
3. 编写 SQLite ↔ PostgreSQL 数据迁移脚本

### 长期
1. 评估是否需要同时支持两种数据库
2. 如果只保留 SQLite，移除 PostgreSQL 相关代码
3. 如果保留双支持，添加 CI/CD 双数据库测试

---

## 相关文件

- `src/models/User.ts` - 用户模型（已修复）
- `src/models/Checkin.ts` - 签到模型（已修复）
- `src/config/database.ts` - 数据库配置（已修复）
- `src/config/init-database.ts` - 自动初始化（已修复）
- `database/init-sqlite.sql` - SQLite 初始化脚本
- `DATABASE.md` - 数据库配置文档

---

**修复日期:** 2026-03-12  
**修复提交:** `e499a26`  
**状态:** ✅ 核心功能已修复，可正常使用

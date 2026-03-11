# 被裁了吗 - 技术架构文档

**版本：** v1.0  
**创建日期：** 2026-03-11  
**技术栈：** React Native + Node.js + MySQL

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    用户端 (Mobile)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  iOS App    │  │ Android App │  │  小程序     │     │
│  │  (React     │  │  (React     │  │  (未来)     │     │
│  │   Native)   │  │   Native)   │  │             │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                         │
                         │ HTTPS / REST API
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    API Gateway                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Node.js + Express + TypeScript                 │   │
│  │  - 用户认证 (JWT)                               │   │
│  │  - 请求限流                                     │   │
│  │  - 日志记录                                     │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   MySQL     │  │   Redis     │  │  对象存储   │
│   (数据)    │  │   (缓存)    │  │  (图片)     │
│             │  │             │  │             │
│ - 用户表    │  │ - Session   │  │ - 头像      │
│ - 签到表    │  │ - 计数器    │  │ - 分享图    │
│ - 成就表    │  │ - 限流      │  │             │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

## 📦 技术选型

### 前端 (Mobile)

| 技术 | 版本 | 用途 |
|------|------|------|
| React Native | 0.73+ | 跨平台移动应用 |
| TypeScript | 5.3+ | 类型安全 |
| Zustand | 4.4+ | 状态管理 |
| React Navigation | 6.1+ | 导航系统 |
| Axios | 1.6+ | HTTP 客户端 |
| AsyncStorage | 1.21+ | 本地存储 |

### 后端 (API)

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 20.x | 运行时 |
| Express | 4.18+ | Web 框架 |
| TypeScript | 5.3+ | 类型安全 |
| MySQL | 8.0+ | 主数据库 |
| Redis | 7.2+ | 缓存/计数器 |
| JWT | 9.0+ | 用户认证 |

### 基础设施

| 服务 | 用途 |
|------|------|
| Docker | 容器化部署 |
| Nginx | 反向代理 |
| PM2 | 进程管理 |
| GitHub Actions | CI/CD |

---

## 🗄️ 数据库设计

### 用户表 (users)

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    device_id VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_checkin_at TIMESTAMP NULL,
    total_checkins INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    INDEX idx_device (device_id),
    INDEX idx_checkin (last_checkin_at)
);
```

### 签到表 (checkins)

```sql
CREATE TABLE checkins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    checkin_date DATE NOT NULL,
    checkin_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quote_id INT NULL,  -- 签到时显示的语录 ID
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY uk_user_date (user_id, checkin_date),
    INDEX idx_date (checkin_date)
);
```

### 成就表 (achievements)

```sql
CREATE TABLE achievements (
    id INT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    description VARCHAR(256) NOT NULL,
    icon_url VARCHAR(256) NOT NULL,
    condition_type ENUM('streak', 'total', 'special') NOT NULL,
    condition_value INT NOT NULL
);

CREATE TABLE user_achievements (
    user_id BIGINT NOT NULL,
    achievement_id INT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id)
);
```

### 每日统计缓存 (Redis)

```
Key 格式：stats:daily:{YYYY-MM-DD}
Value: JSON {
    "total_checkins": 12345,
    "unique_users": 8901,
    "replaced_count": 247  // 被替代计数器
}
```

---

## 🔌 API 设计

### 认证相关

```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
```

### 签到相关

```
POST /api/v1/checkin          # 今日签到
GET  /api/v1/checkin/status   # 签到状态
GET  /api/v1/checkin/calendar # 签到日历
GET  /api/v1/checkin/streak   # 连续签到统计
```

### 用户相关

```
GET /api/v1/user/profile      # 用户信息
GET /api/v1/user/achievements # 成就列表
PUT /api/v1/user/profile      # 更新资料
```

### 统计相关

```
GET /api/v1/stats/global      # 全局统计
GET /api/v1/stats/personal    # 个人统计
```

---

## 📱 前端架构

### 目录结构

```
src/
├── components/          # 可复用组件
│   ├── CheckinButton.tsx
│   ├── StreakCounter.tsx
│   ├── ReplacedCounter.tsx
│   └── QuoteCard.tsx
├── screens/            # 页面
│   ├── HomeScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── AchievementsScreen.tsx
│   └── CommunityScreen.tsx
├── navigation/         # 导航配置
├── store/             # 状态管理
│   ├── userStore.ts
│   └── checkinStore.ts
├── services/          # API 服务
│   └── api.ts
├── theme/             # 主题样式
│   ├── colors.ts
│   └── typography.ts
└── utils/             # 工具函数
```

### 核心组件

#### CheckinButton.tsx
```typescript
interface Props {
  onCheckinSuccess: () => void;
  disabled: boolean;
}

// 功能：
// - 显示今日是否已签到
// - 点击签到动画
// - 显示随机扎心语录
```

#### ReplacedCounter.tsx
```typescript
interface Props {
  initialCount: number;
  updateInterval: number; // 毫秒
}

// 功能：
// - 实时递增的"被替代人数"计数器
// - 每 3 秒增加随机数字
// - 制造焦虑感 😈
```

---

## 🚀 部署方案

### 开发环境

```bash
# 本地开发
docker-compose up -d mysql redis

# API 开发
cd api && npm run dev

# App 开发
cd app && npm run ios  # 或 npm run android
```

### 生产环境

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: ./api
    restart: always
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://user:pass@db:3306/beicaile
      - REDIS_URL=redis://redis:6379
    ports:
      - "3000:3000"
  
  db:
    image: mysql:8.0
    volumes:
      - mysql_data:/var/lib/mysql
  
  redis:
    image: redis:7-alpine
  
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
      - "443:443"
```

---

## 📊 监控与日志

### 关键指标

| 指标 | 告警阈值 |
|------|----------|
| API 响应时间 | > 500ms |
| 错误率 | > 1% |
| 数据库连接数 | > 80% |
| Redis 内存使用 | > 80% |

### 日志系统

- **应用日志：** Winston + 文件轮转
- **访问日志：** Nginx access.log
- **错误追踪：** Sentry（可选）

---

## 🔒 安全措施

1. **JWT 认证** - 用户会话管理
2. **请求限流** - 防止刷接口
3. **SQL 注入防护** - 参数化查询
4. **XSS 防护** - 输入过滤
5. **HTTPS** - 数据传输加密

---

## 📈 性能优化

1. **Redis 缓存** - 签到状态、统计数据
2. **数据库索引** - 高频查询字段
3. **CDN 加速** - 静态资源
4. **图片压缩** - 头像、分享图
5. **分页加载** - 列表数据

---

**下一步：** 等待产品文档完成后，开始详细设计和开发。

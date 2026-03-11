# 开发指南

## 项目结构

```
beicaile-app/
├── backend/              # 后端 API
│   ├── src/
│   │   ├── config/      # 配置文件
│   │   ├── controllers/ # 控制器
│   │   ├── middleware/  # 中间件
│   │   ├── models/      # 数据模型
│   │   ├── routes/      # 路由
│   │   └── utils/       # 工具函数
│   └── package.json
├── frontend/            # 前端应用
│   ├── src/
│   │   ├── components/  # 组件
│   │   ├── pages/       # 页面
│   │   ├── services/    # API 服务
│   │   └── types/       # TypeScript 类型
│   └── package.json
├── database/            # 数据库脚本
│   ├── init.sql        # 初始化脚本
│   └── migrations/     # 迁移文件
└── docker/             # Docker 配置
```

## 开发流程

### 1. 环境准备

```bash
# 克隆项目
git clone <repository-url>
cd beicaile-app

# 安装依赖
cd backend && npm install
cd ../frontend && npm install
```

### 2. 启动开发环境

```bash
# 方式一：使用 Docker Compose（推荐）
docker-compose -f docker/docker-compose.yml up -d

# 方式二：手动启动
# 终端 1 - 启动数据库
docker-compose up -d db

# 终端 2 - 启动后端
cd backend
npm run dev

# 终端 3 - 启动前端
cd frontend
npm run dev
```

### 3. 数据库初始化

```bash
# 如果使用 Docker，数据库会自动初始化
# 否则手动执行：
psql -U postgres -h localhost -f database/init.sql
```

## 代码规范

### TypeScript

- 使用严格模式
- 所有函数和变量必须有类型注解
- 使用接口定义数据结构

### 命名规范

```typescript
// 文件和文件夹：kebab-case
// 组件：PascalCase
// 函数和变量：camelCase
// 常量：UPPER_SNAKE_CASE
// 类型和接口：PascalCase

// 示例
checkin.service.ts
CheckinRecord.ts
const checkinService = {}
const MAX_RETRY_COUNT = 3
interface CheckinDTO {}
```

### Git 提交规范

```bash
# 格式
<type>(<scope>): <subject>

# 类型
feat:     新功能
fix:      Bug 修复
docs:     文档更新
style:    代码格式
refactor: 重构
test:     测试
chore:    构建/工具

# 示例
git commit -m "feat(checkin): 添加签到统计功能"
git commit -m "fix(auth): 修复登录 token 过期问题"
```

## API 开发

### 添加新路由

1. 在 `backend/src/routes/` 创建路由文件
2. 在 `backend/src/index.ts` 中注册路由
3. 添加 Swagger 文档注释

```typescript
// routes/example.ts
import { Router } from 'express'
import { authenticate } from '../middleware/auth'

const router = Router()

/**
 * @swagger
 * /example:
 *   get:
 *     summary: 示例接口
 */
router.get('/', authenticate, async (req, res) => {
  res.json({ message: 'Hello' })
})

export default router
```

### 添加数据模型

```typescript
// models/Example.ts
import { query } from '../config/database'

export interface Example {
  id: number
  name: string
  created_at: Date
}

export class ExampleModel {
  static async create(data: Partial<Example>): Promise<Example> {
    const result = await query(
      'INSERT INTO examples (name) VALUES ($1) RETURNING *',
      [data.name]
    )
    return result.rows[0]
  }
}
```

## 前端开发

### 添加新页面

1. 在 `frontend/src/pages/` 创建页面组件
2. 在 `App.tsx` 中添加路由
3. 在 `HeaderNav.tsx` 中添加导航菜单

```tsx
// pages/Example.tsx
const Example: React.FC = () => {
  return <div>Example Page</div>
}

export default Example
```

### 调用 API

```typescript
// services/example.ts
import api from './api'

export const getExample = async (id: number) => {
  return await api.get(`/example/${id}`)
}

// 在组件中使用
const ExampleComponent = () => {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    getExample(1).then(setData)
  }, [])
  
  return <div>{/* ... */}</div>
}
```

## 测试

### 后端测试

```bash
cd backend
npm test
```

### 前端测试

```bash
cd frontend
npm test
```

## 调试技巧

### 后端调试

```typescript
// 使用 console.log 调试
console.log('Debug:', { data })

// 或使用调试工具
import debug from 'debug'
const log = debug('app:example')
log('Message')
```

### 前端调试

- 使用 React Developer Tools
- 使用浏览器开发者工具
- 使用 axios 拦截器查看请求

## 常见问题

### 依赖安装失败

```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install
```

### TypeScript 类型错误

- 检查类型定义是否完整
- 使用 `any` 作为临时方案（不推荐）
- 查看 TypeScript 配置

### 数据库连接问题

- 检查 `.env` 配置
- 确认数据库服务运行
- 验证网络连接

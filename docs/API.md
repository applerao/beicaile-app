# 被裁了吗 API 文档

## 基础信息

- **Base URL**: `http://localhost:8000/api`
- **认证方式**: JWT Bearer Token
- **内容类型**: `application/json`

## 认证

### 用户注册

**POST** `/auth/register`

```json
// 请求
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "用户名"
}

// 响应 201
{
  "message": "注册成功",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "用户名"
  }
}
```

### 用户登录

**POST** `/auth/login`

```json
// 请求
{
  "email": "user@example.com",
  "password": "password123"
}

// 响应 200
{
  "message": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "用户名"
  }
}
```

## 用户

### 获取当前用户信息

**GET** `/users/me`

**Headers**: `Authorization: Bearer <token>`

```json
// 响应 200
{
  "id": 1,
  "email": "user@example.com",
  "nickname": "用户名",
  "avatar_url": "https://...",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### 更新用户信息

**PUT** `/users/me`

**Headers**: `Authorization: Bearer <token>`

```json
// 请求
{
  "nickname": "新昵称",
  "avatar_url": "https://..."
}

// 响应 200
{
  "message": "更新成功",
  "user": { ... }
}
```

## 签到

### 每日签到

**POST** `/checkin`

**Headers**: `Authorization: Bearer <token>`

```json
// 请求（可选）
{
  "note": "今天天气不错"
}

// 响应 201
{
  "message": "签到成功",
  "checkin": {
    "id": 1,
    "checkin_date": "2024-01-01",
    "note": "今天天气不错"
  }
}

// 响应 409 (今日已签到)
{
  "error": "今日已签到"
}
```

### 获取签到记录

**GET** `/checkin`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `limit`: 每页数量 (默认 30)
- `offset`: 偏移量 (默认 0)

```json
// 响应 200
{
  "checkins": [
    {
      "id": 1,
      "checkin_date": "2024-01-01",
      "note": "今天天气不错",
      "created_at": "2024-01-01T08:00:00Z"
    }
  ],
  "pagination": {
    "limit": 30,
    "offset": 0
  }
}
```

### 获取签到统计

**GET** `/checkin/stats`

**Headers**: `Authorization: Bearer <token>`

```json
// 响应 200
{
  "stats": {
    "total_count": 100,
    "current_streak": 7,
    "longest_streak": 30,
    "last_checkin_date": "2024-01-01"
  }
}
```

## 错误响应

所有错误返回统一格式：

```json
{
  "error": "错误信息"
}
```

### 常见错误码

- `400` - 请求参数错误
- `401` - 未认证或 token 无效
- `403` - 权限不足
- `404` - 资源不存在
- `409` - 资源冲突（如重复签到）
- `500` - 服务器内部错误

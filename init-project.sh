#!/bin/bash

# 被裁了吗 App - 项目初始化脚本
# 用法：./init-project.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "🚀 开始初始化 被裁了吗 App 项目..."

# 1. 初始化后端
echo "📦 初始化后端..."
cd backend
if [ ! -f "package.json" ]; then
    npm init -y
fi
npm install express cors dotenv pg better-sqlite3 jsonwebtoken bcryptjs swagger-ui-express swagger-jsdoc
npm install -D typescript @types/node @types/express @types/cors @types/jsonwebtoken @types/bcryptjs @types/pg @types/better-sqlite3 @types/swagger-ui-express ts-node nodemon
npx tsc --init
cd ..

# 2. 初始化前端
echo "📦 初始化前端..."
cd frontend
if [ ! -f "package.json" ]; then
    npm create vite@latest . -- --template react-ts
    npm install
fi
npm install axios react-router-dom antd @ant-design/icons
npm install -D @types/node
cd ..

# 3. 创建必要的目录
echo "📁 创建必要目录..."
mkdir -p backend/src/{routes,controllers,models,middleware,config,utils}
mkdir -p frontend/src/{components,pages,services,utils,types}
mkdir -p database/migrations

# 4. 创建环境变量文件
echo "🔐 创建环境变量配置..."
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOF
# 服务器配置
PORT=8000
NODE_ENV=development

# 数据库配置（默认使用 SQLite，无需额外配置）
DB_TYPE=sqlite
DB_SQLITE_PATH=./data/beicaile.db

# PostgreSQL 配置（可选，当 DB_TYPE=postgres 时使用）
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=beicaile
# DB_USER=postgres
# DB_PASSWORD=postgres

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
EOF
fi

if [ ! -f "frontend/.env" ]; then
    cat > frontend/.env << EOF
VITE_API_BASE_URL=http://localhost:8000/api
EOF
fi

# 5. 初始化数据库
echo "🗄️  初始化数据库..."
cd database
if [ ! -f "init.sql" ]; then
    echo "创建数据库初始化脚本..."
fi
cd ..

echo "✅ 项目初始化完成！"
echo ""
echo "下一步："
echo "1. 检查 backend/.env 文件中的环境变量配置"
echo "2. 启动后端：cd backend && npm run dev"
echo "   - 默认使用 SQLite 数据库，自动创建在 backend/data/beicaile.db"
echo "   - 如需使用 PostgreSQL，修改 DB_TYPE=postgres 并配置相关参数"
echo "3. 启动前端：cd frontend && npm run dev"
echo ""
echo "📚 详细文档：backend/DATABASE.md"

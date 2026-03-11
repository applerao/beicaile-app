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
npm install express cors dotenv pg jsonwebtoken bcryptjs swagger-ui-express
npm install -D typescript @types/node @types/express @types/cors @types/jsonwebtoken @types/bcryptjs ts-node nodemon
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

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=beicaile
DB_USER=postgres
DB_PASSWORD=postgres

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
echo "1. 配置 backend/.env 文件中的环境变量"
echo "2. 启动数据库：docker-compose up -d db"
echo "3. 初始化数据库表：psql -h localhost -U postgres -d beicaile -f database/init.sql"
echo "4. 启动后端：cd backend && npm run dev"
echo "5. 启动前端：cd frontend && npm run dev"

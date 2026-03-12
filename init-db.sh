#!/bin/bash

# 被裁了吗 App - 数据库初始化脚本
# 用法：./init-db.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# 检测数据库类型
DB_TYPE="${DB_TYPE:-sqlite}"

echo "🗄️  初始化数据库..."
echo "   数据库类型：$DB_TYPE"

if [ "$DB_TYPE" = "sqlite" ]; then
    # SQLite 模式
    SQLITE_PATH="${DB_SQLITE_PATH:-./backend/data/beicaile.db}"
    
    # 确保目录存在
    mkdir -p "$(dirname "$SQLITE_PATH")"
    
    echo "📁 数据库路径：$SQLITE_PATH"
    echo "📝 执行初始化脚本..."
    
    # 使用 sqlite3 执行初始化脚本
    if command -v sqlite3 &> /dev/null; then
        sqlite3 "$SQLITE_PATH" < database/init-sqlite.sql
        echo "✅ SQLite 数据库初始化完成！"
    else
        echo "⚠️  未找到 sqlite3 命令，请手动执行或使用后端自动创建表"
        echo "   安装 sqlite3: brew install sqlite (macOS) 或 apt-get install sqlite3 (Linux)"
    fi
    
elif [ "$DB_TYPE" = "postgres" ]; then
    # PostgreSQL 模式
    DB_HOST="${DB_HOST:-localhost}"
    DB_PORT="${DB_PORT:-5432}"
    DB_NAME="${DB_NAME:-beicaile}"
    DB_USER="${DB_USER:-postgres}"
    
    echo "🔗 连接到 PostgreSQL: $DB_HOST:$DB_PORT/$DB_NAME"
    
    # 检查 psql 是否可用
    if ! command -v psql &> /dev/null; then
        echo "❌ 未找到 psql 命令，请安装 PostgreSQL 客户端"
        exit 1
    fi
    
    # 执行 PostgreSQL 初始化脚本
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f database/init.sql
    
    echo "✅ PostgreSQL 数据库初始化完成！"
else
    echo "❌ 不支持的数据库类型：$DB_TYPE"
    echo "   支持的类型：sqlite, postgres"
    exit 1
fi

echo ""
echo "下一步："
echo "1. 启动后端：cd backend && npm run dev"
echo "2. 访问 API 文档：http://localhost:8000/api-docs"

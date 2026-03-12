#!/bin/bash

# 被裁了吗 Python 后端 - 启动脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PID_FILE="$PROJECT_DIR/app.pid"
LOG_FILE="$PROJECT_DIR/app.log"

cd "$PROJECT_DIR"

# 检查是否已经运行
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "❌ 服务已经在运行 (PID: $PID)"
        echo "   先执行 ./scripts/stop.sh 停止服务"
        exit 1
    else
        echo "⚠️  发现残留的 PID 文件，已清理"
        rm -f "$PID_FILE"
    fi
fi

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "📦 创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "🔧 激活虚拟环境..."
source venv/bin/activate

# 安装依赖
echo "📦 安装依赖..."
pip install -r requirements.txt -q

# 确保数据目录存在
mkdir -p data

# 启动服务
echo "🚀 启动服务..."
nohup uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --reload \
    > "$LOG_FILE" 2>&1 &

# 保存 PID
echo $! > "$PID_FILE"

# 等待服务启动
sleep 2

# 检查服务是否成功启动
if ps -p $(cat "$PID_FILE") > /dev/null 2>&1; then
    echo "✅ 服务启动成功!"
    echo "   PID: $(cat "$PID_FILE")"
    echo "   日志：$LOG_FILE"
    echo "   API 文档：http://localhost:8000/api-docs"
    echo "   健康检查：http://localhost:8000/health"
else
    echo "❌ 服务启动失败，请查看日志：$LOG_FILE"
    rm -f "$PID_FILE"
    exit 1
fi

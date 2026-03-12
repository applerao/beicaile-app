#!/bin/bash

# 被裁了吗 Python 后端 - 停止脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PID_FILE="$PROJECT_DIR/app.pid"

cd "$PROJECT_DIR"

# 检查 PID 文件
if [ ! -f "$PID_FILE" ]; then
    echo "⚠️  服务未运行 (无 PID 文件)"
    exit 0
fi

PID=$(cat "$PID_FILE")

# 检查进程是否存在
if ! ps -p $PID > /dev/null 2>&1; then
    echo "⚠️  进程不存在，清理 PID 文件"
    rm -f "$PID_FILE"
    exit 0
fi

# 停止服务
echo "🛑 停止服务 (PID: $PID)..."
kill $PID

# 等待进程结束
for i in {1..10}; do
    if ! ps -p $PID > /dev/null 2>&1; then
        echo "✅ 服务已停止"
        rm -f "$PID_FILE"
        exit 0
    fi
    sleep 1
done

# 强制停止
echo "⚠️  优雅停止超时，强制停止..."
kill -9 $PID
rm -f "$PID_FILE"
echo "✅ 服务已强制停止"

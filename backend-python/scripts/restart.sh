#!/bin/bash

# 被裁了吗 Python 后端 - 重启脚本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR"

echo "🔄 重启服务..."
./stop.sh
sleep 1
./start.sh

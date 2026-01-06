#!/bin/bash
# Backend Python 3.13 迁移执行脚本
# 此脚本将自动完成所有必要的设置步骤

set -e  # 遇到错误立即退出

echo "🚀 ServerSentinel Backend - Python 3.13 迁移脚本"
echo "=================================================="
echo ""

# 进入 backend 目录
cd "$(dirname "$0")"
BACKEND_DIR=$(pwd)
echo "📁 工作目录: $BACKEND_DIR"
echo ""

# 步骤 1: 清理旧环境
echo "🧹 步骤 1/5: 清理旧虚拟环境..."
if [ -d "venv" ]; then
    rm -rf venv
    echo "   ✅ 旧环境已清理"
else
    echo "   ℹ️  未发现旧环境"
fi
echo ""

# 步骤 2: 创建新虚拟环境
echo "🆕 步骤 2/5: 创建 Python 3.13 虚拟环境..."
python3.13 -m venv venv
echo "   ✅ 虚拟环境创建成功"
echo ""

# 步骤 3: 安装依赖
echo "📦 步骤 3/5: 安装依赖包..."
source venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt
echo "   ✅ 依赖安装完成"
echo ""

# 步骤 4: 创建数据库迁移
echo "🗄️  步骤 4/5: 创建数据库迁移..."
PYTHONPATH=. alembic revision --autogenerate -m "add_timestamps_audit_log_and_constraints"
echo "   ✅ 迁移文件已生成"
echo ""

# 步骤 5: 应用迁移
echo "⬆️  步骤 5/5: 应用数据库迁移..."
PYTHONPATH=. alembic upgrade head
echo "   ✅ 迁移已应用"
echo ""

echo "=================================================="
echo "✨ 迁移完成！"
echo ""
echo "📊 验证信息:"
echo "   - Python 版本: $(python --version)"
echo "   - SQLAlchemy 版本: $(pip show sqlalchemy | grep Version)"
echo "   - 数据库文件: $(ls -lh serversentinel.db 2>/dev/null || echo '未创建')"
echo ""
echo "🎯 下一步操作:"
echo "   1. 启动服务: PYTHONPATH=. uvicorn app.main:app --reload"
echo "   2. 访问文档: http://localhost:8000/docs"
echo "   3. 健康检查: curl http://localhost:8000/health"
echo ""
echo "📚 查看详细报告: cat MIGRATION_COMPLETE.md"
echo ""

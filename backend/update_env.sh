#!/bin/bash
# 更新 .env 文件为 SQLite 配置

set -e

echo "🔧 更新 .env 文件为 SQLite 配置..."

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
    echo "📝 .env 文件不存在，从 .env.example 复制..."
    cp .env.example .env
    echo "✅ .env 文件已创建"
else
    echo "⚠️  .env 文件已存在"
    echo "📝 备份当前 .env 文件到 .env.backup..."
    cp .env .env.backup
    
    # 更新 DATABASE_URL
    if grep -q "mysql" .env; then
        echo "🔄 检测到 MySQL 配置，更新为 SQLite..."
        sed -i 's|DATABASE_URL=.*|DATABASE_URL=sqlite:///./serversentinel.db|' .env
        echo "✅ DATABASE_URL 已更新为 SQLite"
    else
        echo "✅ DATABASE_URL 已经是 SQLite 配置"
    fi
fi

echo ""
echo "📋 当前 .env 配置:"
cat .env

echo ""
echo "✅ 配置更新完成！"
echo ""
echo "💡 下一步:"
echo "   1. 检查 .env 文件内容是否正确"
echo "   2. 运行: source venv/bin/activate"
echo "   3. 运行: PYTHONPATH=. alembic upgrade head"
echo "   4. 运行: PYTHONPATH=. uvicorn app.main:app --reload"

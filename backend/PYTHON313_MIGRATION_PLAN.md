# Backend 项目整改方案 (Python 3.13)

## 审查日期
2026-01-06

## 目标
根据 `docs/` 目录中的文档要求，对 backend 项目进行全面整改，确保与 Python 3.13 兼容。

---

## 🔴 关键问题：Python 3.13 兼容性

### 问题 1: SQLAlchemy 2.0.30 与 Python 3.13 不兼容

**问题描述：**
SQLAlchemy 2.0.30 在 Python 3.13 环境下会报错：
```
TypeError: Can't replace canonical symbol for '__firstlineno__' with new int value 615
```

这是 SQLAlchemy 2.0.30 的已知 bug，在 Python 3.13 中无法正常工作。

**解决方案：**
升级到 SQLAlchemy 2.0.36 或更高版本（已修复此问题）

**修改文件：** `requirements.txt`
```diff
- sqlalchemy==2.0.30
+ sqlalchemy==2.0.36
```

---

## 📋 文档要求的功能缺失

### 问题 2: 缺少时间戳字段

**设计文档要求：** (`design.md` 第 3.2 节)

所有核心表都应该包含时间戳字段：

| 表名 | 缺失字段 |
|------|---------|
| `users` | `created_at`, `updated_at` |
| `ssh_keys` | `created_at` |
| `nodes` | `created_at`, `updated_at` |
| `devices` | `created_at` |
| `reservations` | `created_at`, `updated_at` |

**解决方案：**
在所有模型中添加时间戳字段。使用 SQLAlchemy 2.0 推荐的方式：

```python
from datetime import datetime, timezone
from sqlalchemy import DateTime
from sqlalchemy.orm import mapped_column

# 使用 UTC 时间
created_at = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
updated_at = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), 
                           onupdate=lambda: datetime.now(timezone.utc), nullable=False)
```

**注意：** Python 3.13 中应使用 `datetime.now(timezone.utc)` 而不是已弃用的 `datetime.utcnow()`

---

### 问题 3: 缺少 AuditLog 审计日志表

**设计文档要求：** (`design.md` 第 3.2 节)

需要创建 `audit_logs` 表用于记录所有关键操作。

**表结构：**
```python
class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(50))
    resource_type: Mapped[str] = mapped_column(String(50))
    resource_id: Mapped[Optional[int]]
    details: Mapped[Optional[dict]] = mapped_column(JSON)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
```

---

### 问题 4: 缺少 SQLite WAL 模式优化

**文档要求：** (`SQLITE_MIGRATION.md` 第 101-118 行)

需要启用 WAL (Write-Ahead Logging) 模式以提升并发性能。

**解决方案：**
在 `app/core/database.py` 中添加：

```python
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine

@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    """启用 SQLite WAL 模式以提升并发性能"""
    if settings.DATABASE_URL.startswith("sqlite"):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()
```

---

### 问题 5: 缺少唯一约束

**设计文档要求：** (`design.md` 第 290 行)

`devices` 表应该有 `(node_id, device_index)` 的唯一约束。

**解决方案：**
```python
from sqlalchemy import UniqueConstraint

class Device(Base):
    __tablename__ = "devices"
    __table_args__ = (
        UniqueConstraint('node_id', 'device_index', name='uq_node_device_index'),
    )
```

---

### 问题 6: 缺少健康检查端点

**文档要求：** (`design.md` 第 5.5.2 节)

需要实现 `/health` 端点用于监控。

**解决方案：**
在 `app/main.py` 中添加：

```python
@app.get("/health")
def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "service": "ServerSentinel API",
        "version": "0.1.0",
        "database": "sqlite",
        "python_version": "3.13"
    }
```

---

## 🎯 推荐的现代化改进 (Python 3.13 + SQLAlchemy 2.0)

### 改进 1: 使用 SQLAlchemy 2.0 的 Mapped 类型注解

SQLAlchemy 2.0 引入了更好的类型支持，建议使用新的声明式语法：

**旧写法：**
```python
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
```

**新写法（推荐）：**
```python
from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    email: Mapped[str] = mapped_column(String(100), unique=True)
    is_admin: Mapped[bool] = mapped_column(default=False)
```

**优势：**
- 更好的 IDE 类型提示
- 更符合 Python 3.13 的类型注解规范
- 代码更简洁易读

---

### 改进 2: 使用 timezone-aware datetime

Python 3.13 中 `datetime.utcnow()` 已被标记为弃用，应使用：

```python
from datetime import datetime, timezone

# ❌ 旧写法（已弃用）
datetime.utcnow()

# ✅ 新写法
datetime.now(timezone.utc)
```

---

## 📝 实施步骤

### 步骤 1: 升级依赖（必须）

```bash
# 修改 requirements.txt
sqlalchemy==2.0.36  # 从 2.0.30 升级
```

### 步骤 2: 更新所有模型文件

按以下顺序更新：

1. **user.py** - 添加时间戳字段
2. **node.py** - 添加时间戳字段和 ssh_port
3. **reservation.py** - 添加时间戳字段
4. **audit_log.py** - 创建新模型
5. **__init__.py** - 导入 AuditLog

### 步骤 3: 更新数据库配置

修改 `app/core/database.py`，添加 WAL 模式支持。

### 步骤 4: 添加健康检查端点

修改 `app/main.py`，添加 `/health` 端点。

### 步骤 5: 创建数据库迁移

```bash
cd /home/eric/workspace/github/ServerSentinel/backend
source venv/bin/activate

# 重新安装依赖
pip install -r requirements.txt

# 创建新的迁移
PYTHONPATH=. alembic revision --autogenerate -m "add_timestamps_audit_log_and_constraints"

# 应用迁移
PYTHONPATH=. alembic upgrade head
```

### 步骤 6: 验证

```bash
# 启动服务
PYTHONPATH=. uvicorn app.main:app --reload

# 测试健康检查
curl http://localhost:8000/health

# 检查数据库
sqlite3 serversentinel.db ".schema"
```

---

## ⚠️ 注意事项

### 1. 虚拟环境问题

当前虚拟环境可能配置不正确。建议重建：

```bash
cd /home/eric/workspace/github/ServerSentinel/backend
rm -rf venv
python3.13 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 2. Alembic 路径配置

`alembic.ini` 中的 `script_location` 应该是相对于运行目录的路径。
如果从 backend 目录运行，应该是：
```ini
script_location = alembic
```

如果从项目根目录运行，应该是：
```ini
script_location = backend/alembic
```

### 3. 环境变量

确保 `.env` 文件配置正确：
```bash
DATABASE_URL=sqlite:///./serversentinel.db
SECRET_KEY=your-secret-key-here
```

---

## 📊 整改优先级

### 🔴 高优先级（必须立即修复）
1. ✅ 升级 SQLAlchemy 到 2.0.36（Python 3.13 兼容性）
2. ✅ 添加所有缺失的时间戳字段
3. ✅ 创建 AuditLog 模型

### 🟡 中优先级（本周内完成）
4. ✅ 添加 SQLite WAL 模式优化
5. ✅ 添加 devices 表唯一约束
6. ✅ 添加健康检查端点

### 🟢 低优先级（可选，但推荐）
7. 迁移到 SQLAlchemy 2.0 新语法（Mapped 类型）
8. 更新所有 datetime 使用 timezone-aware 方式
9. 添加完整的单元测试

---

## 🚀 快速开始脚本

创建一个一键整改脚本：

```bash
#!/bin/bash
# 文件: scripts/migrate_to_python313.sh

set -e

echo "🔧 开始 Python 3.13 迁移..."

# 1. 清理旧环境
echo "📦 清理旧虚拟环境..."
rm -rf venv

# 2. 创建新虚拟环境
echo "🆕 创建 Python 3.13 虚拟环境..."
python3.13 -m venv venv
source venv/bin/activate

# 3. 升级 pip
echo "⬆️  升级 pip..."
pip install --upgrade pip

# 4. 安装依赖
echo "📥 安装依赖..."
pip install -r requirements.txt

# 5. 运行测试
echo "🧪 运行测试..."
PYTHONPATH=. pytest tests/ || echo "⚠️  测试失败，请检查"

echo "✅ 迁移完成！"
echo "💡 下一步："
echo "   1. 创建数据库迁移: PYTHONPATH=. alembic revision --autogenerate -m 'your_message'"
echo "   2. 应用迁移: PYTHONPATH=. alembic upgrade head"
echo "   3. 启动服务: PYTHONPATH=. uvicorn app.main:app --reload"
```

---

## 📚 参考资料

- [SQLAlchemy 2.0 文档](https://docs.sqlalchemy.org/en/20/)
- [Python 3.13 新特性](https://docs.python.org/3.13/whatsnew/3.13.html)
- [FastAPI 最佳实践](https://fastapi.tiangolo.com/tutorial/)
- 项目文档: `docs/design.md`, `docs/SQLITE_MIGRATION.md`


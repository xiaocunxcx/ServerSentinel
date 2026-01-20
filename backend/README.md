# ServerSentinel Backend

ServerSentinel 后端服务，基于 FastAPI + SQLAlchemy，默认使用 SQLite。

## 功能概览

- 健康检查接口 `/health`
- 节点与设备管理
- 预约与审计日志
- SQLite WAL 模式优化

## 项目状态

- 最新进度与已完成任务请查看 `../docs/task.md`

## 运行要求

- Python 3.13
- SQLite 3

## 快速开始

### 方式一：一键脚本

```bash
./migrate_to_python313.sh
```

### 方式二：手动

```bash
python3.13 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

PYTHONPATH=. alembic upgrade head
PYTHONPATH=. uvicorn app.main:app --reload
```

## 环境变量

创建 `.env` 并配置：

```bash
DATABASE_URL=sqlite:///./serversentinel.db
SECRET_KEY=change-me
```

## 验证

```bash
curl http://localhost:8000/health
```

## 测试

```bash
pytest
```

## 目录结构

- `app/` 业务代码
- `alembic/` 数据库迁移
- `tests/` 测试

## 相关文档

- `QUICK_START.md`
- `../docs/design.md`
- `../docs/SQLITE_MIGRATION.md`

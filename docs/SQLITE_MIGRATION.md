# SQLite 迁移指南

## 为什么选择 SQLite？

ServerSentinel 已从 MySQL 迁移到 SQLite，以实现更轻量、更易部署的架构。

### 优势

✅ **零配置** - 无需安装和配置独立的数据库服务器  
✅ **单文件存储** - 整个数据库就是一个 `serversentinel.db` 文件  
✅ **轻量部署** - Docker 镜像更小，启动更快  
✅ **开发友好** - 本地开发无需额外依赖  
✅ **性能优秀** - 读取性能优于 MySQL（中小规模）  
✅ **完整SQL支持** - 支持事务、外键、索引

### 适用场景

- ✅ 10-50台服务器规模
- ✅ 并发用户数 < 100
- ✅ 预约操作频率适中

## 配置变更

### 1. 数据库连接字符串

**之前 (MySQL)**:
```
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/serversentinel
```

**现在 (SQLite)**:
```
DATABASE_URL=sqlite:///./serversentinel.db
```

### 2. 依赖变更

**移除**:
- `PyMySQL==1.1.1` (MySQL 驱动)

**保留**:
- `sqlalchemy==2.0.30` (完美支持 SQLite)
- `alembic==1.13.1` (数据库迁移工具)

### 3. 代码变更

**database.py** 添加了 SQLite 特定配置:
```python
# SQLite 需要 check_same_thread=False 才能在 FastAPI 中正常工作
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
```

## 使用指南

### 初始化数据库

```bash
cd /home/eric/workspace/github/ServerSentinel/backend

# 1. 安装依赖
pip install -r requirements.txt

# 2. 创建数据库迁移
alembic revision --autogenerate -m "initial_schema"

# 3. 执行迁移
alembic upgrade head

# 4. 数据库文件会自动创建
ls -lh serversentinel.db
```

### 备份与恢复

**备份**:
```bash
# 简单复制文件即可
cp serversentinel.db serversentinel.db.backup
# 或使用时间戳
cp serversentinel.db serversentinel.db.$(date +%Y%m%d_%H%M%S)
```

**恢复**:
```bash
cp serversentinel.db.backup serversentinel.db
```

### 查看数据库

```bash
# 使用 sqlite3 命令行工具
sqlite3 serversentinel.db

# 常用命令
.tables          # 查看所有表
.schema users    # 查看表结构
SELECT * FROM users;  # 查询数据
.quit            # 退出
```

## 性能优化

### 1. 启用 WAL 模式

WAL (Write-Ahead Logging) 模式可以显著提升并发性能：

```python
# 在 database.py 中添加
from sqlalchemy import event
from sqlalchemy.engine import Engine

@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA synchronous=NORMAL")
    cursor.close()
```

### 2. 定期清理

```bash
# 清理碎片，优化数据库文件大小
sqlite3 serversentinel.db "VACUUM;"
```

## 迁移到其他数据库

如果未来规模扩大，可以无缝迁移到 PostgreSQL 或 MySQL：

### 1. 导出数据

```bash
# 使用 SQLAlchemy 的迁移工具
alembic downgrade base  # 回退所有迁移
```

### 2. 更改配置

```bash
# 修改 .env 文件
DATABASE_URL=postgresql://user:password@localhost:5432/serversentinel
# 或
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/serversentinel
```

### 3. 重新迁移

```bash
# 安装对应的数据库驱动
pip install psycopg2-binary  # PostgreSQL
# 或
pip install PyMySQL  # MySQL

# 执行迁移
alembic upgrade head
```

### 4. 数据迁移

使用工具如 `pgloader` 或手动导出/导入数据。

## 常见问题

### Q: SQLite 是否支持并发写入？

A: SQLite 使用文件锁机制，同一时间只能有一个写入者。但对于 ServerSentinel 的使用场景（预约操作不是高频写入），这完全足够。启用 WAL 模式后，读写可以并发进行。

### Q: 数据库文件会无限增长吗？

A: 不会。SQLite 会自动回收删除的空间。定期运行 `VACUUM` 可以进一步优化文件大小。

### Q: 是否需要定期备份？

A: 是的。建议每天自动备份数据库文件。由于是单文件，备份非常简单。

### Q: 多大规模需要考虑迁移？

A: 建议在以下情况考虑迁移到 PostgreSQL/MySQL：
- 服务器数量 > 100台
- 并发用户数 > 100
- 需要复杂的数据分析和报表
- 需要跨数据中心部署

## 总结

SQLite 为 ServerSentinel 提供了：
- 🚀 更快的开发和部署速度
- 📦 更小的资源占用
- 🔧 更简单的运维管理
- 🔄 灵活的迁移路径

对于 10-50 台服务器的规模，SQLite 是最佳选择！

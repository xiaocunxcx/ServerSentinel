# ServerSentinel

一个基于 FastAPI + React 的高性能计算资源（NPU 服务器）管理与预约平台，提供节点/设备管理、预约冲突检测、SSH 公钥管理等能力。

## 功能概览

- JWT 登录与权限控制（管理员/普通用户）
- 节点与设备管理（列表/详情；管理员可创建节点与设备）
- 预约管理（整机/卡级，冲突检测，支持查询/删除）
- SSH 公钥管理（增/删/查）
- 审计日志（登录、预约、SSH key 操作）
- 健康检查 `/health`

## 技术栈

- 后端：FastAPI, SQLAlchemy, Alembic, Pydantic, JWT
- 前端：React + Vite + Ant Design + Axios
- 数据库：SQLite 默认；`docker-compose` 使用 MySQL

## 快速开始（Docker Compose）

详细步骤见 `QUICKSTART.md`。

1. 启动服务（后端 + MySQL）：
   ```bash
   docker-compose up --build
   ```
2. 运行数据库迁移：
   ```bash
   docker-compose exec api alembic upgrade head
   ```
3. 初始化测试账号：
   ```bash
   docker-compose exec api python /app/scripts/init_db.py
   ```
4. 访问 API 文档：`http://localhost:8000/docs`

### 前端开发

```bash
cd frontend
npm install
npm run dev
```

默认访问 `http://localhost:5173`，Vite 已将 `/api` 代理到 `http://localhost:8000`。如需改为其他后端地址，请设置 `VITE_API_URL`。

## 本地开发（不使用 Docker）

### 后端（SQLite）

```bash
cd backend
python3.13 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=. alembic upgrade head
PYTHONPATH=. uvicorn app.main:app --reload
```

默认使用 SQLite；如需切换数据库或修改密钥，可在 `backend/.env` 中设置 `DATABASE_URL` 与 `SECRET_KEY`。

### 前端

```bash
cd frontend
npm install
npm run dev
```

## 默认账号（运行初始化脚本后）

- 管理员：`admin` / `admin123`
- 测试用户：`testuser` / `test123`

## API 概览

- `POST /api/v1/auth/login`
- `GET /api/v1/users/me`
- `GET /api/v1/users/me/ssh-keys`
- `POST /api/v1/users/me/ssh-keys`
- `DELETE /api/v1/users/me/ssh-keys/{id}`
- `GET /api/v1/nodes`
- `GET /api/v1/nodes/{id}`
- `POST /api/v1/nodes`（管理员）
- `POST /api/v1/nodes/{id}/devices`（管理员）
- `GET /api/v1/reservations`
- `GET /api/v1/reservations/my`
- `GET /api/v1/reservations/{id}`
- `POST /api/v1/reservations`
- `DELETE /api/v1/reservations/{id}`
- `GET /health`

## 项目结构

```
ServerSentinel/
├── backend/            # FastAPI 后端
│   ├── app/            # 应用核心代码
│   ├── alembic/        # 数据库迁移
│   ├── scripts/        # 初始化脚本
│   └── tests/          # 后端测试
├── frontend/           # React 前端（Vite）
├── docs/               # 设计/需求/任务文档
├── docker-compose.yml  # Docker Compose 配置
├── QUICKSTART.md       # 快速开始
└── README.md
```

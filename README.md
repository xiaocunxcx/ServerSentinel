# ServerSentinel

一个基于Python (FastAPI) 和 React 的高性能计算资源（NPU服务器）管理平台。

## 项目结构 (Project Structure - Python Edition)
... (内容保持不变) ...

# ServerSentinel

一个基于Python (FastAPI) 和 React 的高性能计算资源（NPU服务器）管理平台。

... (previous content) ...

## 后端快速启动 (Backend Quickstart - Docker)

本项目使用 Docker 和 Docker Compose 来提供一个一致且便捷的开发环境。

### 先决条件

*   [Docker](https://www.docker.com/get-started)
*   [Docker Compose](https://docs.docker.com/compose/install/)

### 运行步骤

1.  **启动服务**:
    在项目的根目录下（与 `docker-compose.yml` 文件同级），运行以下命令：
    ```bash
    docker-compose up --build
    ```
    此命令会：
    *   启动一个 MySQL 数据库容器。
    *   构建后端 FastAPI 应用的 Docker 镜像。
    *   启动 API 服务容器，并监听 `http://localhost:8000`。
    *   由于配置了 `reload`，任何在 `backend/app` 目录下的代码更改都会自动重载服务。

2.  **初始化/迁移数据库**:
    *   在 `docker-compose up` 成功启动**之后**，你需要**打开一个新的终端**，执行以下命令来创建所有数据库表：
    ```bash
    docker-compose exec api alembic upgrade head
    ```
    *   此命令会在 `api` 服务容器内执行 Alembic，并将数据库结构更新到最新版本。**每次你修改了 `backend/app/models` 下的模型后，都需要重新生成并执行新的迁移。**

3.  **访问 API 文档**:
    服务启动后，在浏览器中打开 **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**。
    你将看到 FastAPI 自动生成的交互式 API 文档 (Swagger UI)，可以在此直接测试已创建的 `/api/v1/reservations/` 端点。

### 自我检验 (Testing)
... (rest of the file remains the same) ...

## 项目结构 (Project Structure - Python Edition)

本项目采用 Monorepo (单体仓库) 模式进行管理，所有组件均采用统一的 Python 技术栈，以实现最高的开发效率和可维护性。

```
/ServerSentinel
│
├── backend/                  # Python FastAPI 后端服务
│   ├── app/                  # FastAPI 应用核心代码
│   │   ├── api/              # API 路由/端点
│   │   │   ├── deps.py       # 依赖注入项
│   │   │   └── v1/           # API v1 版本
│   │   │       ├── endpoints/
│   │   │       └── router.py
│   │   ├── core/             # 核心逻辑 (配置, 中间件等)
│   │   ├── crud/             # 数据库 CRUD 操作
│   │   ├── models/           # SQLAlchemy 数据库模型
│   │   ├── schemas/          # Pydantic 请求/响应模型
│   │   ├── services/         # 业务逻辑服务
│   │   └── main.py           # FastAPI 应用入口
│   ├── alembic/              # Alembic 数据库迁移脚本
│   ├── tests/                # 单元测试与集成测试 (Pytest)
│   ├── alembic.ini           # Alembic 配置文件
│   ├── requirements.txt      # 后端依赖
│   └── .env                  # 环境变量
│
├── frontend/                 # React 前端应用 (结构不变)
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   ├── package.json
│   └── tsconfig.json
│
├── agent/                    # Python 节点代理
│   ├── agent.py              # Agent主脚本 (包含daemon和get-keys逻辑)
│   ├── collector.py          # 指标采集模块
│   ├── config.py             # Agent配置模块
│   ├── requirements.txt      # Agent依赖
│   └── setup.py              # PyInstaller 打包配置文件
│
├── docs/                     # 项目文档
│   ├── design.md
│   ├── requirements.md
│   └── task.md
│
├── .gitignore
└── README.md                 # 你正在看的文件
```

### 目录说明 (Python版)

*   **`backend/`**: 后端 FastAPI 服务。
    *   `app/`: 存放所有应用代码的核心包。
    *   `app/api/`: API层，负责处理HTTP请求，进行数据校验，并调用`services`。
    *   `app/schemas/`: Pydantic 模型，定义API的数据结构，FastAPI用它来做请求验证和自动生成API文档。
    *   `app/services/`: 服务层，封装核心业务逻辑，协调`crud`操作。
    *   `app/crud/`: 数据访问层，封装对数据库的直接增删改查操作。
    *   `app/models/`: 数据模型层，定义与数据库表映射的SQLAlchemy模型。
    *   `alembic/`: 数据库版本迁移目录，由`Alembic`工具管理。

*   **`frontend/`**: 前端 React 应用，目录结构保持不变。

*   **`agent/`**: 节点代理，一个独立的 Python 项目。
    *   `agent.py`: Agent 的主程序入口，可以通过命令行参数启动为守护进程或执行`get-keys`等一次性任务。
    *   `setup.py`: 用于配置`PyInstaller`，将整个Agent打包成单个可执行文件。

*   **`docs/`**: 存放所有与项目相关的设计、需求和规划文档。

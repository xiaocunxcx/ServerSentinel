# ServerSentinel - 项目任务分解 (Task Breakdown - Python/SQLite Stack)

## 总体策略

本项目将遵循“后端先行、分阶段迭代”的开发策略，技术栈统一为 **Python + SQLite**。

1.  **后端先行**: 每个功能的开发都将从后端 API 开始，确保数据结构和业务逻辑正确无误。API 开发和测试通过后，前端再进行开发对接。
2.  **分阶段迭代 (Phased Approach)**: 项目将分为三个主要里程碑，循序渐进地实现功能，降低一次性开发的复杂度和风险。
    *   **里程碑一 (Phase 1)**: 构建核心预定能力。实现一个功能正常的、但尚未实现“硬锁定”的资源预定平台。
    *   **里程碑二 (Phase 2)**: 实现核心“硬锁定”。引入 Agent，打通从“预定”到“SSH 自动授权”的核心闭环。
    *   **里程碑三 (Phase 3)**: 完善与加固。全面增强系统的安全性、健壮性、并补全监控、报表等高级功能。

---

## 里程碑一 (Phase 1): MVP - 核心预定平台

**目标**: 搭建一个功能可用的预定系统，用户可以查看资源、提交预约，但SSH授权仍需手动完成。**验证核心业务逻辑的正确性**。

### P1.1: 后端 (Backend)
-   [ ] **任务 P1.1.1: 项目初始化与数据库建模**
    -   [ ] 初始化 **Python** 项目并引入 **FastAPI** 框架。
    -   [ ] 配置 **SQLite** 数据库（单文件：`serversentinel.db`）。
    -   [ ] 引入 **SQLAlchemy** 作为 ORM，并使用 **Alembic** 进行数据库迁移管理。
    -   [ ] 根据 `design.md` 创建 `users`, `ssh_keys`, `nodes`, `devices`, `reservations`, `reservation_devices` 的 SQLAlchemy 模型并生成首次迁移。
    -   [ ] 配置 SQLite 连接字符串：`sqlite:///./serversentinel.db`

-   [ ] **任务 P1.1.2: 用户与公钥管理 API**
    -   [ ] `POST /api/login`: 实现基于白名单的用户登录认证 (使用 JWT)。
    -   [ ] `GET /api/users/me`: 获取当前登录用户信息。
    -   [ ] `POST /api/users/me/keys`: 允许用户上传和管理自己的 SSH 公钥。
    -   [ ] `DELETE /api/users/me/keys/{key_id}`: 删除 SSH 公钥。
    -   [ ] 为以上接口编写单元测试和集成测试 (使用 Pytest)。

-   [ ] **任务 P1.1.3: 资产管理 API (手动录入)**
    -   [ ] `POST /api/admin/nodes`: (Admin) 手动注册物理服务器节点。
    -   [ ] `POST /api/admin/nodes/{node_id}/devices`: (Admin) 手动为节点添加 NPU 设备信息。
    -   [ ] `GET /api/nodes`: 获取所有节点及其设备的列表。

-   [ ] **任务 P1.1.4: 核心预约逻辑 API**
    -   [ ] `POST /api/reservations`: 创建新的资源预约。
        -   **关键**: 实现时间段冲突检测算法（整机 vs 整机, 整机 vs 卡级, 卡级 vs 卡级）。
    -   [ ] `GET /api/reservations`: 查询预约列表（支持按用户、节点过滤）。
    -   [ ] `DELETE /api/reservations/{id}`: 删除/释放预约。
    -   [ ] 为冲突检测逻辑编写详尽的单元测试。

### P1.2: 前端 (Frontend)
*(此部分任务与后端技术栈无关，保持不变)*
...

---

## 里程碑二 (Phase 2): Agent 与 SSH 硬锁定

**目标**: 引入 Agent，打通从“UI预定”到“SSH自动授权”的全流程，**实现系统的核心价值**。

### P2.1: 后端 (Backend)
*(此部分任务与后端技术栈无关，保持不变)*
...

### P2.2: Agent
-   [ ] **任务 P2.2.1: Agent 初始化与 `get-keys` 命令**
    -   [ ] 创建 Agent 的 **Python** 脚本项目。
    -   [ ] 实现 `get-keys %u` 命令，该命令会调用后端的 `GET /api/auth/ssh-keys` API，并将其返回的公钥和环境变量打印到标准输出。

-   [ ] **任务 P2.2.2: Agent 资产发现与监控功能**
    -   [ ] 实现执行 `npu-smi` 命令并解析其输出的功能。
    -   [ ] Agent 启动时，上报资产信息。
    -   [ ] Agent 内置定时器，周期性上报监控指标。

### P2.3: 部署与联调
-   [ ] **任务 P2.3.1: 端到端测试**
    -   [ ] 编写部署脚本，将 Agent 和 `sshd_config` 修改部署到一台**测试服务器**。
    -   [ ] **关键测试用例**:
        1.  在 UI 创建一个预约。
        2.  立即尝试 SSH 登录测试服务器，应成功。
        3.  登录后，检查 `echo $ASCEND_VISIBLE_DEVICES` 是否正确。
        4.  在 UI 释放该预约。
        5.  立即尝试 SSH 登录测试服务器，应失败 (`Permission denied`)。

### P2.4: 前端 (Frontend)
*(此部分任务与后端技术栈无关，保持不变)*
...

---

## 里程碑三 (Phase 3): 健壮性、安全性与高级功能

**目标**: 将系统从“可用”提升到“可靠”、“安全”，达到生产环境部署标准。

### P3.1: 安全与可靠性 (Security & Reliability)
-   [ ] **任务 P3.1.1: 后端 - Agent 安全认证体系**
    -   [ ] 实现一次性邀请码和永久 Agent-Token 的生成与管理逻辑。
    -   [ ] 为所有 Agent-Facing API 添加 `Bearer Token` 认证中间件。

-   [ ] **任务 P3.1.2: Agent - 实现安全认证与本地缓存**
    -   [ ] Agent 支持通过邀请码注册并安全存储 Agent-Token。
    -   [ ] **关键重构**: 将 Agent改造为持久化运行的 `systemd` 守护进程。
    -   [ ] 实现周期性从后端拉取**完整授权策略**并写入本地缓存文件的逻辑。
    -   [ ] **关键重构**: 将 `get-keys` 命令的实现改为仅从**本地缓存文件**读取，不再进行网络调用。
    -   [ ] **新增**: 引入 **PyInstaller**，编写打包脚本，将 Agent 构建为单个可执行文件。

### P3.2: 后端 (Backend)
*(此部分任务与后端技术栈无关，保持不变)*
...

### P3.3: 前端 (Frontend)
*(此部分任务与后端技术栈无关，保持不变)*
...

### P3.4: 文档
*(此部分任务与后端技术栈无关，保持不变)*
...

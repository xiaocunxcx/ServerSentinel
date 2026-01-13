# ServerSentinel - 项目任务分解 (Task Breakdown - Python/SQLite Stack)

## 总体策略

本项目将遵循“后端先行、分阶段迭代”的开发策略，技术栈统一为 **Python + SQLite**。

1.  **后端先行**: 每个功能的开发都将从后端 API 开始，确保数据结构和业务逻辑正确无误。API 开发和测试通过后，前端再进行开发对接。
2.  **分阶段迭代 (Phased Approach)**: 项目将分为三个主要里程碑，循序渐进地实现功能，降低一次性开发的复杂度和风险。
    *   **里程碑一 (Phase 1)**: 构建核心预定能力。实现一个功能正常的、但尚未实现“硬锁定”的资源预定平台。
    *   **里程碑二 (Phase 2)**: 实现核心“硬锁定”。引入 Agent，打通从“预定”到“SSH 自动授权”的核心闭环。
    *   **里程碑三 (Phase 3)**: 完善与加固。全面增强系统的安全性、健壮性、并补全监控、报表等高级功能。

### Spec-Driven 开发流程（必选）

1. **写 Spec**：在 `docs/specs/` 新建规格文档，明确目标、规则、边界与验收标准。
2. **更新设计**：在 `docs/design.md` 补充数据模型与 API 合约。
3. **拆任务**：在本文件中补充实现/测试任务。
4. **实现与测试**：代码必须覆盖 Spec 中的验收标准与异常路径。

---

## 通用 Definition of Done (DoD)

- 相关 Spec 完整、评审通过（含边界条件与错误码）。
- API 文档与实现一致；关键接口具备单元/集成测试。
- 关键流程覆盖端到端测试或手工验证步骤。
- 变更记录在 `docs/design.md` 与 `docs/task.md` 同步更新。

## 里程碑一 (Phase 1): MVP - 核心预定平台

**目标**: 搭建一个功能可用的预定系统，用户可以查看资源、提交预约，但SSH授权仍需手动完成。**验证核心业务逻辑的正确性**。

### P1.1: 后端 (Backend)
-   [x] **任务 P1.1.1: 项目初始化与数据库建模** ✅
    -   [x] 初始化 **Python** 项目并引入 **FastAPI** 框架。
    -   [x] 配置 **SQLite** 数据库（单文件：`serversentinel.db`）。
    -   [x] 引入 **SQLAlchemy** 作为 ORM，并使用 **Alembic** 进行数据库迁移管理。
    -   [x] 根据 `design.md` 创建 `users`, `ssh_keys`, `nodes`, `devices`, `reservations`, `reservation_devices` 的 SQLAlchemy 模型并生成首次迁移。
    -   [x] 配置 SQLite 连接字符串：`sqlite:///./serversentinel.db`

-   [x] **任务 P1.1.2: 用户与公钥管理 API** ✅
    -   [x] `POST /api/v1/auth/login`: 实现基于白名单的用户登录认证 (使用 JWT)。
    -   [x] `GET /api/v1/users/me`: 获取当前登录用户信息。
    -   [x] `POST /api/v1/users/me/ssh-keys`: 允许用户上传和管理自己的 SSH 公钥。
    -   [x] `DELETE /api/v1/users/me/ssh-keys/{key_id}`: 删除 SSH 公钥。
    -   [ ] 为以上接口编写单元测试和集成测试 (使用 Pytest)。

-   [x] **任务 P1.1.3: 资产管理 API (手动录入)** ✅
    -   [ ] `POST /api/admin/nodes`: (Admin) 手动注册物理服务器节点。
    -   [ ] `POST /api/admin/nodes/{node_id}/devices`: (Admin) 手动为节点添加 NPU 设备信息。
    -   [x] `GET /api/v1/nodes`: 获取所有节点及其设备的列表。

-   [x] **任务 P1.1.4: 核心预约逻辑 API** ✅
    -   [x] `POST /api/v1/reservations`: 创建新的资源预约。
        -   **关键**: 实现时间段冲突检测算法（整机 vs 整机, 整机 vs 卡级, 卡级 vs 卡级）。
    -   [x] `GET /api/v1/reservations`: 查询预约列表（支持按用户、节点过滤）。
    -   [x] `DELETE /api/v1/reservations/{id}`: 删除/释放预约。
    -   [ ] 为冲突检测逻辑编写详尽的单元测试。

### P1.2: 前端 (Frontend)
-   [x] **任务 P1.2.1: 项目初始化** ✅
    -   [x] 初始化 React + TypeScript + Vite 项目
    -   [x] 集成 Ant Design 组件库
    -   [x] 配置路由 (React Router)
    -   [x] 配置 API 客户端 (Axios)

-   [x] **任务 P1.2.2: 认证相关页面** ✅
    -   [x] 登录页面 (`/login`)
    -   [x] 受保护路由组件
    -   [x] JWT Token 存储与管理

-   [x] **任务 P1.2.3: 核心页面** ✅
    -   [x] Dashboard 首页 - 资源概览
    -   [x] 节点列表页 - 显示所有节点和设备
    -   [x] 节点详情页 - 显示单个节点详细信息
    -   [x] 预约管理页 - 创建/查看/删除预约
    -   [x] SSH 密钥管理页

-   [x] **任务 P1.2.4: 前后端联调** ✅
    -   [x] API endpoints 定义完成
    -   [x] API 类型定义完成
    -   [x] Dashboard 接入真实 API（替换 mock 数据）
    -   [x] 节点列表接入真实 API
    -   [x] 预约功能接入真实 API
    -   [x] 错误处理与加载状态优化

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

---

## 当前进展概览 (Progress Summary)

**更新时间**: 2026-01-13

### 已完成 (Completed)
- ✅ 后端 FastAPI 框架搭建完成
- ✅ SQLite 数据库 + SQLAlchemy ORM 配置完成
- ✅ 用户认证系统 (JWT) 完成
- ✅ SSH 密钥管理 API 完成
- ✅ 节点查询 API 完成
- ✅ 预约系统 (含冲突检测) 完成
- ✅ 前端 React + TypeScript 项目搭建完成
- ✅ 前端页面组件全部完成 (登录/Dashboard/节点/预约/密钥管理)
- ✅ API 客户端与类型定义完成
- ✅ 前后端联调完成

### 进行中 (In Progress)
- （暂无）

### 待完成 (Pending)
1. **Phase 1 收尾**
   - [ ] Admin API - 节点/设备手动录入
   - [x] 前端接入真实 API
   - [ ] 单元测试覆盖

2. **Phase 2 - Agent 与 SSH 硬锁定**
   - [ ] Agent `get-keys` 命令
   - [ ] Agent 资产发现与监控
   - [ ] Agent 认证体系
   - [ ] 端到端测试

3. **Phase 3 - 健壮性与高级功能**
   - [ ] Agent Token 认证
   - [ ] 本地缓存机制
   - [ ] 统计报表
   - [ ] 文档完善

---

## 下一阶段任务规划 (Next Steps)

### 优先级 P0 - 完成前后端联调
1. ✅ Dashboard 接入真实 API
2. ✅ 创建预约功能接入真实 API
3. ✅ 错误处理与加载状态

### 优先级 P1 - 补全 Admin API
1. POST /api/v1/admin/nodes - 创建节点
2. POST /api/v1/admin/nodes/{id}/devices - 添加设备
3. 前端 Admin 资产管理页面

### 优先级 P2 - 单元测试
1. 认证相关测试
2. 预约冲突检测测试
3. API 集成测试

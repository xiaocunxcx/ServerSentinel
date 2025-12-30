# ServerSentinel 快速开始指南

## 前提条件

- Docker & Docker Compose
- (可选) Python 3.11+ 用于本地开发

## 🚀 启动步骤

### 1. 启动服务

```bash
cd /home/eric/workspace/ServerSentinel
docker-compose up --build
```

等待服务启动，看到 "ServerSentinel API startup complete" 消息。

### 2. 运行数据库迁移

打开**新的终端窗口**：

```bash
cd /home/eric/workspace/ServerSentinel
docker-compose exec api alembic upgrade head
```

### 3. 初始化测试用户

```bash
docker-compose exec api python /app/scripts/init_db.py
```

这会创建：
- 管理员: `admin` / `admin123`
- 测试用户: `testuser` / `test123`

### 4. 访问 API 文档

打开浏览器访问: **http://localhost:8000/docs**

## 📝 API 测试流程

### 登录获取 Token

1. 在 Swagger UI 中找到 `POST /api/v1/auth/login`
2. 点击 "Try it out"
3. 输入:
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
4. 点击 Execute
5. 复制返回的 `access_token`

### 授权后续请求

1. 点击页面右上角的 **"Authorize"** 按钮（绿色锁图标）
2. 在弹出框中粘贴 token（不需要 "Bearer " 前缀）
3. 点击 "Authorize"
4. 点击 "Close"

现在所有需要认证的 API 都可以调用了！

## 🧪 测试示例

### 创建节点（需要管理员权限）

`POST /api/v1/nodes`
```json
{
  "name": "GPU-Server-01",
  "ip_address": "192.168.1.100",
  "ssh_port": 22
}
```

### 添加设备到节点

`POST /api/v1/nodes/{node_id}/devices`
```json
{
  "device_index": 0,
  "model_name": "Ascend 910B"
}
```

### 创建预约

`POST /api/v1/reservations`
```json
{
  "node_id": 1,
  "start_time": "2025-12-29T12:00:00",
  "end_time": "2025-12-29T18:00:00",
  "type": "device",
  "device_ids": [1]
}
```

## 🛠️ 开发模式

### 查看日志

```bash
docker-compose logs -f api
```

### 重新构建

```bash
docker-compose down
docker-compose up --build
```

### 停止服务

```bash
docker-compose down
```

## ⚠️ 重要提示

1. **生产环境**务必修改 `.env` 中的 `SECRET_KEY`
2. **立即修改**默认管理员密码
3. 数据持久化在 Docker volume `sentinel-db-data` 中

## 📚 更多信息

- 完整需求: `docs/requirements.md`
- 系统设计: `docs/design.md`
- 任务规划: `docs/task.md`

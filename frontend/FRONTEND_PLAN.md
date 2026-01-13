# Frontend 项目完善计划

**项目**: ServerSentinel Frontend  
**日期**: 2026-01-06  
**技术栈**: React + TypeScript + Ant Design + Vite  
**状态**: 🔄 进行中

---

## 📊 当前状态分析

### ✅ 已有文件
- `src/api/types.ts` - API 类型定义
- `src/api/endpoints.ts` - API 端点
- `src/pages/Login.tsx` - 登录页面
- `src/pages/Dashboard.tsx` - 仪表板
- `src/pages/Reservations.tsx` - 预约管理
- `src/pages/Keys.tsx` - SSH 密钥管理
- `src/pages/Nodes.tsx` - 节点列表
- `src/pages/NodeDetail.tsx` - 节点详情
- `src/pages/AdminAssets.tsx` - 管理员资产管理
- `src/layouts/AppLayout.tsx` - 应用布局
- `src/styles/global.css` - 全局样式

### ❌ 缺失文件
1. **项目配置**
   - `package.json` - 项目依赖
   - `vite.config.ts` - Vite 配置
   - `tsconfig.json` - TypeScript 配置
   - `index.html` - HTML 入口
   - `.env.example` - 环境变量示例

2. **核心文件**
   - `src/main.tsx` - 应用入口
   - `src/App.tsx` - 根组件
   - `src/api/client.ts` - API 客户端

3. **组件**
   - `src/components/MetricCard.tsx` - 指标卡片
   - `src/components/ResourceCard.tsx` - 资源卡片
   - 其他通用组件

4. **数据**
   - `src/data/mock.ts` - Mock 数据

5. **路由**
   - `src/router/index.tsx` - 路由配置

---

## 🎯 实施计划

### 第一阶段：项目基础设施 ✅
1. ✅ 创建 `package.json`
2. ✅ 创建 `vite.config.ts`
3. ✅ 创建 `tsconfig.json`
4. ✅ 创建 `index.html`
5. ✅ 创建 `.env.example`

### 第二阶段：核心文件 ⬜
6. ⬜ 创建 `src/main.tsx`
7. ⬜ 创建 `src/App.tsx`
8. ⬜ 完善 `src/api/client.ts`
9. ⬜ 创建 `src/router/index.tsx`

### 第三阶段：组件开发 ⬜
10. ⬜ 创建 `src/components/MetricCard.tsx`
11. ⬜ 创建 `src/components/ResourceCard.tsx`
12. ⬜ 创建其他通用组件

### 第四阶段：页面完善 ⬜
13. ⬜ 更新 API 端点路径（`/me/keys` → `/me/ssh-keys`）
14. ⬜ 完善预约管理页面
15. ⬜ 完善 SSH 密钥管理页面
16. ⬜ 完善仪表板页面

### 第五阶段：样式优化 ⬜
17. ⬜ 完善全局样式
18. ⬜ 添加响应式设计
19. ⬜ 添加动画效果

---

## 📝 需要修复的问题

### 1. API 端点路径不匹配
**问题**: 当前代码使用 `/api/v1/users/me/keys`，但后端已更新为 `/api/v1/users/me/ssh-keys`

**修复**:
```typescript
// endpoints.ts
export const getKeys = () => api.get("/api/v1/users/me/ssh-keys");
export const createKey = (payload: SshKeyPayload) =>
    api.post("/api/v1/users/me/ssh-keys", payload);
export const deleteKey = (id: number) =>
    api.delete(`/api/v1/users/me/ssh-keys/${id}`);
```

### 2. 类型定义不完整
**问题**: 缺少完整的类型定义

**需要添加**:
- `Node` 类型
- `Device` 类型
- `Reservation` 类型
- `SSHKey` 类型
- 等等

### 3. 缺少 Mock 数据
**问题**: 页面引用了 `../data/mock` 但文件不存在

**需要创建**: `src/data/mock.ts`

---

## 🚀 优先级

### 🔴 高优先级（立即完成）
1. 创建项目配置文件（package.json, vite.config.ts, etc.）
2. 创建核心文件（main.tsx, App.tsx, router）
3. 修复 API 端点路径
4. 创建缺失的组件

### 🟡 中优先级（本周完成）
5. 完善类型定义
6. 优化样式
7. 添加错误处理

### 🟢 低优先级（可选）
8. 添加单元测试
9. 添加 E2E 测试
10. 性能优化

---

## 📚 技术选型

- **框架**: React 18
- **语言**: TypeScript 5
- **构建工具**: Vite 5
- **UI 库**: Ant Design 5
- **路由**: React Router 6
- **HTTP 客户端**: Axios
- **状态管理**: React Hooks (useState, useContext)
- **样式**: CSS Modules + Ant Design

---

**开始时间**: 2026-01-06 16:40  
**预计完成**: 2026-01-06 18:00

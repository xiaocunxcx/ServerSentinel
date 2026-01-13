# Frontend 白屏问题诊断和修复

**问题**: 启动后页面显示白屏

---

## ✅ 已修复的问题

### 1. 添加 CSS 变量定义
**问题**: 全局样式缺少 CSS 变量定义  
**修复**: 在 `src/styles/global.css` 开头添加了所有必需的 CSS 变量

### 2. 添加 Vite 类型定义
**问题**: TypeScript 报错 `Property 'env' does not exist on type 'ImportMeta'`  
**修复**: 创建 `src/vite-env.d.ts` 文件

---

## 🔍 诊断步骤

### 1. 检查浏览器控制台
打开浏览器开发者工具（F12），查看 Console 标签页是否有错误信息。

### 2. 检查 Network 标签
查看是否有资源加载失败（红色的请求）。

### 3. 检查页面元素
在 Elements/检查 标签页中，查看 `<div id="root"></div>` 是否有内容。

---

## 🚀 重启服务

请重新启动 Vite 开发服务器：

```bash
# 停止当前服务（Ctrl+C）
# 然后重新启动
cd /home/eric/workspace/github/ServerSentinel/frontend
npx vite --host 0.0.0.0
```

---

## 🔧 可能的问题和解决方案

### 问题 1: 依赖未安装
**症状**: 控制台显示 "Cannot find module" 错误  
**解决**: 
```bash
npm install
```

### 问题 2: 端口被占用
**症状**: 启动时提示端口已被使用  
**解决**: 
```bash
# 使用不同端口
npx vite --host 0.0.0.0 --port 5174
```

### 问题 3: 路由问题
**症状**: 页面加载但显示空白  
**解决**: 直接访问登录页
```
http://localhost:5173/login
```

### 问题 4: API 代理问题
**症状**: 控制台显示 API 请求失败  
**解决**: 确保后端服务正在运行
```bash
cd ../backend
source venv/bin/activate
PYTHONPATH=. uvicorn app.main:app --reload
```

---

## 📋 检查清单

- [ ] 依赖已安装（`npm install`）
- [ ] Vite 服务已重启
- [ ] 浏览器控制台无错误
- [ ] 后端服务正在运行
- [ ] 可以访问 http://localhost:5173/login

---

## 🎯 预期结果

### 访问 http://localhost:5173/

**应该看到**:
- 自动重定向到 `/login`
- 显示登录页面
- 左侧有渐变色背景的 Hero 区域
- 右侧有登录表单

### 登录后

**应该看到**:
- 左侧导航栏（ServerSentinel 品牌）
- 顶部标题栏（资源矩阵）
- 主内容区域（仪表板）

---

## 💡 快速测试

### 测试 1: 检查根路径
```bash
curl http://localhost:5173/
```
应该返回 HTML 内容

### 测试 2: 检查 main.tsx
```bash
curl http://localhost:5173/src/main.tsx
```
应该返回 TypeScript 代码

### 测试 3: 检查 Vite 服务
访问: http://localhost:5173/__vite_ping
应该返回 "pong"

---

## 🆘 如果仍然白屏

请提供以下信息：

1. **浏览器控制台错误**（截图或复制错误信息）
2. **Network 标签中的失败请求**
3. **Vite 启动日志**

然后我可以提供更具体的解决方案。

---

**更新时间**: 2026-01-06 17:25  
**状态**: 已修复 CSS 变量和类型定义问题

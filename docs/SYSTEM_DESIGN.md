# ServerSentinel 系统设计说明书

> **版本**: 1.0
> **更新日期**: 2026-01-15
> **文档目的**: 为新加入的开发人员提供全面的系统架构和开发指南

---

## 目录

1. [项目概述](#1-项目概述)
2. [系统架构](#2-系统架构)
3. [技术栈详解](#3-技术栈详解)
4. [数据库设计](#4-数据库设计)
5. [后端架构](#5-后端架构)
6. [前端架构](#6-前端架构)
7. [API 设计规范](#7-api-设计规范)
8. [安全机制](#8-安全机制)
9. [部署方案](#9-部署方案)
10. [开发指南](#10-开发指南)
11. [扩展开发](#11-扩展开发)

---

## 1. 项目概述

### 1.1 项目简介

ServerSentinel 是一个高性能的 **NPU 服务器管理与预约平台**，主要用于管理计算资源服务器，提供设备预约、节点管理、SSH 密钥管理等功能。

### 1.2 核心功能

| 模块 | 功能描述 |
|------|----------|
| **用户认证** | JWT Token 认证、管理员权限控制 |
| **节点管理** | 服务器节点的增删查改、状态监控 |
| **设备管理** | NPU 设备的注册与管理 |
| **预约系统** | 整机/设备级预约、冲突检测 |
| **SSH 密钥** | 用户 SSH 公钥管理 |
| **审计日志** | 操作记录与审计追踪 |

### 1.3 项目结构

```
ServerSentinel/
├── backend/                 # FastAPI 后端
│   ├── app/
│   │   ├── api/            # API 路由层
│   │   ├── core/           # 核心配置
│   │   ├── crud/           # 数据库操作层
│   │   ├── models/         # SQLAlchemy 模型
│   │   ├── schemas/        # Pydantic 模式
│   │   └── services/       # 业务逻辑层
│   ├── alembic/            # 数据库迁移
│   ├── tests/              # 后端测试
│   └── main.py             # 应用入口
├── frontend/                # React 前端
│   ├── src/
│   │   ├── api/            # API 调用封装
│   │   ├── components/     # 可复用组件
│   │   ├── pages/          # 页面组件
│   │   ├── layouts/        # 布局组件
│   │   ├── router/         # 路由配置
│   │   ├── styles/         # 样式文件
│   │   └── main.tsx        # 应用入口
│   └── vite.config.ts      # Vite 配置
├── docs/                    # 项目文档
├── docker-compose.yml       # Docker 编排
└── README.md                # 项目说明
```

---

## 2. 系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         客户端 (Browser)                          │
│                    React + TypeScript + Vite                     │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / REST API
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Nginx (可选)                               │
│                      反向代理 / 静态资源                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FastAPI Backend                             │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │   API     │  │ Service  │  │  CRUD    │  │    Model      │   │
│  │  Routes   │→│   Layer   │→│   Layer   │→│   (SQLAlchemy) │   │
│  └───────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Middleware (CORS, Auth, Logging)             │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       数据存储层                                  │
│  ┌──────────────────┐          ┌──────────────────┐            │
│  │   MySQL 8.0      │          │  SQLite (Dev)    │            │
│  │   (生产环境)      │          │  (开发环境)       │            │
│  └──────────────────┘          └──────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 分层架构说明

| 层级 | 职责 | 技术实现 |
|------|------|----------|
| **表现层** | 用户界面、路由管理 | React + Ant Design |
| **API 层** | HTTP 请求处理、参数验证 | FastAPI 路由 |
| **业务层** | 业务逻辑处理、权限控制 | Services |
| **数据层** | 数据持久化、事务管理 | SQLAlchemy ORM |
| **存储层** | 数据存储 | MySQL / SQLite |

---

## 3. 技术栈详解

### 3.1 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Python** | 3.11+ | 开发语言 |
| **FastAPI** | 0.111.0 | Web 框架 |
| **Uvicorn** | 0.29.0 | ASGI 服务器 |
| **SQLAlchemy** | 2.0.36 | ORM 框架 |
| **Alembic** | 1.13.1 | 数据库迁移 |
| **Pydantic** | 2.9.0 | 数据验证 |
| **python-jose** | 3.3.0 | JWT 处理 |
| **bcrypt** | 4.0.1 | 密码加密 |
| **PyMySQL** | 1.1.0 | MySQL 驱动 |

### 3.2 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 18.2.0 | UI 框架 |
| **TypeScript** | 5.3.3 | 类型系统 |
| **Vite** | 5.0.8 | 构建工具 |
| **Ant Design** | 5.12.0 | UI 组件库 |
| **React Router** | 6.20.0 | 路由管理 |
| **Axios** | 1.6.2 | HTTP 客户端 |
| **Day.js** | 1.11.10 | 日期处理 |

### 3.3 开发工具

| 工具 | 用途 |
|------|------|
| **Docker** | 容器化部署 |
| **Docker Compose** | 多容器编排 |
| **Git** | 版本控制 |
| **Black** | Python 代码格式化 |
| **ESLint** | JavaScript 代码检查 |

---

## 4. 数据库设计

### 4.1 ER 图概览

```
┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│    users    │       │    nodes    │       │  devices     │
├─────────────┤       ├─────────────┤       ├──────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)      │
│ username    │       │ name        │       │ device_index │
│ email       │       │ ip_address  │ 1   * │ node_id (FK) │
│ password    │       │ ssh_port    │───────││ model_name   │
│ is_admin    │       │ status      │       └──────────────┘
│ ...         │       │ ...         │
└──────┬──────┘       └──────┬──────┘
       │                     │
       │ *                1  │
       │                     │
       │         ┌───────────┴──────────┐
       │         │                       │
┌──────▼──────┐  │              ┌────────▼────────┐
│  ssh_keys   │  │              │  reservations   │
├─────────────┤  │              ├─────────────────┤
│ id (PK)     │  │              │ id (PK)         │
│ user_id (FK)│  │              │ start_time      │
│ public_key  │  │              │ end_time        │
│ fingerprint │  │              │ type            │
│ ...         │  │              │ user_id (FK)    │
└─────────────┘  │              │ node_id (FK)    │
                  │              │ ...             │
                  │              └────────┬────────┘
                  │                       │
                  │              ┌────────▼─────────────────┐
                  │              │ reservation_devices      │
                  │              ├──────────────────────────┤
                  │              │ reservation_id (FK)      │
                  │              │ device_id (FK)           │
                  │              └──────────────────────────┘
                  │
┌─────────────────▼────────┐
│       audit_logs         │
├──────────────────────────┤
│ id (PK)                  │
│ user_id (FK, nullable)   │
│ action                   │
│ resource_type            │
│ resource_id              │
│ details (JSON)           │
│ ip_address               │
│ created_at               │
└──────────────────────────┘
```

### 4.2 数据表详细说明

#### 4.2.1 用户表 (users)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | Integer | 主键 | PRIMARY KEY, AUTO_INCREMENT |
| username | String(50) | 用户名 | UNIQUE, NOT NULL |
| email | String(100) | 邮箱 | UNIQUE, NOT NULL |
| hashed_password | String(255) | 加密密码 | NOT NULL |
| is_admin | Boolean | 是否管理员 | DEFAULT False |
| is_active | Boolean | 是否激活 | DEFAULT True |
| created_at | DateTime | 创建时间 | DEFAULT NOW |
| updated_at | DateTime | 更新时间 | DEFAULT NOW |

#### 4.2.2 SSH 密钥表 (ssh_keys)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | Integer | 主键 | PRIMARY KEY |
| public_key | Text | 公钥内容 | NOT NULL |
| fingerprint | String(100) | 密钥指纹 | NOT NULL |
| user_id | Integer | 所属用户 | FOREIGN KEY → users.id |
| created_at | DateTime | 创建时间 | DEFAULT NOW |

#### 4.2.3 节点表 (nodes)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | Integer | 主键 | PRIMARY KEY |
| name | String(100) | 节点名称 | UNIQUE, NOT NULL |
| ip_address | String(50) | IP 地址 | NOT NULL |
| ssh_port | Integer | SSH 端口 | DEFAULT 22 |
| status | String(20) | 状态 | 'online'/'offline' |
| created_at | DateTime | 创建时间 | DEFAULT NOW |
| updated_at | DateTime | 更新时间 | DEFAULT NOW |

#### 4.2.4 设备表 (devices)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | Integer | 主键 | PRIMARY KEY |
| device_index | Integer | 设备索引 | NOT NULL |
| model_name | String(100) | 设备型号 | NOT NULL |
| node_id | Integer | 所属节点 | FOREIGN KEY → nodes.id |
| created_at | DateTime | 创建时间 | DEFAULT NOW |

#### 4.2.5 预约表 (reservations)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | Integer | 主键 | PRIMARY KEY |
| start_time | DateTime | 开始时间 | NOT NULL |
| end_time | DateTime | 结束时间 | NOT NULL |
| type | String(20) | 预约类型 | 'machine'/'device' |
| user_id | Integer | 预约用户 | FOREIGN KEY → users.id |
| node_id | Integer | 预约节点 | FOREIGN KEY → nodes.id |
| created_at | DateTime | 创建时间 | DEFAULT NOW |
| updated_at | DateTime | 更新时间 | DEFAULT NOW |

#### 4.2.6 预约设备关联表 (reservation_devices)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| reservation_id | Integer | 预约ID | FOREIGN KEY → reservations.id |
| device_id | Integer | 设备ID | FOREIGN KEY → devices.id |

**联合主键**: (reservation_id, device_id)

#### 4.2.7 审计日志表 (audit_logs)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | Integer | 主键 | PRIMARY KEY |
| user_id | Integer | 操作用户 | FOREIGN KEY → users.id (nullable) |
| action | String(50) | 操作类型 | 'login', 'create', 'delete', etc. |
| resource_type | String(50) | 资源类型 | 'node', 'reservation', etc. |
| resource_id | Integer | 资源ID | - |
| details | JSON | 详细信息 | - |
| ip_address | String(50) | 客户端IP | - |
| created_at | DateTime | 创建时间 | DEFAULT NOW |

---

## 5. 后端架构

### 5.1 目录结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI 应用入口
│   ├── config.py               # 配置管理
│   ├── database.py             # 数据库会话
│   ├── dependencies.py         # 依赖注入
│   │
│   ├── api/                    # API 路由
│   │   ├── __init__.py
│   │   ├── auth.py             # 认证相关接口
│   │   ├── users.py            # 用户相关接口
│   │   ├── nodes.py            # 节点相关接口
│   │   ├── reservations.py     # 预约相关接口
│   │   └── health.py           # 健康检查
│   │
│   ├── core/                   # 核心模块
│   │   ├── __init__.py
│   │   ├── security.py         # 安全相关（JWT, 密码）
│   │   ├── config.py           # 配置类
│   │   └── deps.py             # 公共依赖
│   │
│   ├── crud/                   # 数据库操作层
│   │   ├── __init__.py
│   │   ├── base.py             # 基础 CRUD 类
│   │   ├── user.py             # 用户操作
│   │   ├── node.py             # 节点操作
│   │   ├── device.py           # 设备操作
│   │   ├── reservation.py      # 预约操作
│   │   └── ssh_key.py          # SSH密钥操作
│   │
│   ├── models/                 # SQLAlchemy 模型
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── node.py
│   │   ├── device.py
│   │   ├── reservation.py
│   │   ├── ssh_key.py
│   │   └── audit_log.py
│   │
│   ├── schemas/                # Pydantic 模式
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── node.py
│   │   ├── device.py
│   │   ├── reservation.py
│   │   ├── ssh_key.py
│   │   └── token.py
│   │
│   └── services/               # 业务逻辑层
│       ├── __init__.py
│       ├── auth_service.py     # 认证服务
│       ├── reservation_service.py  # 预约服务
│       └── audit_service.py    # 审计服务
│
├── alembic/                    # 数据库迁移
│   ├── versions/
│   └── env.py
│
├── tests/                      # 测试代码
│   ├── __init__.py
│   ├── conftest.py
│   └── test_api/
│
├── scripts/                    # 工具脚本
│   └── init_db.py              # 初始化数据库
│
├── .env.example                # 环境变量示例
├── alembic.ini                 # Alembic 配置
├── requirements.txt            # Python 依赖
└── main.py                     # 应用启动入口
```

### 5.2 分层设计

#### 5.2.1 API 层 (app/api/)

处理 HTTP 请求和响应，负责：
- 路由定义
- 参数验证
- 响应格式化
- 错误处理

**示例代码结构**:

```python
# app/api/nodes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.core.deps import get_db, get_current_user

router = APIRouter()

@router.get("/", response_model=List[schemas.Node])
def list_nodes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """获取节点列表"""
    return crud.node.get_multi(db, skip=skip, limit=limit)

@router.post("/", response_model=schemas.Node)
def create_node(
    node_in: schemas.NodeCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """创建节点（管理员）"""
    if not current_user.is_admin:
        raise HTTPException(403, "权限不足")
    return crud.node.create(db, obj_in=node_in)
```

#### 5.2.2 CRUD 层 (app/crud/)

封装数据库操作，提供统一的数据访问接口：

```python
# app/crud/base.py
from typing import Generic, TypeVar, Type, List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session

ModelType = TypeVar("ModelType")
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get(self, db: Session, id: int) -> Optional[ModelType]:
        return db.query(self.model).filter(self.model.id == id).first()

    def get_multi(self, db: Session, skip: int = 0, limit: int = 100) -> List[ModelType]:
        return db.query(self.model).offset(skip).limit(limit).all()

    def create(self, db: Session, obj_in: CreateSchemaType) -> ModelType:
        obj_in_data = obj_in.model_dump()
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, id: int) -> ModelType:
        obj = db.query(self.model).get(id)
        db.delete(obj)
        db.commit()
        return obj
```

#### 5.2.3 Model 层 (app/models/)

定义数据库表结构：

```python
# app/models/user.py
from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```

#### 5.2.4 Schema 层 (app/schemas/)

定义 API 请求和响应的数据结构：

```python
# app/schemas/user.py
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: EmailStr | None = None

class User(UserBase):
    id: int
    is_admin: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
```

#### 5.2.5 Service 层 (app/services/)

处理复杂业务逻辑：

```python
# app/services/reservation_service.py
from typing import List
from sqlalchemy.orm import Session
from app import models, schemas

class ReservationService:
    @staticmethod
    def check_conflict(
        db: Session,
        node_id: int,
        start_time: datetime,
        end_time: datetime,
        device_ids: List[int] = None,
        exclude_id: int = None
    ) -> bool:
        """检查预约时间冲突"""
        query = db.query(models.Reservation).filter(
            models.Reservation.node_id == node_id,
            models.Reservation.start_time < end_time,
            models.Reservation.end_time > start_time
        )

        if exclude_id:
            query = query.filter(models.Reservation.id != exclude_id)

        if device_ids:
            query = query.join(models.Reservation.devices).filter(
                models.Device.id.in_(device_ids)
            )

        return query.first() is not None
```

### 5.3 依赖注入系统

FastAPI 的依赖注入用于：

```python
# app/core/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app import crud, models
from app.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    """获取当前登录用户"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    # 验证 token 并返回用户
    user = crud.user.get_by_token(db, token=token)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(
    current_user: models.User = Depends(get_current_user)
) -> models.User:
    """获取当前激活用户"""
    if not current_user.is_active:
        raise HTTPException(400, "用户已被禁用")
    return current_user
```

---

## 6. 前端架构

### 6.1 目录结构

```
frontend/
├── src/
│   ├── main.tsx                # 应用入口
│   ├── App.tsx                 # 根组件
│   ├── vite-env.d.ts           # Vite 类型声明
│   │
│   ├── api/                    # API 调用封装
│   │   ├── index.ts            # Axios 实例配置
│   │   ├── auth.ts             # 认证接口
│   │   ├── nodes.ts            # 节点接口
│   │   ├── reservations.ts     # 预约接口
│   │   └── ssh_keys.ts         # SSH密钥接口
│   │
│   ├── components/             # 可复用组件
│   │   ├── Layout/             # 布局组件
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── index.tsx
│   │   ├── NodeCard/           # 节点卡片
│   │   ├── ReservationForm/    # 预约表单
│   │   └── SSHKeyForm/         # SSH密钥表单
│   │
│   ├── pages/                  # 页面组件
│   │   ├── Login/              # 登录页
│   │   ├── Dashboard/          # 仪表板
│   │   ├── Nodes/              # 节点管理
│   │   ├── Reservations/       # 预约管理
│   │   ├── Profile/            # 用户资料
│   │   └── Admin/              # 管理员页面
│   │
│   ├── router/                 # 路由配置
│   │   └── index.tsx           # 路由定义
│   │
│   ├── styles/                 # 样式文件
│   │   ├── global.css          # 全局样式
│   │   ├── variables.css       # CSS 变量
│   │   └── theme.ts            # 主题配置
│   │
│   ├── contexts/               # React Context
│   │   └── AuthContext.tsx     # 认证上下文
│   │
│   ├── hooks/                  # 自定义 Hooks
│   │   ├── useAuth.ts          # 认证 Hook
│   │   └── useReservations.ts  # 预约 Hook
│   │
│   └── utils/                  # 工具函数
│       ├── request.ts          # 请求工具
│       └── format.ts           # 格式化工具
│
├── public/                     # 静态资源
├── index.html                  # HTML 入口
├── vite.config.ts              # Vite 配置
├── tsconfig.json               # TypeScript 配置
├── package.json                # 依赖管理
└── .env.example                # 环境变量示例
```

### 6.2 组件设计模式

#### 6.2.1 布局组件

```typescript
// src/components/Layout/index.tsx
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export default function Layout() {
  return (
    <div className="layout">
      <Header />
      <div className="layout-body">
        <Sidebar />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

#### 6.2.2 API 调用封装

```typescript
// src/api/index.ts
import axios from 'axios';
import { message } from 'antd';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // 跳转登录页
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### 6.2.3 页面组件示例

```typescript
// src/pages/Nodes/index.tsx
import { useEffect, useState } from 'react';
import { Card, Spin } from 'antd';
import api from '@/api/nodes';

export default function NodesPage() {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNodes();
  }, []);

  const fetchNodes = async () => {
    setLoading(true);
    try {
      const data = await api.listNodes();
      setNodes(data);
    } catch (error) {
      message.error('获取节点列表失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin />;

  return (
    <div>
      {nodes.map(node => (
        <Card key={node.id} title={node.name}>
          {/* 节点内容 */}
        </Card>
      ))}
    </div>
  );
}
```

### 6.3 路由配置

```typescript
// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Nodes from '@/pages/Nodes';
import Reservations from '@/pages/Reservations';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'nodes', element: <Nodes /> },
      { path: 'reservations', element: <Reservations /> },
    ],
  },
]);

export default router;
```

### 6.4 主题配置

```typescript
// src/styles/theme.ts
export const theme = {
  token: {
    colorPrimary: '#0c8c7d',
    borderRadius: 6,
    fontSize: 14,
  },
  components: {
    Button: {
      controlHeight: 40,
    },
    Input: {
      controlHeight: 40,
    },
  },
};
```

---

## 7. API 设计规范

### 7.1 RESTful 风格

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/resource | 获取列表 |
| GET | /api/resource/:id | 获取详情 |
| POST | /api/resource | 创建资源 |
| PUT | /api/resource/:id | 更新资源 |
| DELETE | /api/resource/:id | 删除资源 |

### 7.2 API 端点列表

#### 7.2.1 认证相关

| 端点 | 方法 | 说明 | 权限 |
|------|------|------|------|
| /api/auth/login | POST | 用户登录 | 公开 |
| /api/auth/logout | POST | 用户登出 | 已登录 |

#### 7.2.2 用户相关

| 端点 | 方法 | 说明 | 权限 |
|------|------|------|------|
| /api/users/me | GET | 获取当前用户信息 | 已登录 |
| /api/users/me/ssh-keys | GET | 获取 SSH 密钥列表 | 已登录 |
| /api/users/me/ssh-keys | POST | 添加 SSH 密钥 | 已登录 |
| /api/users/me/ssh-keys/:id | DELETE | 删除 SSH 密钥 | 已登录 |

#### 7.2.3 节点相关

| 端点 | 方法 | 说明 | 权限 |
|------|------|------|------|
| /api/nodes | GET | 获取节点列表 | 已登录 |
| /api/nodes/:id | GET | 获取节点详情 | 已登录 |
| /api/nodes | POST | 创建节点 | 管理员 |
| /api/nodes/:id | PUT | 更新节点 | 管理员 |
| /api/nodes/:id | DELETE | 删除节点 | 管理员 |
| /api/nodes/:id/devices | POST | 添加设备 | 管理员 |

#### 7.2.4 预约相关

| 端点 | 方法 | 说明 | 权限 |
|------|------|------|------|
| /api/reservations | GET | 获取预约列表 | 已登录 |
| /api/reservations/my | GET | 获取我的预约 | 已登录 |
| /api/reservations/:id | GET | 获取预约详情 | 已登录 |
| /api/reservations | POST | 创建预约 | 已登录 |
| /api/reservations/:id | DELETE | 删除预约 | 本人/管理员 |

#### 7.2.5 系统相关

| 端点 | 方法 | 说明 | 权限 |
|------|------|------|------|
| /api/health | GET | 健康检查 | 公开 |

### 7.3 响应格式规范

#### 7.3.1 成功响应

```json
{
  "id": 1,
  "name": "node-01",
  "ip_address": "192.168.1.100",
  "status": "online"
}
```

#### 7.3.2 错误响应

```json
{
  "detail": "资源不存在"
}
```

#### 7.3.3 列表响应

```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "size": 20
}
```

### 7.4 HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 422 | 验证失败 |
| 500 | 服务器错误 |

---

## 8. 安全机制

### 8.1 认证流程

```
┌─────────┐                  ┌─────────┐                  ┌─────────┐
│ Client  │                  │ Backend │                  │  DB     │
└────┬────┘                  └────┬────┘                  └────┬────┘
     │                            │                            │
     │ POST /api/auth/login       │                            │
     │ {username, password}       │                            │
     ├───────────────────────────>│                            │
     │                            │ SELECT * FROM users        │
     │                            │ WHERE username = ?         │
     │                            ├───────────────────────────>│
     │                            │<───────────────────────────┤
     │                            │                            │
     │                            │ bcrypt.compare()           │
     │                            │                            │
     │ {access_token}             │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
     │ 存储 token 到 localStorage │                            │
     │                            │                            │
     │ GET /api/users/me          │                            │
     │ Authorization: Bearer xxx  │                            │
     ├───────────────────────────>│                            │
     │                            │ 验证 JWT                   │
     │                            │ 获取用户信息               │
     │ {user_info}                │                            │
     │<───────────────────────────┤                            │
```

### 8.2 JWT Token 配置

```python
# app/core/security.py
from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """创建访问令牌"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_access_token(token: str) -> dict:
    """解码访问令牌"""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
```

### 8.3 密码加密

```python
import bcrypt

def hash_password(password: str) -> str:
    """加密密码"""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed_password: str) -> bool:
    """验证密码"""
    return bcrypt.checkpw(password.encode(), hashed_password.encode())
```

### 8.4 CORS 配置

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 前端地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 9. 部署方案

### 9.1 Docker Compose 部署

#### 9.1.1 docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    container_name: serversentinel-db
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: serversentinel
      MYSQL_USER: serversentinel
      MYSQL_PASSWORD: serversentinel
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build: ./backend
    container_name: serversentinel-api
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: mysql+pymysql://serversentinel:serversentinel@db:3306/serversentinel
      SECRET_KEY: ${SECRET_KEY}
      ACCESS_TOKEN_EXPIRE_MINUTES: 1440
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  web:
    build: ./frontend
    container_name: serversentinel-web
    depends_on:
      - api
    ports:
      - "80:80"
    volumes:
      - ./frontend/nginx.conf:/etc/nginx/nginx.conf

volumes:
  mysql_data:
```

#### 9.1.2 部署步骤

```bash
# 1. 克隆项目
git clone <repository-url>
cd ServerSentinel

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置必要的配置

# 3. 启动服务
docker-compose up -d

# 4. 初始化数据库
docker-compose exec api python -m scripts.init_db

# 5. 查看日志
docker-compose logs -f
```

### 9.2 生产环境建议

| 组件 | 建议 |
|------|------|
| **Web 服务器** | 使用 Nginx 作为反向代理 |
| **数据库** | 使用 MySQL 集群或云数据库 |
| **缓存** | 添加 Redis 缓存热点数据 |
| **日志** | 使用 ELK 或 Loki 收集日志 |
| **监控** | 使用 Prometheus + Grafana |
| **HTTPS** | 配置 SSL 证书 |
| **备份** | 定期备份数据库 |

---

## 10. 开发指南

### 10.1 环境准备

#### 10.1.1 后端环境

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 复制配置文件
cp .env.example .env

# 初始化数据库
alembic upgrade head

# 启动开发服务器
uvicorn app.main:app --reload --port 8000
```

#### 10.1.2 前端环境

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 复制配置文件
cp .env.example .env

# 启动开发服务器
npm run dev
```

### 10.2 开发规范

#### 10.2.1 代码风格

**Python (后端)**:
- 使用 Black 格式化代码
- 使用 isort 排序导入
- 使用 flake8 检查代码
- 遵循 PEP 8 规范

```bash
# 格式化
black backend/
isort backend/

# 检查
flake8 backend/
```

**TypeScript (前端)**:
- 使用 ESLint 检查代码
- 使用 Prettier 格式化代码
- 遵循 Airbnb 规范

```bash
# 检查
npm run lint

# 格式化
npm run format
```

#### 10.2.2 Git 提交规范

```
<type>(<scope>): <subject>

<type>: 类型 (feat, fix, docs, style, refactor, test, chore)
<scope>: 影响范围 (api, frontend, db, auth, etc.)
<subject>: 简短描述 (不超过 50 字符)
```

示例:
```
feat(api): 添加节点删除接口
fix(frontend): 修复预约时间选择器问题
docs: 更新系统设计文档
```

#### 10.2.3 分支策略

```
main        - 生产分支
develop     - 开发分支
feature/*   - 功能分支
fix/*       - 修复分支
hotfix/*    - 紧急修复分支
```

### 10.3 调试技巧

#### 10.3.1 后端调试

```python
# 使用 pdb 断点
import pdb; pdb.set_trace()

# 或使用 ipdb
import ipdb; ipdb.set_trace()

# VS Code 断点调试
# 在 .vscode/launch.json 中配置
```

#### 10.3.2 前端调试

```typescript
// 使用 console.log
console.log('Debug info:', data);

// 使用 debugger
debugger;

// React DevTools
// 安装浏览器扩展进行组件调试
```

### 10.4 数据库迁移

```bash
# 创建迁移文件
alembic revision --autogenerate -m "描述"

# 应用迁移
alembic upgrade head

# 回滚迁移
alembic downgrade -1

# 查看迁移历史
alembic history
```

---

## 11. 扩展开发

### 11.1 添加新的 API 端点

#### 步骤：

1. **创建 Schema** (`app/schemas/`)

```python
# app/schemas/resource.py
from pydantic import BaseModel

class ResourceBase(BaseModel):
    name: str

class ResourceCreate(ResourceBase):
    pass

class Resource(ResourceBase):
    id: int

    class Config:
        from_attributes = True
```

2. **创建 Model** (`app/models/`)

```python
# app/models/resource.py
from sqlalchemy import Column, Integer, String
from app.database import Base

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
```

3. **创建 CRUD** (`app/crud/`)

```python
# app/crud/resource.py
from app.crud.base import CRUDBase
from app.models.resource import Resource
from app.schemas.resource import ResourceCreate, ResourceUpdate

class CRUDResource(CRUDBase[Resource, ResourceCreate, ResourceUpdate]):
    pass

resource = CRUDResource(Resource)
```

4. **创建 API** (`app/api/`)

```python
# app/api/resources.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import crud, schemas
from app.core.deps import get_db

router = APIRouter()

@router.get("/", response_model=list[schemas.Resource])
def list_resources(db: Session = Depends(get_db)):
    return crud.resource.get_multi(db)

@router.post("/", response_model=schemas.Resource)
def create_resource(
    resource_in: schemas.ResourceCreate,
    db: Session = Depends(get_db)
):
    return crud.resource.create(db, obj_in=resource_in)
```

5. **注册路由** (`app/main.py`)

```python
from app.api.resources import router as resources_router

app.include_router(resources_router, prefix="/api/resources", tags=["resources"])
```

6. **创建数据库迁移**

```bash
alembic revision --autogenerate -m "add resources table"
alembic upgrade head
```

### 11.2 添加新的前端页面

#### 步骤：

1. **创建页面组件** (`src/pages/`)

```typescript
// src/pages/Resources/index.tsx
import { useState, useEffect } from 'react';
import { Table, Button } from 'antd';
import api from '@/api/resources';

export default function ResourcesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await api.listResources();
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Table dataSource={data} loading={loading} />
    </div>
  );
}
```

2. **创建 API 封装** (`src/api/`)

```typescript
// src/api/resources.ts
import api from './index';

export const listResources = () => {
  return api.get('/resources');
};

export const createResource = (data: any) => {
  return api.post('/resources', data);
};
```

3. **添加路由** (`src/router/index.tsx`)

```typescript
import Resources from '@/pages/Resources';

// 在路由配置中添加
{ path: 'resources', element: <Resources /> }
```

4. **添加菜单** (`src/components/Layout/Sidebar.tsx`)

```typescript
const menuItems = [
  // ...
  {
    key: 'resources',
    icon: <DatabaseOutlined />,
    label: '资源管理',
    path: '/resources',
  },
];
```

### 11.3 常见扩展场景

| 需求 | 实现方案 |
|------|----------|
| **邮件通知** | 集成 SendGrid/Aliyun DM |
| **文件上传** | 使用 MinIO/OSS |
| **实时通知** | WebSocket / Server-Sent Events |
| **定时任务** | Celery / APScheduler |
| **缓存** | Redis / Memcached |
| **全文搜索** | Elasticsearch / Meilisearch |

---

## 附录

### A. 环境变量说明

| 变量 | 说明 | 默认值 |
|------|------|--------|
| DATABASE_URL | 数据库连接字符串 | sqlite:///./serversentinel.db |
| SECRET_KEY | JWT 密钥 | - (必填) |
| ALGORITHM | JWT 算法 | HS256 |
| ACCESS_TOKEN_EXPIRE_MINUTES | Token 过期时间 | 1440 |
| VITE_API_URL | 前端 API 地址 | http://localhost:8000 |

### B. 常用命令

```bash
# 后端
cd backend
uvicorn app.main:app --reload              # 启动开发服务器
alembic revision --autogenerate -m "msg"   # 创建迁移
alembic upgrade head                       # 应用迁移

# 前端
cd frontend
npm run dev                                # 启动开发服务器
npm run build                              # 构建生产版本
npm run lint                               # 代码检查

# Docker
docker-compose up -d                        # 启动所有服务
docker-compose down                         # 停止所有服务
docker-compose logs -f api                  # 查看 API 日志
```

### C. 相关文档

- [FastAPI 官方文档](https://fastapi.tiangolo.com/)
- [React 官方文档](https://react.dev/)
- [Ant Design 文档](https://ant.design/)
- [SQLAlchemy 文档](https://docs.sqlalchemy.org/)

---

**文档维护**: 请保持本文档与代码同步更新，如有变更请及时修订。

**联系方式**: 如有疑问请联系项目维护者或提交 Issue。

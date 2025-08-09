# 管理员鉴权系统设计文档

## 概述

管理员鉴权系统是一个完全独立于用户系统的身份验证和授权系统，专门为管理员提供安全的登录、token管理和权限控制功能。

## 系统架构

### 1. 核心组件

#### AdminTokenService
- **功能**: 专门管理管理员token的服务
- **存储**: 使用线程安全的 `ConcurrentDictionary<int, AdminTokenInfo>` 存储管理员token
- **特点**: 
  - 独立的token队列，与用户token完全分离
  - 支持token生成、验证、刷新、撤销
  - 自动清理过期token
  - 提供紧急情况下强制下线所有管理员的功能

#### AdminService
- **功能**: 管理员业务逻辑服务
- **依赖**: 依赖 `AdminTokenService` 进行token管理
- **特点**:
  - 处理管理员登录、信息管理
  - 密码哈希和验证
  - 管理员权限控制

#### AdminController
- **功能**: 提供管理员API接口
- **特点**:
  - RESTful API设计
  - JWT Bearer认证
  - 角色基础访问控制

### 2. 数据模型

#### Admin实体
```csharp
public class Admin
{
    public int AdminId { get; set; }
    public string AdminName { get; set; }
    public string AdminPassword { get; set; }
    public int Role { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public int Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

#### AdminTokenInfo
```csharp
public class AdminTokenInfo
{
    public int AdminId { get; set; }
    public string Token { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public string Role { get; set; }
    public string Email { get; set; }
    public string AdminName { get; set; }
}
```

## 鉴权流程

### 1. 登录流程
1. 管理员提交邮箱和密码
2. 系统验证管理员存在且状态为活跃(Status=1)
3. 验证密码哈希
4. 生成JWT token
5. 将token存储在内存队列中
6. 返回token和管理员信息

### 2. Token验证流程
1. 客户端在请求头中携带 `Authorization: Bearer {token}`
2. 系统解析JWT token
3. 验证token签名和过期时间
4. 检查内存队列中是否存在该token
5. 验证token是否匹配且未过期
6. 提取管理员ID和角色信息

### 3. 登出流程
1. 管理员请求登出
2. 系统从内存队列中移除该管理员的token
3. 返回登出成功响应

## API接口

### 认证接口

#### POST /api/admin/initial-register
- **功能**: 初始管理员注册（仅当数据库中没有管理员时可用）
- **请求体**:
```json
{
    "adminName": "系统管理员",
    "email": "admin@example.com",
    "password": "admin123",
    "phone": "13800138000"
}
```
- **响应**:
```json
{
    "success": true,
    "message": "初始管理员创建成功并已自动登录",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "adminInfo": {
        "adminId": 1,
        "adminName": "系统管理员",
        "email": "admin@example.com",
        "role": 1,
        "phone": "13800138000",
        "status": 1
    }
}
```

#### POST /api/admin/login
- **功能**: 管理员登录
- **请求体**:
```json
{
    "email": "admin@example.com",
    "password": "admin123"
}
```
- **响应**:
```json
{
    "success": true,
    "message": "登录成功",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "adminInfo": {
        "adminId": 1,
        "adminName": "管理员",
        "email": "admin@example.com",
        "role": 1,
        "phone": "13800138000",
        "status": 1
    }
}
```

#### POST /api/admin/logout
- **功能**: 管理员登出
- **认证**: 需要Bearer token
- **响应**:
```json
{
    "success": true,
    "message": "登出成功"
}
```

### 信息管理接口

#### GET /api/admin/info
- **功能**: 获取管理员信息
- **认证**: 需要Bearer token

#### PUT /api/admin/info
- **功能**: 更新管理员信息
- **认证**: 需要Bearer token
- **请求体**:
```json
{
    "adminName": "新管理员名称",
    "phone": "13800138000"
}
```

#### PUT /api/admin/password
- **功能**: 修改密码
- **认证**: 需要Bearer token
- **请求体**:
```json
{
    "oldPassword": "旧密码",
    "newPassword": "新密码"
}
```

### 系统管理接口

#### GET /api/admin/list
- **功能**: 获取所有管理员列表（仅超级管理员）
- **认证**: 需要Bearer token

#### GET /api/admin/validate
- **功能**: 验证token有效性
- **认证**: 需要Bearer token

## 安全特性

### 1. 密码安全
- 使用SHA256哈希算法
- 密码在数据库中不存储明文

### 2. Token安全
- JWT token包含管理员ID、邮箱、角色信息
- Token有效期为7天
- 支持token刷新和撤销
- 内存存储，重启后自动清理

### 3. 权限控制
- 基于角色的访问控制(RBAC)
- 超级管理员(Role=1)拥有所有权限
- 普通管理员(Role=2)拥有有限权限

### 4. 状态控制
- 管理员状态控制(Status字段)
- 只有活跃状态(Status=1)的管理员可以登录

## 与用户系统的区别

| 特性 | 用户系统 | 管理员系统 |
|------|----------|------------|
| Token存储 | `ConcurrentDictionary<int, UserTokenInfo>` | `ConcurrentDictionary<int, AdminTokenInfo>` |
| 角色 | "user" | "admin" |
| 服务类 | `TokenService` | `AdminTokenService` |
| 控制器 | `UserController` | `AdminController` |
| 注册功能 | 支持用户注册 | 仅支持初始管理员注册 |
| 权限级别 | 普通用户权限 | 管理员权限 |

## 部署和配置

### 1. 依赖注入配置
在 `Program.cs` 中注册服务：
```csharp
// 注册 AdminTokenService
builder.Services.AddScoped<AdminTokenService>();

// 注册 AdminService
builder.Services.AddScoped<AdminService>();
```

### 2. JWT配置
管理员系统使用与用户系统相同的JWT密钥：
```csharp
private static readonly string _jwtSecret = "YourSuperSuperSuperSuperSecretKey123456!@#";
```

### 3. 数据库配置
确保 `ADMIN` 表已创建并包含必要的字段。

## 测试

使用提供的测试脚本 `test/test_admin_auth.py` 来验证系统功能：

```bash
python test/test_admin_auth.py
```

测试内容包括：
- 管理员登录
- Token验证
- 信息管理
- 密码修改
- 登出功能
- 无效凭据处理
- 无token访问处理

## 注意事项

1. **管理员账户创建**: 首次使用时通过 `/api/admin/initial-register` 创建初始管理员，后续管理员需要通过数据库直接创建
2. **Token管理**: 管理员token存储在内存中，服务器重启后会丢失
3. **权限控制**: 确保只有超级管理员可以访问管理员列表等敏感接口
4. **安全审计**: 建议记录管理员的所有操作日志
5. **备份策略**: 定期备份管理员账户信息

## 扩展功能

可以考虑添加的功能：
1. 管理员操作日志记录
2. 管理员权限细分
3. 管理员账户锁定机制
4. Token黑名单功能
5. 多因素认证(MFA)
6. 管理员会话管理 
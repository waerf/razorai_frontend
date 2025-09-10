# RazorAI Backend API 接口文档

## 目录
- [UserController - 用户管理](#usercontroller---用户管理)
- [AdminController - 管理员管理](#admincontroller---管理员管理)
- [AgentReviewController - 机器人审核](#agentreviewcontroller---机器人审核)
- [MarketController - 市场管理](#marketcontroller---市场管理)
- [PointsController - 积分管理](#pointscontroller---积分管理)

---

## UserController - 用户管理

### 用户注册
**POST** 用户信息（用户名，密码，邮箱，电话号码必填，性别和年龄可选），后端将把它存到数据库中。

**地址：** `http://localhost:5000/user/register`  
**方法：** POST  
**请求头：**
```
Content-Type: application/json
Accept: application/json
```

**请求体：**
```json
{
  "userName": "testuser123",
  "password": "Test@123456",
  "email": "testuser123@example.com",
  "phone": "13812345678",
  "gender": 1,
  "age": 25
}
```

**正常响应：**
- **状态码：** 200
```json
{
    "message": "注册成功"
}
```

**异常响应：**
- **状态码：** 400
```json
{
    "message": "错误信息"
}
```

**备注：** 注册成功后会自动获得100积分奖励

---

### 用户登录
**POST** 用户的账号密码，后端将会检测数据库中是否存在账号密码，然后返回登录成功与否。

**地址：** `http://localhost:5000/user/login`  
**方法：** POST  
**请求头：**
```
Content-Type: application/json
Accept: application/json
```

**请求体：**
```json
{
  "identifier": "testuser",
  "password": "yourpassword"
}
```

**正常响应：**
- **状态码：** 200
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "登录成功",
    "username": "testuser",
    "user_id": 361,
    "token_info": "用户特定token，已自动写入cookie，无需每次手动添加"
}
```

**异常响应：**
- **状态码：** 402
```json
{
    "message": "密码错误"
}
```

**备注：** 
- identifier可以是user_id、email、phone
- token会自动写入HttpOnly Cookie，前端无需手动处理

---

### 用户登出
**POST** 用户登出，撤销用户token。

**地址：** `http://localhost:5000/user/logout`  
**方法：** POST  
**请求头：**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "userId": 123
}
```

**正常响应：**
- **状态码：** 200
```json
{
    "message": "登出成功，token已撤销"
}
```

**异常响应：**
- **状态码：** 400
```json
{
    "message": "用户未登录或token不存在"
}
```

**备注：** 需要用户身份验证

---

### 用户刷新Token
**POST** 刷新用户token。

**地址：** `http://localhost:5000/user/refresh-token`  
**方法：** POST  
**请求头：**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "userId": 123
}
```

**正常响应：**
- **状态码：** 200
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "Token刷新成功"
}
```

**异常响应：**
- **状态码：** 400
```json
{
    "message": "用户未登录或token不存在"
}
```

**备注：** 需要用户身份验证

---

### 根据用户ID获取Token信息
**GET** 获取用户token的详细信息。

**地址：** `http://localhost:5000/user/token-info/{userId}`  
**方法：** GET  
**请求头：**
```
Accept: application/json
Authorization: Bearer {token}
```

**请求体：** 无

**正常响应：**
- **状态码：** 200
```json
{
    "user_id": 361,
    "username": "testuser",
    "email": "testuser@example.com",
    "role": "user",
    "created_at": "2025-07-26T01:46:36.9946511+08:00",
    "expires_at": "2025-08-02T01:46:36.9946504+08:00",
    "is_valid": true
}
```

**异常响应：**
- **状态码：** 404
```json
{
    "message": "用户未登录或token不存在"
}
```

**备注：** 需要用户身份验证

---

### 修改密码
**POST** 修改用户密码。

**地址：** `http://localhost:5000/user/change-password/{id}`  
**方法：** POST  
**请求头：**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "oldPassword": "OldPass@123",
  "newPassword": "NewPass@456"
}
```

**正常响应：**
- **状态码：** 200
```json
{
    "message": "密码修改成功"
}
```

**异常响应：**
- **状态码：** 400
```json
{
    "message": "错误信息"
}
```

**备注：** 需要用户身份验证

---

### 重置密码
**POST** 重置用户密码（无需旧密码）。

**地址：** `http://localhost:5000/user/reset-password/{id}`  
**方法：** POST  
**请求头：**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "newPassword": "NewPass@456"
}
```

**正常响应：**
- **状态码：** 200
```json
{
    "message": "密码重置成功"
}
```

**异常响应：**
- **状态码：** 400
```json
{
    "message": "错误信息"
}
```

**备注：** 需要用户身份验证

---

### 检查密码强度
**POST** 检查密码强度。

**地址：** `http://localhost:5000/user/check-password-strength`  
**方法：** POST  
**请求头：**
```
Content-Type: application/json
Accept: application/json
```

**请求体：**
```json
{
  "password": "Test@123456"
}
```

**正常响应：**
- **状态码：** 200
```json
{
    "strength": 90,
    "description": "非常强",
    "message": "密码强度：非常强 (90/100)"
}
```

**异常响应：**
- **状态码：** 400
```json
{
    "message": "密码不能为空"
}
```

---

### 获取用户信息
**GET** 根据用户ID获取用户信息。

**地址：** `http://localhost:5000/user/{id}`  
**方法：** GET  
**请求头：**
```
Accept: application/json
Authorization: Bearer {token}
```

**请求体：** 无

**正常响应：**
- **状态码：** 200
```json
{
    "user_id": 361,
    "user_name": "testuser",
    "email": "testuser@example.com",
    "phone": "13812345678",
    "gender": 1,
    "age": 25,
    "created_at": "2025-07-26T01:17:07.4240291",
    "updated_at": "2025-07-26T01:58:23.2097642"
}
```

**异常响应：**
- **状态码：** 404
```json
{
    "message": "用户不存在"
}
```

**备注：** 需要用户身份验证

---

### 修改用户信息
**PUT** 修改用户信息，只需传入需要修改的部分即可。

**地址：** `http://localhost:5000/user/{id}`  
**方法：** PUT  
**请求头：**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "userName": "updateduser123",
  "gender": 2,
  "age": 30,
  "email": "updated@example.com",
  "phone": "13987654321"
}
```

**正常响应：**
- **状态码：** 200
```json
{
    "message": "用户信息更新成功"
}
```

**异常响应：**
- **状态码：** 404
```json
{
    "message": "用户不存在"
}
```

**备注：** 需要用户身份验证

---

### 删除用户
**DELETE** 删除用户。

**地址：** `http://localhost:5000/user/{id}`  
**方法：** DELETE  
**请求头：**
```
Accept: application/json
Authorization: Bearer {token}
```

**请求体：** 无

**正常响应：**
- **状态码：** 200
```json
{
    "message": "用户已删除"
}
```

**异常响应：**
- **状态码：** 404
```json
{
    "message": "用户不存在"
}
```

**备注：** 需要用户身份验证，删除用户时会同时撤销其token

---

## AdminController - 管理员管理

### 初始管理员注册
**POST** 初始管理员注册（仅当数据库中没有管理员时可用）。

**地址：** `http://localhost:5000/api/admin/initial-register`  
**方法：** POST  
**请求头：**
```
Content-Type: application/json
Accept: application/json
```

**请求体：**
```json
{
  "adminName": "admin",
  "email": "admin@example.com",
  "password": "Admin@123456",
  "phone": "13812345678"
}
```

**正常响应：**
- **状态码：** 200
```json
{
    "success": true,
    "message": "初始管理员注册成功",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "adminInfo": {
        "adminId": 1,
        "adminName": "admin",
        "email": "admin@example.com",
        "role": 1
    }
}
```

**异常响应：**
- **状态码：** 400
```json
{
    "success": false,
    "message": "错误信息"
}
```

---

### 管理员登录
**POST** 管理员登录。

**地址：** `http://localhost:5000/api/admin/login`  
**方法：** POST  
**请求头：**
```
Content-Type: application/json
Accept: application/json
```

**请求体：**
```json
{
  "identifier": "admin",
  "password": "Admin@123456"
}
```

**正常响应：**
- **状态码：** 200
```json
{
    "success": true,
    "message": "登录成功",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "adminInfo": {
        "adminId": 1,
        "adminName": "admin",
        "email": "admin@example.com",
        "role": 1
    }
}
```

**异常响应：**
- **状态码：** 400
```json
{
    "success": false,
    "message": "登录失败"
}
```

---

### 获取管理员信息
**GET** 获取当前管理员信息。

**地址：** `http://localhost:5000/api/admin/info`  
**方法：** GET  
**请求头：**
```
Accept: application/json
Authorization: Bearer {token}
```

**请求体：** 无

**正常响应：**
- **状态码：** 200
```json
{
    "success": true,
    "adminInfo": {
        "adminId": 1,
        "adminName": "admin",
        "email": "admin@example.com",
        "role": 1,
        "phone": "13812345678"
    }
}
```

**异常响应：**
- **状态码：** 401
```json
{
    "success": false,
    "message": "无效的管理员token"
}
```

**备注：** 需要管理员身份验证

---

### 更新管理员信息
**PUT** 更新管理员信息。

**地址：** `http://localhost:5000/api/admin/info`  
**方法：** PUT  
**请求头：**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "adminName": "updatedadmin",
  "phone": "13987654321"
}
```

**正常响应：**
- **状态码：** 200
```json
{
    "success": true,
    "message": "管理员信息更新成功"
}
```

**异常响应：**
- **状态码：** 400
```json
{
    "success": false,
    "message": "管理员信息更新失败"
}
```

**备注：** 需要管理员身份验证

---

### 修改管理员密码
**PUT** 修改管理员密码。

**地址：** `http://localhost:5000/api/admin/password`  
**方法：** PUT  
**请求头：**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "oldPassword": "OldPass@123",
  "newPassword": "NewPass@456"
}
```

**正常响应：**
- **状态码：** 200
```json
{
    "success": true,
    "message": "密码修改成功"
}
```

**异常响应：**
- **状态码：** 400
```json
{
    "success": false,
    "message": "密码修改失败，请检查旧密码是否正确"
}
```

**备注：** 需要管理员身份验证

---

### 管理员登出
**POST** 管理员登出。

**地址：** `http://localhost:5000/api/admin/logout`  
**方法：** POST  
**请求头：**
```
Accept: application/json
Authorization: Bearer {token}
```

**请求体：** 无

**正常响应：**
- **状态码：** 200
```json
{
    "success": true,
    "message": "登出成功"
}
```

**异常响应：**
- **状态码：** 400
```json
{
    "success": false,
    "message": "登出失败"
}
```

**备注：** 需要管理员身份验证

---

### 获取所有管理员列表
**GET** 获取所有管理员列表（仅超级管理员）。

**地址：** `http://localhost:5000/api/admin/list`  
**方法：** GET  
**请求头：**
```
Accept: application/json
Authorization: Bearer {token}
```

**请求体：** 无

**正常响应：**
- **状态码：** 200
```json
{
    "success": true,
    "admins": [
        {
            "adminId": 1,
            "adminName": "admin",
            "email": "admin@example.com",
            "role": 1
        }
    ]
}
```

**异常响应：**
- **状态码：** 401
```json
{
    "success": false,
    "message": "无效的管理员token"
}
```

**备注：** 需要管理员身份验证

---

### 验证Token有效性
**GET** 验证管理员token有效性。

**地址：** `http://localhost:5000/api/admin/validate`  
**方法：** GET  
**请求头：**
```
Accept: application/json
Authorization: Bearer {token}
```

**请求体：** 无

**正常响应：**
- **状态码：** 200
```json
{
    "success": true,
    "message": "Token有效",
    "adminInfo": {
        "adminId": 1,
        "adminName": "admin",
        "email": "admin@example.com",
        "role": 1
    }
}
```

**异常响应：**
- **状态码：** 401
```json
{
    "success": false,
    "message": "无效的管理员token"
}
```

**备注：** 需要管理员身份验证

---

## AgentReviewController - 机器人审核

### 获取待审核机器人列表
**GET** 获取待审核的机器人列表。

**地址：** `http://localhost:5000/admin/agent-review/pending`  
**方法：** GET  
**请求头：**
```
Accept: application/json
Authorization: Bearer {token}
```

**查询参数：**
- `page` (可选): 页码，默认1
- `pageSize` (可选): 每页数量，默认20

**请求体：** 无

**正常响应：**
- **状态码：** 200
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "测试机器人",
            "type": 1,
            "description": "这是一个测试机器人",
            "price": 100,
            "creatorId": 1,
            "creatorName": "testuser",
            "createdAt": "2025-07-26T01:17:07.4240291",
            "chatPrompt": "你是一个测试机器人"
        }
    ],
    "pagination": {
        "page": 1,
        "pageSize": 20,
        "totalCount": 1,
        "totalPages": 1
    }
}
```

**异常响应：**
- **状态码：** 500
```json
{
    "success": false,
    "message": "获取待审核机器人失败: 错误信息"
}
```

**备注：** 需要管理员身份验证

---

### 获取机器人详情
**GET** 获取机器人详情用于审核。

**地址：** `http://localhost:5000/admin/agent-review/{agentId}`  
**方法：** GET  
**请求头：**
```
Accept: application/json
Authorization: Bearer {token}
```

**请求体：** 无

**正常响应：**
- **状态码：** 200
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "测试机器人",
        "type": 1,
        "description": "这是一个测试机器人",
        "price": 100,
        "creatorId": 1,
        "creatorName": "testuser",
        "createdAt": "2025-07-26T01:17:07.4240291",
        "chatPrompt": "你是一个测试机器人",
        "reviewStatus": 0,
        "reviewRemarks": "",
        "reviewerId": null,
        "reviewedAt": null
    }
}
```

**异常响应：**
- **状态码：** 404
```json
{
    "success": false,
    "message": "机器人不存在"
}
```

**备注：** 需要管理员身份验证

---

### 审核通过机器人
**POST** 审核通过机器人。

**地址：** `http://localhost:5000/admin/agent-review/{agentId}/approve`  
**方法：** POST  
**请求头：**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "remarks": "审核通过，机器人质量良好"
}
```

**正常响应：**
- **状态码：** 200
```json
{
    "success": true,
    "message": "机器人审核通过成功"
}
```

**异常响应：**
- **状态码：** 400
```json
{
    "success": false,
    "message": "该机器人已经审核过了"
}
```

**备注：** 需要管理员身份验证

---

### 审核拒绝机器人
**POST** 审核拒绝机器人。

**地址：** `http://localhost:5000/admin/agent-review/{agentId}/reject`  
**方法：** POST  
**请求头：**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "remarks": "审核拒绝，机器人内容不符合规范"
}
```

**正常响应：**
- **状态码：** 200
```json
{
    "success": true,
    "message": "机器人审核拒绝成功"
}
```

**异常响应：**
- **状态码：** 400
```json
{
    "success": false,
    "message": "该机器人已经审核过了"
}
```

**备注：** 需要管理员身份验证

---

### 获取审核历史
**GET** 获取审核历史记录。

**地址：** `http://localhost:5000/admin/agent-review/history`  
**方法：** GET  
**请求头：**
```
Accept: application/json
Authorization: Bearer {token}
```

**查询参数：**
- `page` (可选): 页码，默认1
- `pageSize` (可选): 每页数量，默认20

**请求体：** 无

**正常响应：**
- **状态码：** 200
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "测试机器人",
            "creatorId": 1,
            "creatorName": "testuser",
            "status": 1,
            "statusText": "审核通过",
            "reviewRemarks": "审核通过，机器人质量良好",
            "reviewerId": 1,
            "reviewerName": "admin",
            "reviewedAt": "2025-07-26T01:17:07.4240291",
            "createdAt": "2025-07-26T01:17:07.4240291"
        }
    ],
    "pagination": {
        "page": 1,
        "pageSize": 20,
        "totalCount": 1,
        "totalPages": 1
    }
}
```

**异常响应：**
- **状态码：** 500
```json
{
    "success": false,
    "message": "获取审核历史失败: 错误信息"
}
```

**备注：** 需要管理员身份验证

---

### 获取审核统计信息
**GET** 获取审核统计数据。

**地址：** `http://localhost:5000/admin/agent-review/stats`  
**方法：** GET  
**请求头：**
```
Accept: application/json
Authorization: Bearer {token}
```

**请求体：** 无

**正常响应：**
- **状态码：** 200
```json
{
    "success": true,
    "data": {
        "total": 10,
        "pending": 3,
        "reviewed": 7,
        "approved": 5,
        "rejected": 2,
        "approvalRate": 71.43
    }
}
```

**异常响应：**
- **状态码：** 500
```json
{
    "success": false,
    "message": "获取审核统计失败: 错误信息"
}
```

**备注：** 需要管理员身份验证

---

## MarketController - 市场管理

### 获取所有机器人
**GET** 获取所有机器人列表（包括未审核、已通过、已拒绝、已删除的机器人）。

**地址：** `http://localhost:5000/market`  
**方法：** GET  
**请求头：**
```
Accept: application/json
```

**请求体：** 无

**正常响应：**
- **状态码：** 200
```json
[
    {
        "id": 1,
        "name": "测试机器人",
        "description": "这是一个测试机器人",
        "type": 1,
        "price": 100,
        "creatorId": 1,
        "creatorName": "testuser",
        "subscriptionCnt": 5,
        "auditStatus": "已通过"
    },
    {
        "id": 2,
        "name": "未审核机器人",
        "description": "这是一个未审核的机器人",
        "type": 2,
        "price": 150,
        "creatorId": 2,
        "creatorName": "developer2",
        "subscriptionCnt": 0,
        "auditStatus": "未审核"
    }
]
```

**异常响应：**
- **状态码：** 500
```json
{
    "message": "获取机器人列表失败",
    "error": "错误信息"
}
```

**备注：** 
- 现在显示所有机器人，无论审核状态如何
- `auditStatus` 字段表示审核状态：`"未审核"`、`"已通过"`、`"已拒绝"`、`"已删除"`

---

### 获取机器人详情
**GET** 获取单个机器人详情（无论审核状态如何）。

**地址：** `http://localhost:5000/market/agentdetail/{agentId}`  
**方法：** GET  
**请求头：**
```
Accept: application/json
```

**请求体：** 无

**正常响应：**
- **状态码：** 200
```json
{
    "id": 1,
    "name": "测试机器人",
    "description": "这是一个测试机器人",
    "type": 1,
    "price": 100,
    "creatorId": 1,
    "creatorName": "testuser",
    "subscriptionCnt": 5,
    "auditStatus": "已通过"
}
```

**异常响应：**
- **状态码：** 404
```json
{
    "message": "AI代理不存在"
}
```

**备注：** 
- 现在可以获取任何机器人的详情，无论审核状态如何
- `auditStatus` 字段表示审核状态
- 只有机器人不存在时才返回404错误

---

### 启动所有机器人
**POST** 启动所有机器人。

**地址：** `http://localhost:5000/market/start`  
**方法：** POST  
**请求头：**
```
Accept: application/json
```

**请求体：** 无

**正常响应：**
- **状态码：** 200
```json
{
    "message": "启动所有机器人成功"
}
```

**异常响应：**
- **状态码：** 500
```json
{
    "message": "启动代理服务失败",
    "error": "错误信息"
}
```

---

### 订阅机器人
**POST** 订阅机器人。

**地址：** `http://localhost:5000/market/user/agent/subscribe`  
**方法：** POST  
**请求头：**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "userId": 1,
  "agentId": 1,
  "startTime": "2025-07-26T01:17:07.4240291",
  "duration": 30,
  "subscriptionType": 1
}
```

**正常响应：**
- **状态码：** 200
```json
{
    "message": "订阅成功"
}
```

**异常响应：**
- **状态码：** 400
```json
{
    "message": "参数不完整"
}
```

**备注：** 需要用户身份验证

---

### 获取用户订阅列表
**GET** 获取用户的所有订阅。

**地址：** `http://localhost:5000/market/user/subs/{userId}`  
**方法：** GET  
**请求头：**
```
Accept: application/json
Authorization: Bearer {token}
```

**请求体：** 无

**正常响应：**
- **状态码：** 200
```json
[
    {
        "id": 1,
        "userId": 1,
        "agentId": 1,
        "startTime": "2025-07-26T01:17:07.4240291",
        "endTime": "2025-08-25T01:17:07.4240291",
        "status": 1,
        "subscriptionType": 1,
        "agent_name": "测试机器人",
        "subscription_type": "月度订阅"
    }
]
```

**备注：** 需要用户身份验证

---

### 支付
**POST** 用户支付。

**地址：** `http://localhost:5000/market/user/pay`  
**方法：** POST  
**请求头：**
```
Accept: application/json
Authorization: Bearer {token}
```

**请求体：** 无

**正常响应：**
- **状态码：** 200
```json
{
    "message": "支付成功"
}
```

**异常响应：**
- **状态码：** 441
```json
{
    "message": "支付失败"
}
```

**备注：** 需要用户身份验证

---

### 获取订阅详情
**GET** 获取订阅详情。

**地址：** `http://localhost:5000/market/subscription/{subId}`  
**方法：** GET  
**请求头：**
```
Accept: application/json
Authorization: Bearer {token}
```

**请求体：** 无

**正常响应：**
- **状态码：** 200
```json
{
    "id": 1,
    "userId": 1,
    "agentId": 1,
    "startTime": "2025-07-26T01:17:07.4240291",
    "endTime": "2025-08-25T01:17:07.4240291",
    "status": 1,
    "subscriptionType": 1
}
```

**异常响应：**
- **状态码：** 404
```json
{
    "message": "订阅不存在"
}
```

**备注：** 需要用户身份验证

---

### 取消订阅
**DELETE** 取消订阅。

**地址：** `http://localhost:5000/market/subscription/{subId}`  
**方法：** DELETE  
**请求头：**
```
Accept: application/json
Authorization: Bearer {token}
```

**请求体：** 无

**正常响应：**
- **状态码：** 200
```json
{
    "message": "订阅已取消"
}
```

**异常响应：**
- **状态码：** 400
```json
{
    "message": "订阅不存在或已取消"
}
```

**备注：** 需要用户身份验证

---

### 获取机器人订阅数量
**GET** 获取机器人的订阅数量。

**地址：** `http://localhost:5000/market/subscription/count/{agentId}`  
**方法：** GET  
**请求头：**
```
Accept: application/json
```

**请求体：** 无

**正常响应：**
- **状态码：** 200
```json
{
    "agentId": 1,
    "subscriptionCnt": 5
}
```

**异常响应：**
- **状态码：** 400
```json
{
    "message": "机器人ID无效"
}
```

---

### 获取机器人评论
**GET** 获取机器人的所有评论。

**地址：** `http://localhost:5000/market/feedback/{agentId}`  
**方法：** GET  
**请求头：**
```
Accept: application/json
```

**请求体：** 无

**正常响应：**
- **状态码：** 200
```json
[
    {
        "id": 1,
        "userId": 1,
        "agentId": 1,
        "score": 5,
        "comment": "这个机器人很好用",
        "userName": "testuser",
        "createdAt": "2025-07-26T01:17:07.4240291"
    }
]
```

**异常响应：**
- **状态码：** 400
```json
{
    "message": "机器人ID无效"
}
```

---

### 发布评论
**POST** 发布评论。

**地址：** `http://localhost:5000/market/feedback`  
**方法：** POST  
**请求头：**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "agentId": 1,
  "comment": "这个机器人很好用",
  "score": 5
}
```

**正常响应：**
- **状态码：** 200
```json
{
    "message": "评论发布成功"
}
```

**异常响应：**
- **状态码：** 400
```json
{
    "message": "参数不完整"
}
```

**备注：** 需要用户身份验证

---

### 删除评论
**DELETE** 删除评论。

**地址：** `http://localhost:5000/market/feedback/{feedbackId}`  
**方法：** DELETE  
**请求头：**
```
Accept: application/json
Authorization: Bearer {token}
```

**请求体：** 无

**正常响应：**
- **状态码：** 200
```json
{
    "message": "评论删除成功"
}
```

**异常响应：**
- **状态码：** 400
```json
{
    "message": "评论不存在或无权限删除"
}
```

**备注：** 需要用户身份验证

---

## PointsController - 积分管理

### 获取用户积分余额
**GET** 获取用户当前积分余额。

**地址：** `http://localhost:5000/points/balance`  
**方法：** GET  
**请求头：**
```
Accept: application/json
Authorization: Bearer {token}
```

**请求体：** 无

**正常响应：**
- **状态码：** 200
```json
{
    "points": 1000
}
```

**异常响应：**
- **状态码：** 500
```json
{
    "message": "获取积分失败",
    "error": "错误信息"
}
```

**备注：** 需要用户身份验证

---

### 获取积分历史记录
**GET** 获取用户积分历史记录。

**地址：** `http://localhost:5000/points/history`  
**方法：** GET  
**请求头：**
```
Accept: application/json
Authorization: Bearer {token}
```

**查询参数：**
- `page` (可选): 页码，默认1
- `pageSize` (可选): 每页数量，默认20

**请求体：** 无

**正常响应：**
- **状态码：** 200
```json
[
    {
        "transaction_id": 1,
        "points_change": 100,
        "transaction_type": 1,
        "transaction_date": "2025-07-26T01:17:07.4240291",
        "related_subscription_id": null,
        "related_contribution_id": null,
        "created_at": "2025-07-26T01:17:07.4240291"
    }
]
```

**异常响应：**
- **状态码：** 500
```json
{
    "message": "获取积分历史失败",
    "error": "错误信息"
}
```

**备注：** 需要用户身份验证

---

### 获取积分统计
**GET** 获取用户积分统计信息。

**地址：** `http://localhost:5000/points/stats`  
**方法：** GET  
**请求头：**
```
Accept: application/json
Authorization: Bearer {token}
```

**请求体：** 无

**正常响应：**
- **状态码：** 200
```json
{
    "total_earned": 1500,
    "total_spent": 500,
    "current_balance": 1000,
    "transaction_count": 10
}
```

**异常响应：**
- **状态码：** 500
```json
{
    "message": "获取积分统计失败",
    "error": "错误信息"
}
```

**备注：** 需要用户身份验证

---

### 增加积分
**POST** 增加用户积分（管理员功能）。

**地址：** `http://localhost:5000/points/add`  
**方法：** POST  
**请求头：**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "userId": 1,
  "points": 100,
  "actionType": "REWARD",
  "description": "活动奖励",
  "relatedId": null
}
```

**正常响应：**
- **状态码：** 200
```json
{
    "message": "积分增加成功",
    "new_balance": 1100
}
```

**异常响应：**
- **状态码：** 400
```json
{
    "message": "参数不完整"
}
```

**备注：** 需要管理员身份验证

---

### 扣除积分
**POST** 扣除用户积分（管理员功能）。

**地址：** `http://localhost:5000/points/deduct`  
**方法：** POST  
**请求头：**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "userId": 1,
  "points": 50,
  "actionType": "PENALTY",
  "description": "违规扣除",
  "relatedId": null
}
```

**正常响应：**
- **状态码：** 200
```json
{
    "message": "积分扣除成功",
    "new_balance": 950
}
```

**异常响应：**
- **状态码：** 400
```json
{
    "message": "参数不完整"
}
```

**备注：** 需要管理员身份验证

---

### 检查积分是否足够
**POST** 检查用户是否有足够积分。

**地址：** `http://localhost:5000/points/check`  
**方法：** POST  
**请求头：**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "requiredPoints": 100
}
```

**正常响应：**
- **状态码：** 200
```json
{
    "has_enough": true,
    "current_points": 1000,
    "required_points": 100
}
```

**异常响应：**
- **状态码：** 400
```json
{
    "message": "参数不完整"
}
```

**备注：** 需要用户身份验证

---

## 通用说明

### 状态码说明
- **200**: 请求成功
- **400**: 请求参数错误
- **401**: 未授权访问
- **402**: 密码错误
- **404**: 资源不存在
- **441**: 支付失败
- **500**: 服务器内部错误

### 身份验证
- 需要身份验证的接口需要在请求头中包含 `Authorization: Bearer {token}`
- 用户token通过登录接口获取
- 管理员token通过管理员登录接口获取

### 分页参数
- `page`: 页码，从1开始
- `pageSize`: 每页数量，默认20

### 审核状态
- **0**: 未审核
- **1**: 审核通过
- **2**: 审核拒绝
- **3**: 已删除

### 积分交易类型
- **1**: 充值
- **2**: 消费
- **3**: 奖励
- **4**: 惩罚
- **5**: 注册奖励
- **6**: 订阅消费
- **7**: 续订消费

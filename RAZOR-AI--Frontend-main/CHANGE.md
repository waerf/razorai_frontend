### 后端
#### 地址
- 本地运行的地址为5253
#### Program.cs
- 如果F12有如下报错：

```bash
已拦截跨源请求：同源策略禁止读取位于 http://localhost:5253/api/admin/login 的远程资源。（原因：CORS 请求未能成功）。状态码：(null)
```

解决思路如下：

后端需要启用 CORS 支持，允许前端域名访问。
检查后端 Controller 是否允许 POST 方法。
检查路由是否正确。
针对 ASP.NET Core（.NET 6+），需要在后端添加 CORS 配置。请在 Program.cs 里添加如下内容：

1. 注册 CORS 服务（在`builder.Services.AddControllers()`之前）：

```c
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
```
2. 在`app.UseAuthorization()`之前启用 CORS：

```c
app.UseCors("AllowAll");
```

---

### 前端
#### src/utils/api.js
- 统一了api格式，但要注意后端的路径，有些需要加/api（如更改管理员密码的路径为<baseAdminApi> + /api + /后端对应地址），有些不需要加
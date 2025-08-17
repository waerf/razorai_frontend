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

#### admin.cs
- 为了让phone可空，确保：public string? Phone { get; set; }
- 输入dotnet tool install --global dotnet-ef安装工具
- 运行：
dotnet ef migrations add MakeAdminPhoneNullable
dotnet ef database update

- 如果还不行，在数据库执行：
ALTER TABLE "RAZORAI"."ADMIN" MODIFY ("PHONE" VARCHAR2(20) NULL);

#### AdminService.cs
- 获取待审核管理员时，会报错{"success":false,"message":"获取待审核管理员失败: ORA-50032: Column contains NULL data"}

1. 更改AdminService.cs中待审核管理员列表函数：
```c
// 获取待审核的管理员列表
        public async Task<List<PendingAdminInfo>> GetPendingAdminsAsync()
        {
            try
            {
                // 使用原始 SQL 查询，显式处理 NULL 值
                var result = new List<PendingAdminInfo>();
                
                // 只查询必要的字段
                var query = await _context.Admins
                    .Where(a => a.Status == 0)
                    .Select(a => new 
                    {
                        AdminId = a.AdminId,
                        // 使用三元表达式在SQL级别处理空值
                        AdminName = a.AdminName != null ? a.AdminName : "",
                        Email = a.Email != null ? a.Email : "",
                        Phone = a.Phone != null ? a.Phone : "",
                        CreatedAt = a.CreatedAt
                    })
                    .ToListAsync();
                
                // 将查询结果映射到返回类型
                foreach (var item in query)
                {
                    result.Add(new PendingAdminInfo
                    {
                        AdminId = item.AdminId,
                        AdminName = item.AdminName,
                        Email = item.Email,
                        Phone = item.Phone,
                        CreatedAt = item.CreatedAt
                    });
                }
                
                // 在内存中排序
                return result.OrderBy(a => a.CreatedAt).ToList();
            }
            catch (Exception ex)
            {
                // 记录异常详细信息
                Console.WriteLine($"GetPendingAdminsAsync 发生异常: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"内部异常: {ex.InnerException.Message}");
                }
                throw; // 重新抛出异常让调用者处理
            }
        }
```

2. 以防万一，AI建议把数据库中可能为空的数据都设置空值（但我没做） 
    如AdminModel.cs中：
    ```c
    // 待审核管理员信息模型
    public class PendingAdminInfo
    {
        public int AdminId { get; set; }
        public string AdminName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
    ```

---

### 前端
#### src/utils/api.js
- 统一了api格式，但要注意后端的路径，有些需要加/api（如更改管理员密码的路径为<baseAdminApi> + /api + /后端对应地址），有些不需要加
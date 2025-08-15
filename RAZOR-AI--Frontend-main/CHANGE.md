### 后端
#### 地址
- 本地运行的地址为5253
#### Program.cs
- 确保有如下代码：
```c
// 添加 CORS 服务
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication(); // 必须在 UseAuthorization 之前
app.UseAuthorization();
// 启用 CORS
app.UseCors("AllowAll");

app.MapControllers();

app.Run();

```

---

### 前端
#### src/utils/api.js
- 统一了api格式，但要注意后端的路径，有些需要加/api（如更改管理员密码的路径为<baseAdminApi> + /api + /后端对应地址），有些不需要加
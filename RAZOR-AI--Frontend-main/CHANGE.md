### 后端
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

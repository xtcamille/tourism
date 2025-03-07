# 旅游项目 (Tourism Project)

基于Gin+Vue3的前后端分离项目。

## 项目结构

```
tourism/
├── backend/           # Gin后端API服务
│   ├── controllers/   # 控制器
│   ├── models/        # 数据模型
│   ├── routes/        # 路由配置
│   ├── middleware/    # 中间件
│   ├── utils/         # 工具函数
│   ├── config/        # 配置
│   ├── main.go        # 入口文件
│   └── go.mod         # Go模块定义
└── frontend/          # Vue3前端应用
    ├── public/        # 静态资源
    ├── src/           # 源代码
    ├── package.json   # 依赖配置
    └── vite.config.js # Vite配置
```

## 后端启动方法

```bash
cd backend
go mod tidy
go run main.go
```

## 前端启动方法

```bash
cd frontend
npm install
npm run dev
```

## API文档

后端API默认运行在 http://localhost:8080
前端开发服务器默认运行在 http://localhost:5173
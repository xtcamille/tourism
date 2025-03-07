# 基于区块链的乡村旅游资源数字化存证管理平台 (Tourism Project)

基于Gin+Vue3的前后端分离项目。

## 项目结构

```
tourism/
├── backend/           # Gin后端API服务
│   ├── main.go        # 入口文件
│   └── go.mod         # Go模块定义
└── frontend/          # Vue3前端应用
    ├── /src
    │   ├── /assets
    │   │   ├── image.jpg          # 背景图像
    │   │   └── logo.png                # 项目 logo
    │   ├── /components
    │   │   ├── Navbar.vue              # 导航栏组件
    │   │   └── Sidebar.vue             # 侧边栏组件
    │   ├── /layouts
    │   │   └── MainLayout.vue          # 主布局组件
    │   ├── /router
    │   │   └── index.js                # 路由配置
    │   ├── /stores
    │   │   └── user.js                 # 用户状态管理
    │   ├── /views
    │   │   ├── DashboardView.vue       # 仪表盘视图
    │   │   ├── LoginView.vue           # 登录视图
    │   │   ├── RegisterView.vue        # 注册视图
    │   │   ├── DashboardsView.vue      # 大表视图
    │   │   ├── TicketsView.vue         # 门票视图
    │   │   ├── ProductsView.vue        # 交易视图
    │   │   └── ReviewsView.vue         # 评价视图
    │   ├── App.vue                     # 根组件
    │   ├── main.js                     # 入口文件
    │   └── styles.css                  # 全局样式
    ├── .gitignore                       # Git 忽略文件
    └── package.json                     # 项目依赖和脚本
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
- 后端API默认运行在 http://localhost:8080 
- 前端开发服务器默认运行在 http://localhost:5173
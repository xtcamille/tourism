<template>
    <div class="main-layout" >
        <!-- <Navbar /> -->
        <div class="layout-content" >
            <Sidebar />
            <div class="content">
                <router-view /> <!-- 渲染子路由 -->
            </div>
        </div>
    </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'; // 导航栏组件
import Sidebar from '@/components/SideMenu.vue'; // 侧边栏组件
</script>

<style scoped>
.main-layout {
    display: flex;
    flex-direction: column;
    /* 使导航栏在顶部 */
    height: 100vh;
    /* 使布局占满整个视口高度 */
}

.layout-content {
  
    display: flex;
    flex: 1;
    /* 使内容区域占满剩余空间 */
}

.content {
    flex: 1;
    /* 使内容区域占满剩余空间 */
    padding-left: 20px;
    /* padding-left: 20px; */
    padding-top: 0px;
    /* 根据需要调整内边距 */
    overflow-y: auto;
    /* 允许内容区域滚动 */
}

.sidebar {
    width: 220px;
    /* 侧边栏宽度 */
    background-color: #2a74ba;
    /* 侧边栏背景色 */
    border-right: 1px solid #ddd;
    /* 侧边栏右边框 */
    height: 100%; /* 侧边栏高度 */
    position: relative;
}

.navbar {
    height: 60px;
    /* 导航栏高度 */
    background-color: #001529;
    /* 导航栏背景色 */
    color: white;
    /* 导航栏文字颜色 */
    display: flex;
    align-items: center;
    /* 垂直居中 */
    padding: 0 20px;
    /* 导航栏内边距 */
}
</style>
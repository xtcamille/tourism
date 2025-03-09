<template>
    <div class="sidebar">
        <el-menu :default-active="activeRoute" router class="el-menu-vertical" background-color="#2a74ba"
            text-color="#fff" active-text-color="#1e2521">

            <el-menu-item index="/home/dashboard">
                <el-icon>
                    <DataLine />
                </el-icon>
                <span>总览大屏</span>
            </el-menu-item>

            <el-menu-item index="/home/tickets">
                <el-icon>
                    <Tickets />
                </el-icon>
                <span>门票管理</span>
            </el-menu-item>

            <el-menu-item index="/home/products">
                <el-icon>
                    <ShoppingBag />
                </el-icon>
                <span>产品管理</span>
            </el-menu-item>

            <el-menu-item index="/home/reviews">
                <el-icon>
                    <ChatDotRound />
                </el-icon>
                <span>评价管理</span>
            </el-menu-item>

            <!-- 节点用户专属菜单 -->
            <template v-if="userStore.userInfo?.role === 'node'">
                <el-sub-menu index="node-menu">
                    <template #title>
                        <el-icon>
                            <Connection />
                        </el-icon>
                        <span>节点管理</span>
                    </template>

                    <el-menu-item index="/node/status">
                        节点状态
                    </el-menu-item>

                    <el-menu-item index="/node/transactions">
                        交易审核
                    </el-menu-item>
                </el-sub-menu>
            </template>
        </el-menu>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import {
    DataLine, Tickets, ShoppingBag, ChatDotRound,
    Place, Connection
} from '@element-plus/icons-vue';
import { useUserStore } from '../stores/user';

const route = useRoute();
const userStore = useUserStore();

// 获取当前激活的路由路径
const activeRoute = computed(() => {
    return route.path;
});
</script>

<style scoped>
.sidebar {
    width:220x;
    /* 侧边栏宽度 */
    background-color: #2a74ba;
    /* 侧边栏背景色 */
    border-right: 1px solid #ddd;
    /* 侧边栏右边框 */
     position: fixed;
}

.el-menu {
    border-right: none;
    height: auto;
   
}
.el-menu-item {
    font-size: 16px;
    height: 70px;
}
.el-menu-item,
.el-sub-menu {
    margin-top: 0px;
}

.el-sub-menu :deep(.el-sub-menu__title) {
    background-color: transparent !important;
}

.el-sub-menu :deep(.el-menu--inline) {
    background-color: #2a74ba !important;
}
</style>
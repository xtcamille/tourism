<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-logo" v-if="userStore.isLoggedIn">
        <img src="@/assets/logo.png" alt="平台Logo" class="logo" />
        <h1>乡村旅游资源数字化存证管理平台</h1>
      </div>
      <div class="navbar-auth">
        <template v-if="userStore.isLoggedIn">
          <el-dropdown>
            <div class="user-info">
              <span class="user-type-badge" :class="{ 'node-badge': userStore.userInfo?.role === 'node' }">
                {{ userStore.userInfo?.role === 'node' ? '节点' : '用户' }}
              </span>
              <span class="username">{{ userStore.userInfo?.username || '用户' }}</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <div class="blockchain-account">
                    <span class="label">区块链账户:</span>
                    <span class="account-id">{{ formatAccount(userStore.userInfo?.blockchainAccount) }}</span>
                    <el-button type="primary" size="small" circle @click.stop="copyAccount" class="copy-btn">
                      <el-icon>
                        <DocumentCopy />
                      </el-icon>
                    </el-button>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item divided>
                  <router-link to="/profile">个人中心</router-link>
                </el-dropdown-item>
                <el-dropdown-item v-if="userStore.userInfo?.role === 'user'">
                  <router-link to="/bookings">我的预订</router-link>
                </el-dropdown-item>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowDown, DocumentCopy } from '@element-plus/icons-vue';
import { useUserStore } from '../stores/user';
import { ElMessage } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();

onMounted(() => {
  // userStore.initializeAuth();
});

// 格式化区块链账户地址，显示前6位和后4位
const formatAccount = (account) => {
  if (!account) return '未绑定账户';
  return `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
};

// 复制区块链账户地址
const copyAccount = (event) => {
  event.stopPropagation();
  if (userStore.userInfo?.blockchainAccount) {
    navigator.clipboard.writeText(userStore.userInfo.blockchainAccount)
      .then(() => {
        ElMessage.success('账户地址已复制到剪贴板');
      })
      .catch(() => {
        ElMessage.error('复制失败，请手动复制');
      });
  }
};

const handleLogout = () => {
  userStore.logout();
  ElMessage.success('已成功退出登录');
  router.push('/');
};
</script>

<style scoped>
.navbar {
  width: 100%;
  /* 使导航栏宽度与浏览器同宽 */
  height: 80px;
  /* 导航栏高度 */
  background-color: #2a74ba;
  /* background-color: #001529; */
  /* 导航栏背景色 */
  color: white;
  /* 导航栏文字颜色 */
  display: flex;
  align-items: center;
  /* 垂直居中 */
  padding: 0 20px;
  /* 导航栏内边距 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  /* 添加阴影效果 */
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  /* 确保内容占满整个导航栏 */
}
.navbar-logo {
  display: flex; /* 使用 Flexbox 布局 */
  align-items: center; /* 垂直居中对齐 */
}
.logo {
  width: auto; /* 自适应宽度 */
  height: 50px; /* 设置固定高度 */
  margin-right: 10px; /* 图片与标题之间的间距 */
}
.navbar-logo h1 {
  font-size: 25px;
  color: #f1f3f5;
  margin: 0;
}

.navbar-menu {
  display: flex;
  gap: 20px;
}

.navbar-item {
  color: #606266;
  font-size: 16px;
  transition: color 0.3s;
}

.navbar-item:hover {
  /* color: #409eff; */
  color: #1071d2;
}

.navbar-auth {
  display: flex;
  gap: 15px;
  align-items: center;
}

.login-btn,
.register-btn {
  padding: 8px 16px;
  border-radius: 4px;
}

.login-btn {
  color: #2a74ba;
}

.register-btn {
  background-color: #2a74ba;
  color: white;
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e7ebf3;
}

.user-type-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  background-color: #67c23a;
  color: white;
}

.user-type-badge.node-badge {
  background-color: #2a74ba;
}

.username {
  font-weight: 500;
}

.blockchain-account {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 0;
  width: 250px;
}

.label {
  color: #909399;
  font-size: 13px;
}

.account-id {
  font-family: monospace;
  color: #606266;
  font-weight: 500;
}

.copy-btn {
  margin-left: auto;
}
</style>
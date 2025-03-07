<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">
        乡村旅游资源数字化存证平台
      </h1>

      <el-tabs v-model="activeTab" class="login-tabs">
        <el-tab-pane label="普通用户登录" name="user">
          <el-form :model="userForm" :rules="userRules" ref="userFormRef" label-position="top">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="userForm.username" placeholder="请输入用户名" prefix-icon="User" />
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input v-model="userForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock"
                show-password />
            </el-form-item>

            <div class="form-actions">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              <a href="#" class="forgot-password">忘记密码?</a>
            </div>

            <el-form-item>
              <el-button type="primary" :loading="userStore.loading" @click="handleUserLogin" class="login-button">
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="区块链节点登录" name="node">
          <el-alert title="节点用户需要额外的身份验证" type="warning" description="节点用户登录后将拥有参与区块链共识和交易验证的权限" show-icon
            :closable="false" style="margin-bottom: 20px" />

          <el-form :model="nodeForm" :rules="nodeRules" ref="nodeFormRef" label-position="top">
            <el-form-item label="节点名称" prop="username">
              <el-input v-model="nodeForm.username" placeholder="请输入节点名称" prefix-icon="Connection" />
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input v-model="nodeForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock"
                show-password />
            </el-form-item>

            <el-form-item label="节点密钥密码" prop="keyPassword">
              <el-input v-model="nodeForm.keyPassword" type="password" placeholder="请输入节点密钥密码" prefix-icon="Key"
                show-password />
            </el-form-item>

            <div class="form-actions">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              <a href="#" class="forgot-password">忘记密码?</a>
            </div>

            <el-form-item>
              <el-button type="primary" :loading="userStore.loading" @click="handleNodeLogin" class="login-button">
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <div class="register-link">
        还没有账号? <router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { User, Lock, Connection, Monitor, SetUp, Key } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../stores/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const userFormRef = ref(null);
const nodeFormRef = ref(null);
const activeTab = ref('user');
const rememberMe = ref(false);

// 用户登录表单
const userForm = reactive({
  username: '',
  password: ''
});

// 节点登录表单
const nodeForm = reactive({
  username: '',
  password: '',
  keyPassword: ''
});

// 区块链状态信息
const blockchainStatus = reactive({
  blockHeight: 1256789,
  networkStatus: 'online',
  activeNodes: 8
});

// 普通用户表单验证规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
  ]
};

// 节点表单验证规则
const nodeRules = {
  username: [
    { required: true, message: '请输入节点名称', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
  ],
  keyPassword: [
    { required: true, message: '请输入节点密钥密码', trigger: 'blur' },
  ]
};

// 获取区块链状态信息
const fetchBlockchainStatus = () => {
  // 模拟从API获取区块链状态
  // 实际应用中应该定时获取最新状态
};

// 普通用户登录
const handleUserLogin = async () => {
  if (!userFormRef.value) return;

  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 添加用户类型
        const credentials = {
          ...userForm,
          userType: 'user'
        };

        await userStore.login(credentials);
        ElMessage.success('登录成功');

        // 如果有重定向参数，则跳转到该页面，否则跳转到仪表盘
        // const redirectPath = route.query.redirect || '/dashboard';
        router.push('/home/dashboard');
      } catch (error) {
        ElMessage.error(error.response?.data?.error || '登录失败，请检查用户名和密码');
      }
    } else {
      return false;
    }
  });
};

// 节点登录
const handleNodeLogin = async () => {
  if (!nodeFormRef.value) return;

  await nodeFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 添加用户类型和节点密钥密码
        const credentials = {
          username: nodeForm.username,
          password: nodeForm.password,
          userType: 'node',
          keyPassword: nodeForm.keyPassword
        };

        await userStore.login(credentials);
        ElMessage.success('节点登录成功');

        // 如果有重定向参数，则跳转到该页面，否则跳转到仪表盘
        // const redirectPath = route.query.redirect || '/dashboard';
        router.push('/home/dashboard');
      } catch (error) {
        ElMessage.error(error.response?.data?.error || '节点登录失败，请检查凭证信息');
      }
    } else {
      return false;
    }
  });
};

onMounted(() => {
  fetchBlockchainStatus();
});
</script>

<style scoped>
.login-container {
  background-image: url('../assets/image.png'); /* 设置背景图 */
  background-size: cover; /* 背景图覆盖整个容器 */
  background-position: center; /* 背景图居中 */
  height: 100vh; /* 使容器高度占满整个视口 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  width: 100%;
  max-width: 480px;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 20px;
  color: #303133;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.logo {
  border-radius: 4px;
}

.login-tabs {
  margin-bottom: 20px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.forgot-password {
  color: #909399;
}

.forgot-password:hover {
  color: #409eff;
}

.login-button {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  margin-bottom: 30px;
  color: #606266;
}

.register-link a {
  color: #409eff;
  font-weight: 500;
}

.blockchain-info {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
}

.info-item {
  text-align: center;
}

.info-label {
  color: #909399;
  font-size: 13px;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.info-value {
  font-weight: 500;
  color: #303133;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #f56c6c;
}

.status-dot.online {
  background-color: #67c23a;
}
</style>
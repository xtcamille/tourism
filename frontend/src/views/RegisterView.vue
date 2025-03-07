<template>
  <div class="register-container container">
    <div class="register-card">
      <h1 class="register-title">用户注册</h1>

      <el-tabs v-model="activeTab" class="register-tabs">
        <el-tab-pane label="普通用户注册" name="user">
          <el-alert v-if="showUserAlert" title="注册成功后将为您自动创建区块链账户，请妥善保管您的密码" type="info"
            description="区块链账户将用于您在平台上的所有数字存证操作" show-icon :closable="false" style="margin-bottom: 20px" />

          <el-form :model="userForm" :rules="userRules" ref="userFormRef" label-position="top">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="userForm.username" placeholder="请输入用户名" prefix-icon="User" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="userForm.email" placeholder="请输入邮箱地址" prefix-icon="Message" />
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input v-model="userForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock"
                show-password />
            </el-form-item>

            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="userForm.confirmPassword" type="password" placeholder="请再次输入密码" prefix-icon="Lock"
                show-password />
            </el-form-item>

            <el-form-item>
              <el-checkbox v-model="agreeTerms" @change="validateAgree">
                我已阅读并同意 <a href="#" @click.prevent="showTerms">服务条款和隐私政策</a>
              </el-checkbox>
              <div class="error-message" v-if="termsError">{{ termsError }}</div>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="userStore.loading" @click="handleUserRegister"
                class="register-button">
                注册普通用户
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="区块链节点注册" name="node">
          <el-alert title="区块链节点需要上传已有的节点密钥文件" type="warning" description="节点用户拥有对区块链交易的验证权限，请确保您了解节点运行的相关责任" show-icon
            :closable="false" style="margin-bottom: 20px" />

          <el-form :model="nodeForm" :rules="nodeRules" ref="nodeFormRef" label-position="top">
            <el-form-item label="节点名称" prop="username">
              <el-input v-model="nodeForm.username" placeholder="请输入节点名称" prefix-icon="Connection" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="nodeForm.email" placeholder="请输入邮箱地址" prefix-icon="Message" />
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input v-model="nodeForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock"
                show-password />
            </el-form-item>

            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="nodeForm.confirmPassword" type="password" placeholder="请再次输入密码" prefix-icon="Lock"
                show-password />
            </el-form-item>

            <el-form-item label="节点密钥文件" prop="keyFile">
              <el-upload class="upload-key-file" action="#" :auto-upload="false" :on-change="handleKeyFileChange"
                :limit="1">
                <template #trigger>
                  <el-button type="primary">选择文件</el-button>
                </template>
                <template #tip>
                  <div class="el-upload__tip">
                    请上传节点密钥文件 (.json)
                  </div>
                </template>
              </el-upload>
            </el-form-item>

            <el-form-item>
              <el-checkbox v-model="agreeTerms" @change="validateAgree">
                我已阅读并同意 <a href="#" @click.prevent="showTerms">服务条款和隐私政策</a>
              </el-checkbox>
              <div class="error-message" v-if="termsError">{{ termsError }}</div>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="userStore.loading" @click="handleNodeRegister"
                class="register-button">
                注册节点用户
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <div class="login-link">
        已有账号? <router-link to="/login">立即登录</router-link>
      </div>
    </div>

    <!-- 服务条款对话框 -->
    <el-dialog v-model="termsDialogVisible" title="服务条款和隐私政策" width="70%">
      <div class="terms-content">
        <h3>服务条款</h3>
        <p>欢迎使用我们的乡村旅游资源数字化存证管理平台。通过注册和使用本平台，您同意遵守以下条款和条件：</p>
        <p>1. 您必须提供真实、准确、完整的个人信息，并在信息变更时及时更新。</p>
        <p>2. 您需要妥善保管账户信息，对账户下的所有活动负责。</p>
        <p>3. 不得利用本平台进行任何违法违规活动。</p>
        <p>4. 节点用户需遵守额外的区块链共识规则和安全责任。</p>

        <h3>隐私政策</h3>
        <p>我们重视您的隐私。本隐私政策说明了我们如何收集、使用和保护您的个人信息：</p>
        <p>1. 我们收集您的注册信息、交易记录和区块链存证数据。</p>
        <p>2. 您的区块链账户信息和私钥由您自行保管，平台不存储您的私钥。</p>
        <p>3. 我们使用加密技术保护您的数据安全。</p>

        <h3>区块链存证说明</h3>
        <p>1. 存储在区块链上的数据不可篡改且公开可查。</p>
        <p>2. 用户需对提交存证的数据真实性负责。</p>
        <p>3. 区块链交易需要支付少量gas费用。</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="termsDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="acceptTerms">
            接受
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { User, Lock, Message, Connection } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../stores/user';

const router = useRouter();
const userStore = useUserStore();
const userFormRef = ref(null);
const nodeFormRef = ref(null);
const activeTab = ref('user');
const agreeTerms = ref(false);
const termsError = ref('');
const termsDialogVisible = ref(false);
const showUserAlert = ref(true);

// 普通用户注册表单
const userForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

// 节点用户注册表单
const nodeForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  keyFile: null
});

// 验证密码一致性
const validatePass = (rule, value, callback, form) => {
  if (value === '') {
    callback(new Error('请输入密码'));
  } else {
    if (form.confirmPassword !== '') {
      if (activeTab.value === 'user') {
        userFormRef.value.validateField('confirmPassword');
      } else {
        nodeFormRef.value.validateField('confirmPassword');
      }
    }
    callback();
  }
};

// 验证同意条款
const validateAgree = () => {
  if (!agreeTerms.value) {
    termsError.value = '您必须同意服务条款和隐私政策才能注册';
  } else {
    termsError.value = '';
  }
};

// 普通用户表单验证规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度应在6-30个字符之间', trigger: 'blur' },
    { validator: (rule, value, callback) => validatePass(rule, value, callback, userForm), trigger: 'blur' }
  ],
};

// 节点用户表单验证规则
const nodeRules = {
  username: [
    { required: true, message: '请输入节点名称', trigger: 'blur' },
    { min: 3, max: 20, message: '节点名称长度应在3-20个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度应在6-30个字符之间', trigger: 'blur' },
    { validator: (rule, value, callback) => validatePass(rule, value, callback, nodeForm), trigger: 'blur' }
  ],
  keyFile: [
    { required: true, message: '请上传节点密钥文件', trigger: 'change' }
  ]
};

// 显示服务条款
const showTerms = () => {
  termsDialogVisible.value = true;
};

// 接受服务条款
const acceptTerms = () => {
  agreeTerms.value = true;
  termsError.value = '';
  termsDialogVisible.value = false;
};

// 处理密钥文件上传
const handleKeyFileChange = (file) => {
  nodeForm.keyFile = file.raw;
};

// 普通用户注册
const handleUserRegister = async () => {
  if (!userFormRef.value) return;

  if (!agreeTerms.value) {
    termsError.value = '您必须同意服务条款和隐私政策才能注册';
    return;
  }

  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const { confirmPassword, ...userData } = userForm.value;
        console.log("userData", userData);
        await userStore.registerUser(userData);
        ElMessage.success('注册成功，系统已为您创建区块链账户，请登录');
        router.push('/login');
      } catch (error) {
        console.log("error", error);
        ElMessage.error(error.response?.data?.error || '注册失败，请检查输入信息');
      }
    } else {
      return false;
    }
  });
};

// 节点用户注册
const handleNodeRegister = async () => {
  if (!nodeFormRef.value) return;

  if (!agreeTerms.value) {
    termsError.value = '您必须同意服务条款和隐私政策才能注册';
    return;
  }

  await nodeFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const { confirmPassword, ...nodeData } = nodeForm;
        await userStore.registerNode(nodeData);
        ElMessage.success('节点注册成功，请登录');
        router.push('/login');
      } catch (error) {
        ElMessage.error(error.response?.data?.error || '节点注册失败，请检查输入信息');
      }
    } else {
      return false;
    }
  });
};

// 表单验证
const validateForm = () => {
  if (!userForm.value.username || !userForm.value.password || !userForm.value.confirmPassword) {
    ElMessage.error('请填写所有必填字段');
    return false;
  }
  if (userForm.value.password !== userForm.value.confirmPassword) {
    ElMessage.error('密码和确认密码不匹配');
    return false;
  }
  return true;
};

const submitForm = async () => {
  if (validateForm()) {
    // 继续注册逻辑
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 40px 0;
}

.register-card {
  width: 100%;
  max-width: 600px;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.register-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  color: #303133;
}

.register-tabs {
  margin-bottom: 20px;
}

.error-message {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
}

.register-button {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #606266;
}

.login-link a {
  color: #409eff;
  font-weight: 500;
}

.terms-content {
  max-height: 50vh;
  overflow-y: auto;
  padding: 15px 0;
}

.terms-content h3 {
  margin-top: 20px;
  margin-bottom: 10px;
}

.terms-content p {
  line-height: 1.6;
  margin-bottom: 15px;
}

.upload-key-file {
  width: 100%;
}
</style>
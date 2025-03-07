<template>
    <div class="create-wallet-container container">
        <div class="create-wallet-card">
            <h1 class="page-title">创建您的区块链账户</h1>
            <el-steps :active="currentStep" finish-status="success" simple>
                <el-step title="创建账户" />
                <el-step title="备份密钥" />
                <el-step title="验证密钥" />
                <el-step title="完成" />
            </el-steps>

            <div class="step-content">
                <!-- 步骤1: 创建钱包 -->
                <div v-if="currentStep === 0" class="step-body">
                    <div class="step-info">
                        <h2>设置您的账户密码</h2>
                        <p>此密码将用于保护您的区块链账户私钥，请务必使用强密码并安全保存。</p>
                        <el-alert type="warning" :closable="false" show-icon>
                            <template #title>
                                <strong>重要提示：</strong> 请妥善保管您的密码！如果忘记密码，您将无法恢复您的账户和数据。
                            </template>
                        </el-alert>
                    </div>

                    <el-form :model="walletForm" :rules="walletRules" ref="walletFormRef" label-width="120px">
                        <el-form-item label="区块链密码" prop="password">
                            <el-input v-model="walletForm.password" type="password" placeholder="请输入6-20位密码"
                                show-password />
                        </el-form-item>

                        <el-form-item label="确认密码" prop="confirmPassword">
                            <el-input v-model="walletForm.confirmPassword" type="password" placeholder="请再次输入密码"
                                show-password />
                        </el-form-item>

                        <el-form-item label="密码提示" prop="passwordHint">
                            <el-input v-model="walletForm.passwordHint" placeholder="可选，用于帮助您记忆密码的提示" />
                        </el-form-item>

                        <el-form-item>
                            <el-checkbox v-model="walletForm.agreement" @change="validateAgreement">
                                我已理解并同意<el-link type="primary" @click.stop.prevent="showTerms">《区块链账户服务条款》</el-link>
                            </el-checkbox>
                            <div class="error-message" v-if="agreementError">{{ agreementError }}</div>
                        </el-form-item>

                        <el-form-item>
                            <el-button type="primary" @click="createWallet" :loading="loading">创建账户</el-button>
                        </el-form-item>
                    </el-form>
                </div>

                <!-- 步骤2: 备份私钥 -->
                <div v-if="currentStep === 1" class="step-body">
                    <div class="step-info">
                        <h2>备份您的私钥助记词</h2>
                        <p>这是您的区块链账户私钥恢复助记词，请将它安全地记录下来并妥善保管。</p>
                        <el-alert type="warning" :closable="false" show-icon>
                            <template #title>
                                <strong>警告：</strong> 任何获得此助记词的人将能够控制您的账户！请勿将其分享给任何人。
                            </template>
                        </el-alert>
                    </div>

                    <div class="mnemonic-container">
                        <div class="mnemonic-words">
                            <div v-for="(word, index) in mnemonicWords" :key="index" class="mnemonic-word">
                                <span class="word-index">{{ index + 1 }}</span>
                                <span class="word-text">{{ word }}</span>
                            </div>
                        </div>

                        <div class="mnemonic-actions">
                            <el-button type="primary" @click="copyMnemonic">
                                <el-icon>
                                    <DocumentCopy />
                                </el-icon> 复制助记词
                            </el-button>
                            <el-button @click="downloadMnemonic">
                                <el-icon>
                                    <Download />
                                </el-icon> 下载助记词
                            </el-button>
                        </div>
                    </div>

                    <div class="step-navigation">
                        <el-checkbox v-model="mnemonicBackedUp">我已经安全备份了我的助记词</el-checkbox>
                        <div class="error-message" v-if="backupError">{{ backupError }}</div>
                        <div class="step-buttons">
                            <el-button @click="currentStep = 0">上一步</el-button>
                            <el-button type="primary" @click="goToVerifyStep"
                                :disabled="!mnemonicBackedUp">下一步</el-button>
                        </div>
                    </div>
                </div>

                <!-- 步骤3: 验证私钥 -->
                <div v-if="currentStep === 2" class="step-body">
                    <div class="step-info">
                        <h2>验证您的助记词</h2>
                        <p>请选择下面的单词，按照正确的顺序重新输入您的助记词。</p>
                    </div>

                    <div class="verify-mnemonic">
                        <div class="selected-words">
                            <div v-for="(slot, index) in selectedWords" :key="'slot-' + index" class="word-slot"
                                @click="clearWordSlot(index)">
                                <span v-if="slot">{{ slot }}</span>
                                <span v-else class="slot-placeholder">点击选择</span>
                            </div>
                        </div>

                        <div class="word-options">
                            <el-button v-for="(word, index) in shuffledWords" :key="'word-' + index"
                                :disabled="selectedWords.includes(word)" @click="selectWord(word)" size="small">
                                {{ word }}
                            </el-button>
                        </div>
                    </div>

                    <div class="step-navigation">
                        <div class="verification-message" v-if="verificationError">
                            <el-alert type="error" :closable="false" show-icon :title="verificationError" />
                        </div>
                        <div class="step-buttons">
                            <el-button @click="resetVerification">重置</el-button>
                            <el-button @click="currentStep = 1">上一步</el-button>
                            <el-button type="primary" @click="verifyMnemonic">验证</el-button>
                        </div>
                    </div>
                </div>

                <!-- 步骤4: 完成 -->
                <div v-if="currentStep === 3" class="step-body">
                    <div class="completion-container">
                        <el-result icon="success" title="区块链账户创建成功" sub-title="您现在可以使用区块链账户进行存证和交易操作">
                            <template #extra>
                                <div class="account-info">
                                    <div class="account-label">您的区块链账户地址:</div>
                                    <div class="account-address">
                                        <span class="address-text">{{ walletAddress }}</span>
                                        <el-button type="primary" size="small" circle @click="copyAddress">
                                            <el-icon>
                                                <DocumentCopy />
                                            </el-icon>
                                        </el-button>
                                    </div>
                                </div>

                                <div class="completion-actions">
                                    <el-button type="primary" @click="goToDashboard">开始使用</el-button>
                                </div>
                            </template>

                            <div class="completion-tips">
                                <h3>重要提示</h3>
                                <p>1. 请确保您已安全备份您的助记词和密码</p>
                                <p>2. 任何区块链上的交易都无法撤销</p>
                                <p>3. 您的账户将用于所有数字存证操作</p>
                            </div>
                        </el-result>
                    </div>
                </div>
            </div>
        </div>

        <!-- 条款对话框 -->
        <el-dialog v-model="termsDialogVisible" title="区块链账户服务条款" width="70%">
            <div class="terms-content">
                <h3>区块链账户服务协议</h3>
                <p>本协议是您与乡村旅游资源数字化存证管理平台之间关于区块链账户服务的协议。使用我们的区块链账户服务，表示您同意以下条款：</p>

                <h4>1. 账户安全</h4>
                <p>您需要妥善保管您的私钥和密码。我们无法恢复您丢失的私钥或密码。</p>
                <p>任何拥有您私钥的人都能够控制您的账户，请务必安全保管。</p>

                <h4>2. 账户责任</h4>
                <p>您对使用您的区块链账户进行的所有活动负责。</p>
                <p>您承诺不会使用区块链账户进行任何违法活动。</p>

                <h4>3. 交易不可撤销</h4>
                <p>区块链上的所有交易一旦确认，将无法撤销或修改。</p>
                <p>请确认交易信息后再进行操作。</p>

                <h4>4. 隐私与数据</h4>
                <p>您在区块链上存储的数据可能是公开的，并且将永久存储。</p>
                <p>请勿在区块链上存储敏感或个人隐私信息。</p>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="termsDialogVisible = false">关闭</el-button>
                    <el-button type="primary" @click="acceptTerms">
                        我已阅读并同意
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { DocumentCopy, Download } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../stores/user';

const router = useRouter();
const userStore = useUserStore();
const walletFormRef = ref(null);
const currentStep = ref(0);
const loading = ref(false);
const termsDialogVisible = ref(false);
const agreementError = ref('');
const backupError = ref('');
const verificationError = ref('');
const mnemonicBackedUp = ref(false);

// 钱包创建表单
const walletForm = reactive({
    password: '',
    confirmPassword: '',
    passwordHint: '',
    agreement: false
});

// 模拟生成的助记词
const mnemonicWords = ref([
    'apple', 'banana', 'cherry', 'dolphin', 'elephant', 'flower',
    'guitar', 'honey', 'island', 'jungle', 'kangaroo', 'lemon'
]);

// 乱序的助记词（用于验证）
const shuffledWords = computed(() => {
    return [...mnemonicWords.value].sort(() => Math.random() - 0.5);
});

// 选中的助记词（用于验证）
const selectedWords = ref(Array(mnemonicWords.value.length).fill(''));

// 模拟生成的钱包地址
const walletAddress = ref('0x8f5b785d732c5add0eba3c80fc37d20ebc7988a1');

// 表单验证规则
const validatePassword = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请输入密码'));
    } else {
        if (walletForm.confirmPassword !== '') {
            walletFormRef.value.validateField('confirmPassword');
        }
        callback();
    }
};

const validateAgreement = () => {
    if (!walletForm.agreement) {
        agreementError.value = '您必须同意区块链账户服务条款才能继续';
    } else {
        agreementError.value = '';
    }
};

const walletRules = {
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度应在6-20个字符之间', trigger: 'blur' },
        { validator: validatePassword, trigger: 'blur' }
    ],
};

// 显示服务条款
const showTerms = () => {
    termsDialogVisible.value = true;
};

// 接受服务条款
const acceptTerms = () => {
    walletForm.agreement = true;
    agreementError.value = '';
    termsDialogVisible.value = false;
};

// 创建钱包
const createWallet = async () => {
    if (!walletFormRef.value) return;

    if (!walletForm.agreement) {
        agreementError.value = '您必须同意区块链账户服务条款才能继续';
        return;
    }

    await walletFormRef.value.validate(async (valid) => {
        if (valid) {
            loading.value = true;
            try {
                // 模拟创建钱包过程
                await new Promise(resolve => setTimeout(resolve, 1500));

                // 实际应用中应该调用API创建钱包
                // const result = await userStore.createBlockchainWallet(walletForm.password);
                // walletAddress.value = result.address;

                currentStep.value = 1;
            } catch (error) {
                ElMessage.error('创建钱包失败，请重试');
            } finally {
                loading.value = false;
            }
        }
    });
};

// 复制助记词
const copyMnemonic = () => {
    const mnemonicString = mnemonicWords.value.join(' ');
    navigator.clipboard.writeText(mnemonicString)
        .then(() => {
            ElMessage.success('助记词已复制到剪贴板');
        })
        .catch(() => {
            ElMessage.error('复制失败，请手动复制');
        });
};

// 下载助记词
const downloadMnemonic = () => {
    const mnemonicString = mnemonicWords.value.join(' ');
    const blob = new Blob([mnemonicString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mnemonic.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    ElMessage.success('助记词已下载');
};

// 进入验证步骤
const goToVerifyStep = () => {
    if (!mnemonicBackedUp.value) {
        backupError.value = '请确认您已经备份了助记词';
        return;
    }
    backupError.value = '';
    currentStep.value = 2;
};

// 选择验证词
const selectWord = (word) => {
    const index = selectedWords.value.findIndex(slot => !slot);
    if (index !== -1) {
        selectedWords.value[index] = word;
    }
};

// 清除选中的验证词
const clearWordSlot = (index) => {
    selectedWords.value[index] = '';
};

// 重置验证
const resetVerification = () => {
    selectedWords.value = Array(mnemonicWords.value.length).fill('');
    verificationError.value = '';
};

// 验证助记词
const verifyMnemonic = () => {
    // 检查是否所有槽都已填满
    if (selectedWords.value.includes('')) {
        verificationError.value = '请填写所有助记词';
        return;
    }

    // 验证助记词顺序
    const isCorrect = selectedWords.value.every((word, index) => word === mnemonicWords.value[index]);

    if (isCorrect) {
        ElMessage.success('助记词验证成功');
        currentStep.value = 3;
    } else {
        verificationError.value = '助记词顺序不正确，请重新检查';
    }
};

// 复制钱包地址
const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress.value)
        .then(() => {
            ElMessage.success('钱包地址已复制到剪贴板');
        })
        .catch(() => {
            ElMessage.error('复制失败，请手动复制');
        });
};

// 前往仪表盘
const goToDashboard = () => {
    router.push('/home/dashboard');
};

onMounted(() => {
    // 检查用户是否已登录
    if (!userStore.isLoggedIn) {
        router.push('/login');
    }
});
</script>

<style scoped>
.create-wallet-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 0;
}

.create-wallet-card {
    width: 100%;
    max-width: 800px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    padding: 40px;
}

.page-title {
    text-align: center;
    margin-bottom: 30px;
}

.step-content {
    margin-top: 40px;
}

.step-body {
    padding: 20px 0;
}

.step-info {
    margin-bottom: 30px;
}

.step-info h2 {
    font-size: 20px;
    margin-bottom: 10px;
}

.step-info p {
    color: #606266;
    margin-bottom: 15px;
}

.error-message {
    color: #f56c6c;
    font-size: 12px;
    margin-top: 5px;
}

.mnemonic-container {
    background-color: #f5f7fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
}

.mnemonic-words {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-bottom: 20px;
}

.mnemonic-word {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: white;
    padding: 8px 12px;
    border-radius: 4px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.word-index {
    background-color: #409eff;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-weight: bold;
}

.word-text {
    font-family: monospace;
    font-size: 16px;
    font-weight: 500;
}

.mnemonic-actions {
    display: flex;
    justify-content: center;
    gap: 15px;
}

.verify-mnemonic {
    margin-bottom: 30px;
}

.selected-words {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-bottom: 30px;
}

.word-slot {
    height: 40px;
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: #f5f7fa;
    transition: all 0.3s;
}

.word-slot:hover {
    background-color: #e6f2ff;
}

.slot-placeholder {
    color: #909399;
    font-size: 13px;
}

.word-options {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
}

.step-navigation {
    margin-top: 30px;
}

.step-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}

.verification-message {
    margin-bottom: 20px;
}

.completion-container {
    text-align: center;
    padding: 20px 0;
}

.account-info {
    margin: 20px 0;
}

.account-label {
    color: #606266;
    margin-bottom: 10px;
}

.account-address {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-bottom: 30px;
}

.address-text {
    font-family: monospace;
    font-size: 16px;
    background-color: #f5f7fa;
    padding: 8px 16px;
    border-radius: 4px;
}

.completion-actions {
    margin-bottom: 30px;
}

.completion-tips {
    margin-top: 30px;
    text-align: left;
    background-color: #f5f7fa;
    padding: 20px;
    border-radius: 8px;
}

.completion-tips h3 {
    margin-bottom: 15px;
    color: #409eff;
}

.completion-tips p {
    margin-bottom: 10px;
    color: #606266;
}

.terms-content {
    max-height: 50vh;
    overflow-y: auto;
    padding: 15px 0;
}

.terms-content h3,
.terms-content h4 {
    margin-top: 20px;
    margin-bottom: 10px;
}

.terms-content p {
    line-height: 1.6;
    margin-bottom: 15px;
}

@media (max-width: 768px) {
    .mnemonic-words {
        grid-template-columns: repeat(2, 1fr);
    }

    .selected-words {
        grid-template-columns: repeat(3, 1fr);
    }
}
</style>
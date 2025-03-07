<template>
    <div class="profile-container container">
        <h1 class="page-title">个人中心</h1>

        <div class="profile-content">
            <el-row :gutter="30">
                <!-- 左侧用户信息卡片 -->
                <el-col :xs="24" :sm="8">
                    <div class="user-card card">
                        <div class="avatar-container">
                            <el-avatar :size="100" src="https://via.placeholder.com/150" />
                        </div>
                        <h2 class="username">{{ userStore.userInfo?.username || '用户' }}</h2>
                        <p class="user-role">{{ userStore.userInfo?.role === 'admin' ? '管理员' : '普通用户' }}</p>
                        <div class="user-stats">
                            <div class="stat-item">
                                <div class="stat-value">{{ bookings.length }}</div>
                                <div class="stat-label">预订总数</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">{{ completedBookings.length }}</div>
                                <div class="stat-label">已完成</div>
                            </div>
                        </div>
                        <el-button type="primary" @click="editProfile" class="edit-profile-btn">
                            编辑个人资料
                        </el-button>
                    </div>

                    <div class="quick-links card">
                        <h3>快捷链接</h3>
                        <div class="link-list">
                            <router-link to="/bookings" class="quick-link">
                                <el-icon>
                                    <Tickets />
                                </el-icon> 我的预订
                            </router-link>
                            <router-link to="/attractions" class="quick-link">
                                <el-icon>
                                    <Place />
                                </el-icon> 浏览景点
                            </router-link>
                            <a href="#" @click.prevent="handleLogout" class="quick-link">
                                <el-icon>
                                    <SwitchButton />
                                </el-icon> 退出登录
                            </a>
                        </div>
                    </div>
                </el-col>

                <!-- 右侧内容区域 -->
                <el-col :xs="24" :sm="16">
                    <!-- 最近预订 -->
                    <div class="recent-bookings card">
                        <div class="section-header">
                            <h3>最近预订</h3>
                            <router-link to="/bookings" class="view-all">查看全部</router-link>
                        </div>

                        <el-empty v-if="bookings.length === 0" description="暂无预订记录" />

                        <div v-else class="booking-list">
                            <div v-for="booking in recentBookings" :key="booking.id" class="booking-item">
                                <div class="booking-info">
                                    <h4>{{ booking.attractionName }}</h4>
                                    <div class="booking-details">
                                        <span class="date"><el-icon>
                                                <Calendar />
                                            </el-icon> {{ booking.date }}</span>
                                        <span class="price">¥{{ booking.totalPrice }}</span>
                                    </div>
                                </div>
                                <el-tag :type="getStatusType(booking.status)">{{ getStatusText(booking.status)
                                    }}</el-tag>
                            </div>
                        </div>
                    </div>

                    <!-- 账户设置 -->
                    <div class="account-settings card">
                        <h3>账户设置</h3>

                        <el-form label-position="top" :model="profileForm" ref="profileFormRef">
                            <el-form-item label="用户名">
                                <el-input v-model="profileForm.username" disabled />
                            </el-form-item>

                            <el-form-item label="电子邮箱">
                                <el-input v-model="profileForm.email" disabled />
                            </el-form-item>

                            <el-form-item label="通知设置">
                                <div class="notification-settings">
                                    <el-switch v-model="profileForm.emailNotifications" active-text="电子邮件通知" />
                                    <el-switch v-model="profileForm.smsNotifications" active-text="短信通知" />
                                </div>
                            </el-form-item>

                            <el-form-item>
                                <el-button type="primary" @click="saveSettings">保存设置</el-button>
                            </el-form-item>
                        </el-form>
                    </div>

                    <!-- 修改密码 -->
                    <div class="change-password card">
                        <h3>修改密码</h3>

                        <el-form label-position="top" :model="passwordForm" :rules="passwordRules"
                            ref="passwordFormRef">
                            <el-form-item label="当前密码" prop="currentPassword">
                                <el-input v-model="passwordForm.currentPassword" type="password" show-password />
                            </el-form-item>

                            <el-form-item label="新密码" prop="newPassword">
                                <el-input v-model="passwordForm.newPassword" type="password" show-password />
                            </el-form-item>

                            <el-form-item label="确认新密码" prop="confirmPassword">
                                <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
                            </el-form-item>

                            <el-form-item>
                                <el-button type="primary" @click="changePassword">修改密码</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-col>
            </el-row>
        </div>

        <!-- 编辑个人资料对话框 -->
        <el-dialog v-model="editDialogVisible" title="编辑个人资料" width="500px">
            <el-form :model="editForm" label-position="top">
                <el-form-item label="头像">
                    <el-upload class="avatar-uploader" action="#" :show-file-list="false" :auto-upload="false"
                        :on-change="handleAvatarChange">
                        <img v-if="editForm.avatar" :src="editForm.avatar" class="avatar" />
                        <el-icon v-else class="avatar-uploader-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                </el-form-item>

                <el-form-item label="昵称">
                    <el-input v-model="editForm.nickname" placeholder="请输入昵称" />
                </el-form-item>

                <el-form-item label="个人简介">
                    <el-input v-model="editForm.bio" type="textarea" :rows="3" placeholder="请输入个人简介" />
                </el-form-item>
            </el-form>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="updateProfile">
                        保存
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
    Tickets, Place, SwitchButton, Calendar, Plus
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../stores/user';
import { useBookingsStore } from '../stores/bookings';

const router = useRouter();
const userStore = useUserStore();
const bookingsStore = useBookingsStore();

const profileFormRef = ref(null);
const passwordFormRef = ref(null);
const editDialogVisible = ref(false);

// 个人设置表单
const profileForm = reactive({
    username: 'demouser',
    email: 'demo@example.com',
    emailNotifications: true,
    smsNotifications: false
});

// 密码修改表单
const passwordForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});


const passwordRules = {
    currentPassword: [
        { required: true, message: '请输入当前密码', trigger: 'blur' }
    ],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
    ],
};

// 编辑个人资料表单
const editForm = reactive({
    avatar: '',
    nickname: 'DemoUser',
    bio: '热爱旅行的探险家'
});

// 获取预订列表
const bookings = computed(() => bookingsStore.bookings || []);

// 获取最近3个预订
const recentBookings = computed(() => {
    return [...bookings.value].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    }).slice(0, 3);
});

// 已完成的预订
const completedBookings = computed(() => {
    return bookings.value.filter(booking => booking.status === 'completed');
});

// 获取状态标签类型
const getStatusType = (status) => {
    switch (status) {
        case 'confirmed':
            return 'success';
        case 'pending':
            return 'warning';
        case 'completed':
            return 'info';
        case 'cancelled':
            return 'danger';
        default:
            return 'info';
    }
};

// 获取状态显示文本
const getStatusText = (status) => {
    switch (status) {
        case 'confirmed':
            return '已确认';
        case 'pending':
            return '待确认';
        case 'completed':
            return '已完成';
        case 'cancelled':
            return '已取消';
        default:
            return status;
    }
};

// 编辑个人资料
const editProfile = () => {
    editDialogVisible.value = true;
};

// 处理头像上传
const handleAvatarChange = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file.raw);
    reader.onload = () => {
        editForm.avatar = reader.result;
    };
};

// 更新个人资料
const updateProfile = () => {
    // 模拟更新成功
    ElMessage.success('个人资料更新成功');
    editDialogVisible.value = false;
};

// 保存账户设置
const saveSettings = () => {
    // 模拟保存成功
    ElMessage.success('设置已保存');
};

// 修改密码
const changePassword = () => {
    passwordFormRef.value.validate((valid) => {
        if (valid) {
            // 模拟修改成功
            ElMessage.success('密码已成功修改');
            passwordForm.currentPassword = '';
            passwordForm.newPassword = '';
            passwordForm.confirmPassword = '';
        }
    });
};

// 退出登录
const handleLogout = () => {
    userStore.logout();
    ElMessage.success('已成功退出登录');
    router.push('/login');
};

onMounted(async () => {
    // 如果还没有加载预订数据，则加载
    if (bookingsStore.bookings.length === 0) {
        await bookingsStore.fetchBookings();
    }

    // 初始化表单数据
    if (userStore.userInfo) {
        profileForm.username = userStore.userInfo.username;
        editForm.nickname = userStore.userInfo.username;
    }
});
</script>

<style scoped>
.profile-container {
    padding: 40px 0;
}

.profile-content {
    margin-top: 20px;
}

.card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 25px;
    margin-bottom: 30px;
}

.user-card {
    text-align: center;
}

.avatar-container {
    margin-bottom: 15px;
}

.username {
    font-size: 24px;
    margin-bottom: 5px;
}

.user-role {
    color: #909399;
    margin-bottom: 20px;
}

.user-stats {
    display: flex;
    justify-content: space-around;
    margin: 20px 0;
}

.stat-item {
    text-align: center;
}

.stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #409eff;
}

.stat-label {
    font-size: 14px;
    color: #606266;
}

.edit-profile-btn {
    width: 100%;
    margin-top: 15px;
}

.quick-links h3 {
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
}

.link-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.quick-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.quick-link:hover {
    background-color: #f5f7fa;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
}

.section-header h3 {
    margin: 0;
}

.view-all {
    font-size: 14px;
}

.booking-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.booking-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-radius: 4px;
    background-color: #f5f7fa;
}

.booking-info h4 {
    margin: 0 0 5px 0;
    font-size: 16px;
}

.booking-details {
    display: flex;
    gap: 15px;
    color: #606266;
    font-size: 14px;
}

.date {
    display: flex;
    align-items: center;
    gap: 5px;
}

.price {
    font-weight: bold;
}

.account-settings h3,
.change-password h3 {
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
}

.notification-settings {
    display: flex;
    gap: 20px;
}

.avatar-uploader {
    text-align: center;
}

.avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
}

.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    border-radius: 50%;
    border: 1px dashed #d9d9d9;
}
</style>
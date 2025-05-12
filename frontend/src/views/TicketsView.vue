<template>
    <div class="tickets-container">
        <div class="page-header">
            <h1 class="page-title">门票记录存证</h1>
            <el-button type="primary" @click="showAddTicketDialog">
                <el-icon>
                    <Plus />
                </el-icon> 新增门票存证
            </el-button>
        </div>

        <!-- 搜索和过滤 -->
        <div class="filter-section card">
            <el-form :inline="true" :model="filterForm" class="filter-form">
                <el-form-item label="景点名称">
                    <el-input v-model="filterForm.attractionName" placeholder="输入景点名称" clearable />
                </el-form-item>
                <el-form-item label="存证状态">
                    <el-select v-model="filterForm.status" placeholder="选择状态" clearable>
                        <el-option label="待确认" value="pending" />
                        <el-option label="已确认" value="confirmed" />
                        <el-option label="已拒绝" value="rejected" />
                    </el-select>
                </el-form-item>
                <el-form-item label="日期范围">
                    <el-date-picker v-model="filterForm.dateRange" type="daterange" range-separator="至"
                        start-placeholder="开始日期" end-placeholder="结束日期" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="searchTickets">搜索</el-button>
                    <el-button @click="resetFilters">重置</el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- 门票存证列表 -->
        <div class="tickets-list card">
            <el-table :data="tickets" stripe style="width: 100%" v-loading="loading">
                <el-table-column prop="id" label="存证ID" width="120" />
                <el-table-column prop="attractionName" label="景点名称" min-width="180" />
                <el-table-column prop="visitorName" label="游客姓名" width="120" />
                <el-table-column prop="visitorId" label="证件号码" width="180">
                    <template #default="scope">
                        <el-tag type="info">{{ maskIdNumber(scope.row.visitorId) }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="ticketType" label="票种" width="120" />
                <el-table-column prop="visitDate" label="游览日期" width="120" />
                <el-table-column prop="createTime" label="存证时间" width="180" />
                <el-table-column prop="status" label="状态" width="100">
                    <template #default="scope">
                        <el-tag :type="getStatusType(scope.row.status)">
                            {{ getStatusText(scope.row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="txHash" label="区块链交易哈希" width="220">
                    <template #default="scope">
                        <el-link v-if="scope.row.txHash" type="primary" @click="viewTransaction(scope.row.txHash)"
                            :underline="false">
                            {{ formatHash(scope.row.txHash) }}
                        </el-link>
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150" fixed="right">
                    <template #default="scope">
                        <el-button size="small" @click="viewTicketDetails(scope.row)">详情</el-button>
                        <el-button size="small" type="danger" plain :disabled="scope.row.status === 'confirmed'"
                            @click="deleteTicket(scope.row)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-container">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" :total="total"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </div>

        <!-- 新增门票存证对话框 -->
        <el-dialog v-model="addTicketDialogVisible" title="新增门票存证" width="500px">
            <el-form :model="ticketForm" :rules="ticketRules" ref="ticketFormRef" label-width="100px">
                <el-form-item label="景点名称" prop="attractionName">
                    <el-select v-model="ticketForm.attractionName" placeholder="选择景点" filterable>
                        <el-option v-for="item in attractions" :key="item.id" :label="item.name" :value="item.name" />
                    </el-select>
                </el-form-item>

                <el-form-item label="游客姓名" prop="visitorName">
                    <el-input v-model="ticketForm.visitorName" />
                </el-form-item>

                <el-form-item label="证件号码" prop="visitorId">
                    <el-input v-model="ticketForm.visitorId" />
                </el-form-item>

                <el-form-item label="票种" prop="ticketType">
                    <el-select v-model="ticketForm.ticketType" placeholder="选择票种">
                        <el-option label="成人票" value="成人票" />
                        <el-option label="儿童票" value="儿童票" />
                        <el-option label="老人票" value="老人票" />
                        <el-option label="学生票" value="学生票" />
                    </el-select>
                </el-form-item>

                <el-form-item label="游览日期" prop="visitDate">
                    <el-date-picker v-model="ticketForm.visitDate" type="date" placeholder="选择日期" style="width: 100%" />
                </el-form-item>

                <el-form-item label="票价" prop="price">
                    <el-input-number v-model="ticketForm.price" :precision="2" :step="10" :min="0"
                        style="width: 100%" />
                </el-form-item>

                <el-form-item label="门票图片" prop="ticketImage">
                    <el-upload class="upload-demo" action="#" :auto-upload="false" :on-change="handleImageChange"
                        :limit="1">
                        <template #trigger>
                            <el-button type="primary">选择图片</el-button>
                        </template>
                        <template #tip>
                            <div class="el-upload__tip">
                                请上传门票图片，支持jpg/png格式
                            </div>
                        </template>
                    </el-upload>
                </el-form-item>

                <el-form-item label="备注" prop="remarks">
                    <el-input v-model="ticketForm.remarks" type="textarea" :rows="2" placeholder="可选填" />
                </el-form-item>
            </el-form>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="addTicketDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitTicket" :loading="submitLoading">
                        提交存证
                    </el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 门票详情对话框 -->
        <el-dialog v-model="ticketDetailsVisible" title="门票存证详情" width="700px">
            <div v-if="currentTicket" class="ticket-details">
                <div class="ticket-header">
                    <div class="ticket-title">
                        <h2>{{ currentTicket.attractionName }}</h2>
                        <el-tag :type="getStatusType(currentTicket.status)">
                            {{ getStatusText(currentTicket.status) }}
                        </el-tag>
                    </div>
                    <div class="ticket-id">
                        存证ID: {{ currentTicket.id }}
                    </div>
                </div>

                <el-divider />

                <div class="ticket-content">
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="游客姓名">{{ currentTicket.visitorName }}</el-descriptions-item>
                        <el-descriptions-item label="证件号码">{{ maskIdNumber(currentTicket.visitorId)
                            }}</el-descriptions-item>
                        <el-descriptions-item label="票种">{{ currentTicket.ticketType }}</el-descriptions-item>
                        <el-descriptions-item label="票价">¥{{ currentTicket.price }}</el-descriptions-item>
                        <el-descriptions-item label="游览日期">{{ currentTicket.visitDate }}</el-descriptions-item>
                        <el-descriptions-item label="存证时间">{{ currentTicket.createTime }}</el-descriptions-item>
                        <el-descriptions-item label="备注" :span="2">{{ currentTicket.remarks || '无'
                            }}</el-descriptions-item>
                    </el-descriptions>

                    <div class="ticket-image-container">
                        <h3>门票图片</h3>
                        <div class="ticket-image">
                            <el-image
                                :src="currentTicket.ticketImage || 'https://via.placeholder.com/300x150?text=门票图片'"
                                :preview-src-list="[currentTicket.ticketImage || 'https://via.placeholder.com/300x150?text=门票图片']"
                                fit="contain" />
                        </div>
                    </div>

                    <div class="blockchain-info" v-if="currentTicket.txHash">
                        <h3>区块链信息</h3>
                        <el-descriptions :column="1" border>
                            <el-descriptions-item label="交易哈希">
                                <span class="hash-value">{{ currentTicket.txHash }}</span>
                                <el-button size="small" type="primary" link @click="copyHash(currentTicket.txHash)">
                                    <el-icon>
                                        <DocumentCopy />
                                    </el-icon>
                                </el-button>
                            </el-descriptions-item>
                            <el-descriptions-item label="区块高度">{{ currentTicket.blockHeight || '-'
                                }}</el-descriptions-item>
                            <el-descriptions-item label="确认时间">{{ currentTicket.confirmTime || '-'
                                }}</el-descriptions-item>
                            <el-descriptions-item label="区块浏览器">
                                <el-link :href="`https://example-blockchain-explorer.com/tx/${currentTicket.txHash}`"
                                    target="_blank" type="primary">
                                    在区块浏览器中查看
                                </el-link>
                            </el-descriptions-item>
                        </el-descriptions>
                    </div>
                </div>

                <div class="proof-actions" v-if="currentTicket.status === 'confirmed'">
                    <el-button type="success" @click="downloadProof">
                        <el-icon>
                            <Download />
                        </el-icon>
                        下载存证证明
                    </el-button>

                    <el-button type="primary" @click="verifyProof">
                        <el-icon>
                            <Check />
                        </el-icon>
                        验证存证
                    </el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import {
    Plus, Download, Check, DocumentCopy
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();

// 列表数据和分页
const tickets = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 过滤表单
const filterForm = reactive({
    attractionName: '',
    status: '',
    dateRange: []
});

// 对话框控制
const addTicketDialogVisible = ref(false);
const ticketDetailsVisible = ref(false);
const currentTicket = ref(null);
const submitLoading = ref(false);

// 表单相关
const ticketFormRef = ref(null);
const ticketForm = reactive({
    attractionName: '',
    visitorName: '',
    visitorId: '',
    ticketType: '',
    visitDate: '',
    price: 0,
    ticketImage: null,
    remarks: ''
});

// 表单验证规则
const ticketRules = {
    attractionName: [{ required: true, message: '请选择景点', trigger: 'change' }],
    visitorName: [{ required: true, message: '请输入游客姓名', trigger: 'blur' }],
    visitorId: [
        { required: true, message: '请输入证件号码', trigger: 'blur' },
        { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号码', trigger: 'blur' }
    ],
    ticketType: [{ required: true, message: '请选择票种', trigger: 'change' }],
    visitDate: [{ required: true, message: '请选择游览日期', trigger: 'change' }],
    price: [{ required: true, message: '请输入票价', trigger: 'blur' }]
};

// 景点列表
const attractions = ref([
    { id: 1, name: '西湖风景区' },
    { id: 2, name: '故宫博物院' },
    { id: 3, name: '长城' },
    { id: 4, name: '颐和园' },
    { id: 5, name: '黄山风景区' }
]);

// 初始化数据
onMounted(() => {
    fetchTickets();
});

// 获取门票存证列表
const fetchTickets = async () => {
    loading.value = true;
    try {
        // 模拟API请求获取数据
        setTimeout(() => {
            tickets.value = [
                {
                    id: 'T10001',
                    attractionName: '西湖风景区',
                    visitorName: '张三',
                    visitorId: '110101199003074258',
                    ticketType: '成人票',
                    visitDate: '2025-03-15',
                    price: 80,
                    createTime: '2025-03-15 14:30:22',
                    status: 'confirmed',
                    txHash: '0x8f5b785d732c5add0eba3c80fc37d20ebc7988a19c9b6180d59c3e2d7272fa21',
                    blockHeight: 1256789,
                    confirmTime: '2025-03-15 14:35:18',
                    remarks: '西湖十景之一',
                    ticketImage: 'https://via.placeholder.com/300x150?text=西湖门票'
                },
                {
                    id: 'T10002',
                    attractionName: '故宫博物院',
                    visitorName: '李四',
                    visitorId: '310104199107236147',
                    ticketType: '学生票',
                    visitDate: '2025-03-15',
                    price: 40,
                    createTime: '2025-03-15 13:25:36',
                    status: 'pending',
                    txHash: '',
                    remarks: '',
                    ticketImage: 'https://via.placeholder.com/300x150?text=故宫门票'
                },
                {
                    id: 'T10003',
                    attractionName: '长城',
                    visitorName: '王五',
                    visitorId: '440105199209184723',
                    ticketType: '成人票',
                    visitDate: '2025-03-15',
                    price: 120,
                    createTime: '2025-03-15 12:18:49',
                    status: 'confirmed',
                    txHash: '0x3c7b2c2150a48b5b9ff252f498ee08065287ed87f4947e9a3d9764d8873dd233',
                    blockHeight: 1256787,
                    confirmTime: '2025-03-15 12:23:07',
                    remarks: '八达岭长城',
                    ticketImage: 'https://via.placeholder.com/300x150?text=长城门票'
                },
                {
                    id: 'T10004',
                    attractionName: '黄山风景区',
                    visitorName: '赵六',
                    visitorId: '330102199401238574',
                    ticketType: '老人票',
                    visitDate: '2025-03-27',
                    price: 60,
                    createTime: '2025-03-27 11:05:31',
                    status: 'rejected',
                    txHash: '',
                    remarks: '含缆车票',
                    ticketImage: 'https://via.placeholder.com/300x150?text=黄山门票'
                }
            ];
            total.value = 4;
            loading.value = false;
        }, 500);
    } catch (error) {
        ElMessage.error('获取门票存证列表失败');
        loading.value = false;
    }
};

// 显示新增门票对话框
const showAddTicketDialog = () => {
    // 重置表单
    if (ticketFormRef.value) {
        ticketFormRef.value.resetFields();
    }
    addTicketDialogVisible.value = true;
};

// 处理图片上传
const handleImageChange = (file) => {
    ticketForm.ticketImage = file.raw;
};

// 提交门票存证
const submitTicket = async () => {
    if (!ticketFormRef.value) return;

    await ticketFormRef.value.validate(async (valid) => {
        if (valid) {
            submitLoading.value = true;
            try {
                // 模拟API请求提交数据
                setTimeout(() => {
                    ElMessage.success('门票存证提交成功，等待区块链确认');
                    addTicketDialogVisible.value = false;
                    fetchTickets(); // 重新加载列表
                    submitLoading.value = false;
                }, 1000);
            } catch (error) {
                ElMessage.error('提交失败，请稍后重试');
                submitLoading.value = false;
            }
        }
    });
};

// 查看门票详情
const viewTicketDetails = (ticket) => {
    currentTicket.value = ticket;
    ticketDetailsVisible.value = true;
};

// 删除门票存证
const deleteTicket = (ticket) => {
    ElMessageBox.confirm(
        '确定要删除这条门票存证记录吗？',
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(() => {
        // 模拟删除请求
        setTimeout(() => {
            ElMessage.success('删除成功');
            fetchTickets(); // 重新加载列表
        }, 500);
    }).catch(() => {
        // 取消删除
    });
};

// 下载存证证明
const downloadProof = () => {
    ElMessage.success('存证证明下载中...');
    // 实际项目中这里应该调用API下载证明文件
};

// 验证存证
const verifyProof = () => {
    ElMessage.success('存证验证通过，数据完整且未被篡改');
    // 实际项目中这里应该调用API验证存证有效性
};

// 搜索门票
const searchTickets = () => {
    currentPage.value = 1;
    fetchTickets();
};

// 重置过滤条件
const resetFilters = () => {
    filterForm.attractionName = '';
    filterForm.status = '';
    filterForm.dateRange = [];
    searchTickets();
};

// 查看交易详情
const viewTransaction = (txHash) => {
    ElMessage.info(`查看交易: ${txHash}`);
    // 实际项目中这里应该打开区块链浏览器或者展示交易详情
};

// 复制哈希值
const copyHash = (hash) => {
    navigator.clipboard.writeText(hash)
        .then(() => {
            ElMessage.success('交易哈希已复制到剪贴板');
        })
        .catch(() => {
            ElMessage.error('复制失败，请手动复制');
        });
};

// 获取状态标签类型
const getStatusType = (status) => {
    switch (status) {
        case 'confirmed':
            return 'success';
        case 'pending':
            return 'warning';
        case 'rejected':
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
        case 'rejected':
            return '已拒绝';
        default:
            return '未知';
    }
};

// 格式化哈希值
const formatHash = (hash) => {
    if (!hash) return '-';
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 6)}`;
};

// 身份证号码脱敏
const maskIdNumber = (idNumber) => {
    if (!idNumber) return '-';
    return idNumber.replace(/^(.{4})(?:\d+)(.{4})$/, '$1********$2');
};

// 分页处理
const handleSizeChange = (newSize) => {
    pageSize.value = newSize;
    fetchTickets();
};

const handleCurrentChange = (newPage) => {
    currentPage.value = newPage;
    fetchTickets();
};
</script>

<style scoped>
.tickets-container {
    padding: 20px;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.card {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.filter-section {
    margin-bottom: 20px;
}

.filter-form {
    display: flex;
    flex-wrap: wrap;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.ticket-details {
    padding: 10px;
}

.ticket-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
}

.ticket-title {
    display: flex;
    align-items: center;
    gap: 10px;
}

.ticket-title h2 {
    margin: 0;
}

.ticket-id {
    color: #909399;
    font-size: 14px;
}

.ticket-content {
    margin-top: 20px;
}

.ticket-image-container {
    margin: 20px 0;
}

.ticket-image {
    max-width: 100%;
    text-align: center;
    margin-top: 10px;
}

.blockchain-info {
    margin: 20px 0;
}

.hash-value {
    font-family: monospace;
    word-break: break-all;
}

.proof-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 30px;
}

@media (max-width: 768px) {
    .filter-form {
        flex-direction: column;
    }

    .filter-form .el-form-item {
        margin-right: 0;
    }
}
</style>
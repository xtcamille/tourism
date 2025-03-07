<template>
    <div class="reviews-container">
        <h1 class="page-title">评价记录存证管理</h1>

        <!-- 搜索和过滤 -->
        <div class="filter-section card">
            <el-form :inline="true" :model="filterForm" class="filter-form">
                <el-form-item label="评价内容">
                    <el-input v-model="filterForm.content" placeholder="搜索评价内容" clearable />
                </el-form-item>
                <el-form-item label="评价类型">
                    <el-select v-model="filterForm.type" placeholder="评价类型" clearable>
                        <el-option label="景点评价" value="attraction" />
                        <el-option label="产品评价" value="product" />
                        <el-option label="服务评价" value="service" />
                    </el-select>
                </el-form-item>
                <el-form-item label="评分等级">
                    <el-select v-model="filterForm.rating" placeholder="评分等级" clearable>
                        <el-option label="5星" value="5" />
                        <el-option label="4星" value="4" />
                        <el-option label="3星" value="3" />
                        <el-option label="2星" value="2" />
                        <el-option label="1星" value="1" />
                    </el-select>
                </el-form-item>
                <el-form-item label="存证状态">
                    <el-select v-model="filterForm.status" placeholder="存证状态" clearable>
                        <el-option label="已存证" value="verified" />
                        <el-option label="未存证" value="unverified" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">搜索</el-button>
                    <el-button @click="resetFilters">重置</el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- 操作按钮区 -->
        <div class="action-bar">
            <el-button type="success" @click="batchCertify" :disabled="selectedReviews.length === 0">
                <el-icon>
                    <Lock />
                </el-icon> 批量存证
            </el-button>
            <el-button @click="exportReviewData">
                <el-icon>
                    <Download />
                </el-icon> 导出数据
            </el-button>
        </div>

        <!-- 评价列表 -->
        <div class="reviews-list card">
            <el-table :data="paginatedReviews" border style="width: 100%" @selection-change="handleSelectionChange"
                v-loading="loading">
                <el-table-column type="selection" width="55" />
                <el-table-column label="评价ID" prop="id" width="80" />
                <el-table-column label="评价对象" min-width="150">
                    <template #default="scope">
                        <div class="review-object">
                            <span class="review-object-type">【{{ getTypeName(scope.row.type) }}】</span>
                            <span>{{ scope.row.objectName }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="评价内容" prop="content" min-width="200" show-overflow-tooltip />
                <el-table-column label="评分" width="100">
                    <template #default="scope">
                        <el-rate v-model="scope.row.rating" disabled show-score text-color="#ff9900"
                            score-template="{value}" />
                    </template>
                </el-table-column>
                <el-table-column label="评价用户" prop="userName" width="120" />
                <el-table-column label="评价时间" prop="createTime" width="180" />
                <el-table-column label="存证状态" width="100">
                    <template #default="scope">
                        <el-tag :type="scope.row.verified ? 'success' : 'info'" effect="dark">
                            {{ scope.row.verified ? '已存证' : '未存证' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" fixed="right" width="150">
                    <template #default="scope">
                        <el-button v-if="scope.row.verified" link type="primary" @click="viewCertification(scope.row)">
                            查看存证
                        </el-button>
                        <el-button v-else link type="success" @click="certifyReview(scope.row)">
                            提交存证
                        </el-button>
                        <el-button link type="danger" @click="deleteReview(scope.row)" v-if="!scope.row.verified">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页控制 -->
            <div class="pagination-container">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]" :total="filteredReviews.length"
                    layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                    @current-change="handleCurrentChange" />
            </div>
        </div>

        <!-- 评价详情对话框 -->
        <el-dialog v-model="reviewDetailDialogVisible" title="评价详情" width="600px">
            <div v-if="currentReview" class="review-detail">
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="评价ID" :span="2">{{ currentReview.id }}</el-descriptions-item>
                    <el-descriptions-item label="评价对象" :span="2">
                        <span class="review-object-type">【{{ getTypeName(currentReview.type) }}】</span>
                        {{ currentReview.objectName }}
                    </el-descriptions-item>
                    <el-descriptions-item label="评分">
                        <el-rate v-model="currentReview.rating" disabled show-score text-color="#ff9900"
                            score-template="{value}" />
                    </el-descriptions-item>
                    <el-descriptions-item label="评价时间">{{ currentReview.createTime }}</el-descriptions-item>
                    <el-descriptions-item label="评价用户">{{ currentReview.userName }}</el-descriptions-item>
                    <el-descriptions-item label="用户IP">{{ currentReview.userIp }}</el-descriptions-item>
                    <el-descriptions-item label="评价内容" :span="2">{{ currentReview.content }}</el-descriptions-item>
                </el-descriptions>

                <div v-if="currentReview.images && currentReview.images.length > 0" class="review-images">
                    <h4>评价图片：</h4>
                    <el-image v-for="(url, index) in currentReview.images" :key="index" :src="url"
                        :preview-src-list="currentReview.images" fit="cover" class="review-image" />
                </div>
            </div>
        </el-dialog>

        <!-- 区块链存证信息对话框 -->
        <el-dialog v-model="certificationDialogVisible" title="评价区块链存证信息" width="600px">
            <div v-if="currentCertification" class="certification-info">
                <el-descriptions :column="1" border>
                    <el-descriptions-item label="评价ID">{{ currentCertification.reviewId }}</el-descriptions-item>
                    <el-descriptions-item label="评价对象">{{ currentCertification.objectName }}</el-descriptions-item>
                    <el-descriptions-item label="存证时间">{{ currentCertification.timestamp }}</el-descriptions-item>
                    <el-descriptions-item label="存证哈希">
                        <span class="hash-text">{{ currentCertification.hash }}</span>
                        <el-button type="primary" link @click="copyHash(currentCertification.hash)" size="small">
                            <el-icon>
                                <DocumentCopy />
                            </el-icon>
                        </el-button>
                    </el-descriptions-item>
                    <el-descriptions-item label="所在区块">{{ currentCertification.blockNumber }}</el-descriptions-item>
                    <el-descriptions-item label="验证者">{{ currentCertification.validator }}</el-descriptions-item>
                    <el-descriptions-item label="数据指纹">{{ currentCertification.dataFingerprint }}</el-descriptions-item>
                </el-descriptions>

                <div class="certification-actions">
                    <el-button type="primary" @click="verifyData">
                        <el-icon>
                            <Check />
                        </el-icon> 验证数据真实性
                    </el-button>
                    <el-button type="success" @click="viewBlockExplorer">
                        <el-icon>
                            <Link />
                        </el-icon> 查看区块浏览器
                    </el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import {
    Lock, Download, Check, Link, DocumentCopy, View
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 评价数据
const reviews = ref([
    {
        id: '10001',
        type: 'attraction',
        objectId: '1',
        objectName: '龙山村世外桃源风景区',
        content: '风景非常美丽，空气清新，是周末休闲的好去处。服务也很周到，推荐大家来游玩。',
        rating: 5,
        userName: '张三',
        userIp: '192.168.1.101',
        createTime: '2023-05-10 14:30:22',
        images: [
            'https://via.placeholder.com/300x200?text=Review1-1',
            'https://via.placeholder.com/300x200?text=Review1-2'
        ],
        verified: true,
        certificationInfo: {
            reviewId: '10001',
            objectName: '龙山村世外桃源风景区',
            hash: '0x8f5b785d732c5add0eba3c80fc37d20ebc7988a19c9b6180d59c3e2d7272fa21',
            blockNumber: 1256789,
            timestamp: '2023-05-10 16:22:18',
            validator: '节点3',
            dataFingerprint: 'QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgG12'
        }
    },
    {
        id: '10002',
        type: 'product',
        objectId: '1',
        objectName: '青山绿茶',
        content: '茶叶品质很好，香气浓郁，回甘明显，包装也很精美，非常满意。',
        rating: 5,
        userName: '李四',
        userIp: '192.168.1.102',
        createTime: '2023-05-12 09:45:11',
        images: [
            'https://via.placeholder.com/300x200?text=Review2'
        ],
        verified: true,
        certificationInfo: {
            reviewId: '10002',
            objectName: '青山绿茶',
            hash: '0x3c7b2c2150a48b5b9ff252f498ee08065287ed87f4947e9a3d9764d8873dd233',
            blockNumber: 1256793,
            timestamp: '2023-05-12 10:15:33',
            validator: '节点1',
            dataFingerprint: 'QmT8CeWdN43qrthZnxaTmBHKqjmLnJgS8Bp9ZJFRQAGWgP'
        }
    },
    {
        id: '10003',
        type: 'attraction',
        objectId: '3',
        objectName: '五彩田园生态景区',
        content: '生态环境很好，有机蔬果可以现摘现吃，孩子们玩得很开心，但设施有点陈旧。',
        rating: 4,
        userName: '王五',
        userIp: '192.168.1.103',
        createTime: '2023-05-15 16:20:35',
        images: [],
        verified: false,
        certificationInfo: null
    },
    {
        id: '10004',
        type: 'product',
        objectId: '3',
        objectName: '农家腊肉',
        content: '味道很正宗，回味无穷，但价格有点贵，希望能优惠一些。',
        rating: 3,
        userName: '赵六',
        userIp: '192.168.1.104',
        createTime: '2023-05-18 11:05:47',
        images: [
            'https://via.placeholder.com/300x200?text=Review4-1',
            'https://via.placeholder.com/300x200?text=Review4-2',
            'https://via.placeholder.com/300x200?text=Review4-3'
        ],
        verified: false,
        certificationInfo: null
    },
    {
        id: '10005',
        type: 'service',
        objectId: '2',
        objectName: '民宿主题体验服务',
        content: '服务态度很好，活动安排合理，是一次很愉快的体验。',
        rating: 5,
        userName: '钱七',
        userIp: '192.168.1.105',
        createTime: '2023-05-20 14:35:18',
        images: [],
        verified: true,
        certificationInfo: {
            reviewId: '10005',
            objectName: '民宿主题体验服务',
            hash: '0x1d8f88ae3bdf736c072a9b4dcda680f92a4f0612a4bed70c593f5adb8d5251af',
            blockNumber: 1256810,
            timestamp: '2023-05-20 15:42:55',
            validator: '节点2',
            dataFingerprint: 'QmNLei78zWmzUdbeRB3CiUfAizWUrbeeZh5K1rhAQKCh51'
        }
    },
    {
        id: '10006',
        type: 'attraction',
        objectId: '4',
        objectName: '梅山古村',
        content: '古村落保存得很好，能感受到浓厚的历史文化氛围，但讲解服务有待加强。',
        rating: 4,
        userName: '孙八',
        userIp: '192.168.1.106',
        createTime: '2023-05-22 09:15:47',
        images: [
            'https://via.placeholder.com/300x200?text=Review6'
        ],
        verified: true,
        certificationInfo: {
            reviewId: '10006',
            objectName: '梅山古村',
            hash: '0xe56c2f9e5d937cbb231925c7da5399b58f97ef09bca676d2e95770559c0a7764',
            blockNumber: 1256820,
            timestamp: '2023-05-22 10:30:21',
            validator: '节点5',
            dataFingerprint: 'QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqB'
        }
    },
]);

// 过滤和分页
const filterForm = reactive({
    content: '',
    type: '',
    rating: '',
    status: ''
});

const loading = ref(false);
const selectedReviews = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);

const getTypeName = (type) => {
    const typeMap = {
        'attraction': '景点评价',
        'product': '产品评价',
        'service': '服务评价'
    };
    return typeMap[type] || type;
};

const filteredReviews = computed(() => {
    let result = [...reviews.value];

    // 应用内容过滤
    if (filterForm.content) {
        result = result.filter(item =>
            item.content.toLowerCase().includes(filterForm.content.toLowerCase()) ||
            item.objectName.toLowerCase().includes(filterForm.content.toLowerCase())
        );
    }

    // 应用类型过滤
    if (filterForm.type) {
        result = result.filter(item => item.type === filterForm.type);
    }

    // 应用评分过滤
    if (filterForm.rating) {
        result = result.filter(item => item.rating === Number(filterForm.rating));
    }

    // 应用存证状态过滤
    if (filterForm.status) {
        if (filterForm.status === 'verified') {
            result = result.filter(item => item.verified);
        } else if (filterForm.status === 'unverified') {
            result = result.filter(item => !item.verified);
        }
    }

    return result;
});

const paginatedReviews = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filteredReviews.value.slice(start, end);
});

// 评价详情
const reviewDetailDialogVisible = ref(false);
const currentReview = ref(null);

// 区块链存证信息
const certificationDialogVisible = ref(false);
const currentCertification = ref(null);

// 表格选择
const handleSelectionChange = (selection) => {
    selectedReviews.value = selection;
};

// 搜索和重置
const handleSearch = () => {
    currentPage.value = 1;
};

const resetFilters = () => {
    filterForm.content = '';
    filterForm.type = '';
    filterForm.rating = '';
    filterForm.status = '';
    currentPage.value = 1;
};

// 分页处理
const handleSizeChange = (newSize) => {
    pageSize.value = newSize;
};

const handleCurrentChange = (newPage) => {
    currentPage.value = newPage;
};

// 查看评价详情
const viewReviewDetail = (review) => {
    currentReview.value = review;
    reviewDetailDialogVisible.value = true;
};

// 删除评价
const deleteReview = (review) => {
    ElMessageBox.confirm(
        `确定要删除ID为 ${review.id} 的评价记录吗？`,
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        const index = reviews.value.findIndex(item => item.id === review.id);
        if (index !== -1) {
            reviews.value.splice(index, 1);
            ElMessage.success('评价删除成功');
        }
    }).catch(() => { });
};

// 存证功能
const certifyReview = (review) => {
    loading.value = true;

    // 模拟提交存证过程
    setTimeout(() => {
        const index = reviews.value.findIndex(item => item.id === review.id);
        if (index !== -1) {
            const now = new Date();
            const timestamp = now.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).replace(/\//g, '-');

            // 创建存证信息
            const certificationInfo = {
                reviewId: review.id,
                objectName: review.objectName,
                hash: `0x${Math.random().toString(16).substr(2, 40)}`,
                blockNumber: Math.floor(1256800 + Math.random() * 100),
                timestamp: timestamp,
                validator: `节点${Math.floor(Math.random() * 5) + 1}`,
                dataFingerprint: `QmW${Math.random().toString(36).substr(2, 40)}`
            };

            // 更新评价信息
            reviews.value[index] = {
                ...reviews.value[index],
                verified: true,
                certificationInfo: certificationInfo
            };

            ElMessage.success('评价存证成功');
        }

        loading.value = false;
    }, 2000);
};

const batchCertify = () => {
    if (selectedReviews.value.length === 0) {
        ElMessage.warning('请选择要存证的评价');
        return;
    }

    const unverifiedReviews = selectedReviews.value.filter(review => !review.verified);
    if (unverifiedReviews.length === 0) {
        ElMessage.warning('选中的评价都已经完成存证');
        return;
    }

    ElMessageBox.confirm(
        `确定要对选中的 ${unverifiedReviews.length} 条未存证评价进行区块链存证吗？`,
        '确认操作',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info',
        }
    ).then(() => {
        loading.value = true;

        // 模拟批量存证过程
        setTimeout(() => {
            for (const review of unverifiedReviews) {
                const index = reviews.value.findIndex(item => item.id === review.id);
                if (index !== -1) {
                    const now = new Date();
                    const timestamp = now.toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    }).replace(/\//g, '-');

                    // 创建存证信息
                    const certificationInfo = {
                        reviewId: review.id,
                        objectName: review.objectName,
                        hash: `0x${Math.random().toString(16).substr(2, 40)}`,
                        blockNumber: Math.floor(1256800 + Math.random() * 100),
                        timestamp: timestamp,
                        validator: `节点${Math.floor(Math.random() * 5) + 1}`,
                        dataFingerprint: `QmW${Math.random().toString(36).substr(2, 40)}`
                    };

                    // 更新评价信息
                    reviews.value[index] = {
                        ...reviews.value[index],
                        verified: true,
                        certificationInfo: certificationInfo
                    };
                }
            }

            ElMessage.success(`成功对 ${unverifiedReviews.length} 条评价完成区块链存证`);
            loading.value = false;
        }, 2000);
    }).catch(() => { });
};

// 导出数据
const exportReviewData = () => {
    ElMessage.success('数据导出功能已触发，文件将开始下载');
    // 实际应用中这里应该实现真正的数据导出功能
};

// 查看存证信息
const viewCertification = (review) => {
    if (review.certificationInfo) {
        currentCertification.value = review.certificationInfo;
        certificationDialogVisible.value = true;
    } else {
        // 如果未存证，先查看详情
        viewReviewDetail(review);
    }
};

// 复制哈希值
const copyHash = (hash) => {
    navigator.clipboard.writeText(hash)
        .then(() => {
            ElMessage.success('哈希值已复制到剪贴板');
        })
        .catch(() => {
            ElMessage.error('复制失败，请手动复制');
        });
};

// 验证数据
const verifyData = () => {
    ElMessage.success('数据验证成功，内容真实无篡改');
};

// 查看区块浏览器
const viewBlockExplorer = () => {
    window.open(`https://example-blockchain-explorer.com/tx/${currentCertification.value.hash}`, '_blank');
};

onMounted(() => {
    // 模拟加载数据
    loading.value = true;
    setTimeout(() => {
        loading.value = false;
    }, 1000);
});
</script>

<style scoped>
.reviews-container {
    padding: 20px;
}

.page-title {
    margin-bottom: 20px;
    font-weight: 600;
    color: #303133;
}

.card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    padding: 20px;
}

.filter-section {
    margin-bottom: 20px;
}

.filter-form {
    display: flex;
    flex-wrap: wrap;
}

.action-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
}

.review-object {
    display: flex;
    align-items: center;
    gap: 5px;
}

.review-object-type {
    color: #606266;
    font-size: 13px;
}

.pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}

.review-detail {
    padding: 10px;
}

.review-images {
    margin-top: 20px;
}

.review-image {
    width: 120px;
    height: 80px;
    margin-right: 10px;
    margin-bottom: 10px;
    border-radius: 4px;
    cursor: pointer;
}

.certification-info {
    padding: 10px;
}

.hash-text {
    font-family: monospace;
    word-break: break-all;
}

.certification-actions {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 15px;
}

@media (max-width: 768px) {
    .filter-form {
        flex-direction: column;
    }

    .filter-form .el-form-item {
        margin-right: 0;
    }

    .action-bar {
        flex-wrap: wrap;
    }
}
</style>
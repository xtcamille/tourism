<template>
    <div class="attractions-container">
        <h1 class="page-title">乡村旅游景点</h1>

        <!-- 搜索和过滤 -->
        <div class="filter-section card">
            <el-form :inline="true" :model="filterForm" class="filter-form">
                <el-form-item label="景点名称">
                    <el-input v-model="filterForm.name" placeholder="输入景点名称" clearable />
                </el-form-item>
                <el-form-item label="所在地区">
                    <el-select v-model="filterForm.location" placeholder="选择地区" clearable>
                        <el-option v-for="item in locationOptions" :key="item" :label="item" :value="item" />
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

        <!-- 景点列表 -->
        <div class="attractions-list">
            <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="attraction in filteredAttractions"
                    :key="attraction.id">
                    <div class="attraction-card card">
                        <div class="attraction-image">
                            <img :src="attraction.image || 'https://via.placeholder.com/300x200?text=景点图片'" alt="景点图片">
                            <div class="blockchain-badge" v-if="attraction.verified">
                                <el-tooltip content="此景点信息已通过区块链存证，数据真实可靠" placement="top">
                                    <el-icon>
                                        <Lock />
                                    </el-icon> 区块链存证
                                </el-tooltip>
                            </div>
                        </div>
                        <div class="attraction-content">
                            <h3 class="attraction-name">{{ attraction.name }}</h3>
                            <div class="attraction-location">
                                <el-icon>
                                    <Location />
                                </el-icon> {{ attraction.location }}
                            </div>
                            <div class="attraction-type">
                                <el-tag size="small" type="success">{{ attraction.type }}</el-tag>
                            </div>
                            <div class="attraction-description">{{ attraction.description }}</div>
                            <div class="attraction-footer">
                                <div class="attraction-price">
                                    <span v-if="attraction.price > 0">¥{{ attraction.price }}</span>
                                    <span v-else>免费</span>
                                </div>
                                <router-link :to="`/attractions/${attraction.id}`" class="view-detail-btn">
                                    查看详情
                                </router-link>
                            </div>
                        </div>
                    </div>
                </el-col>
            </el-row>

            <!-- 分页控制 -->
            <div class="pagination-container">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                    :page-sizes="[8, 16, 24, 32]" :total="total" layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </div>

        <!-- 景点区块链存证信息对话框 -->
        <el-dialog v-model="verificationDialogVisible" title="景点区块链存证信息" width="600px">
            <div v-if="currentVerification" class="verification-info">
                <el-descriptions :column="1" border>
                    <el-descriptions-item label="景点名称">{{ currentVerification.name }}</el-descriptions-item>
                    <el-descriptions-item label="存证时间">{{ currentVerification.timestamp }}</el-descriptions-item>
                    <el-descriptions-item label="存证哈希">
                        <span class="hash-text">{{ currentVerification.hash }}</span>
                        <el-button type="primary" link @click="copyHash(currentVerification.hash)" size="small">
                            <el-icon>
                                <DocumentCopy />
                            </el-icon>
                        </el-button>
                    </el-descriptions-item>
                    <el-descriptions-item label="所在区块">{{ currentVerification.blockNumber }}</el-descriptions-item>
                    <el-descriptions-item label="验证者">{{ currentVerification.validator }}</el-descriptions-item>
                    <el-descriptions-item label="数据指纹">{{ currentVerification.dataFingerprint }}</el-descriptions-item>
                </el-descriptions>

                <div class="verification-actions">
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
    Location, Lock, DocumentCopy, Check, Link
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const attractions = ref([
    {
        id: '1',
        name: '龙山村世外桃源风景区',
        location: '浙江省杭州市',
        type: '乡村风光',
        description: '山清水秀，风景如画，当地农家乐体验丰富多彩，是城市人周末休闲的好去处。',
        price: 60,
        image: 'https://via.placeholder.com/500x300?text=龙山村',
        verified: true,
        verificationInfo: {
            hash: '0x8f5b785d732c5add0eba3c80fc37d20ebc7988a19c9b6180d59c3e2d7272fa21',
            blockNumber: 1256789,
            timestamp: '2023-05-15 14:30:22',
            validator: '节点3',
            dataFingerprint: 'QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgG12'
        }
    },
    {
        id: '2',
        name: '青峰湖农耕文化园',
        location: '江苏省苏州市',
        type: '文化体验',
        description: '集农耕文化展示、农事体验、休闲娱乐于一体的综合性乡村旅游景点。',
        price: 80,
        image: 'https://via.placeholder.com/500x300?text=青峰湖',
        verified: true,
        verificationInfo: {
            hash: '0x3c7b2c2150a48b5b9ff252f498ee08065287ed87f4947e9a3d9764d8873dd233',
            blockNumber: 1256787,
            timestamp: '2023-05-18 09:45:11',
            validator: '节点1',
            dataFingerprint: 'QmT8CeWdN43qrthZnxaTmBHKqjmLnJgS8Bp9ZJFRQAGWgP'
        }
    },
    {
        id: '3',
        name: '五彩田园生态景区',
        location: '安徽省黄山市',
        type: '生态农业',
        description: '四季有景，春赏花，夏采果，秋收获，冬赏雪，全年无休的生态旅游景区。',
        price: 50,
        image: 'https://via.placeholder.com/500x300?text=五彩田园',
        verified: false
    },
    {
        id: '4',
        name: '梅山古村',
        location: '浙江省衢州市',
        type: '古村落',
        description: '有着数百年历史的古村落，保存着大量明清时期的建筑，是研究古代乡村建筑的重要场所。',
        price: 40,
        image: 'https://via.placeholder.com/500x300?text=梅山古村',
        verified: true,
        verificationInfo: {
            hash: '0x1d8f88ae3bdf736c072a9b4dcda680f92a4f0612a4bed70c593f5adb8d5251af',
            blockNumber: 1256786,
            timestamp: '2023-05-20 16:20:35',
            validator: '节点2',
            dataFingerprint: 'QmNLei78zWmzUdbeRB3CiUfAizWUrbeeZh5K1rhAQKCh51'
        }
    },
    {
        id: '5',
        name: '月亮湾渔村',
        location: '福建省福州市',
        type: '渔村体验',
        description: '以渔业文化为特色的乡村旅游点，可以体验捕鱼、品尝海鲜、了解渔村文化。',
        price: 70,
        image: 'https://via.placeholder.com/500x300?text=月亮湾',
        verified: false
    },
    {
        id: '6',
        name: '云雾山茶园',
        location: '安徽省黄山市',
        type: '茶文化',
        description: '高山云雾茶种植基地，可以观赏茶园风光，学习茶叶制作，品尝正宗高山茶。',
        price: 30,
        image: 'https://via.placeholder.com/500x300?text=云雾山',
        verified: true,
        verificationInfo: {
            hash: '0xe56c2f9e5d937cbb231925c7da5399b58f97ef09bca676d2e95770559c0a7764',
            blockNumber: 1256785,
            timestamp: '2023-05-22 10:15:47',
            validator: '节点5',
            dataFingerprint: 'QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqB'
        }
    },
    {
        id: '7',
        name: '桃花源生态园',
        location: '湖南省常德市',
        type: '田园风光',
        description: '现代版"桃花源记"，远离城市喧嚣，回归自然，感受诗意田园生活。',
        price: 45,
        image: 'https://via.placeholder.com/500x300?text=桃花源',
        verified: false
    },
    {
        id: '8',
        name: '红枫农场',
        location: '浙江省杭州市',
        type: '农场体验',
        description: '四季有景，春赏花，夏纳凉，秋赏枫，冬赏雪，还可以体验农场种植和收获的乐趣。',
        price: 65,
        image: 'https://via.placeholder.com/500x300?text=红枫农场',
        verified: true,
        verificationInfo: {
            hash: '0x6a98b2e0ccd139342a38d9b423ccf8eb790bbc7950f0e429018b2c5d752504c0',
            blockNumber: 1256788,
            timestamp: '2023-05-24 13:40:18',
            validator: '节点4',
            dataFingerprint: 'QmZF1ytCBXXJgCnALR23NeJRLhVNGN7YQPk2QZtE1nz6Cv'
        }
    }
]);

// 过滤和分页
const filterForm = reactive({
    name: '',
    location: '',
    status: ''
});

const locationOptions = computed(() => {
    const locations = Array.from(new Set(attractions.value.map(item => item.location)));
    return locations;
});

const currentPage = ref(1);
const pageSize = ref(8);
const total = computed(() => filteredAttractions.value.length);

const filteredAttractions = computed(() => {
    let result = [...attractions.value];

    // 应用名称过滤
    if (filterForm.name) {
        result = result.filter(item =>
            item.name.toLowerCase().includes(filterForm.name.toLowerCase())
        );
    }

    // 应用地区过滤
    if (filterForm.location) {
        result = result.filter(item => item.location === filterForm.location);
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

// 区块链存证信息
const verificationDialogVisible = ref(false);
const currentVerification = ref(null);

// 搜索和重置
const handleSearch = () => {
    currentPage.value = 1;
};

const resetFilters = () => {
    filterForm.name = '';
    filterForm.location = '';
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

// 查看存证信息
const viewVerification = (attraction) => {
    currentVerification.value = attraction.verificationInfo;
    verificationDialogVisible.value = true;
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
    window.open(`https://example-blockchain-explorer.com/tx/${currentVerification.value.hash}`, '_blank');
};

onMounted(() => {
    // 可以在这里加载数据
});
</script>

<style scoped>
.attractions-container {
    padding: 20px;
}

.card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.filter-section {
    padding: 20px;
    margin-bottom: 20px;
}

.filter-form {
    display: flex;
    flex-wrap: wrap;
}

.attractions-list {
    margin-top: 20px;
}

.attraction-card {
    height: 100%;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    overflow: hidden;
}

.attraction-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.attraction-image {
    height: 200px;
    position: relative;
    overflow: hidden;
}

.attraction-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.attraction-card:hover .attraction-image img {
    transform: scale(1.05);
}

.blockchain-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 5px;
}

.attraction-content {
    padding: 15px;
}

.attraction-name {
    margin: 0 0 10px 0;
    font-size: 18px;
    color: #303133;
}

.attraction-location {
    color: #606266;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
}

.attraction-type {
    margin-bottom: 10px;
}

.attraction-description {
    color: #606266;
    margin-bottom: 15px;
    font-size: 14px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

.attraction-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
}

.attraction-price {
    font-weight: bold;
    color: #f56c6c;
    font-size: 18px;
}

.view-detail-btn {
    color: #409eff;
    font-weight: 500;
}

.pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding: 10px 0;
}

.verification-info {
    padding: 10px;
}

.hash-text {
    font-family: monospace;
    word-break: break-all;
}

.verification-actions {
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
}
</style>
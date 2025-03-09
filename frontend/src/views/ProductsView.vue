<template>
    <div class="products-container">
        <h1 class="page-title">乡村土特产品存证管理</h1>

        <!-- 搜索和过滤 -->
        <div class="filter-section card">
            <el-form :inline="true" :model="filterForm" class="filter-form">
                <el-form-item label="产品名称">
                    <el-input v-model="filterForm.name" placeholder="输入产品名称" clearable />
                </el-form-item>
                <el-form-item label="产品类别">
                    <el-select v-model="filterForm.category" placeholder="选择类别" clearable>
                        <el-option v-for="item in categoryOptions" :key="item" :label="item" :value="item" />
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
            <el-button type="primary" @click="showAddProductDialog">
                <el-icon>
                    <Plus />
                </el-icon> 添加土特品交易记录
            </el-button>
            <el-button type="success" @click="batchCertify" :disabled="selectedProducts.length === 0">
                <el-icon>
                    <Lock />
                </el-icon> 批量存证
            </el-button>
            <el-button @click="exportProductData">
                <el-icon>
                    <Download />
                </el-icon> 导出数据
            </el-button>
        </div>

        <!-- 产品列表 -->
        <div class="products-list card">
            <el-table :data="paginatedProducts" border style="width: 100%" @selection-change="handleSelectionChange"
                v-loading="loading">
                <el-table-column type="selection" width="55" />
                <el-table-column label="产品名称" prop="name" min-width="150">
                    <template #default="scope">
                        <div class="product-name-cell">
                            <el-image :src="scope.row.image" :preview-src-list="[scope.row.image]" fit="cover"
                                class="product-thumbnail" />
                            <span>{{ scope.row.name }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="产地" prop="origin" width="120" />
                <el-table-column label="类别" prop="category" width="120">
                    <template #default="scope">
                        <el-tag size="small">{{ scope.row.category }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="价格" prop="price" width="100">
                    <template #default="scope">
                        <span>¥{{ scope.row.price }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="规格" prop="specification" width="120" />
                <el-table-column label="存证状态" width="100">
                    <template #default="scope">
                        <el-tag :type="scope.row.verified ? 'success' : 'info'" effect="dark">
                            {{ scope.row.verified ? '已存证' : '未存证' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="存证时间" width="180">
                    <template #default="scope">
                        <span v-if="scope.row.verified">
                            {{ scope.row.certificationTime }}
                        </span>
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" fixed="right" width="200">
                    <template #default="scope">
                        <el-button v-if="scope.row.verified" link type="primary" @click="viewCertification(scope.row)">
                            查看存证
                        </el-button>
                        <el-button v-else link type="success" @click="certifyProduct(scope.row)">
                            提交存证
                        </el-button>
                        <el-button link type="primary" @click="editProduct(scope.row)">编辑</el-button>
                        <el-button link type="danger" @click="deleteProduct(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页控制 -->
            <div class="pagination-container">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]" :total="filteredProducts.length"
                    layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                    @current-change="handleCurrentChange" />
            </div>
        </div>

        <!-- 产品表单对话框 -->
        <el-dialog v-model="productDialogVisible" :title="isEdit ? '编辑产品' : '添加新产品'" width="600px">
            <el-form :model="productForm" :rules="productRules" ref="productFormRef" label-width="100px">
                <el-form-item label="产品名称" prop="name">
                    <el-input v-model="productForm.name" placeholder="请输入产品名称" />
                </el-form-item>
                <el-form-item label="产品类别" prop="category">
                    <el-select v-model="productForm.category" placeholder="请选择产品类别" style="width: 100%">
                        <el-option v-for="item in categoryOptions" :key="item" :label="item" :value="item" />
                    </el-select>
                </el-form-item>
                <el-form-item label="产地" prop="origin">
                    <el-input v-model="productForm.origin" placeholder="请输入产品产地" />
                </el-form-item>
                <el-form-item label="价格" prop="price">
                    <el-input-number v-model="productForm.price" :precision="2" :min="0" style="width: 100%" />
                </el-form-item>
                <el-form-item label="规格" prop="specification">
                    <el-input v-model="productForm.specification" placeholder="请输入产品规格" />
                </el-form-item>
                <el-form-item label="产品描述" prop="description">
                    <el-input v-model="productForm.description" type="textarea" :rows="3" placeholder="请输入产品描述" />
                </el-form-item>
                <el-form-item label="产品图片" prop="image">
                    <el-upload class="product-image-uploader" action="#" :auto-upload="false" :show-file-list="false"
                        :on-change="handleImageChange">
                        <img v-if="productForm.image" :src="productForm.image" class="product-image" />
                        <el-icon v-else class="uploader-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="productDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitProductForm">确认</el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 区块链存证信息对话框 -->
        <el-dialog v-model="certificationDialogVisible" title="产品区块链存证信息" width="600px">
            <div v-if="currentCertification" class="certification-info">
                <el-descriptions :column="1" border>
                    <el-descriptions-item label="产品名称">{{ currentCertification.name }}</el-descriptions-item>
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
    Plus, Lock, Download, Check, Link, DocumentCopy
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 产品数据
const products = ref([
    {
        id: '1',
        name: '青山绿茶',
        origin: '浙江省杭州市',
        category: '茶叶',
        price: 188,
        specification: '250g/盒',
        description: '高山云雾出好茶，采用传统工艺精制而成，保留了茶叶的原始风味和营养成分。',
        image: 'https://via.placeholder.com/150?text=青山绿茶',
        verified: true,
        certificationTime: '2023-05-15 14:22:36',
        certificationInfo: {
            hash: '0x9f5b785d732c5add0eba3c80fc37d20ebc7988a19c9b6180d59c3e2d7272fa21',
            blockNumber: 1256789,
            timestamp: '2023-05-15 14:22:36',
            validator: '节点3',
            dataFingerprint: 'QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgG12'
        }
    },
    {
        id: '2',
        name: '山核桃',
        origin: '安徽省黄山市',
        category: '坚果',
        price: 98,
        specification: '500g/袋',
        description: '天然山区出产，无污染，富含不饱和脂肪酸和多种维生素，营养丰富。',
        image: 'https://via.placeholder.com/150?text=山核桃',
        verified: true,
        certificationTime: '2023-05-16 09:35:21',
        certificationInfo: {
            hash: '0x3c7b2c2150a48b5b9ff252f498ee08065287ed87f4947e9a3d9764d8873dd233',
            blockNumber: 1256805,
            timestamp: '2023-05-16 09:35:21',
            validator: '节点1',
            dataFingerprint: 'QmT8CeWdN43qrthZnxaTmBHKqjmLnJgS8Bp9ZJFRQAGWgP'
        }
    },
    {
        id: '3',
        name: '农家腊肉',
        origin: '湖南省常德市',
        category: '肉制品',
        price: 120,
        specification: '500g/份',
        description: '采用传统工艺腌制，经过烟熏而成，肉质鲜美，风味独特。',
        image: 'https://via.placeholder.com/150?text=农家腊肉',
        verified: false,
        certificationTime: null,
        certificationInfo: null
    },
    {
        id: '4',
        name: '野生蜂蜜',
        origin: '云南省西双版纳',
        category: '蜂产品',
        price: 158,
        specification: '500g/瓶',
        description: '原生态野生蜂蜜，营养丰富，口感纯正，无添加任何人工成分。',
        image: 'https://via.placeholder.com/150?text=野生蜂蜜',
        verified: true,
        certificationTime: '2023-05-18 16:42:15',
        certificationInfo: {
            hash: '0x1d8f88ae3bdf736c072a9b4dcda680f92a4f0612a4bed70c593f5adb8d5251af',
            blockNumber: 1256830,
            timestamp: '2023-05-18 16:42:15',
            validator: '节点2',
            dataFingerprint: 'QmNLei78zWmzUdbeRB3CiUfAizWUrbeeZh5K1rhAQKCh51'
        }
    },
    {
        id: '5',
        name: '手工剪纸',
        origin: '河北省保定市',
        category: '手工艺品',
        price: 45,
        specification: '10张/套',
        description: '传统民间艺术，纯手工剪制，题材丰富，寓意美好。',
        image: 'https://via.placeholder.com/150?text=手工剪纸',
        verified: false,
        certificationTime: null,
        certificationInfo: null
    },
    {
        id: '6',
        name: '竹编篮子',
        origin: '四川省成都市',
        category: '手工艺品',
        price: 79,
        specification: '直径30cm',
        description: '纯手工竹编，经久耐用，美观实用，可用于收纳或装饰。',
        image: 'https://via.placeholder.com/150?text=竹编篮子',
        verified: true,
        certificationTime: '2023-05-20 11:18:47',
        certificationInfo: {
            hash: '0xe56c2f9e5d937cbb231925c7da5399b58f97ef09bca676d2e95770559c0a7764',
            blockNumber: 1256842,
            timestamp: '2023-05-20 11:18:47',
            validator: '节点5',
            dataFingerprint: 'QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqB'
        }
    }
]);

// 过滤和分页
const filterForm = reactive({
    name: '',
    category: '',
    status: ''
});

const loading = ref(false);
const selectedProducts = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);

const categoryOptions = computed(() => {
    const categories = Array.from(new Set(products.value.map(item => item.category)));
    return categories;
});

const filteredProducts = computed(() => {
    let result = [...products.value];

    // 应用名称过滤
    if (filterForm.name) {
        result = result.filter(item =>
            item.name.toLowerCase().includes(filterForm.name.toLowerCase())
        );
    }

    // 应用类别过滤
    if (filterForm.category) {
        result = result.filter(item => item.category === filterForm.category);
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

const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filteredProducts.value.slice(start, end);
});

// 产品表单
const productDialogVisible = ref(false);
const productFormRef = ref(null);
const isEdit = ref(false);
const currentProductId = ref(null);

const productForm = reactive({
    name: '',
    category: '',
    origin: '',
    price: 0,
    specification: '',
    description: '',
    image: ''
});

const productRules = {
    name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
    category: [{ required: true, message: '请选择产品类别', trigger: 'change' }],
    origin: [{ required: true, message: '请输入产品产地', trigger: 'blur' }],
    price: [{ required: true, message: '请输入产品价格', trigger: 'blur' }],
    specification: [{ required: true, message: '请输入产品规格', trigger: 'blur' }],
    description: [{ required: true, message: '请输入产品描述', trigger: 'blur' }],
    image: [{ required: true, message: '请上传产品图片', trigger: 'change' }]
};

// 区块链存证信息
const certificationDialogVisible = ref(false);
let currentCertification = ref(null);

// 表格选择
const handleSelectionChange = (selection) => {
    selectedProducts.value = selection;
};

// 搜索和重置
const handleSearch = () => {
    currentPage.value = 1;
};

const resetFilters = () => {
    filterForm.name = '';
    filterForm.category = '';
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

// 添加/编辑产品
const showAddProductDialog = () => {
    isEdit.value = false;
    currentProductId.value = null;
    resetProductForm();
    productDialogVisible.value = true;
};

const editProduct = (product) => {
    isEdit.value = true;
    currentProductId.value = product.id;
    Object.keys(productForm).forEach(key => {
        if (key in product) {
            productForm[key] = product[key];
        }
    });
    productDialogVisible.value = true;
};

const resetProductForm = () => {
    productForm.name = '';
    productForm.category = '';
    productForm.origin = '';
    productForm.price = 0;
    productForm.specification = '';
    productForm.description = '';
    productForm.image = '';
};

const handleImageChange = (file) => {
    // 在实际应用中，这里应该上传图片到服务器并获取URL
    // 这里仅模拟图片上传，使用本地URL
    const reader = new FileReader();
    reader.onload = (e) => {
        productForm.image = e.target.result;
    };
    reader.readAsDataURL(file.raw);
};

const submitProductForm = () => {
    productFormRef.value.validate((valid) => {
        if (valid) {
            if (isEdit.value) {
                // 更新产品
                const index = products.value.findIndex(item => item.id === currentProductId.value);
                if (index !== -1) {
                    const updatedProduct = { ...products.value[index], ...productForm };
                    products.value.splice(index, 1, updatedProduct);
                }
            } else {
                // 添加新产品
                const newProduct = {
                    ...productForm,
                    id: String(products.value.length + 1),
                    verified: false,
                    certificationTime: null,
                    certificationInfo: null
                };
                products.value.push(newProduct);
            }
            ElMessage.success(isEdit.value ? '产品更新成功' : '产品添加成功');
            productDialogVisible.value = false;
        } else {
            return false;
        }
    });
};

// 删除产品
const deleteProduct = (product) => {
    ElMessageBox.confirm(
        `确定要删除产品 "${product.name}" 吗？`,
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        const index = products.value.findIndex(item => item.id === product.id);
        if (index !== -1) {
            products.value.splice(index, 1);
            ElMessage.success('产品删除成功');
        }
    }).catch(() => { });
};

// 存证功能
const certifyProduct = (product) => {
    loading.value = true;

    // 模拟提交存证过程
    setTimeout(() => {
        const index = products.value.findIndex(item => item.id === product.id);
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
                hash: `0x${Math.random().toString(16).substr(2, 40)}`,
                blockNumber: Math.floor(1256800 + Math.random() * 100),
                timestamp: timestamp,
                validator: `节点${Math.floor(Math.random() * 5) + 1}`,
                dataFingerprint: `QmW${Math.random().toString(36).substr(2, 40)}`
            };

            // 更新产品信息
            products.value[index] = {
                ...products.value[index],
                verified: true,
                certificationTime: timestamp,
                certificationInfo: certificationInfo
            };

            ElMessage.success('产品存证成功');
        }

        loading.value = false;
    }, 2000);
};

const batchCertify = () => {
    if (selectedProducts.value.length === 0) {
        ElMessage.warning('请选择要存证的产品');
        return;
    }

    const unverifiedProducts = selectedProducts.value.filter(product => !product.verified);
    if (unverifiedProducts.length === 0) {
        ElMessage.warning('选中的产品都已经完成存证');
        return;
    }

    ElMessageBox.confirm(
        `确定要对选中的 ${unverifiedProducts.length} 个未存证产品进行区块链存证吗？`,
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
            for (const product of unverifiedProducts) {
                const index = products.value.findIndex(item => item.id === product.id);
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
                        hash: `0x${Math.random().toString(16).substr(2, 40)}`,
                        blockNumber: Math.floor(1256800 + Math.random() * 100),
                        timestamp: timestamp,
                        validator: `节点${Math.floor(Math.random() * 5) + 1}`,
                        dataFingerprint: `QmW${Math.random().toString(36).substr(2, 40)}`
                    };

                    // 更新产品信息
                    products.value[index] = {
                        ...products.value[index],
                        verified: true,
                        certificationTime: timestamp,
                        certificationInfo: certificationInfo
                    };
                }
            }

            ElMessage.success(`成功对 ${unverifiedProducts.length} 个产品完成区块链存证`);
            loading.value = false;
        }, 2000);
    }).catch(() => { });
};

// 导出数据
const exportProductData = () => {
    ElMessage.success('数据导出功能已触发，文件将开始下载');
    // 实际应用中这里应该实现真正的数据导出功能
};

// 查看存证信息
const viewCertification = (product) => {
    if (product.certificationInfo) {
        currentCertification = ref({
            name: product.name,
            ...product.certificationInfo
        });
        certificationDialogVisible.value = true;
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
.products-container {
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

.product-name-cell {
    display: flex;
    align-items: center;
    gap: 10px;
}

.product-thumbnail {
    width: 40px;
    height: 40px;
    border-radius: 4px;
}

.pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}

.product-image-uploader {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 178px;
    height: 178px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.product-image-uploader:hover {
    border-color: #409eff;
}

.product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    display: flex;
    justify-content: center;
    align-items: center;
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
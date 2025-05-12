<template>
    <div class="transactions-container">
        <h1 class="page-title">交易审核管理</h1>
        <!-- 交易审核内容 -->
        <el-table :data="transactions" border style="width: 100%">
            <el-table-column label="交易ID" prop="id" />
            <el-table-column label="交易类型" prop="type" />
            <el-table-column label="交易状态" prop="status" />
            <el-table-column label="交易时间" prop="timestamp" />
            <el-table-column label="操作" width="150">
                <template #default="scope">
                    <el-button type="primary" @click="viewTransaction(scope.row)">查看</el-button>
                    <el-button type="danger" @click="deleteTransaction(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const transactions = ref([
    // 示例交易数据
    { id: '1', type: '产品交易', status: '待审核', timestamp: '2025-04-01 10:00:00' },
    { id: '2', type: '门票交易', status: '已审核', timestamp: '2025-04-02 11:00:00' },
]);

const viewTransaction = (transaction) => {
    // 查看交易的逻辑
};

const deleteTransaction = (transaction) => {
    // 删除交易的逻辑
};
</script>

<style scoped>
.transactions-container {
    padding: 20px;
}

.page-title {
    margin-bottom: 20px;
    font-weight: 600;
    color: #303133;
}
</style>
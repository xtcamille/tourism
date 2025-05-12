<template>
    <div class="node-status-container">
        <h1 class="page-title">区块链节点状态监控</h1>

        <!-- 节点状态概览 -->
        <div class="status-overview">
            <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :md="6">
                    <div class="status-card card">
                        <div class="card-icon running">
                            <el-icon>
                                <CPU />
                            </el-icon>
                        </div>
                        <div class="card-content">
                            <div class="card-title">在线节点</div>
                            <div class="card-value">{{ nodeStats.online }}/{{ nodeStats.total }}</div>
                        </div>
                    </div>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                    <div class="status-card card">
                        <div class="card-icon sync">
                            <el-icon>
                                <Connection />
                            </el-icon>
                        </div>
                        <div class="card-content">
                            <div class="card-title">当前区块高度</div>
                            <div class="card-value">{{ nodeStats.currentBlock }}</div>
                        </div>
                    </div>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                    <div class="status-card card">
                        <div class="card-icon transaction">
                            <el-icon>
                                <Tickets />
                            </el-icon>
                        </div>
                        <div class="card-content">
                            <div class="card-title">今日交易数</div>
                            <div class="card-value">{{ nodeStats.todayTransactions }}</div>
                        </div>
                    </div>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                    <div class="status-card card">
                        <div class="card-icon peers">
                            <el-icon>
                                <Share />
                            </el-icon>
                        </div>
                        <div class="card-content">
                            <div class="card-title">共识节点数</div>
                            <div class="card-value">{{ nodeStats.consensusNodes }}</div>
                        </div>
                    </div>
                </el-col>
            </el-row>
        </div>

        <!-- 节点运行状态图表 -->
        <div class="status-chart card">
            <div class="chart-header">
                <h3>节点性能监控</h3>
                <el-radio-group v-model="chartTimeRange" size="small">
                    <el-radio-button label="hour">1小时</el-radio-button>
                    <el-radio-button label="day">24小时</el-radio-button>
                    <el-radio-button label="week">7天</el-radio-button>
                </el-radio-group>
            </div>
            <div class="chart-container" ref="cpuChartContainer"></div>
        </div>

        <!-- 节点列表 -->
        <div class="nodes-list card">
            <div class="list-header">
                <h3>节点列表</h3>
                <div class="list-actions">
                    <el-button type="primary" plain size="small" @click="refreshNodeList">
                        <el-icon>
                            <RefreshRight />
                        </el-icon> 刷新
                    </el-button>
                </div>
            </div>
            <el-table :data="nodesList" border style="width: 100%" v-loading="loading">
                <el-table-column label="节点ID" prop="id" width="80" />
                <el-table-column label="节点名称" prop="name" min-width="120" />
                <el-table-column label="IP地址" prop="ip" width="150" />
                <el-table-column label="状态" width="100">
                    <template #default="scope">
                        <el-tag :type="getStatusType(scope.row.status)">
                            {{ getStatusText(scope.row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="区块高度" prop="blockHeight" width="120" />
                <el-table-column label="节点版本" prop="version" width="120" />
                <el-table-column label="角色" width="100">
                    <template #default="scope">
                        <el-tag :type="scope.row.role === 'consensus' ? 'success' : 'info'" effect="plain">
                            {{ scope.row.role === 'consensus' ? '共识节点' : '普通节点' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="CPU使用率" width="120">
                    <template #default="scope">
                        <el-progress :percentage="scope.row.cpuUsage" :status="getCpuStatus(scope.row.cpuUsage)" />
                    </template>
                </el-table-column>
                <el-table-column label="内存使用率" width="120">
                    <template #default="scope">
                        <el-progress :percentage="scope.row.memoryUsage"
                            :status="getMemoryStatus(scope.row.memoryUsage)" />
                    </template>
                </el-table-column>
                <el-table-column label="上线时间" prop="uptime" width="180" />
                <el-table-column label="操作" fixed="right" width="120">
                    <template #default="scope">
                        <el-button link type="primary" @click="viewNodeDetail(scope.row)">详情</el-button>
                        <el-button v-if="scope.row.status === 'running'" link type="danger"
                            @click="restartNode(scope.row)">
                            重启
                        </el-button>
                        <el-button v-if="scope.row.status === 'stopped'" link type="success"
                            @click="startNode(scope.row)">
                            启动
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 节点详情对话框 -->
        <el-dialog v-model="nodeDetailDialogVisible" title="节点详细信息" width="800px">
            <div v-if="currentNode" class="node-detail">
                <el-tabs>
                    <el-tab-pane label="基本信息">
                        <el-descriptions :column="2" border>
                            <el-descriptions-item label="节点ID">{{ currentNode.id }}</el-descriptions-item>
                            <el-descriptions-item label="节点名称">{{ currentNode.name }}</el-descriptions-item>
                            <el-descriptions-item label="IP地址">{{ currentNode.ip }}</el-descriptions-item>
                            <el-descriptions-item label="端口">{{ currentNode.port }}</el-descriptions-item>
                            <el-descriptions-item label="状态">
                                <el-tag :type="getStatusType(currentNode.status)">
                                    {{ getStatusText(currentNode.status) }}
                                </el-tag>
                            </el-descriptions-item>
                            <el-descriptions-item label="节点角色">
                                <el-tag :type="currentNode.role === 'consensus' ? 'success' : 'info'" effect="plain">
                                    {{ currentNode.role === 'consensus' ? '共识节点' : '普通节点' }}
                                </el-tag>
                            </el-descriptions-item>
                            <el-descriptions-item label="区块高度">{{ currentNode.blockHeight }}</el-descriptions-item>
                            <el-descriptions-item label="连接节点数">{{ currentNode.peerCount }}</el-descriptions-item>
                            <el-descriptions-item label="节点版本">{{ currentNode.version }}</el-descriptions-item>
                            <el-descriptions-item label="操作系统">{{ currentNode.os }}</el-descriptions-item>
                            <el-descriptions-item label="上线时间">{{ currentNode.uptime }}</el-descriptions-item>
                            <el-descriptions-item label="最后心跳">{{ currentNode.lastHeartbeat }}</el-descriptions-item>
                        </el-descriptions>
                    </el-tab-pane>
                    <el-tab-pane label="性能指标">
                        <div class="performance-metrics">
                            <div class="metric-item">
                                <div class="metric-label">CPU使用率</div>
                                <el-progress :percentage="currentNode.cpuUsage"
                                    :status="getCpuStatus(currentNode.cpuUsage)" :stroke-width="18" />
                            </div>
                            <div class="metric-item">
                                <div class="metric-label">内存使用率</div>
                                <el-progress :percentage="currentNode.memoryUsage"
                                    :status="getMemoryStatus(currentNode.memoryUsage)" :stroke-width="18" />
                            </div>
                            <div class="metric-item">
                                <div class="metric-label">磁盘使用率</div>
                                <el-progress :percentage="currentNode.diskUsage"
                                    :status="getDiskStatus(currentNode.diskUsage)" :stroke-width="18" />
                            </div>
                            <div class="metric-item">
                                <div class="metric-label">网络带宽使用</div>
                                <div class="network-stats">
                                    <div>
                                        <strong>上行：</strong> {{ currentNode.networkStats.upload }} MB/s
                                    </div>
                                    <div>
                                        <strong>下行：</strong> {{ currentNode.networkStats.download }} MB/s
                                    </div>
                                </div>
                            </div>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="日志信息">
                        <div class="node-logs">
                            <el-input type="textarea" :rows="10" placeholder="节点日志加载中..." v-model="nodeLogs" readonly />
                            <div class="logs-actions">
                                <el-button type="primary" @click="refreshLogs">刷新日志</el-button>
                                <el-button @click="downloadLogs">下载完整日志</el-button>
                            </div>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';
import {
    CPU, Connection, Tickets, Share, RefreshRight
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as echarts from 'echarts';

const loading = ref(false);
const chartTimeRange = ref('hour');
let cpuChart = null;

// 节点统计数据
const nodeStats = reactive({
    total: 8,
    online: 7,
    currentBlock: 1257842,
    todayTransactions: 356,
    consensusNodes: 5
});

// 节点列表数据
const nodesList = ref([
    {
        id: '1',
        name: '节点1',
        ip: '192.168.1.101',
        port: 8545,
        status: 'running',
        blockHeight: 1257842,
        version: 'v1.2.3',
        role: 'consensus',
        cpuUsage: 32,
        memoryUsage: 45,
        diskUsage: 38,
        uptime: '7天15小时25分钟',
        lastHeartbeat: '2025-03-26 14:25:36',
        os: 'Ubuntu 20.04',
        peerCount: 7,
        networkStats: {
            upload: 0.5,
            download: 1.2
        }
    },
    {
        id: '2',
        name: '节点2',
        ip: '192.168.1.102',
        port: 8545,
        status: 'running',
        blockHeight: 1257842,
        version: 'v1.2.3',
        role: 'consensus',
        cpuUsage: 28,
        memoryUsage: 40,
        diskUsage: 42,
        uptime: '15天8小时12分钟',
        lastHeartbeat: '2025-03-26 14:25:41',
        os: 'CentOS 8',
        peerCount: 6,
        networkStats: {
            upload: 0.3,
            download: 0.9
        }
    },
    {
        id: '3',
        name: '节点3',
        ip: '192.168.1.103',
        port: 8545,
        status: 'running',
        blockHeight: 1257842,
        version: 'v1.2.3',
        role: 'consensus',
        cpuUsage: 45,
        memoryUsage: 60,
        diskUsage: 55,
        uptime: '5天20小时45分钟',
        lastHeartbeat: '2025-03-26 14:25:33',
        os: 'Ubuntu 22.04',
        peerCount: 7,
        networkStats: {
            upload: 0.7,
            download: 1.5
        }
    },
    {
        id: '4',
        name: '节点4',
        ip: '192.168.1.104',
        port: 8545,
        status: 'running',
        blockHeight: 1257841,
        version: 'v1.2.3',
        role: 'regular',
        cpuUsage: 22,
        memoryUsage: 35,
        diskUsage: 30,
        uptime: '3天11小时20分钟',
        lastHeartbeat: '2025-03-26 14:25:22',
        os: 'Debian 11',
        peerCount: 5,
        networkStats: {
            upload: 0.4,
            download: 0.8
        }
    },
    {
        id: '5',
        name: '节点5',
        ip: '192.168.1.105',
        port: 8545,
        status: 'running',
        blockHeight: 1257842,
        version: 'v1.2.3',
        role: 'consensus',
        cpuUsage: 38,
        memoryUsage: 50,
        diskUsage: 48,
        uptime: '10天5小时15分钟',
        lastHeartbeat: '2025-03-26 14:25:28',
        os: 'CentOS 7',
        peerCount: 7,
        networkStats: {
            upload: 0.6,
            download: 1.3
        }
    },
    {
        id: '6',
        name: '节点6',
        ip: '192.168.1.106',
        port: 8545,
        status: 'running',
        blockHeight: 1257842,
        version: 'v1.2.3',
        role: 'consensus',
        cpuUsage: 27,
        memoryUsage: 42,
        diskUsage: 37,
        uptime: '8天18小时30分钟',
        lastHeartbeat: '2025-03-26 14:25:37',
        os: 'Ubuntu 20.04',
        peerCount: 6,
        networkStats: {
            upload: 0.5,
            download: 1.1
        }
    },
    {
        id: '7',
        name: '节点7',
        ip: '192.168.1.107',
        port: 8545,
        status: 'stopped',
        blockHeight: 1257800,
        version: 'v1.2.3',
        role: 'regular',
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 35,
        uptime: '-',
        lastHeartbeat: '2025-03-26 10:15:42',
        os: 'Debian 10',
        peerCount: 0,
        networkStats: {
            upload: 0,
            download: 0
        }
    },
    {
        id: '8',
        name: '节点8',
        ip: '192.168.1.108',
        port: 8545,
        status: 'syncing',
        blockHeight: 1257820,
        version: 'v1.2.3',
        role: 'regular',
        cpuUsage: 75,
        memoryUsage: 68,
        diskUsage: 45,
        uptime: '1小时20分钟',
        lastHeartbeat: '2025-03-26 14:25:39',
        os: 'Ubuntu 20.04',
        peerCount: 5,
        networkStats: {
            upload: 1.2,
            download: 2.5
        }
    }
]);

// 节点详情
const nodeDetailDialogVisible = ref(false);
const currentNode = ref(null);
const nodeLogs = ref('');
const cpuChartContainer = ref(null);

// 获取状态文本和颜色
const getStatusText = (status) => {
    const statusMap = {
        'running': '正常',
        'stopped': '停止',
        'syncing': '同步中',
        'error': '错误'
    };
    return statusMap[status] || status;
};

const getStatusType = (status) => {
    const typeMap = {
        'running': 'success',
        'stopped': 'danger',
        'syncing': 'warning',
        'error': 'danger'
    };
    return typeMap[status] || 'info';
};

// 获取资源使用状态
const getCpuStatus = (usage) => {
    if (usage >= 80) return 'exception';
    if (usage >= 60) return 'warning';
    return 'success';
};

const getMemoryStatus = (usage) => {
    if (usage >= 80) return 'exception';
    if (usage >= 60) return 'warning';
    return 'success';
};

const getDiskStatus = (usage) => {
    if (usage >= 90) return 'exception';
    if (usage >= 70) return 'warning';
    return 'success';
};

// 刷新节点列表
const refreshNodeList = () => {
    loading.value = true;
    setTimeout(() => {
        // 模拟数据更新
        nodesList.value.forEach(node => {
            if (node.status === 'running' || node.status === 'syncing') {
                node.cpuUsage = Math.floor(Math.random() * 30) + (node.status === 'syncing' ? 50 : 20);
                node.memoryUsage = Math.floor(Math.random() * 30) + (node.status === 'syncing' ? 50 : 30);
                node.blockHeight = nodeStats.currentBlock;
            }
        });
        loading.value = false;
        ElMessage.success('节点数据已更新');
    }, 1000);
};

// 查看节点详情
const viewNodeDetail = (node) => {
    currentNode.value = node;
    nodeDetailDialogVisible.value = true;
    nodeLogs.value = '加载中...';

    // 模拟日志加载
    setTimeout(() => {
        // 生成假日志数据
        const logEntries = [];
        const date = new Date();
        for (let i = 0; i < 20; i++) {
            const minutes = i * 5;
            date.setMinutes(date.getMinutes() - 5);
            const timestamp = date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).replace(/\//g, '-');

            const logTypes = ['INFO', 'DEBUG', 'WARN', 'INFO', 'INFO'];
            const logType = logTypes[Math.floor(Math.random() * logTypes.length)];

            const logMessages = [
                '处理新区块 #' + (nodeStats.currentBlock - i),
                '与节点通信成功，同步状态检查',
                '共识轮次完成，选举新验证节点',
                '区块链分叉检测，执行重组操作',
                '交易验证完成，添加到内存池',
                '新的连接请求',
                '处理钱包请求',
                '执行智能合约调用',
                '节点状态心跳更新',
                '区块验证完成，Hash校验通过'
            ];

            const logMessage = logMessages[Math.floor(Math.random() * logMessages.length)];
            logEntries.push(`[${timestamp}] [${logType}] ${logMessage}`);
        }

        nodeLogs.value = logEntries.join('\n');
    }, 800);
};

// 刷新日志
const refreshLogs = () => {
    nodeLogs.value = '加载中...';

    // 模拟日志更新
    setTimeout(() => {
        // 生成新的假日志数据
        const logEntries = [];
        const date = new Date();
        for (let i = 0; i < 20; i++) {
            const minutes = i * 5;
            date.setMinutes(date.getMinutes() - 5);
            const timestamp = date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).replace(/\//g, '-');

            const logTypes = ['INFO', 'DEBUG', 'WARN', 'INFO', 'INFO'];
            const logType = logTypes[Math.floor(Math.random() * logTypes.length)];

            const logMessages = [
                '处理新区块 #' + (nodeStats.currentBlock - i),
                '与节点通信成功，同步状态检查',
                '共识轮次完成，选举新验证节点',
                '区块链分叉检测，执行重组操作',
                '交易验证完成，添加到内存池',
                '新的连接请求',
                '处理钱包请求',
                '执行智能合约调用',
                '节点状态心跳更新',
                '区块验证完成，Hash校验通过'
            ];

            const logMessage = logMessages[Math.floor(Math.random() * logMessages.length)];
            logEntries.push(`[${timestamp}] [${logType}] ${logMessage}`);
        }

        nodeLogs.value = logEntries.join('\n');
        ElMessage.success('日志已更新');
    }, 800);
};

// 下载日志
const downloadLogs = () => {
    ElMessage.success('日志下载已开始');
};

// 重启节点
const restartNode = (node) => {
    ElMessageBox.confirm(
        `确定要重启节点 "${node.name}" 吗？`,
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        loading.value = true;

        // 模拟重启过程
        setTimeout(() => {
            const index = nodesList.value.findIndex(item => item.id === node.id);
            if (index !== -1) {
                // 先将状态设为停止
                nodesList.value[index].status = 'stopped';
                nodesList.value[index].cpuUsage = 0;
                nodesList.value[index].memoryUsage = 0;
                nodesList.value[index].peerCount = 0;
            }

            // 然后将状态恢复为运行中
            setTimeout(() => {
                if (index !== -1) {
                    nodesList.value[index].status = 'running';
                    nodesList.value[index].cpuUsage = Math.floor(Math.random() * 20) + 20;
                    nodesList.value[index].memoryUsage = Math.floor(Math.random() * 20) + 30;
                    nodesList.value[index].blockHeight = nodeStats.currentBlock;
                    nodesList.value[index].peerCount = Math.floor(Math.random() * 3) + 5;

                    // 更新上线时间
                    nodesList.value[index].uptime = '1分钟';
                }
                loading.value = false;
                ElMessage.success(`节点 ${node.name} 已成功重启`);
            }, 2000);
        }, 1000);
    }).catch(() => { });
};

// 启动节点
const startNode = (node) => {
    ElMessageBox.confirm(
        `确定要启动节点 "${node.name}" 吗？`,
        '确认',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info',
        }
    ).then(() => {
        loading.value = true;

        // 模拟启动过程
        setTimeout(() => {
            const index = nodesList.value.findIndex(item => item.id === node.id);
            if (index !== -1) {
                // 先将状态设为同步中
                nodesList.value[index].status = 'syncing';
                nodesList.value[index].cpuUsage = 70;
                nodesList.value[index].memoryUsage = 60;
                nodesList.value[index].peerCount = 3;
                nodesList.value[index].uptime = '1分钟';

                // 然后将状态改为运行中
                setTimeout(() => {
                    nodesList.value[index].status = 'running';
                    nodesList.value[index].cpuUsage = Math.floor(Math.random() * 20) + 20;
                    nodesList.value[index].memoryUsage = Math.floor(Math.random() * 20) + 30;
                    nodesList.value[index].blockHeight = nodeStats.currentBlock;
                    nodesList.value[index].peerCount = Math.floor(Math.random() * 3) + 5;

                    loading.value = false;
                    ElMessage.success(`节点 ${node.name} 已成功启动`);
                }, 3000);
            }
        }, 1000);
    }).catch(() => { });
};

// 初始化图表
const initChart = () => {
    // 确保DOM元素已经加载
    if (cpuChartContainer.value) {
        cpuChart = echarts.init(cpuChartContainer.value);
        updateChart();
    }
};

// 更新图表数据
const updateChart = () => {
    // 生成模拟数据
    const generateTimeData = () => {
        const now = new Date();
        const times = [];
        const data = {
            cpu: [],
            memory: [],
            network: []
        };

        let points = 24; // 默认24小时
        let interval = 60; // 默认每小时一个点

        if (chartTimeRange.value === 'hour') {
            points = 12;
            interval = 5; // 每5分钟一个点
        } else if (chartTimeRange.value === 'week') {
            points = 7;
            interval = 24 * 60; // 每天一个点
        }

        for (let i = points - 1; i >= 0; i--) {
            const time = new Date(now.getTime() - i * interval * 60 * 1000);

            let timeStr;
            if (chartTimeRange.value === 'week') {
                timeStr = time.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
            } else {
                timeStr = time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
            }

            times.push(timeStr);

            // 生成随机数据
            data.cpu.push(Math.floor(Math.random() * 30) + 25);
            data.memory.push(Math.floor(Math.random() * 20) + 35);
            data.network.push(Math.floor(Math.random() * 5) + 1);
        }

        return { times, data };
    };

    const { times, data } = generateTimeData();

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: ['CPU使用率', '内存使用率', '网络流量']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: times
        },
        yAxis: [
            {
                type: 'value',
                name: '使用率(%)',
                min: 0,
                max: 100,
                interval: 20
            },
            {
                type: 'value',
                name: '网络流量(MB/s)',
                min: 0,
                max: 10,
                interval: 2
            }
        ],
        series: [
            {
                name: 'CPU使用率',
                type: 'line',
                smooth: true,
                data: data.cpu
            },
            {
                name: '内存使用率',
                type: 'line',
                smooth: true,
                data: data.memory
            },
            {
                name: '网络流量',
                type: 'line',
                smooth: true,
                yAxisIndex: 1,
                data: data.network
            }
        ]
    };

    cpuChart.setOption(option);
};

// 监听图表时间范围变化
const handleTimeRangeChange = () => {
    updateChart();
};

// 定时更新节点和区块数据
let timerId = null;
const startAutoRefresh = () => {
    timerId = setInterval(() => {
        // 更新区块高度
        nodeStats.currentBlock += 1;
        nodeStats.todayTransactions += Math.floor(Math.random() * 3);

        // 更新在线节点数据
        nodesList.value.forEach(node => {
            if (node.status === 'running') {
                node.blockHeight = nodeStats.currentBlock;
                // 随机小幅度波动CPU和内存使用率
                node.cpuUsage = Math.max(10, Math.min(95, node.cpuUsage + (Math.random() * 10 - 5)));
                node.memoryUsage = Math.max(15, Math.min(90, node.memoryUsage + (Math.random() * 8 - 4)));
            }
        });
    }, 30000); // 每30秒更新一次
};

onMounted(async () => {
    // 初始化并开始自动刷新
    loading.value = true;
    setTimeout(() => {
        loading.value = false;
        nextTick(() => {
            initChart();
        });
    }, 800);

    startAutoRefresh();
});

onUnmounted(() => {
    // 清除定时器和图表
    if (timerId) {
        clearInterval(timerId);
    }

    if (cpuChart) {
        cpuChart.dispose();
        cpuChart = null;
    }
});
</script>

<style scoped>
.node-status-container {
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

.status-overview {
    margin-bottom: 20px;
}

.status-card {
    height: 120px;
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.card-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 20px;
    font-size: 24px;
    color: white;
}

.card-icon.running {
    background-color: #67c23a;
}

.card-icon.sync {
    background-color: #409eff;
}

.card-icon.transaction {
    background-color: #e6a23c;
}

.card-icon.peers {
    background-color: #f56c6c;
}

.card-content {
    flex: 1;
}

.card-title {
    font-size: 14px;
    color: #606266;
    margin-bottom: 5px;
}

.card-value {
    font-size: 24px;
    font-weight: bold;
    color: #303133;
}

.status-chart {
    height: 400px;
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.chart-header h3 {
    margin: 0;
}

.chart-container {
    width: 100%;
    height: 320px;
}

.nodes-list {
    margin-bottom: 20px;
}

.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.list-header h3 {
    margin: 0;
}

.node-detail {
    padding: 10px;
}

.performance-metrics {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 10px;
}

.metric-item {
    margin-bottom: 10px;
}

.metric-label {
    margin-bottom: 5px;
    font-weight: 500;
}

.network-stats {
    display: flex;
    gap: 30px;
    margin-top: 10px;
}

.node-logs {
    padding: 10px;
}

.logs-actions {
    display: flex;
    gap: 10px;
    margin-top: 15px;
    justify-content: flex-end;
}

@media (max-width: 768px) {
    .card-icon {
        width: 50px;
        height: 50px;
        font-size: 20px;
    }

    .card-value {
        font-size: 20px;
    }

    .chart-header,
    .list-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .chart-header h3,
    .list-header h3 {
        margin-bottom: 10px;
    }
}
</style>
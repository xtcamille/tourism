<template>
    <div class="dashboards">
        <h1 class="page-title">总览大屏</h1>
    <div class="data-cards">
      <div class="pie-chart-container">
        <PieChart :data="pieChartData" :options="pieChartOptions" />
      </div>
      <div class="card">
        <h2>当前门票存证数</h2>
        <p>{{ currentData.ticketCertificates }}</p>
      </div>
      <div class="card">
        <h2>当前交易存证数</h2>
        <p>{{ currentData.productTransactions }}</p>
      </div>
      <div class="card">
        <h2>当前评价存证数</h2>
        <p>{{ currentData.reviewRecords }}</p>
      </div>
    </div>
    <div v-if="warningMessage" class="warning">{{ warningMessage }}</div>
    <div class="chart-container">
        <div class="chart-div">
            <h2>近7天数据趋势</h2>
            <LineChart :data="chartData" :options="chartOptions" />
        </div>
        <div class="chart-div">
            <h2>近7天数据趋势</h2>
            <LineChart :data="chartData" :options="chartOptions" />
        </div>        
    </div>
    </div>
</template>

<script>
import { Line, Pie } from 'vue-chartjs'
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    ArcElement, // 确保导入 ArcElement
    CategoryScale,
    LinearScale,
    TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // 导入数据标签插件
import * as echarts from 'echarts'; // 对于 echarts

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    ArcElement, // 注册 ArcElement
    CategoryScale,
    LinearScale,
    TimeScale,
    ChartDataLabels // 注册数据标签插件
)

export default {
    components: {
        LineChart: Line,
        PieChart: Pie
    },
    data() {
        return {
            currentData: {
                blockchainNodes: 5,
                ticketCertificates: 0,
                productTransactions: 0,
                reviewRecords: 0
            },
            warningMessage: '',
            chartData: {
                datasets: [
                    {
                        label: '门票存证',
                        data: [{x: '2025-02-28', y: 310},{x: '2025-03-01', y: 139},{x: '2025-03-02', y: 148},{x: '2025-03-03', y: 332},{x: '2025-03-04', y: 533},{x: '2025-03-05', y: 497},{x: '2025-03-06', y: 371}],
                        borderColor: '#36A2EB',
                        tension: 0.1,
                        fill: false
                    },
                    {
                        label: '交易存证',
                        data: [{x: '2025-02-28', y: 231},{x: '2025-03-01', y: 139},{x: '2025-03-02', y: 148},{x: '2025-03-03', y: 132},{x: '2025-03-04', y: 133},{x: '2025-03-05', y: 397},{x: '2025-03-06', y: 171}],
                        borderColor: '#4BC0C0',
                        tension: 0.1,
                        fill: false
                    },
                    {
                        label: '评价存证',
                        data: [{x: '2025-02-28', y: 344},{x: '2025-03-01', y: 159},{x: '2025-03-02', y: 178},{x: '2025-03-03', y: 132},{x: '2025-03-04', y: 183},{x: '2025-03-05', y: 497},{x: '2025-03-06', y: 271}],
                        borderColor: '#FFCE56',
                        tension: 0.1,
                        fill: false
                    }
                ]
            },
            chartOptions: {
                responsive: true,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            tooltipFormat: 'yyyy-MM-dd'
                        },
                        title: {
                            display: true,
                            text: '日期'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '数量'
                        }
                    }
                }
            },
            pieChartData: {
                labels: ['景区服务部门节点', '景区商家节点', '景区监管部门节点'], // 根据需要调整标签
                datasets: [
                    {
                        label: '区块链节点分布',
                        data: [5,10,4], // 示例数据
                        backgroundColor: ['#36A2EB', '#FF6384','#fab82ad4'], // 饼图颜色
                        hoverOffset: 4
                    }
                ]
            },
            pieChartOptions: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                            return tooltipItem.label + ': ' + tooltipItem.raw;
                            }
                        }
                    },
                    datalabels: {
                        color: '#fff', // 数据标签的颜色
                        formatter: (value, context) => {
                        return value; // 显示数据值
                        }
                    }
                }
            }
        }
    },
    methods: {
        generateFakeDataForLast7Days() {
            const records = [];
            const now = new Date();

            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(now.getDate() - i);

                const ticketCertificates = Math.floor(Math.random() * 150);
                const productTransactions = Math.floor(Math.random() * 150);
                const reviewRecords = Math.floor(Math.random() * 150);
                const warnings = [];

                if (ticketCertificates > 100) {
                    warnings.push(`门票存证超过 100 条`);
                }
                if (productTransactions > 100) {
                    warnings.push(`交易存证超过 100 条`);
                }
                if (reviewRecords > 100) {
                    warnings.push(`评价记录超过 100 条`);
                }

                records.push({
                    date: date.toISOString().split('T')[0],
                    ticketCertificates,
                    productTransactions,
                    reviewRecords,
                    warnings: warnings.length > 0 ? warnings.join(', ') : '无'
                });
            }

            return records;
        },
        updateChartData() {
            const fakeData = this.generateFakeDataForLast7Days();
            this.chartData.datasets[0].data = fakeData.map(record => ({
                x: record.date,
                y: record.ticketCertificates
            }));
            this.chartData.datasets[1].data = fakeData.map(record => ({
                x: record.date,
                y: record.productTransactions
            }));
            this.chartData.datasets[2].data = fakeData.map(record => ({
                x: record.date,
                y: record.reviewRecords
            }));

            // 获取最新数据
            const lastIndex = fakeData.length - 1;
            this.currentData = {
                blockchainNodes: 5, // 假设区块链节点数据为0
                ticketCertificates: fakeData[lastIndex].ticketCertificates,
                productTransactions: fakeData[lastIndex].productTransactions,
                reviewRecords: fakeData[lastIndex].reviewRecords
            };

            // 检查告警
            this.checkForWarnings(fakeData[lastIndex]);
        },
        checkForWarnings(lastRecord) {
            const thresholds = {
                reviewRecords: 100,
                ticketCertificates: 100,
                productTransactions: 100
            };

            const messages = [];
            if (lastRecord.reviewRecords > thresholds.reviewRecords) {
                messages.push(`评价记录超过 ${thresholds.reviewRecords} 条`);
            }
            if (lastRecord.ticketCertificates > thresholds.ticketCertificates) {
                messages.push(`门票存证超过 ${thresholds.ticketCertificates} 条`);
            }
            if (lastRecord.productTransactions > thresholds.productTransactions) {
                messages.push(`商品交易存证超过 ${thresholds.productTransactions} 条`);
            }

            this.warningMessage = messages.join('，');
        },
        updatePieChartData() {
        this.pieChartData.datasets[0].data = [5,14,4];
    }
    },
    mounted() {
        this.updateChartData();
        console.log(this.chartData);
        this.updatePieChartData(); // 更新饼图数据
    },
    watch: {
    // 监视 currentData.blockchainNodes 的变化以更新饼图数据
        'currentData.blockchainNodes': function() {
        this.updatePieChartData();
        }
    },
    
}
</script>

<style scoped>
.dashboards {
    padding: 20px;
}
.warning {
    color: #ff4757;
    font-weight: bold;
    padding: 10px;
    background-color: #ffe4e6;
    border-radius: 4px;
    margin: 15px 0;
}
.dashboard {
  padding: 20px;
}

.data-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  text-align: center;
  height: 100px;  
}

.warning {
  color: #ff4757;
  font-weight: bold;
  padding: 10px;
  background-color: #ffe4e6;
  border-radius: 4px;
  margin: 15px 0;
}

.chart-container {
    margin-top: 20px;
    display: flex;
    align-items:between;
    width: 100%;
}

.chart-div{
    width: 600px;
    height: auto;
}

.pie-chart-container {
  width: 100%; /* 设置饼图容器宽度 */
  height: 220px; /* 设置饼图容器高度 */
  display: flex; /* 使用 Flexbox 布局 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  background-color: #f9f9f9; /* 背景颜色 */
  border-radius: 8px; /* 圆角 */
  padding: 20px; /* 内边距 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* 阴影效果 */
}
</style>
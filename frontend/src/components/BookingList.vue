<template>
  <div class="booking-list">
    <el-empty 
      v-if="bookings.length === 0" 
      description="暂无预订记录" 
    />
    
    <div v-else>
      <div v-for="booking in bookings" :key="booking.id" class="booking-card">
        <div class="booking-header">
          <h3 class="attraction-name">{{ booking.attractionName }}</h3>
          <el-tag :type="getStatusType(booking.status)">{{ getStatusText(booking.status) }}</el-tag>
        </div>
        
        <div class="booking-details">
          <div class="info-item">
            <span class="info-label">预订编号:</span>
            <span class="info-value">{{ booking.id }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">游览日期:</span>
            <span class="info-value">{{ booking.date }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">人数:</span>
            <span class="info-value">{{ booking.quantity }}人</span>
          </div>
          <div class="info-item">
            <span class="info-label">总价:</span>
            <span class="info-value price">¥{{ booking.totalPrice }}</span>
          </div>
        </div>
        
        <div class="booking-actions">
          <router-link 
            :to="`/attractions/${booking.attractionId}`" 
            class="view-attraction"
          >
            查看景点
          </router-link>
          
          <el-button 
            v-if="booking.status === 'pending' || booking.status === 'confirmed'" 
            type="danger" 
            plain
            size="small"
            @click="$emit('cancel', booking.id)"
          >
            取消预订
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  bookings: {
    type: Array,
    required: true
  }
});

defineEmits(['cancel']);

// 获取状态标签类型
const getStatusType = (status) => {
  switch(status) {
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
  switch(status) {
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
</script>

<style scoped>
.booking-list {
  padding: 20px 0;
}

.booking-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.booking-card:hover {
  transform: translateY(-3px);
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.attraction-name {
  font-size: 18px;
  margin: 0;
}

.booking-details {
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.info-value {
  font-size: 16px;
  color: #303133;
}

.info-value.price {
  font-weight: bold;
  color: #f56c6c;
}

.booking-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 15px;
  border-top: 1px solid #ebeef5;
  padding-top: 15px;
  margin-top: 10px;
}

.view-attraction {
  color: #409eff;
}
</style> 
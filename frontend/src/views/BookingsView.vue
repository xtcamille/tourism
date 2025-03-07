<template>
  <div class="bookings-container container">
    <h1 class="page-title">我的预订</h1>
    
    <el-tabs v-model="activeTab" class="booking-tabs">
      <el-tab-pane label="全部预订" name="all">
        <booking-list :bookings="bookings" @cancel="handleCancelBooking" />
      </el-tab-pane>
      <el-tab-pane label="待游览" name="pending">
        <booking-list :bookings="pendingBookings" @cancel="handleCancelBooking" />
      </el-tab-pane>
      <el-tab-pane label="已完成" name="completed">
        <booking-list :bookings="completedBookings" @cancel="handleCancelBooking" />
      </el-tab-pane>
      <el-tab-pane label="已取消" name="cancelled">
        <booking-list :bookings="cancelledBookings" @cancel="handleCancelBooking" />
      </el-tab-pane>
    </el-tabs>
    
    <!-- 取消预订确认对话框 -->
    <el-dialog
      v-model="cancelDialogVisible"
      title="取消预订"
      width="30%"
    >
      <p>您确定要取消这个预订吗？</p>
      <p class="cancel-note">
        <el-icon><InfoFilled /></el-icon> 提前24小时取消可获得全额退款。
      </p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelDialogVisible = false">返回</el-button>
          <el-button type="danger" @click="confirmCancelBooking" :loading="cancelLoading">
            确认取消
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { InfoFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useBookingsStore } from '../stores/bookings';
import BookingList from '../components/BookingList.vue';

const bookingsStore = useBookingsStore();
const activeTab = ref('all');
const cancelDialogVisible = ref(false);
const currentBookingId = ref(null);
const cancelLoading = ref(false);

// 根据状态筛选预订
const bookings = computed(() => bookingsStore.bookings);

const pendingBookings = computed(() => {
  return bookingsStore.bookings.filter(booking => 
    booking.status === 'pending' || booking.status === 'confirmed'
  );
});

const completedBookings = computed(() => {
  return bookingsStore.bookings.filter(booking => booking.status === 'completed');
});

const cancelledBookings = computed(() => {
  return bookingsStore.bookings.filter(booking => booking.status === 'cancelled');
});

// 处理取消预订
const handleCancelBooking = (bookingId) => {
  currentBookingId.value = bookingId;
  cancelDialogVisible.value = true;
};

// 确认取消预订
const confirmCancelBooking = async () => {
  if (!currentBookingId.value) return;
  
  cancelLoading.value = true;
  try {
    await bookingsStore.cancelBooking(currentBookingId.value);
    ElMessage.success('预订已成功取消');
    cancelDialogVisible.value = false;
  } catch (error) {
    ElMessage.error('取消预订失败，请稍后重试');
  } finally {
    cancelLoading.value = false;
  }
};

onMounted(async () => {
  await bookingsStore.fetchBookings();
});
</script>

<style scoped>
.bookings-container {
  padding: 40px 0;
}

.booking-tabs {
  margin-top: 30px;
}

.cancel-note {
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #e6a23c;
  font-size: 14px;
}
</style> 
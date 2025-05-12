<template>
  <div class="attraction-detail-container container" v-if="attraction">
    <div class="attraction-header">
      <router-link to="/attractions" class="back-link">
        <el-icon><ArrowLeft /></el-icon> 返回景点列表
      </router-link>
      <h1 class="attraction-title">{{ attraction.name }}</h1>
      <p class="attraction-location">
        <el-icon><Location /></el-icon> {{ attraction.location }}
      </p>
    </div>
    
    <div class="attraction-content">
      <div class="row">
        <!-- 左侧景点信息 -->
        <div class="col-8">
          <div class="attraction-image-container">
            <img :src="attraction.image || 'https://via.placeholder.com/800x500'" alt="景点图片" class="main-image">
            
            <!-- 图片集展示 -->
            <div class="image-gallery">
              <img 
                v-for="(img, index) in imageGallery" 
                :key="index" 
                :src="img" 
                alt="景点图片" 
                class="gallery-thumbnail"
                @click="showImagePreview(index)"
              >
            </div>
          </div>
          
          <div class="attraction-description card">
            <h2>景点介绍</h2>
            <p>{{ attraction.details || attraction.description }}</p>
          </div>
          
          <div class="attraction-features card">
            <h2>景点特色</h2>
            <ul class="features-list">
              <li><el-icon><Star /></el-icon> 优美的自然景观</li>
              <li><el-icon><Picture /></el-icon> 绝佳的拍照地点</li>
              <li><el-icon><Opportunity /></el-icon> 丰富的文化体验</li>
              <li><el-icon><Food /></el-icon> 当地特色美食</li>
            </ul>
          </div>
          
          <!-- 评论区 -->
          <div class="attraction-reviews card">
            <h2>游客评价</h2>
            
            <div class="reviews-summary">
              <div class="average-rating">
                <span class="rating-score">4.8</span>
                <el-rate
                  v-model="averageRating"
                  disabled
                  text-color="#ff9900"
                />
                <span class="total-reviews">128 条评价</span>
              </div>
            </div>
            
            <div class="review-list">
              <div v-for="(review, index) in reviews" :key="index" class="review-item">
                <div class="review-header">
                  <div class="reviewer-info">
                    <span class="reviewer-name">{{ review.user }}</span>
                    <span class="review-date">{{ review.date }}</span>
                  </div>
                  <el-rate
                    v-model="review.rating"
                    disabled
                    text-color="#ff9900"
                  />
                </div>
                <p class="review-content">{{ review.content }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧预订信息 -->
        <div class="col-4">
          <div class="booking-card card">
            <h2>预订信息</h2>
            <div class="price-info">
              <span class="price-label">票价</span>
              <span class="price-value">{{ attraction.price > 0 ? `¥${attraction.price}/人` : '免费' }}</span>
            </div>
            
            <el-form :model="bookingForm" ref="bookingFormRef">
              <el-form-item label="日期">
                <el-date-picker
                  v-model="bookingForm.date"
                  type="date"
                  placeholder="选择日期"
                  :disabled-date="disabledDate"
                  style="width: 100%"
                />
              </el-form-item>
              
              <el-form-item label="人数">
                <el-input-number 
                  v-model="bookingForm.quantity" 
                  :min="1" 
                  :max="10"
                  style="width: 100%"
                />
              </el-form-item>
              
              <div class="booking-total" v-if="attraction.price > 0">
                <span>总价:</span>
                <span class="total-price">¥{{ (attraction.price * bookingForm.quantity).toFixed(2) }}</span>
              </div>
              
              <el-button 
                type="primary" 
                class="booking-button" 
                :disabled="!isFormValid"
                @click="handleBooking"
              >
                立即预订
              </el-button>
            </el-form>
            
            <div class="booking-note">
              <p><el-icon><InfoFilled /></el-icon> 预订提示:</p>
              <ul>
                <li>请提前至少1天预订</li>
                <li>可免费取消预订（提前24小时）</li>
                <li>景点开放时间: 09:00 - 17:00</li>
              </ul>
            </div>
          </div>
          
          <!-- 位置信息 -->
          <div class="location-card card">
            <h2>位置信息</h2>
            <div class="map-placeholder" @click="showMap">
              <img src="https://via.placeholder.com/400x200?text=地图" alt="地图" class="map-image">
              <div class="map-overlay">点击查看大图</div>
            </div>
            <div class="location-info">
              <p><el-icon><Location /></el-icon> {{ attraction.location }}</p>
              <p><el-icon><Van /></el-icon> 交通: 可乘坐公交车或地铁到达</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 图片预览 -->
    <el-image-viewer
      v-if="showViewer"
      :url-list="imageGallery"
      :initial-index="viewerIndex"
      @close="showViewer = false"
    />
    
    <!-- 登录提示对话框 -->
    <el-dialog
      v-model="loginDialogVisible"
      title="提示"
      width="30%"
    >
      <span>请先登录后再进行预订</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="loginDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="goToLogin">
            去登录
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
  
  <div v-else-if="attractionsStore.loading" class="loading-container container">
    <el-skeleton :rows="10" animated />
  </div>
  
  <div v-else class="error-container container">
    <el-empty description="未找到景点信息" />
    <router-link to="/attractions" class="back-link-center">
      返回景点列表
    </router-link>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  ArrowLeft, Location, Star, Picture, 
  Opportunity, Food, InfoFilled, Van 
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useAttractionsStore } from '../stores/attractions';
import { useUserStore } from '../stores/user';
import { useBookingsStore } from '../stores/bookings';

const route = useRoute();
const router = useRouter();
const attractionsStore = useAttractionsStore();
const userStore = useUserStore();
const bookingsStore = useBookingsStore();

const attraction = computed(() => attractionsStore.currentAttraction);
const averageRating = ref(4.8);
const loginDialogVisible = ref(false);

// 预订表单
const bookingForm = reactive({
  date: null,
  quantity: 1
});

// 模拟图片库
const imageGallery = computed(() => {
  return [
    attraction.value?.image || 'https://via.placeholder.com/800x500',
    'https://via.placeholder.com/800x500?text=图片2',
    'https://via.placeholder.com/800x500?text=图片3',
    'https://via.placeholder.com/800x500?text=图片4'
  ];
});

// 图片预览
const showViewer = ref(false);
const viewerIndex = ref(0);

const showImagePreview = (index) => {
  viewerIndex.value = index;
  showViewer.value = true;
};

// 模拟评论数据
const reviews = reactive([
  {
    user: '张先生',
    date: '2025-02-15',
    rating: 5,
    content: '景色非常美丽，服务也很好，强烈推荐来这里游览。我和家人度过了愉快的一天。'
  },
  {
    user: '李女士',
    date: '2025-03-22',
    rating: 4,
    content: '整体体验很好，就是人有点多。建议早点去避开人流高峰。'
  },
  {
    user: '王先生',
    date: '2025-02-30',
    rating: 5,
    content: '这是我来过的最美的地方之一，拍照效果很好，导游讲解也很详细。'
  }
]);

// 禁用过去的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 86400000; // 今天之前的日期不可选
};

// 检查表单是否有效
const isFormValid = computed(() => {
  return bookingForm.date && bookingForm.quantity > 0;
});

// 显示地图
const showMap = () => {
  ElMessage.info('地图功能正在开发中');
};

// 处理预订
const handleBooking = async () => {
  if (!userStore.isLoggedIn) {
    loginDialogVisible.value = true;
    return;
  }
  
  try {
    const bookingData = {
      attractionId: attraction.value.id,
      date: bookingForm.date.toISOString().split('T')[0],
      quantity: bookingForm.quantity,
      price: attraction.value.price
    };
    
    await bookingsStore.createBooking(bookingData);
    ElMessage.success('预订成功！');
    router.push('/bookings');
  } catch (error) {
    ElMessage.error('预订失败，请稍后重试');
  }
};

// 跳转到登录页
const goToLogin = () => {
  loginDialogVisible.value = false;
  router.push({ 
    path: '/login', 
    query: { redirect: route.fullPath } 
  });
};

onMounted(async () => {
  const id = route.params.id;
  await attractionsStore.fetchAttractionById(id);
});
</script>

<style scoped>
.attraction-detail-container {
  padding: 40px 0;
}

.attraction-header {
  margin-bottom: 30px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 20px;
  color: #606266;
}

.back-link:hover {
  color: #409eff;
}

.attraction-title {
  font-size: 32px;
  margin-bottom: 10px;
}

.attraction-location {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #606266;
  font-size: 16px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -15px;
}

.col-8 {
  width: 66.666667%;
  padding: 0 15px;
}

.col-4 {
  width: 33.333333%;
  padding: 0 15px;
}

@media (max-width: 992px) {
  .col-8, .col-4 {
    width: 100%;
  }
  
  .col-4 {
    margin-top: 30px;
  }
}

.attraction-image-container {
  margin-bottom: 30px;
}

.main-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 15px;
}

.image-gallery {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.gallery-thumbnail {
  width: 100px;
  height: 70px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.gallery-thumbnail:hover {
  opacity: 0.8;
}

.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 25px;
  margin-bottom: 30px;
}

.card h2 {
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
}

.attraction-description p {
  line-height: 1.8;
  color: #606266;
}

.features-list {
  list-style: none;
  padding: 0;
}

.features-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: #606266;
}

.reviews-summary {
  margin-bottom: 25px;
}

.average-rating {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-score {
  font-size: 24px;
  font-weight: bold;
}

.total-reviews {
  color: #909399;
}

.review-item {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.review-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.reviewer-name {
  font-weight: 500;
  margin-right: 10px;
}

.review-date {
  color: #909399;
}

.review-content {
  color: #606266;
  line-height: 1.6;
}

.booking-card {
  position: sticky;
  top: 20px;
}

.price-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.price-label {
  font-size: 16px;
  color: #606266;
}

.price-value {
  font-size: 24px;
  font-weight: bold;
  color: #67c23a;
}

.booking-total {
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
  padding: 10px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}

.total-price {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}

.booking-button {
  width: 100%;
  margin-top: 10px;
  height: 44px;
  font-size: 16px;
}

.booking-note {
  margin-top: 20px;
  color: #606266;
}

.booking-note p {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
  color: #409eff;
}

.booking-note ul {
  list-style: none;
  padding-left: 15px;
}

.booking-note li {
  margin-bottom: 5px;
  font-size: 14px;
}

.map-placeholder {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 15px;
}

.map-image {
  width: 100%;
  transition: transform 0.3s;
}

.map-placeholder:hover .map-image {
  transform: scale(1.05);
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.map-placeholder:hover .map-overlay {
  opacity: 1;
}

.location-info {
  color: #606266;
}

.location-info p {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
}

.loading-container, .error-container {
  padding: 60px 0;
  text-align: center;
}

.back-link-center {
  display: inline-block;
  margin-top: 20px;
  color: #409eff;
}
</style> 
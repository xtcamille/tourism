<template>
  <div class="home">
    <!-- 头部横幅 -->
    <section class="hero">
      <div class="container">
        <h1>探索世界的美丽</h1>
        <p>发现令人惊叹的旅游目的地和难忘的体验</p>
        <router-link to="/attractions" class="btn-primary">浏览景点</router-link>
      </div>
    </section>

    <!-- 特色景点 -->
    <section class="featured-attractions container">
      <h2 class="section-title">热门景点</h2>
      <div class="attraction-cards">
        <el-skeleton :rows="3" animated v-if="attractionsStore.loading" />
        <div v-else class="row">
          <div v-for="attraction in attractions" :key="attraction.id" class="col">
            <div class="attraction-card">
              <div class="attraction-image"
                :style="{ backgroundImage: `url(${attraction.image || 'https://via.placeholder.com/300x200'})` }"></div>
              <div class="attraction-content">
                <h3>{{ attraction.name }}</h3>
                <p class="location"><el-icon>
                    <Location />
                  </el-icon> {{ attraction.location }}</p>
                <p class="description">{{ attraction.description }}</p>
                <div class="card-footer">
                  <span class="price">{{ attraction.price > 0 ? `¥${attraction.price}` : '免费' }}</span>
                  <router-link :to="`/attractions/${attraction.id}`" class="btn-view">查看详情</router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="view-all-link">
        <router-link to="/attractions">查看全部景点 <el-icon>
            <ArrowRight />
          </el-icon></router-link>
      </div>
    </section>

    <!-- 为什么选择我们 -->
    <section class="why-choose-us">
      <div class="container">
        <h2 class="section-title">为什么选择我们</h2>
        <div class="features row">
          <div class="feature col">
            <el-icon class="feature-icon">
              <Star />
            </el-icon>
            <h3>精选景点</h3>
            <p>我们精心挑选最佳旅游目的地，确保您获得最好的体验。</p>
          </div>
          <div class="feature col">
            <el-icon class="feature-icon">
              <Money />
            </el-icon>
            <h3>优惠价格</h3>
            <p>提供最具竞争力的价格，让您能够以合理的成本享受旅行。</p>
          </div>
          <div class="feature col">
            <el-icon class="feature-icon">
              <Service />
            </el-icon>
            <h3>卓越服务</h3>
            <p>我们的客户服务团队随时准备帮助您规划完美的行程。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 用户评价 -->
    <section class="testimonials container">
      <h2 class="section-title">用户评价</h2>
      <el-carousel height="250px">
        <el-carousel-item v-for="testimonial in testimonials" :key="testimonial.id">
          <div class="testimonial-card">
            <div class="testimonial-content">
              <p class="quote">"{{ testimonial.content }}"</p>
              <div class="user-info">
                <h4>{{ testimonial.user }}</h4>
                <p>{{ testimonial.location }}</p>
              </div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Location, ArrowRight, Star, Money, Service } from '@element-plus/icons-vue';
import { useAttractionsStore } from '../stores/attractions';

const attractionsStore = useAttractionsStore();

// 获取前3个景点展示在首页
const attractions = computed(() => {
  return attractionsStore.attractions.slice(0, 3);
});

// 模拟用户评价数据
const testimonials = ref([
  {
    id: 1,
    content: '这是我使用过的最好的旅游平台！预订过程简单，客户服务非常棒。',
    user: '张先生',
    location: '上海'
  },
  {
    id: 2,
    content: '价格实惠，景点选择多样。我已经通过这个平台预订了三次旅行，每次都很满意。',
    user: '李女士',
    location: '北京'
  },
  {
    id: 3,
    content: '界面友好，信息丰富，帮助我计划了一次完美的家庭旅行。强烈推荐！',
    user: '王先生',
    location: '深圳'
  }
]);

onMounted(async () => {
  if (attractionsStore.attractions.length === 0) {
    await attractionsStore.fetchAttractions();
  }
});
</script>

<style scoped>
.hero {
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1501594907352-04cda38ebc29');
  background-size: cover;
  background-position: center;
  color: white;
  text-align: center;
  padding: 100px 20px;
  margin-bottom: 40px;
}

.hero h1 {
  font-size: 48px;
  margin-bottom: 16px;
}

.hero p {
  font-size: 20px;
  margin-bottom: 32px;
}

.btn-primary {
  background-color: #409eff;
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: bold;
  display: inline-block;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #337ecc;
}

.section-title {
  text-align: center;
  margin-bottom: 40px;
  font-size: 32px;
  font-weight: 600;
}

.featured-attractions {
  margin-bottom: 60px;
}

.attraction-cards {
  margin-bottom: 30px;
}

.attraction-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.attraction-image {
  height: 200px;
  background-size: cover;
  background-position: center;
}

.attraction-content {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.attraction-content h3 {
  margin-bottom: 10px;
  font-size: 20px;
}

.location {
  color: #606266;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.description {
  margin-bottom: 20px;
  flex-grow: 1;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.price {
  font-weight: bold;
  font-size: 18px;
  color: #67c23a;
}

.btn-view {
  background-color: #f5f7fa;
  color: #409eff;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.btn-view:hover {
  background-color: #ecf5ff;
}

.view-all-link {
  text-align: center;
  margin-top: 20px;
}

.view-all-link a {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 16px;
  font-weight: 500;
}

.why-choose-us {
  background-color: #f5f7fa;
  padding: 60px 0;
  margin-bottom: 60px;
}

.features {
  text-align: center;
}

.feature {
  padding: 20px;
}

.feature-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 20px;
}

.feature h3 {
  margin-bottom: 15px;
}

.testimonials {
  margin-bottom: 60px;
}

.testimonial-card {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 30px;
  height: 100%;
  display: flex;
  align-items: center;
}

.testimonial-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.quote {
  font-size: 18px;
  font-style: italic;
  margin-bottom: 20px;
}

.user-info h4 {
  margin-bottom: 5px;
}

.cta {
  background-color: #409eff;
  color: white;
  text-align: center;
  padding: 60px 20px;
}

.cta h2 {
  font-size: 32px;
  margin-bottom: 16px;
}

.cta p {
  font-size: 18px;
  margin-bottom: 32px;
}

.cta .btn-primary {
  background-color: white;
  color: #409eff;
}

.cta .btn-primary:hover {
  background-color: #f5f7fa;
}
</style>
<template>
  <el-config-provider>
    <div class="app">
      <header v-if="userStore.isLoggedIn">
        <Navbar />
      </header>
  
      
      <div class="main-container">

        <!-- <el-aside width="220px" v-if="userStore.isLoggedIn" class="sidebar">
          <SideMenu />
        </el-aside> -->

        <el-main>
          <router-view />
        </el-main>
      </div> 
   
      <footer class="footer">
        <div class="container">
          <p>&copy; {{ new Date().getFullYear() }} 乡村旅游资源数字化存证管理平台. 保留所有权利.</p>
        </div>
      </footer>
    </div>
  </el-config-provider>
</template>

<script setup>
import { RouterView } from 'vue-router';
import Navbar from './components/Navbar.vue';
import SideMenu from './components/SideMenu.vue';
import { useUserStore } from './stores/user';
import MainLayout from './layouts/MainLayout.vue';
 
const userStore = useUserStore();
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-container {
  display: flex;
  flex: 1;
}

.sidebar {
  height: calc(100vh - 60px);
  position: fixed;
  left: 0;
  top: 0px;
  background-color: #2a74ba;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
}

.el-main {
  margin-left: 0px;
  padding: 0px;
  transition: margin-left 0s;
}

.el-main:has(+ .sidebar) {
  margin-left: 220px;
}

.footer {
  background-color: #f5f5f5;
  padding: 5px 0;
  text-align: center;
  margin-top: auto;
}

.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 15px;
}
</style>
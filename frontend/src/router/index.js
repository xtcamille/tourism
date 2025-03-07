import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import { useUserStore } from '../stores/user';

const routes = [
    {
        path: '/',
        name: 'login',
        component: LoginView,
    },
    {
        path: '/register',
        name: 'register',
        component: RegisterView,
    },
    {
        path: '/home',
        name: 'home',
        component: MainLayout,
        meta: { requiresAuth: false },
        children: [
            {
                path: '/home/dashboard',
                name: 'dashboard',
                component: () => import('../views/DashboardView.vue'),
            },
            {
                path: '/home/tickets',
                name: 'tickets',
                component: () => import('../views/TicketsView.vue'),
            },
            {
                path: '/home/products',
                name: 'products',
                component: () => import('../views/ProductsView.vue'),
            },
            {
                path: '/home/reviews',
                name: 'reviews',
                component: () => import('../views/ReviewsView.vue'),
            },
            {
                path: '/home/attractions',
                name: 'attractions',
                component: () => import('../views/AttractionsView.vue'),
            },
            {
                path: '/home/attractions/:id',
                name: 'attractionDetail',
                component: () => import('../views/AttractionDetailView.vue'),
            },
            {
                path: 'profile',
                name: 'profile',
                component: () => import('../views/ProfileView.vue'),
            },
            {
                path: 'bookings',
                name: 'bookings',
                component: () => import('../views/BookingsView.vue'),
            },
            {
                path: 'node/status',
                name: 'nodeStatus',
                component: () => import('../views/node/StatusView.vue'),
                meta: { requiresNode: false }
            },
            {
                path: 'node/transactions',
                name: 'nodeTransactions',
                component: () => import('../views/node/TransactionsView.vue'),
                meta: { requiresNode: false }
            },
            {
                path: 'about',
                name: 'about',
                component: () => import('../views/AboutView.vue'),
            },
        ],
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'notFound',
        component: () => import('../views/NotFoundView.vue')
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

// 导航守卫
router.beforeEach((to, from, next) => {
    const userStore = useUserStore();

    // 检查路由是否需要认证
    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
        // 重定向到登录页
        next({ name: 'login', query: { redirect: to.fullPath } });
    }
    // 检查路由是否需要节点权限
    else if (to.meta.requiresNode && (!userStore.isLoggedIn || userStore.user?.role !== 'node')) {
        // 用户不是节点用户，重定向到首页
        next({ name: 'home' });
    }
    else {
        next();
    }
});

export default router; 
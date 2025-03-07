import { defineStore } from 'pinia';
import axios from 'axios';

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token') || null,
        loading: false,
        error: null,
        isLoggedIn: false
    }),

    getters: {
        // isLoggedIn: (state) => !!state.token,
        userInfo: (state) => state.user,
        isNodeUser: (state) => state.user?.role === 'node',
        userRole: (state) => {
            return state.user ? state.user.role : null;
        }
    },

    actions: {
        async login(credentials) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.post('/api/login', credentials);
                this.token = response.data.token;
                this.user = response.data.user;

                // 保存token到本地存储
                localStorage.setItem('token', this.token);

                // 为后续请求设置认证头
                axios.defaults.headers.common['Authorization'] = this.token;

                this.isLoggedIn = true;

                return response.data;
            } catch (error) {
                this.error = error.response?.data?.error || '登录失败';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async registerUser(userData) {
            try {
                // 假设您有一个 API 端点用于注册用户
                const response = await axios.post('/api/register', userData);
                this.user = response.data; // 假设返回的用户数据
                this.isLoggedIn = true;
            } catch (error) {
                console.log("error", error);
                throw error; // 抛出错误以便在组件中捕获
            }
        },

        async registerNode(nodeData) {
            this.loading = true;
            this.error = null;

            try {
                // 节点用户注册，上传密钥文件
                const formData = new FormData();
                formData.append('username', nodeData.username);
                formData.append('password', nodeData.password);
                formData.append('email', nodeData.email);
                formData.append('keyFile', nodeData.keyFile);

                const response = await axios.post('/api/register/node', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.error || '节点注册失败';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        logout() {
            this.token = null;
            this.user = null;
            this.isLoggedIn = false;

            // 清除本地存储
            localStorage.removeItem('token');

            // 清除请求头中的token
            delete axios.defaults.headers.common['Authorization'];
        },

        async fetchUserInfo() {
            if (!this.token) return;

            this.loading = true;

            try {
                // 实际项目中应该从后端API获取用户信息
                // 暂时模拟用户数据
                const response = await axios.get('/api/user/profile');
                this.user = response.data;
            } catch (error) {
                this.error = '获取用户信息失败';
                this.logout(); // 失败时登出
            } finally {
                this.loading = false;
            }
        },

        // 创建或导入区块链钱包
        async createBlockchainWallet(password) {
            this.loading = true;

            try {
                const response = await axios.post('/api/blockchain/wallet/create', { password });
                if (this.user) {
                    this.user.blockchainAccount = response.data.address;
                }
                return response.data;
            } catch (error) {
                this.error = '创建区块链钱包失败';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // 导入已有的区块链钱包
        async importBlockchainWallet(privateKey, password) {
            this.loading = true;

            try {
                const response = await axios.post('/api/blockchain/wallet/import', {
                    privateKey,
                    password
                });
                if (this.user) {
                    this.user.blockchainAccount = response.data.address;
                }
                return response.data;
            } catch (error) {
                this.error = '导入区块链钱包失败';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        initializeAuth() {
            if (this.token) {
                axios.defaults.headers.common['Authorization'] = this.token;
                this.fetchUserInfo();
            }
        },

        register(userInfo) {
            // 这里可以添加注册逻辑，例如调用 API
            this.user = userInfo; // 假设注册后直接登录
            this.isLoggedIn = true;
        }
    }
}); 
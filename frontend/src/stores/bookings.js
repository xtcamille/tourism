import { defineStore } from 'pinia';
import axios from 'axios';

export const useBookingsStore = defineStore('bookings', {
    state: () => ({
        bookings: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchBookings() {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get('/api/bookings');
                this.bookings = response.data.data;
                return response.data.data;
            } catch (error) {
                this.error = '获取预订列表失败';
                console.error(error);
            } finally {
                this.loading = false;
            }
        },

        async createBooking(bookingData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.post('/api/bookings', bookingData);
                // 添加新预订到列表
                this.bookings.push(response.data.data);
                return response.data.data;
            } catch (error) {
                this.error = '创建预订失败';
                console.error(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async cancelBooking(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.delete(`/api/bookings/${id}`);
                // 更新预订状态
                const index = this.bookings.findIndex(booking => booking.id === id);
                if (index !== -1) {
                    this.bookings[index].status = 'cancelled';
                }
                return response.data;
            } catch (error) {
                this.error = '取消预订失败';
                console.error(error);
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
}); 
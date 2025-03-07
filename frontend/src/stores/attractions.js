import { defineStore } from 'pinia';
import axios from 'axios';

export const useAttractionsStore = defineStore('attractions', {
    state: () => ({
        attractions: [],
        currentAttraction: null,
        loading: false,
        error: null
    }),

    getters: {
        getAttractionById: (state) => (id) => {
            return state.attractions.find(attraction => attraction.id === id);
        }
    },

    actions: {
        async fetchAttractions() {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get('/api/attractions');
                this.attractions = response.data.data;
            } catch (error) {
                this.error = '获取景点列表失败';
                console.error(error);
            } finally {
                this.loading = false;
            }
        },

        async fetchAttractionById(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get(`/api/attractions/${id}`);
                this.currentAttraction = response.data.data;
                return response.data.data;
            } catch (error) {
                this.error = '获取景点详情失败';
                console.error(error);
            } finally {
                this.loading = false;
            }
        }
    }
}); 